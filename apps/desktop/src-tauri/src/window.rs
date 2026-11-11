use std::sync::Mutex;
use crate::wake_word::WakeWordService;

#[derive(Default)]
pub struct AppState {
    pub previous_hwnd: Mutex<Option<isize>>,
    pub server_process: Mutex<Option<std::process::Child>>,
    pub wake_word_service: Mutex<WakeWordService>,
}

#[cfg(target_os = "windows")]
pub fn get_foreground_window() -> Option<isize> {
    use windows_sys::Win32::UI::WindowsAndMessaging::GetForegroundWindow;
    unsafe {
        let hwnd = GetForegroundWindow();
        if !hwnd.is_null() {
            println!("[Rust Window] get_foreground_window: {:p}", hwnd);
            Some(hwnd as isize)
        } else {
            None
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_foreground_window() -> Option<isize> {
    None
}

#[cfg(target_os = "windows")]
pub fn restore_foreground_window(hwnd: isize) {
    use windows_sys::Win32::Foundation::HWND;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        BringWindowToTop, GetForegroundWindow, SetForegroundWindow,
    };

    unsafe {
        let target_hwnd = hwnd as HWND;
        let foreground_hwnd = GetForegroundWindow();
        println!("[Rust Window] restore_foreground_window target: {:p}, current: {:p}", target_hwnd, foreground_hwnd);
        if foreground_hwnd != target_hwnd {
            BringWindowToTop(target_hwnd);
            SetForegroundWindow(target_hwnd);
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub fn restore_foreground_window(_hwnd: isize) {}
