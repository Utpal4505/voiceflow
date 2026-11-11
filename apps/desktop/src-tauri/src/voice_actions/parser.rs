use super::intent::ActionIntent;

/// Cleans and normalizes spoken text:
/// 1. Trims whitespace and trailing punctuation (. , ! ?)
/// 2. Converts "dot" between tokens to "." (e.g. "gdha dot online" -> "gdha.online")
/// 3. Strips optional leading wake-word prefixes ("hey flow", "hey voiceflow", "flow")
pub fn normalize_spoken_command(raw_text: &str) -> String {
    let mut text = raw_text.trim().to_lowercase();

    // Strip trailing punctuation
    while text.ends_with('.') || text.ends_with('!') || text.ends_with('?') || text.ends_with(',') {
        text.pop();
        text = text.trim().to_string();
    }

    // Strip optional wake word prefix (with or without comma)
    let prefixes = [
        "hey voiceflow,",
        "hey voiceflow",
        "hey flow,",
        "hey flow",
        "flow,",
        "flow",
    ];
    for p in &prefixes {
        if text.starts_with(p) {
            text = text[p.len()..].trim().to_string();
            break;
        }
    }

    // Convert " dot " to "." (e.g., "gdha dot online" -> "gdha.online")
    while let Some(idx) = text.find(" dot ") {
        text.replace_range(idx..idx + 5, ".");
    }
    // Also handle "dot " if at beginning of domain segment
    while let Some(idx) = text.find(" dot.") {
        text.replace_range(idx..idx + 5, ".");
    }

    text
}

/// Checks if a string looks like a web domain (e.g. contains a valid dot and extension)
fn is_web_domain(token: &str) -> bool {
    let clean = token.trim().trim_start_matches("https://").trim_start_matches("http://").trim_start_matches("www.");
    if let Some((_, tld)) = clean.rsplit_once('.') {
        if tld.len() >= 2 && tld.chars().all(|c| c.is_alphabetic()) {
            return true;
        }
    }
    false
}

/// Known web-first hubs that default to browser URLs unless an app is requested
fn get_web_hub_url(name: &str) -> Option<&'static str> {
    match name {
        "youtube" => Some("https://youtube.com"),
        "twitter" | "x" => Some("https://x.com"),
        "reddit" => Some("https://reddit.com"),
        "gmail" => Some("https://mail.google.com"),
        "chatgpt" => Some("https://chatgpt.com"),
        "linkedin" => Some("https://linkedin.com"),
        "github" => Some("https://github.com"),
        "instagram" => Some("https://instagram.com"),
        "facebook" => Some("https://facebook.com"),
        "netflix" => Some("https://netflix.com"),
        "wikipedia" => Some("https://wikipedia.org"),
        "stackoverflow" => Some("https://stackoverflow.com"),
        "google maps" | "maps" => Some("https://maps.google.com"),
        _ => None,
    }
}

/// Maps common spoken app names to their Windows executable hint and pretty name
fn get_app_alias(name: &str) -> Option<(&'static str, &'static str)> {
    match name {
        "vs code" | "vscode" | "code" | "visual studio code" => Some(("code", "Visual Studio Code")),
        "terminal" | "cmd" | "command prompt" | "powershell" => Some(("wt", "Terminal")),
        "spotify" => Some(("spotify", "Spotify")),
        "calculator" => Some(("calc", "Calculator")),
        "notepad" => Some(("notepad", "Notepad")),
        "file explorer" | "explorer" | "files" => Some(("explorer", "File Explorer")),
        "settings" => Some(("ms-settings:", "Windows Settings")),
        "task manager" => Some(("taskmgr", "Task Manager")),
        "chrome" | "google chrome" => Some(("chrome", "Google Chrome")),
        "firefox" => Some(("firefox", "Firefox")),
        "edge" | "microsoft edge" => Some(("msedge", "Microsoft Edge")),
        "slack" => Some(("slack", "Slack")),
        "discord" => Some(("discord", "Discord")),
        "telegram" => Some(("telegram", "Telegram")),
        "whatsapp" => Some(("whatsapp", "WhatsApp")),
        "notion" => Some(("notion", "Notion")),
        "postman" => Some(("postman", "Postman")),
        "docker" => Some(("Docker Desktop", "Docker Desktop")),
        "paint" => Some(("mspaint", "Paint")),
        "word" | "microsoft word" => Some(("winword", "Microsoft Word")),
        "excel" | "microsoft excel" => Some(("excel", "Microsoft Excel")),
        _ => None,
    }
}

