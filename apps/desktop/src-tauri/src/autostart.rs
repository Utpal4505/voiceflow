use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[cfg(target_os = "windows")]
use std::ffi::OsStr;
#[cfg(target_os = "windows")]
use std::os::windows::ffi::OsStrExt;
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Registry::{
    RegCloseKey, RegDeleteValueW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW,
    HKEY, HKEY_CURRENT_USER, KEY_READ, KEY_WRITE, REG_SZ,
};

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
pub struct AutostartConfig {
    pub autostart_enabled: Option<bool>,
}

fn get_config_path() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let dir = PathBuf::from(appdata).join("VoiceFlow");
            let _ = std::fs::create_dir_all(&dir);
            return Some(dir.join("autostart_settings.json"));
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(home) = std::env::var("HOME") {
            let dir = PathBuf::from(home).join(".config").join("voiceflow");
            let _ = std::fs::create_dir_all(&dir);
            return Some(dir.join("autostart_settings.json"));
        }
    }
    None
}

pub fn load_autostart_config() -> AutostartConfig {
    if let Some(path) = get_config_path() {
        if let Ok(content) = std::fs::read_to_string(&path) {
            if let Ok(config) = serde_json::from_str::<AutostartConfig>(&content) {
                return config;
            }
        }
    }
    AutostartConfig::default()
}

pub fn save_autostart_config(enabled: bool) {
    if let Some(path) = get_config_path() {
        let config = AutostartConfig {
            autostart_enabled: Some(enabled),
        };
        if let Ok(json) = serde_json::to_string_pretty(&config) {
            let _ = std::fs::write(path, json);
        }
    }
}

pub fn init_default_autostart() {
    let config = load_autostart_config();
    match config.autostart_enabled {
        None => {
            // First run: Autostart is enabled by default.
            println!("[Autostart] First run detected: initializing Windows autostart to ON by default");
            if let Err(e) = enable_autostart() {
                eprintln!("[Autostart] Failed to enable autostart on first run: {}", e);
            } else {
                save_autostart_config(true);
            }
        }
        Some(true) => {
            // User wants autostart enabled: verify/refresh registry entry (e.g. if binary path updated)
            if !is_autostart_enabled() {
                println!("[Autostart] Refreshing autostart registration in registry");
                let _ = enable_autostart();
            }
        }
        Some(false) => {
            // User explicitly disabled autostart: respect user preference and do not enable!
            println!("[Autostart] Autostart is disabled per user preference");
            if is_autostart_enabled() {
                let _ = disable_autostart();
            }
        }
    }
}

pub fn set_autostart(enabled: bool) -> Result<bool, String> {
    save_autostart_config(enabled);
    if enabled {
        enable_autostart()?;
    } else {
        disable_autostart()?;
    }
    Ok(is_autostart_enabled())
}

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
