import posthog from "posthog-js";

let isPostHogInitialized = false;

/**
 * Initializes PostHog browser client.
 * Reads NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST from the environment.
 * If no key is set, safely operates in development logging mode without throwing.
 */
export function initPostHog(): void {
  if (typeof window === "undefined" || isPostHogInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[PostHog] NEXT_PUBLIC_POSTHOG_KEY not set. Analytics operating in development logging mode."
      );
    }
    return;
  }

  try {
    posthog.init(apiKey, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // Handled explicitly by PostHogPageView for client route changes
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: false,
    });
    isPostHogInitialized = true;
  } catch (err) {
    console.warn("[PostHog] Failed to initialize (non-fatal):", err);
  }
}

/**
 * Generic safe event tracker.
 */
export function trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  try {
    const defaultProps = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      pathname: window.location.pathname,
    };

    if (isPostHogInitialized) {
      posthog.capture(eventName, { ...defaultProps, ...properties });
    } else if (process.env.NODE_ENV === "development") {
      console.log(`[PostHog Track] ${eventName}:`, { ...defaultProps, ...properties });
    }
  } catch {
    // Fail silently to never disrupt the visitor experience
  }
}

/**
 * High-value funnel action: Visitor clicks a download button or alternate download link.
 */
export function trackDownloadClicked(params: {
  platform: "windows" | "mac";
  location: "hero" | "navbar" | "footer" | "mobile_drawer" | "mobile_header" | "toast";
  url?: string;
}): void {
  trackEvent("download_clicked", {
    platform: params.platform,
    location: params.location,
    format: params.platform === "mac" ? "dmg" : "exe",
    url: params.url,
  });
}

/**
 * User switches the interactive simulation app tab (VS Code, Slack, Google Docs).
 */
export function trackDemoTabChanged(tab: "vscode" | "slack" | "docs"): void {
  trackEvent("demo_tab_changed", {
    tab,
  });
}

/**
 * User triggers dictation inside the interactive playground.
 */
export function trackDemoDictationTriggered(
  tab: string,
  triggerType: "button" | "hotkey" | "click_to_dictate"
): void {
  trackEvent("demo_dictation_triggered", {
    tab,
    trigger_type: triggerType,
  });
}

/**
 * User tests the global Ctrl+Space hotkey in the interactive playground.
 */
export function trackHotkeyTested(source: "header_pill" | "keyboard_shortcut"): void {
  trackEvent("hotkey_tested", {
    source,
    hotkey: "Ctrl + Space",
  });
}

/**
 * User expands an FAQ accordion item.
 */
export function trackFaqToggled(question: string, isOpen: boolean): void {
  if (isOpen) {
    trackEvent("faq_question_expanded", {
      question,
    });
  }
}

/**
 * User opens a security or setup guide modal/link.
 */
export function trackGuideOpened(guideType: "smartscreen" | "macos_permissions"): void {
  trackEvent("guide_opened", {
    guide_type: guideType,
  });
}

/**
 * User clicks an external outbound link (GitHub, Discord, Docs).
 */
export function trackExternalLinkClicked(label: string, destination: string): void {
  trackEvent("external_link_clicked", {
    label,
    destination,
  });
}
