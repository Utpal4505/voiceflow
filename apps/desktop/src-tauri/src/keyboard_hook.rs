use std::sync::atomic::{AtomicBool, AtomicPtr, AtomicU32, Ordering};
use std::sync::OnceLock;
use tauri::{AppHandle, Emitter, Manager};
use crate::window::{restore_foreground_window, AppState};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::System::Threading::{
    GetCurrentThread, GetCurrentThreadId, SetThreadPriority, THREAD_PRIORITY_TIME_CRITICAL,
};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{VK_ESCAPE, VK_RETURN};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, PeekMessageW, PostThreadMessageW,
    SetWindowsHookExW, TranslateMessage, UnhookWindowsHookEx, KBDLLHOOKSTRUCT, MSG,
    PM_NOREMOVE, WH_KEYBOARD_LL, WM_KEYDOWN, WM_SYSKEYDOWN, WM_USER,
};

const WM_HOOK_ACTIVATE: u32 = WM_USER + 101;
const WM_HOOK_DEACTIVATE: u32 = WM_USER + 102;

static HOOK_THREAD_ID: AtomicU32 = AtomicU32::new(0);
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
static CURRENT_HOOK: AtomicPtr<std::ffi::c_void> = AtomicPtr::new(std::ptr::null_mut());
pub static IS_OVERLAY_ACTIVE: AtomicBool = AtomicBool::new(false);

pub fn set_overlay_active(active: bool) {
    IS_OVERLAY_ACTIVE.store(active, Ordering::SeqCst);
    println!("[Rust Hook] set_overlay_active: {}", active);
}

pub fn is_overlay_active() -> bool {
    IS_OVERLAY_ACTIVE.load(Ordering::SeqCst)
}

pub fn init_keyboard_hook(app: AppHandle) {
    let _ = APP_HANDLE.set(app);

    std::thread::spawn(|| {
        unsafe {
            let tid = GetCurrentThreadId();
            HOOK_THREAD_ID.store(tid, Ordering::SeqCst);

            // Give this thread maximum scheduling priority to prevent any scheduling latency on hybrid CPUs
            SetThreadPriority(GetCurrentThread(), THREAD_PRIORITY_TIME_CRITICAL);

            // Force creation of Win32 message queue for this thread
            let mut msg: MSG = std::mem::zeroed();
            PeekMessageW(&mut msg, std::ptr::null_mut(), 0, 0, PM_NOREMOVE);

            while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                match msg.message {
                    WM_HOOK_ACTIVATE => {
                        let hook = CURRENT_HOOK.load(Ordering::SeqCst);
                        if hook.is_null() {
                            let new_hook = SetWindowsHookExW(
                                WH_KEYBOARD_LL,
                                Some(low_level_keyboard_proc),
                                std::ptr::null_mut(),
                                0,
                            );
                            CURRENT_HOOK.store(new_hook as _, Ordering::SeqCst);
                            println!("[Rust Hook] Keyboard hook ACTIVATED (handle: {:p})", new_hook);
                        }
                    }
                    WM_HOOK_DEACTIVATE => {
                        let hook = CURRENT_HOOK.swap(std::ptr::null_mut(), Ordering::SeqCst);
                        if !hook.is_null() {
                            UnhookWindowsHookEx(hook as _);
                            println!("[Rust Hook] Keyboard hook DEACTIVATED");
                        }
                    }
                    _ => {
                        TranslateMessage(&msg);
                        DispatchMessageW(&msg);
                    }
                }
            }

            let hook = CURRENT_HOOK.swap(std::ptr::null_mut(), Ordering::SeqCst);
            if !hook.is_null() {
                UnhookWindowsHookEx(hook as _);
            }
        }
    });
}

pub fn set_hook_active(active: bool) {
    IS_OVERLAY_ACTIVE.store(active, Ordering::SeqCst);
    let tid = HOOK_THREAD_ID.load(Ordering::SeqCst);
    println!("[Rust Hook] set_hook_active called with active: {}, thread_id: {}", active, tid);
    if tid != 0 {
        unsafe {
            let msg = if active {
                WM_HOOK_ACTIVATE
            } else {
                WM_HOOK_DEACTIVATE
            };
            PostThreadMessageW(tid, msg, 0, 0);
        }
    } else {
        println!("[Rust Hook] WARNING: Hook thread ID is 0, cannot post message");
    }
}

pub fn is_hook_active() -> bool {
    !CURRENT_HOOK.load(Ordering::SeqCst).is_null()
}

unsafe extern "system" fn low_level_keyboard_proc(
    code: i32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    unsafe {
        // Fast-path: Only intercept if the overlay is explicitly marked active
        if !IS_OVERLAY_ACTIVE.load(Ordering::SeqCst) {
            return CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam);
        }

        if code >= 0 {
            let msg = wparam as u32;
            if msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN {
                let kbd = *(lparam as *const KBDLLHOOKSTRUCT);
                let vk = kbd.vkCode as u16;

                if vk == VK_RETURN {
                    if let Some(app) = APP_HANDLE.get() {
                        if let Some(overlay) = app.get_webview_window("overlay") {
                            if crate::is_overlay_window_visible(&overlay) {
                                println!("[Rust Hook] VK_RETURN intercepted while overlay is visible! Emitting overlay:submit");
                                let _ = app.emit("overlay:submit", ());
                                let _ = overlay.emit("overlay:submit", ());
                                return 1; // Consume Enter key so it does not type newline into the active editor
                            }
                        }
                    }
                }

                if vk == VK_ESCAPE {
                    if let Some(app) = APP_HANDLE.get() {
                        if let Some(overlay) = app.get_webview_window("overlay") {
                            if crate::is_overlay_window_visible(&overlay) {
                                println!("[Rust Hook] VK_ESCAPE intercepted while overlay is visible! Hiding overlay and restoring focus");
                                set_hook_active(false);

                                let _ = app.emit("overlay:hide", ());
                                let _ = overlay.emit("overlay:hide", ());
                                crate::hide_overlay_window(&overlay);
                                let state = app.state::<AppState>();
                                if let Ok(mut guard) = state.previous_hwnd.lock() {
                                    if let Some(hwnd) = guard.take() {
                                        println!("[Rust Hook] Restoring previous foreground window: {:x}", hwnd);
                                        restore_foreground_window(hwnd);
                                    }
                                }
                                return 1; // Consume Escape key
                            }
                        }
                    }
                }
            }
        }

        CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
    }
}
