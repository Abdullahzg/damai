interface DamToggleProps {
  enabled: boolean;
  onToggle: () => void;
  onSettings: () => void;
}

export function DamToggle({ enabled, onToggle, onSettings }: DamToggleProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <button
        data-dam-ai-toggle
        aria-pressed={enabled}
        aria-label="Improve prompts before sending"
        title="Improve prompts before sending"
        onClick={onToggle}
      >
        <span data-dam-ai-toggle-dot />
        DAM AI {enabled ? "ON" : "OFF"}
      </button>
      <button
        data-dam-ai-toggle
        aria-label="DAM AI Settings"
        title="DAM AI Settings"
        onClick={onSettings}
        style={{ padding: "4px 8px", fontSize: 12 }}
      >
        ⚙
      </button>
    </div>
  );
}
