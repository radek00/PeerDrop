import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("desktop-icon")
export class DesktopIcon extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;

      svg {
        height: 85%;
        width: 85%;
      }
    }
  `;
  render() {
    return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M14 27h4m-4 0l.5-4h3l.5 4m-4 0h-3m7 0h3M5 5h22a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"
      />
    </svg>`;
  }
}
