use std::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub previous_hwnd: Mutex<Option<isize>>,
}

#[cfg(target_os = "windows")]
pub fn get_foreground_window() -> Option<isize> {
    use windows_sys::Win32::UI::WindowsAndMessaging::GetForegroundWindow;
    unsafe {
        let hwnd = GetForegroundWindow();
        if !hwnd.is_null() {
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
    use windows_sys::Win32::UI::WindowsAndMessaging::SetForegroundWindow;
    unsafe {
        SetForegroundWindow(hwnd as HWND);
    }
}

#[cfg(not(target_os = "windows"))]
pub fn restore_foreground_window(_hwnd: isize) {}
