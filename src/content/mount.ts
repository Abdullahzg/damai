import React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { HostAdapter } from "./hostAdapter";
import { DamToggle } from "../ui/DamToggle";
import { Clarifier } from "../ui/Clarifier";
import { Settings } from "../ui/Settings";
import { getDamEnabled, setDamEnabled } from "../storage/settings";
import {
  initInterception,
  setDamState,
  setDamEnabledState,
} from "./intercept";
import { getHostThemeVars } from "./theme";
import "../styles/dam.css";

const ROOT_ATTR = "data-dam-ai-root";

let root: Root | null = null;
let container: HTMLDivElement | null = null;
let clarifierContainer: HTMLDivElement | null = null;
let clarifierRoot: Root | null = null;
let settingsContainer: HTMLDivElement | null = null;
let settingsRoot: Root | null = null;
let settingsBackdrop: HTMLDivElement | null = null;
let mounted = false;
let currentEnabled = false;

function applyTheme(el: HTMLElement) {
  Object.entries(getHostThemeVars()).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}

export async function mountDamUI(toolbar: HTMLElement, adapter: HostAdapter) {
  if (mounted) return;
  mounted = true;

  console.log("[DAM AI] Mounting UI on", adapter.id);

  currentEnabled = await getDamEnabled();
  setDamEnabledState(currentEnabled);

  container = document.createElement("div");
  container.setAttribute(ROOT_ATTR, "");
  applyTheme(container);
  toolbar.appendChild(container);
  root = createRoot(container);

  const renderToggle = () => {
    root?.render(
      React.createElement(DamToggle, {
        enabled: currentEnabled,
        onToggle: async () => {
          currentEnabled = !currentEnabled;
          await setDamEnabled(currentEnabled);
          setDamEnabledState(currentEnabled);
          console.log("[DAM AI] Toggle:", currentEnabled ? "ON" : "OFF");
          renderToggle();
        },
        onSettings: () => {
          showSettings(adapter);
        },
      })
    );
  };

  renderToggle();

  initInterception(adapter, () => currentEnabled, () => {
    showClarifier(adapter);
  });

  console.log("[DAM AI] UI mounted successfully");
}

function showClarifier(adapter: HostAdapter) {
  if (clarifierContainer) return;

  clarifierContainer = document.createElement("div");
  clarifierContainer.setAttribute(ROOT_ATTR, "");
  applyTheme(clarifierContainer);
  clarifierContainer.style.position = "relative";

  container?.appendChild(clarifierContainer);
  clarifierRoot = createRoot(clarifierContainer);

  clarifierRoot.render(
    React.createElement(Clarifier, {
      host: adapter.id,
      adapter,
      onCancel: () => {
        hideClarifier();
        setDamState("idle");
      },
    })
  );
}

function hideClarifier() {
  if (clarifierRoot) {
    clarifierRoot.unmount();
    clarifierRoot = null;
  }
  if (clarifierContainer) {
    clarifierContainer.remove();
    clarifierContainer = null;
  }
  setDamState("idle");
}

function showSettings(_adapter: HostAdapter) {
  if (settingsContainer) {
    hideSettings();
    return;
  }

  settingsBackdrop = document.createElement("div");
  settingsBackdrop.style.position = "fixed";
  settingsBackdrop.style.inset = "0";
  settingsBackdrop.style.background = "rgba(0,0,0,0.4)";
  settingsBackdrop.style.zIndex = "10001";
  settingsBackdrop.onclick = hideSettings;
  document.body.appendChild(settingsBackdrop);

  settingsContainer = document.createElement("div");
  settingsContainer.setAttribute(ROOT_ATTR, "");
  applyTheme(settingsContainer);
  settingsContainer.style.position = "fixed";
  settingsContainer.style.top = "50%";
  settingsContainer.style.left = "50%";
  settingsContainer.style.transform = "translate(-50%, -50%)";
  settingsContainer.style.zIndex = "10002";
  document.body.appendChild(settingsContainer);

  settingsRoot = createRoot(settingsContainer);
  settingsRoot.render(
    React.createElement(Settings, { onClose: hideSettings })
  );
}

function hideSettings() {
  if (settingsRoot) {
    settingsRoot.unmount();
    settingsRoot = null;
  }
  if (settingsContainer) {
    settingsContainer.remove();
    settingsContainer = null;
  }
  if (settingsBackdrop) {
    settingsBackdrop.remove();
    settingsBackdrop = null;
  }
}

export function isMounted(): boolean {
  return mounted;
}
