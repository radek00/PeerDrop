import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("tablet-icon")
export class PhoneIcon extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;

      svg {
        height: 90%;
        width: 90%;
      }
    }
  `;
  render() {
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M5 6C3.355 6 2 7.355 2 9v14c0 1.645 1.355 3 3 3h22c1.645 0 3-1.355 3-3V9c0-1.645-1.355-3-3-3zm0 2h22c.555 0 1 .445 1 1v14c0 .555-.445 1-1 1H5c-.555 0-1-.445-1-1V9c0-.555.445-1 1-1m1 7c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1"
      />
    </svg>`;
  }
}