/// Parses an utterance into an ActionIntent, or returns None if it's plain dictation
pub fn parse_voice_command(raw_text: &str) -> Option<ActionIntent> {
    let text = normalize_spoken_command(raw_text);
    if text.is_empty() {
        return None;
    }

    // 1. Search Intents
    // Pattern A: "search [provider] for [query]"
    let search_providers = [
        ("youtube", "https://www.youtube.com/results?search_query="),
        ("google", "https://www.google.com/search?q="),
        ("github", "https://github.com/search?q="),
        ("reddit", "https://www.reddit.com/search/?q="),
        ("twitter", "https://x.com/search?q="),
        ("bing", "https://www.bing.com/search?q="),
        ("duckduckgo", "https://duckduckgo.com/?q="),
        ("wikipedia", "https://en.wikipedia.org/wiki/Special:Search?search="),
    ];

    for (provider, base_url) in &search_providers {
        let prefix = format!("search {} for ", provider);
        if text.starts_with(&prefix) {
            let query = text[prefix.len()..].trim().to_string();
            if !query.is_empty() {
                let encoded_query = url_encode(&query);
                return Some(ActionIntent::SearchWeb {
                    provider: provider.to_string(),
                    query,
                    url: format!("{}{}", base_url, encoded_query),
                });
            }
        }
    }

    // Pattern B: "search for [query]" or "search [query]" (defaults to Google)
    if text.starts_with("search for ") {
        let query = text["search for ".len()..].trim().to_string();
        if !query.is_empty() {
            let encoded_query = url_encode(&query);
            return Some(ActionIntent::SearchWeb {
                provider: "google".to_string(),
                query,
                url: format!("https://www.google.com/search?q={}", encoded_query),
            });
        }
    }

    // Pattern C: "google [query]" or "youtube [query]"
    if text.starts_with("google ") {
        let query = text["google ".len()..].trim().to_string();
        if !query.is_empty() && !query.ends_with(".com") {
            let encoded_query = url_encode(&query);
            return Some(ActionIntent::SearchWeb {
                provider: "google".to_string(),
                query,
                url: format!("https://www.google.com/search?q={}", encoded_query),
            });
        }
    }
    if text.starts_with("youtube ") {
        let query = text["youtube ".len()..].trim().to_string();
        if !query.is_empty() && !query.ends_with(".com") {
            let encoded_query = url_encode(&query);
            return Some(ActionIntent::SearchWeb {
                provider: "youtube".to_string(),
                query,
                url: format!("https://www.youtube.com/results?search_query={}", encoded_query),
            });
        }
    }

    // 2. Open / Launch Commands
    let open_prefix = if text.starts_with("open ") {
        Some("open ")
    } else if text.starts_with("launch ") {
        Some("launch ")
    } else if text.starts_with("start ") {
        Some("start ")
    } else {
        None
    };

    if let Some(prefix) = open_prefix {
        let mut target = text[prefix.len()..].trim().to_string();
        if target.is_empty() {
            return None;
        }

        // Check if user explicitly asked for browser ("in browser" or "on web")
        let mut force_browser = false;
        if target.ends_with(" in browser") {
            target = target[..target.len() - " in browser".len()].trim().to_string();
            force_browser = true;
        } else if target.ends_with(" on web") {
            target = target[..target.len() - " on web".len()].trim().to_string();
            force_browser = true;
        } else if target.ends_with(" on chrome") {
            target = target[..target.len() - " on chrome".len()].trim().to_string();
            force_browser = true;
        }

        // Case A: Target has a domain format (e.g. "gdha.online", "apple.com", "portfolio.dev")
        if is_web_domain(&target) || target.starts_with("http://") || target.starts_with("https://") {
            let url = if target.starts_with("http://") || target.starts_with("https://") {
                target.clone()
            } else {
                format!("https://{}", target)
            };
            return Some(ActionIntent::OpenUrl {
                url,
                domain: target,
            });
        }

        // Case B: Known popular web hub (e.g. "open youtube", "open reddit", "open github")
        if let Some(hub_url) = get_web_hub_url(&target) {
            // If user said "open github in browser", it definitely goes to the URL
            // If user just said "open youtube", youtube is naturally a web hub
            return Some(ActionIntent::OpenUrl {
                url: hub_url.to_string(),
                domain: target,
            });
        }

        // Case C: If forced to browser, search for it directly
        if force_browser {
            let encoded_target = url_encode(&target);
            return Some(ActionIntent::OpenUrl {
                url: format!("https://www.google.com/search?q={}", encoded_target),
                domain: target,
            });
        }

        // Case D: Native App Lookup (or App with Registry/Web Fallback)
        if let Some((hint, display)) = get_app_alias(&target) {
            return Some(ActionIntent::LaunchApp {
                app_name: target,
                executable_hint: Some(hint.to_string()),
                display_name: display.to_string(),
            });
        }

        // Case E: Generic App Name (e.g. "open blender", "open obsidian", "open gdha")
        let display = capitalize_words(&target);
        return Some(ActionIntent::LaunchApp {
            app_name: target,
            executable_hint: None,
            display_name: display,
        });
    }

    None
}

