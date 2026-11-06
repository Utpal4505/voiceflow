use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppContext {
    pub app_name: String,
    pub window_title: String,
    pub category: String,
}

impl Default for AppContext {
    fn default() -> Self {
        Self {
            app_name: "Application".to_string(),
            window_title: String::new(),
            category: "default".to_string(),
        }
    }
}

pub fn categorize_app(exe_name: &str) -> (&'static str, &'static str) {
    let lower = exe_name.to_lowercase();

    if lower.contains("code") {
        ("VS Code", "developer")
    } else if lower.contains("cursor") {
        ("Cursor", "developer")
    } else if lower.contains("devenv") {
        ("Visual Studio", "developer")
    } else if lower.contains("idea") || lower.contains("clion") || lower.contains("webstorm") {
        ("JetBrains", "developer")
    } else if lower.contains("windowsterminal") || lower.contains("cmd") || lower.contains("powershell") {
        ("Terminal", "developer")
    } else if lower.contains("chrome") {
        ("Chrome", "browser")
    } else if lower.contains("msedge") {
        ("Edge", "browser")
    } else if lower.contains("firefox") {
        ("Firefox", "browser")
    } else if lower.contains("brave") {
        ("Brave", "browser")
    } else if lower.contains("notion") {
        ("Notion", "notes")
    } else if lower.contains("obsidian") {
        ("Obsidian", "notes")
    } else if lower.contains("slack") {
        ("Slack", "chat")
    } else if lower.contains("discord") {
        ("Discord", "chat")
    } else if lower.contains("whatsapp") {
        ("WhatsApp", "chat")
    } else if lower.contains("telegram") {
        ("Telegram", "chat")
    } else {
        ("Application", "default")
    }
}

#[cfg(target_os = "windows")]
pub fn get_window_context(hwnd: isize) -> AppContext {
    use std::path::Path;
    use windows_sys::Win32::Foundation::{CloseHandle, HWND};
    use windows_sys::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId,
    };

    if hwnd == 0 {
        return AppContext::default();
    }

    unsafe {
        let hwnd = hwnd as HWND;

        let title_len = GetWindowTextLengthW(hwnd);
        let mut title_buf = vec![0u16; (title_len + 1) as usize];
        let actual_len = GetWindowTextW(hwnd, title_buf.as_mut_ptr(), title_buf.len() as i32);
        let window_title = String::from_utf16_lossy(&title_buf[..actual_len as usize]);

        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);

        if pid == 0 {
            return AppContext {
                app_name: "Application".to_string(),
                window_title,
                category: "default".to_string(),
            };
        }

        let h_proc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        if h_proc.is_null() {
            return AppContext {
                app_name: "Application".to_string(),
                window_title,
                category: "default".to_string(),
            };
        }

        let mut path_buf = [0u16; 1024];
        let mut path_len: u32 = path_buf.len() as u32;
        let success = QueryFullProcessImageNameW(h_proc, 0, path_buf.as_mut_ptr(), &mut path_len);
        CloseHandle(h_proc);

        if success == 0 {
            return AppContext {
                app_name: "Application".to_string(),
                window_title,
                category: "default".to_string(),
            };
        }

        let full_path = String::from_utf16_lossy(&path_buf[..path_len as usize]);
        let exe_file = Path::new(&full_path)
            .file_name()
            .and_then(|f| f.to_str())
            .unwrap_or("Application");

        let (friendly_name, category) = categorize_app(exe_file);

        AppContext {
            app_name: friendly_name.to_string(),
            window_title,
            category: category.to_string(),
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_window_context(_hwnd: isize) -> AppContext {
    AppContext::default()
}
