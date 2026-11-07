use tauri::{
    menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

pub fn create_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let open_item = MenuItemBuilder::with_id("open", "Open VoiceFlow").build(app)?;
    let toggle_item = MenuItemBuilder::with_id("toggle", "Toggle Dictation (Ctrl+Space)").build(app)?;
    let autostart_enabled = crate::autostart::is_autostart_enabled();
    let autostart_item = CheckMenuItemBuilder::with_id("autostart", "Start with Windows")
        .checked(autostart_enabled)
        .build(app)?;
    let update_item = MenuItemBuilder::with_id("check_updates", "Check for Updates...").build(app)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quit VoiceFlow").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&open_item, &toggle_item, &autostart_item, &update_item, &separator, &quit_item])
        .build()?;

    let mut tray_builder = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("VoiceFlow - Voice Typing")
        .show_menu_on_left_click(false);

    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    tray_builder
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
            "toggle" => {
                crate::trigger_toggle_overlay(app.clone());
            }
            "autostart" => {
                let current = crate::autostart::is_autostart_enabled();
                if current {
                    let _ = crate::autostart::disable_autostart();
                } else {
                    let _ = crate::autostart::enable_autostart();
                }
            }
            "check_updates" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                    let _ = window.emit("check-for-updates", ());
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    println!("[Tray] System tray initialized successfully");
    Ok(())
}
