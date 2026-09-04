export function detectHostTheme(): "light" | "dark" {
  const body = document.body;
  const computedStyle = getComputedStyle(body);

  const bgColor = computedStyle.backgroundColor;
  if (bgColor) {
    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? "light" : "dark";
    }
  }

  if (body.classList.contains("dark") || document.documentElement.classList.contains("dark")) {
    return "dark";
  }

  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function getHostThemeVars(): Record<string, string> {
  const theme = detectHostTheme();

  if (theme === "dark") {
    return {
      "--dam-bg": "#2d2d2d",
      "--dam-text": "#ececec",
      "--dam-border": "#4a4a4a",
      "--dam-muted": "#9ca3af",
      "--dam-surface": "#3a3a3a",
      "--dam-hover": "#454545",
      "--dam-primary": "#8b5cf6",
    };
  }

  return {
    "--dam-bg": "#ffffff",
    "--dam-text": "#1a1a1a",
    "--dam-border": "#e5e7eb",
    "--dam-muted": "#6b7280",
    "--dam-surface": "#f9fafb",
    "--dam-hover": "#f3f4f6",
    "--dam-primary": "#7c3aed",
  };
}
