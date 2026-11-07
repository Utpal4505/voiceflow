import posthog from 'posthog-js';

const STORAGE_TELEMETRY_ENABLED = 'voiceflow_telemetry_enabled';
const STORAGE_DISTINCT_ID = 'voiceflow_anonymous_device_id';

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
    posthog.capture(eventName, {
      app_version: '0.1.0',
      platform: 'desktop_windows',
      ...properties,
    });
  } catch {
    // Fail silently so telemetry never interferes with voice dictation or app UI
  }
}

// ==========================================
// Strongly-Typed Telemetry Event Trackers
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
  trackEvent('dictation_completed', {
    audio_duration_sec: Math.round(params.audioDurationSec * 10) / 10,
    words_count: params.wordCount,
    total_latency_ms: Math.round(params.totalLatencyMs),
    rtf: params.rtf,
    model_id: params.modelId,
    engine_tier: params.engineTier,
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
