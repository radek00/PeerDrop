import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("signal-icon")
export class SignalIcon extends LitElement {
  static styles = css`
    svg {
      padding: 12px;
      height: 64px;
      width: 64px;
      border-radius: 50%;
      background-color: #042337;
    }
  `;

  render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 50 50"
      >
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="#344054" stroke-width="3" d="M24.896 25h.208" />
          <path
            stroke="#306cfe"
            stroke-width="2"
            d="M11.75 38.25a18.75 18.75 0 0 1 0-26.5m5.875 5.875a10.417 10.417 0 0 0 0 14.75M38.25 38.25a18.75 18.75 0 0 0 0-26.5m-5.875 20.625a10.415 10.415 0 0 0 0-14.75"
          />
        </g>
      </svg>
    `;
  }
}
