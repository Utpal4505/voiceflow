use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::OnceLock;
use tauri::{AppHandle, Emitter};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::System::Threading::{
    GetCurrentThread, GetCurrentThreadId, SetThreadPriority, THREAD_PRIORITY_TIME_CRITICAL,
};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{VK_ESCAPE, VK_RETURN};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, PeekMessageW, PostThreadMessageW,
    SetWindowsHookExW, TranslateMessage, UnhookWindowsHookEx, HHOOK, KBDLLHOOKSTRUCT, MSG,
    PM_NOREMOVE, WH_KEYBOARD_LL, WM_KEYDOWN, WM_SYSKEYDOWN, WM_USER,
};

const WM_HOOK_ACTIVATE: u32 = WM_USER + 101;
const WM_HOOK_DEACTIVATE: u32 = WM_USER + 102;

static HOOK_THREAD_ID: AtomicU32 = AtomicU32::new(0);
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
static mut CURRENT_HOOK: HHOOK = std::ptr::null_mut();

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
                        if CURRENT_HOOK.is_null() {
                            CURRENT_HOOK = SetWindowsHookExW(
                                WH_KEYBOARD_LL,
                                Some(low_level_keyboard_proc),
                                std::ptr::null_mut(),
                                0,
                            );
                        }
                    }
                    WM_HOOK_DEACTIVATE => {
                        if !CURRENT_HOOK.is_null() {
                            UnhookWindowsHookEx(CURRENT_HOOK);
                            CURRENT_HOOK = std::ptr::null_mut();
                        }
                    }
                    _ => {
                        TranslateMessage(&msg);
                        DispatchMessageW(&msg);
                    }
                }
            }

            if !CURRENT_HOOK.is_null() {
                UnhookWindowsHookEx(CURRENT_HOOK);
                CURRENT_HOOK = std::ptr::null_mut();
            }
        }
    });
}

pub fn set_hook_active(active: bool) {
    let tid = HOOK_THREAD_ID.load(Ordering::SeqCst);
    if tid != 0 {
        unsafe {
            let msg = if active {
                WM_HOOK_ACTIVATE
            } else {
                WM_HOOK_DEACTIVATE
            };
            PostThreadMessageW(tid, msg, 0, 0);
        }
    }
}

pub fn is_hook_active() -> bool {
    unsafe { !CURRENT_HOOK.is_null() }
}

unsafe extern "system" fn low_level_keyboard_proc(
    code: i32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    unsafe {
        if code >= 0 {
            let msg = wparam as u32;
            if msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN {
                let kbd = *(lparam as *const KBDLLHOOKSTRUCT);
                let vk = kbd.vkCode as u16;

                if vk == VK_RETURN {
                    if let Some(app) = APP_HANDLE.get() {
                        let _ = app.emit("dictation:submit", ());
                        let _ = app.emit("overlay:submit", ());
                    }
                    return 1; // Consume Enter key so it does not type newline into the active editor
                }

                if vk == VK_ESCAPE {
                    if let Some(app) = APP_HANDLE.get() {
                        let _ = app.emit("dictation:cancel", ());
                        let _ = app.emit("overlay:hide", ());
                    }
                    return 1; // Consume Escape key
                }
            }
        }

        CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
    }
}
