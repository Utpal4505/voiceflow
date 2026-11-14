import posthog from 'posthog-js';

const STORAGE_TELEMETRY_ENABLED = 'voiceflow_telemetry_enabled';
const STORAGE_DISTINCT_ID = 'voiceflow_anonymous_device_id';

export const APP_VERSION = '0.3.1';

const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY || 'phc_mock_development_key';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

/**
 * Generates or retrieves a persistent, privacy-preserving random UUID for this device.
 * Contains no PII, hardware MAC address, or IP.
 */
function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(STORAGE_DISTINCT_ID);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_DISTINCT_ID, id);
    }
    return id;
  } catch {
    return 'anonymous-device';
  }
}

/**
 * Initializes the client telemetry pipeline with strict desktop privacy constraints.
 */
export function initTelemetry(): void {
  if (isInitialized) return;

  const enabled = isTelemetryEnabled();
  const distinctId = getOrCreateDeviceId();

  try {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: false, // Turn off DOM click tracking
      capture_pageview: false, // Turn off pageviews
      disable_session_recording: true, // Never record screens or audio for desktop dictation
      persistence: 'localStorage',
      bootstrap: {
        distinctID: distinctId,
      },
      opt_out_capturing_by_default: !enabled,
      loaded: (ph) => {
        if (!enabled) {
          ph.opt_out_capturing();
        }
      },
    });
    isInitialized = true;
    console.log('[Telemetry] PostHog initialized successfully for device:', distinctId);
  } catch (err) {
    console.warn('[Telemetry] Failed to initialize PostHog (non-fatal):', err);
  }
}

/**
 * Checks if the user has telemetry enabled. Defaults to true (opt-out model).
 */
export function isTelemetryEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_TELEMETRY_ENABLED) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Enables or disables telemetry based on user preference in Settings.
 */
export function setTelemetryEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_TELEMETRY_ENABLED, enabled ? 'true' : 'false');
    if (enabled) {
      posthog.opt_in_capturing();
      trackEvent('telemetry_toggled', { enabled: true });
    } else {
      trackEvent('telemetry_toggled', { enabled: false });
      posthog.opt_out_capturing();
    }
  } catch (err) {
    console.warn('[Telemetry] Failed to set telemetry preference:', err);
  }
}

/**
 * Internal safe wrapper to dispatch events with global desktop metadata.
 */
