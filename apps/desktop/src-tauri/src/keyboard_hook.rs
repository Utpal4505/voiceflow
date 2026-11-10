use std::sync::atomic::{AtomicBool, AtomicPtr, AtomicU32, Ordering};
use std::sync::{Mutex, OnceLock};
use tauri::{AppHandle, Emitter, Manager};
use crate::window::{restore_foreground_window, AppState};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::System::Threading::{
    GetCurrentThread, GetCurrentThreadId, SetThreadPriority, THREAD_PRIORITY_TIME_CRITICAL,
};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    GetAsyncKeyState, VK_CONTROL, VK_ESCAPE, VK_LCONTROL, VK_RCONTROL, VK_RETURN, VK_SPACE,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, PeekMessageW, SetWindowsHookExW,
    TranslateMessage, UnhookWindowsHookEx, KBDLLHOOKSTRUCT, MSG, PM_NOREMOVE, WH_KEYBOARD_LL,
    WM_KEYDOWN, WM_KEYUP, WM_SYSKEYDOWN, WM_SYSKEYUP,
};

static HOOK_THREAD_ID: AtomicU32 = AtomicU32::new(0);
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
static CURRENT_HOOK: AtomicPtr<std::ffi::c_void> = AtomicPtr::new(std::ptr::null_mut());
pub static IS_OVERLAY_ACTIVE: AtomicBool = AtomicBool::new(false);
static PUSH_TO_TALK_HOLDING: AtomicBool = AtomicBool::new(false);
static PRESS_START_TIME: Mutex<Option<std::time::Instant>> = Mutex::new(None);

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

            let new_hook = SetWindowsHookExW(
                WH_KEYBOARD_LL,
                Some(low_level_keyboard_proc),
                std::ptr::null_mut(),
                0,
            );
            CURRENT_HOOK.store(new_hook as _, Ordering::SeqCst);
            println!("[Rust Hook] System-wide low-level keyboard hook ACTIVATED (handle: {:p})", new_hook);

            while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }

            let hook = CURRENT_HOOK.swap(std::ptr::null_mut(), Ordering::SeqCst);
            if !hook.is_null() {
                UnhookWindowsHookEx(hook as _);
            }
        }
    });
}

pub fn set_hook_active(active: bool) {
    set_overlay_active(active);
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
        if code >= 0 {
            let msg = wparam as u32;
            let kbd = *(lparam as *const KBDLLHOOKSTRUCT);
            let vk = kbd.vkCode as u16;

            // 1. Push-to-Talk and Global Shortcut Handler (Ctrl + Space)
            if msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN {
                if vk == VK_SPACE {
                    let is_ctrl_down = GetAsyncKeyState(VK_CONTROL as i32) < 0
                        || GetAsyncKeyState(VK_LCONTROL as i32) < 0
                        || GetAsyncKeyState(VK_RCONTROL as i32) < 0;

                    if is_ctrl_down {
                        let was_holding = PUSH_TO_TALK_HOLDING.swap(true, Ordering::SeqCst);
                        if !was_holding {
                            // Initial press of Ctrl + Space
                            if let Ok(mut guard) = PRESS_START_TIME.lock() {
                                *guard = Some(std::time::Instant::now());
                            }

                            if let Some(app) = APP_HANDLE.get() {
                                let app_clone = app.clone();
                                let is_active = IS_OVERLAY_ACTIVE.load(Ordering::SeqCst);

                                if is_active {
                                    println!("[KeyboardHook] Ctrl+Space pressed while overlay active: toggling overlay off");
                                    std::thread::spawn(move || {
                                        crate::toggle_overlay(app_clone);
                                    });
                                } else {
                                    println!("[KeyboardHook] Ctrl+Space pressed: activating overlay");
                                    std::thread::spawn(move || {
                                        crate::show_overlay(app_clone);
                                    });
                                }
                            }
                        }
                        // Consume Space keydown so spaces are never typed into the active document
                        return 1;
                    }
                }
            } else if msg == WM_KEYUP || msg == WM_SYSKEYUP {
                if PUSH_TO_TALK_HOLDING.load(Ordering::SeqCst) {
                    if vk == VK_SPACE || vk == VK_CONTROL || vk == VK_LCONTROL || vk == VK_RCONTROL {
                        PUSH_TO_TALK_HOLDING.store(false, Ordering::SeqCst);
                        let elapsed = if let Ok(mut guard) = PRESS_START_TIME.lock() {
                            guard.take().map(|start| start.elapsed())
                        } else {
                            None
                        };

                        if let Some(duration) = elapsed {
                            if duration >= std::time::Duration::from_millis(350) {
                                println!(
                                    "[KeyboardHook] [Push-to-Talk] Released after {}ms! Submitting recording...",
                                    duration.as_millis()
                                );
                                if let Some(app) = APP_HANDLE.get() {
                                    let app_clone = app.clone();
                                    std::thread::spawn(move || {
                                        let _ = app_clone.emit("overlay:submit", ());
                                        if let Some(overlay) = app_clone.get_webview_window("overlay") {
                                            let _ = overlay.emit("overlay:submit", ());
                                        }
                                    });
                                }
                            } else {
                                println!(
                                    "[KeyboardHook] [Shortcut] Quick tap detected ({}ms). Overlay remains open for dictation.",
                                    duration.as_millis()
                                );
                            }
                        }
                        return 1; // Consume keyup
                    }
                }
            }

            // 2. Active Overlay Hotkeys (Enter = Submit, Escape = Hide/Cancel)
            if IS_OVERLAY_ACTIVE.load(Ordering::SeqCst) && (msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN) {
                if vk == VK_RETURN {
                    println!("[KeyboardHook] VK_RETURN intercepted while overlay active! Emitting overlay:submit");
                    if let Some(app) = APP_HANDLE.get() {
                        let app_clone = app.clone();
                        std::thread::spawn(move || {
                            let _ = app_clone.emit("overlay:submit", ());
                            if let Some(overlay) = app_clone.get_webview_window("overlay") {
                                let _ = overlay.emit("overlay:submit", ());
                            }
                        });
                    }
                    return 1; // Consume Enter key so newline is not typed into document
                }

                if vk == VK_ESCAPE {
                    println!("[KeyboardHook] VK_ESCAPE intercepted while overlay active! Hiding overlay and restoring focus");
                    set_overlay_active(false);
                    if let Some(app) = APP_HANDLE.get() {
                        let app_clone = app.clone();
                        std::thread::spawn(move || {
                            let _ = app_clone.emit("overlay:hide", ());
                            if let Some(overlay) = app_clone.get_webview_window("overlay") {
                                let _ = overlay.emit("overlay:hide", ());
                                crate::hide_overlay_window(&overlay);
                            }
                            let state = app_clone.state::<AppState>();
                            if let Ok(mut guard) = state.previous_hwnd.lock() {
                                if let Some(hwnd) = guard.take() {
                                    println!("[KeyboardHook] Restoring previous foreground window: {:x}", hwnd);
                                    restore_foreground_window(hwnd);
                                }
                            }
                        });
                    }
                    return 1; // Consume Escape key
                }
            }
        }

        CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
    }
}