/// Simple URL encoder for search queries
fn url_encode(input: &str) -> String {
    let mut encoded = String::new();
    for b in input.bytes() {
        match b {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(b as char);
            }
            b' ' => {
                encoded.push('+');
            }
            _ => {
                encoded.push_str(&format!("%{:02X}", b));
            }
        }
    }
    encoded
}

fn capitalize_words(input: &str) -> String {
    input
        .split_whitespace()
        .map(|word| {
            let mut c = word.chars();
            match c.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_domain_recognition() {
        // Dot recognition in various TLDs
        assert!(is_web_domain("gdha.online"));
        assert!(is_web_domain("portfolio.dev"));
        assert!(is_web_domain("agent.ai"));
        assert!(is_web_domain("example.com"));
        assert!(is_web_domain("open.in"));
        assert!(!is_web_domain("vscode"));
        assert!(!is_web_domain("calculator"));
    }

    #[test]
    fn test_parse_open_domain() {
        let action = parse_voice_command("open gdha.online").unwrap();
        assert_eq!(
            action,
            ActionIntent::OpenUrl {
                url: "https://gdha.online".to_string(),
                domain: "gdha.online".to_string(),
            }
        );

        // With "dot" spoken
        let action2 = parse_voice_command("open gdha dot online").unwrap();
        assert_eq!(
            action2,
            ActionIntent::OpenUrl {
                url: "https://gdha.online".to_string(),
                domain: "gdha.online".to_string(),
            }
        );

        // With wake word and trailing dot
        let action3 = parse_voice_command("Hey Flow, open myportfolio.dev.").unwrap();
        assert_eq!(
            action3,
            ActionIntent::OpenUrl {
                url: "https://myportfolio.dev".to_string(),
                domain: "myportfolio.dev".to_string(),
            }
        );
    }

    #[test]
    fn test_parse_search_web() {
        let action = parse_voice_command("search youtube for lo-fi beats").unwrap();
        assert_eq!(
            action,
            ActionIntent::SearchWeb {
                provider: "youtube".to_string(),
                query: "lo-fi beats".to_string(),
                url: "https://www.youtube.com/results?search_query=lo-fi+beats".to_string(),
            }
        );

        let action2 = parse_voice_command("google rust async tutorial").unwrap();
        assert_eq!(
            action2,
            ActionIntent::SearchWeb {
                provider: "google".to_string(),
                query: "rust async tutorial".to_string(),
                url: "https://www.google.com/search?q=rust+async+tutorial".to_string(),
            }
        );
    }

    #[test]
    fn test_parse_app_launcher() {
        let action = parse_voice_command("open vs code").unwrap();
        assert_eq!(
            action,
            ActionIntent::LaunchApp {
                app_name: "vs code".to_string(),
                executable_hint: Some("code".to_string()),
                display_name: "Visual Studio Code".to_string(),
            }
        );

        let action2 = parse_voice_command("launch terminal").unwrap();
        assert_eq!(
            action2,
            ActionIntent::LaunchApp {
                app_name: "terminal".to_string(),
                executable_hint: Some("wt".to_string()),
                display_name: "Terminal".to_string(),
            }
        );
    }

    #[test]
    fn test_parse_in_browser_fallback() {
        let action = parse_voice_command("open gdha in browser").unwrap();
        assert_eq!(
            action,
            ActionIntent::OpenUrl {
                url: "https://www.google.com/search?q=gdha".to_string(),
                domain: "gdha".to_string(),
            }
        );
    }

    #[test]
    fn test_non_action_dictation() {
        // Plain speech should NOT be intercepted as an action
        assert_eq!(parse_voice_command("hello world"), None);
        assert_eq!(parse_voice_command("this is an open source project"), None);
        assert_eq!(parse_voice_command("I want to search my soul"), None);
    }
}
