# @voiceflow/desktop

Native desktop client for **VoiceFlow**, built on **Tauri v2**, **Rust**, **React 19**, and **Tailwind CSS v4**.

## Overview

The desktop package provides the native Windows integration layer, including:
- **Global Keyboard Hook (`keyboard_hook.rs`)**: Low-level Win32 hook (`WH_KEYBOARD_LL`) running on a time-critical thread to intercept <kbd>Ctrl</kbd> + <kbd>Space</kbd>, <kbd>Enter</kbd>, and <kbd>Escape</kbd>.
- **Non-Activating Overlay HUD (`window.rs` / `OverlayWindow.tsx`)**: Floating translucent interface styled with `WS_EX_NOACTIVATE` and `SW_SHOWNOACTIVATE` so foreground editors (VS Code, Word, Chrome) never lose keyboard focus.
- **Direct Keystroke Insertion (`insertion.rs`)**: Simulates paste (<kbd>Ctrl</kbd> + <kbd>V</kbd>) into the active window once dictation completes.
- **Embedded API Server Management (`server_manager.rs`)**: Detects, spawns, and gracefully terminates the background NestJS API server (`@voiceflow/api`).
- **Windows System Tray & Registry Autostart (`tray.rs`, `autostart.rs`)**: Minimizes silently to the tray and can launch on Windows boot.
- **Cryptographic Auto-Updater**: Uses `@tauri-apps/plugin-updater` with Minisign signatures.

## Tech Stack

- **Tauri v2**: Native Rust windowing, Win32 API integration, and process security.
- **React 19**: Modern declarative UI with hooks and transitions.
- **Vite 8**: Rapid HMR bundling.
- **Tailwind CSS v4**: High-performance CSS styling.
- **Zustand**: Fast, lightweight state management for audio settings, history, and custom vocabulary.
- **Socket.IO Client**: Real-time bi-directional streaming with the local NestJS backend.

## Development

```bash
# Run in standalone dev mode (starts Vite frontend on localhost:1420)
pnpm dev

# Run desktop Tauri window in dev mode (from monorepo root)
pnpm desktop

# Build frontend and compile Rust binaries
pnpm build
```

## Tauri Commands Exposed

| Command | Description |
| :--- | :--- |
| `show_overlay` | Shows the floating non-activating dictation HUD. |
| `hide_overlay` | Hides the HUD and restores target foreground window focus. |
| `toggle_overlay`| Toggles visibility of the overlay window. |
| `insert_text` | Copies text to clipboard and simulates paste into previous foreground HWND. |
| `get_active_context` | Inspects previous foreground HWND to detect application title and process. |
| `get_autostart_status` | Checks if Windows Registry autostart is enabled. |
| `set_autostart_status` | Enables or disables launch on Windows startup in Registry. |
