import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { clientIconStyles } from "../styles/sharedStyle";

@customElement("phone-icon")
export class PhoneIcon extends LitElement {
  static styles = [clientIconStyles];
  render() {
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 25h2M11 3h10a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2"
      />
    </svg>`;
  }
}
