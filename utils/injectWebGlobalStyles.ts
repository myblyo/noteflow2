import { WEB_FONT_STACK } from "../constants/theme";

/** Aplica la fuente de la app en web (inputs, contenteditable, etc.). */
export function injectWebGlobalStyles() {
  if (typeof document === "undefined") return;

  const id = "noteflow-web-global-styles";
  const css = `
    html, body, #root, input, textarea, button, select {
      font-family: ${WEB_FONT_STACK};
    }
    [contenteditable="true"] {
      font-family: ${WEB_FONT_STACK};
    }
  `;

  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = css;
    return;
  }

  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}
