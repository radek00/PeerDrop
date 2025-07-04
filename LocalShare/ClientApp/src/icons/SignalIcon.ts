import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { clientIconStyles } from "../styles/sharedStyle";

@customElement("signal-icon")
export class SignalIcon extends LitElement {
  static styles = [clientIconStyles];

  render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
      >
        <path fill="currentColor" d="M9 8a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M9.68 5.26a.75.75 0 0 1 1.06 0a3.875 3.875 0 0 1 0 5.48a.75.75 0 1 1-1.06-1.06a2.375 2.375 0 0 0 0-3.36a.75.75 0 0 1 0-1.06m-3.36 0a.75.75 0 0 1 0 1.06a2.375 2.375 0 0 0 0 3.36a.75.75 0 1 1-1.06 1.06a3.875 3.875 0 0 1 0-5.48a.75.75 0 0 1 1.06 0"
          clip-rule="evenodd"
        />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M11.89 3.05a.75.75 0 0 1 1.06 0a7 7 0 0 1 0 9.9a.75.75 0 1 1-1.06-1.06a5.5 5.5 0 0 0 0-7.78a.75.75 0 0 1 0-1.06m-7.78 0a.75.75 0 0 1 0 1.06a5.5 5.5 0 0 0 0 7.78a.75.75 0 1 1-1.06 1.06a7 7 0 0 1 0-9.9a.75.75 0 0 1 1.06 0"
          clip-rule="evenodd"
        />
      </svg>
    `;
  }
}
