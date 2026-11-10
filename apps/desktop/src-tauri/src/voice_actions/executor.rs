use super::intent::{ActionIntent, ActionResult};
use std::process::Command;

/// Opens a web URL in the system's default browser
pub fn open_browser_url(url: &str) -> Result<(), String> {
    println!("[VoiceAction Executor] Opening URL in default browser: {}", url);

    #[cfg(target_os = "windows")]
    {
        // On Windows, 'start "" "<url>"' reliably opens in the default web browser
        Command::new("cmd")
            .args(["/C", "start", "", url])
            .spawn()
            .map_err(|e| format!("Failed to open browser URL on Windows: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(url)
            .spawn()
            .map_err(|e| format!("Failed to open browser URL on macOS: {}", e))?;
        Ok(())
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Command::new("xdg-open")
            .arg(url)
            .spawn()
            .map_err(|e| format!("Failed to open browser URL on Linux: {}", e))?;
        Ok(())
    }
}

/// Launches a local desktop application or falls back gracefully to a web search
pub fn launch_desktop_app(app_name: &str, hint: Option<&str>) -> ActionResult {
    println!(
        "[VoiceAction Executor] Launching application: '{}' (hint: {:?})",
        app_name, hint
    );

    #[cfg(target_os = "windows")]
    {
        // 1. If we have an executable hint (like "code", "calc", "notepad", "ms-settings:")
        if let Some(target) = hint {
            if target.starts_with("ms-settings:") {
                let _ = Command::new("cmd").args(["/C", "start", "", target]).spawn();
                return ActionResult {
                    success: true,
                    message: format!("Opened {}", app_name),
                };
            }

            // Direct executable spawn
            if let Ok(_) = Command::new(target).spawn() {
                return ActionResult {
                    success: true,
                    message: format!("Launched {}", app_name),
                };
            }

            // Fallback via Windows shell 'start'
            if let Ok(mut child) = Command::new("cmd").args(["/C", "start", "", target]).spawn() {
                if let Ok(status) = child.wait() {
                    if status.success() {
                        return ActionResult {
                            success: true,
                            message: format!("Launched {}", app_name),
                        };
                    }
                }
            }

            // Special fallback for terminal: if 'wt' fails, launch 'powershell'
            if target == "wt" {
                if let Ok(_) = Command::new("powershell").spawn() {
                    return ActionResult {
                        success: true,
                        message: "Launched PowerShell Terminal".to_string(),
                    };
                }
            }
        }

        // 2. Try generic app name via Windows Shell
        if let Ok(mut child) = Command::new("cmd").args(["/C", "start", "", app_name]).spawn() {
            if let Ok(status) = child.wait() {
                if status.success() {
                    return ActionResult {
                        success: true,
                        message: format!("Launched {}", app_name),
                    };
                }
            }
        }

        // 3. Zero-Dead-End Universal Fallback:
        // If no local app is installed matching 'app_name' (e.g. user said 'open gdha' or 'open figma'),
        // open default browser with a search query so the user gets instant results!
        println!(
            "[VoiceAction Executor] Local app '{}' not found; falling back to web search",
            app_name
        );
        let search_url = format!("https://www.google.com/search?q={}", url_encode(app_name));
        let _ = open_browser_url(&search_url);

        ActionResult {
            success: true,
            message: format!("App not found locally. Opened web search for '{}'", app_name),
        }
    }

    #[cfg(target_os = "macos")]
    {
        // On macOS: 'open -a <app>'
        let target = hint.unwrap_or(app_name);
        if let Ok(status) = Command::new("open").args(["-a", target]).status() {
            if status.success() {
                return ActionResult {
                    success: true,
                    message: format!("Launched {}", app_name),
                };
            }
        }

        // Universal web fallback on macOS
        let search_url = format!("https://www.google.com/search?q={}", url_encode(app_name));
        let _ = open_browser_url(&search_url);

        ActionResult {
            success: true,
            message: format!("App not found locally. Opened web search for '{}'", app_name),
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let search_url = format!("https://www.google.com/search?q={}", url_encode(app_name));
        let _ = open_browser_url(&search_url);
        ActionResult {
            success: true,
            message: format!("Opened web search for '{}'", app_name),
        }
    }
}

/// Executes any ActionIntent
pub fn execute_intent(intent: ActionIntent) -> ActionResult {
    match intent {
        ActionIntent::OpenUrl { url, domain } => match open_browser_url(&url) {
            Ok(_) => ActionResult {
                success: true,
                message: format!("Opened {}", domain),
            },
            Err(e) => ActionResult {
                success: false,
                message: e,
            },
        },
        ActionIntent::SearchWeb { provider, query, url } => match open_browser_url(&url) {
            Ok(_) => ActionResult {
                success: true,
                message: format!("Searching {} for '{}'", provider, query),
            },
            Err(e) => ActionResult {
                success: false,
                message: e,
            },
        },
        ActionIntent::LaunchApp {
            app_name,
            executable_hint,
            display_name,
        } => {
            let res = launch_desktop_app(&app_name, executable_hint.as_deref());
            ActionResult {
                success: res.success,
                message: if res.message.contains("not found") {
                    res.message
                } else {
                    format!("Launched {}", display_name)
                },
            }
        }
    }
}

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