function trackEvent(eventName: string, properties: Record<string, any> = {}): void {
  if (!isTelemetryEnabled()) return;

  try {
    const osPlatform =
      typeof navigator !== 'undefined'
        ? navigator.userAgent.includes('Windows')
          ? 'windows'
          : navigator.userAgent.includes('Mac')
          ? 'macos'
          : navigator.userAgent.includes('Linux')
          ? 'linux'
          : 'desktop'
        : 'unknown';

    posthog.capture(eventName, {
      app_version: APP_VERSION,
      platform: osPlatform,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  } catch (err) {
    console.warn('[Telemetry] Error capturing event:', eventName, err);
  }
}

// ==========================================
// Strongly-Typed Speech & Error Telemetry
// ==========================================

export type SpeechSource =
  | 'overlay_shortcut'
  | 'overlay_wake_word'
  | 'main_window'
  | 'api_test';

export type SpeechFailureStage =
  | 'mic_permission'
  | 'mic_hardware'
  | 'engine_connection'
  | 'streaming'
  | 'transcription'
  | 'insertion'
  | 'timeout'
  | 'unknown';

/**
 * 1. Track when speech dictation begins.
 */
export function trackSpeechStarted(params: {
  sessionId: string;
  source: SpeechSource;
  modelId?: string;
}): void {
  trackEvent('speech_started', {
    session_id: params.sessionId,
    source: params.source,
    model_id: params.modelId || 'base',
    status: 'started',
  });
}

/**
 * 2. Track when speech dictation completes successfully (passed).
 */
export function trackSpeechPassed(params: {
  sessionId?: string;
  source: SpeechSource;
  audioDurationSec: number;
  wordCount: number;
  totalLatencyMs: number;
  rtf?: number;
  modelId?: string;
  engineTier?: string;
  actionType?: string;
}): void {
  const payload = {
    session_id: params.sessionId,
    source: params.source,
    status: 'passed',
    audio_duration_sec: Math.round(params.audioDurationSec * 10) / 10,
    words_count: params.wordCount,
    total_latency_ms: Math.round(params.totalLatencyMs),
    rtf: params.rtf,
    model_id: params.modelId,
    engine_tier: params.engineTier,
    action_type: params.actionType,
  };

  // Primary funnel event
  trackEvent('speech_passed', payload);

  // Backward-compatible alias
  trackEvent('dictation_completed', payload);
}

/**
 * 3. Track when speech dictation fails with full contextual breakdown.
 */
export function trackSpeechFailed(params: {
  sessionId?: string;
  source: SpeechSource;
  stage: SpeechFailureStage;
  reason: string;
  errorMessage?: string;
  durationMs?: number;
  modelId?: string;
}): void {
  trackEvent('speech_failed', {
    session_id: params.sessionId,
    source: params.source,
    status: 'failed',
    failure_stage: params.stage,
    failure_reason: params.reason,
    error_message: params.errorMessage || params.reason,
    duration_ms: params.durationMs ? Math.round(params.durationMs) : 0,
    model_id: params.modelId,
  });
}

/**
 * 4. Specific microphone hardware or permission error.
 */
export function trackMicrophoneError(params: {
  category: 'permission_denied' | 'device_not_found' | 'not_readable' | 'overconstrained' | 'unknown';
  rawError: string;
  deviceLabel?: string;
}): void {
  trackEvent('microphone_error', {
    mic_error_category: params.category,
    raw_error: params.rawError,
    device_label: params.deviceLabel,
  });
}

/**
 * 5. Track when the user clicks the 1-click button to open Windows/Mac Microphone settings.
 */
export function trackMicrophoneSettingsOpened(params: {
  source: 'main_window' | 'overlay';
}): void {
  trackEvent('microphone_settings_opened', {
    ui_source: params.source,
  });
}

/**
 * 6. Track Engine / WebSocket disconnections or failures.
 */
export function trackEngineError(params: {
  error: string;
  context?: string;
}): void {
  trackEvent('engine_error', {
    engine_error: params.error,
    context: params.context || 'websocket',
  });
}

// ==========================================
// Legacy / General App Events
// ==========================================

export function trackAppLaunched(metadata?: {
  engineTier?: string;
  recommendedModelId?: string;
  cpuModel?: string;
  logicalCores?: number;
}): void {
  trackEvent('app_launched', {
    engine_tier: metadata?.engineTier,
    recommended_model: metadata?.recommendedModelId,
    logical_cores: metadata?.logicalCores,
  });
}

export function trackDictationCompleted(params: {
  audioDurationSec: number;
  wordCount: number;
  totalLatencyMs: number;
  rtf?: number;
  modelId?: string;
  engineTier?: string;
}): void {
  trackSpeechPassed({
    source: 'overlay_shortcut',
    audioDurationSec: params.audioDurationSec,
    wordCount: params.wordCount,
    totalLatencyMs: params.totalLatencyMs,
    rtf: params.rtf,
    modelId: params.modelId,
    engineTier: params.engineTier,
  });
}

export function trackInsertionFailed(params: {
  reason: string;
  durationMs?: number;
}): void {
  trackEvent('insertion_failed', {
    reason: params.reason,
    duration_ms: params.durationMs,
  });
}

export function trackModelSwitched(fromModel: string, toModel: string): void {
  trackEvent('model_switched', {
    from_model: fromModel,
    to_model: toModel,
  });
}

export function trackModelDownload(params: {
  modelId: string;
  durationSec: number;
  success: boolean;
  error?: string;
}): void {
  trackEvent('model_download_result', {
    model_id: params.modelId,
    duration_sec: params.durationSec,
    success: params.success,
    error: params.error,
  });
}

export function trackSettingsChanged(setting: string, value: any): void {
  trackEvent('setting_changed', {
    setting_name: setting,
    new_value: value,
  });
}
