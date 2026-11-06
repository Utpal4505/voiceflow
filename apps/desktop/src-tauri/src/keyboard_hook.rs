use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::{AppHandle, Emitter, Manager};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{VK_ESCAPE, VK_RETURN};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, SetWindowsHookExW, TranslateMessage,
    UnhookWindowsHookEx, HHOOK, KBDLLHOOKSTRUCT, MSG, WH_KEYBOARD_LL, WM_KEYDOWN, WM_SYSKEYDOWN,
};

static HOOK_ACTIVE: AtomicBool = AtomicBool::new(false);
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

pub fn init_keyboard_hook(app: AppHandle) {
    let _ = APP_HANDLE.set(app);
    std::thread::spawn(|| {
        unsafe {
            let hook: HHOOK = SetWindowsHookExW(
                WH_KEYBOARD_LL,
                Some(low_level_keyboard_proc),
                std::ptr::null_mut(),
                0,
            );
            if hook == std::ptr::null_mut() {
                eprintln!("[KeyboardHook] Failed to install WH_KEYBOARD_LL hook");
                return;
            }
            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
            UnhookWindowsHookEx(hook);
        }
    });
}

pub fn set_hook_active(active: bool) {
    HOOK_ACTIVE.store(active, Ordering::SeqCst);
}

pub fn is_hook_active() -> bool {
    HOOK_ACTIVE.load(Ordering::SeqCst)
}

unsafe extern "system" fn low_level_keyboard_proc(
    code: i32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    if code >= 0 && HOOK_ACTIVE.load(Ordering::Relaxed) {
        let msg = wparam as u32;
        if msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN {
            let kbd = unsafe { *(lparam as *const KBDLLHOOKSTRUCT) };
            let vk = kbd.vkCode as u16;

            if vk == VK_RETURN {
                HOOK_ACTIVE.store(false, Ordering::SeqCst);
                if let Some(app) = APP_HANDLE.get() {
                    let _ = app.emit("overlay:submit", ());
                    if let Some(overlay) = app.get_webview_window("overlay") {
                        let _ = overlay.emit("overlay:submit", ());
                    }
                }
                return 1; // Consume Enter key so it does not type newline into the active editor
            }

            if vk == VK_ESCAPE {
                HOOK_ACTIVE.store(false, Ordering::SeqCst);
                if let Some(app) = APP_HANDLE.get() {
                    let _ = app.emit("overlay:hide", ());
                    if let Some(overlay) = app.get_webview_window("overlay") {
                        let _ = overlay.emit("overlay:hide", ());
                    }
                }
                return 1; // Consume Escape key
            }
        }
    }

    unsafe { CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam) }
}
