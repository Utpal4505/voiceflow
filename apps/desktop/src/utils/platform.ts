export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function getShortcutDisplay(): {
  modKey: string;
  key: string;
  description: string;
  altModKey?: string;
} {
  if (isMac()) {
    return {
      modKey: "⌥ Option",
      key: "Space",
      description:
        "Press this hotkey anywhere on macOS—in VS Code, Cursor, Slack, or Notes—to dictate directly into your active cursor without switching windows.",
      altModKey: "⌃ Ctrl",
    };
  }
  return {
    modKey: "Ctrl",
    key: "Space",
    description:
      "Press this hotkey anywhere in Windows—in VS Code, Slack, Word, or Chrome—to dictate directly into your active cursor without switching windows.",
  };
}
