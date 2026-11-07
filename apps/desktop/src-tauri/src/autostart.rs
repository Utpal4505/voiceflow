#[cfg(target_os = "windows")]
use std::ffi::OsStr;
#[cfg(target_os = "windows")]
use std::os::windows::ffi::OsStrExt;
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Registry::{
    RegCloseKey, RegDeleteValueW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW,
    HKEY, HKEY_CURRENT_USER, KEY_READ, KEY_WRITE, REG_SZ,
};

#[cfg(target_os = "windows")]
fn to_wide_chars(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

#[cfg(target_os = "windows")]
pub fn is_autostart_enabled() -> bool {
    let subkey = to_wide_chars("Software\\Microsoft\\Windows\\CurrentVersion\\Run");
    let app_name = to_wide_chars("VoiceFlow");

    let mut hkey: HKEY = std::ptr::null_mut();
    unsafe {
        if RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_READ, &mut hkey) != 0 {
            return false;
        }

        let mut data_type: u32 = 0;
        let mut data_size: u32 = 0;
        let status = RegQueryValueExW(
            hkey,
            app_name.as_ptr(),
            std::ptr::null_mut(),
            &mut data_type,
            std::ptr::null_mut(),
            &mut data_size,
        );

        RegCloseKey(hkey);
        status == 0
    }
}

#[cfg(not(target_os = "windows"))]
pub fn is_autostart_enabled() -> bool {
    false
}

#[cfg(target_os = "windows")]
pub fn enable_autostart() -> Result<(), String> {
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_str = current_exe.to_string_lossy();
    let command_value = format!("\"{}\" --minimized", exe_str);

    let subkey = to_wide_chars("Software\\Microsoft\\Windows\\CurrentVersion\\Run");
    let app_name = to_wide_chars("VoiceFlow");
    let value_wide = to_wide_chars(&command_value);

    let mut hkey: HKEY = std::ptr::null_mut();
    unsafe {
        let open_status = RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_WRITE, &mut hkey);
        if open_status != 0 {
            return Err(format!("Failed to open Run registry key: error code {}", open_status));
        }

        let byte_len = (value_wide.len() * std::mem::size_of::<u16>()) as u32;
        let set_status = RegSetValueExW(
            hkey,
            app_name.as_ptr(),
            0,
            REG_SZ,
            value_wide.as_ptr() as *const u8,
            byte_len,
        );

        RegCloseKey(hkey);

        if set_status != 0 {
            return Err(format!("Failed to set Run registry value: error code {}", set_status));
        }

        println!("[Autostart] Registered VoiceFlow autostart in registry: {}", command_value);
        Ok(())
    }
}

#[cfg(not(target_os = "windows"))]
pub fn enable_autostart() -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "windows")]
pub fn disable_autostart() -> Result<(), String> {
    let subkey = to_wide_chars("Software\\Microsoft\\Windows\\CurrentVersion\\Run");
    let app_name = to_wide_chars("VoiceFlow");

    let mut hkey: HKEY = std::ptr::null_mut();
    unsafe {
        let open_status = RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_WRITE, &mut hkey);
        if open_status != 0 {
            return Err(format!("Failed to open Run registry key: error code {}", open_status));
        }

        let del_status = RegDeleteValueW(hkey, app_name.as_ptr());
        RegCloseKey(hkey);

        if del_status != 0 && del_status != 2 {
            // Error 2 is ERROR_FILE_NOT_FOUND (value does not exist), which is fine
            return Err(format!("Failed to remove Run registry value: error code {}", del_status));
        }

        println!("[Autostart] Unregistered VoiceFlow autostart from registry");
        Ok(())
    }
}

#[cfg(not(target_os = "windows"))]
pub fn disable_autostart() -> Result<(), String> {
    Ok(())
}
