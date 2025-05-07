import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("peer-icon")
export class PeerIcon extends LitElement {
  static styles = [
    css`
      svg {
        width: 60px;
        height: 60px;
        color: var(--color-primary-500);
      }
    `,
  ];
  render() {
    return html` <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <!-- Peer 1 -->
      <path
        d="M6 8h1c1.414 0 2.121 0 2.56-.44C10 7.122 10 6.415 10 5s0-2.121-.44-2.56C9.122 2 8.415 2 7 2H5c-1.414 0-2.121 0-2.56.44C2 2.878 2 3.585 2 5s0 2.121.44 2.56C2.878 8 3.585 8 5 8z"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      >
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.5s"
          begin="0s"
          fill="freeze"
        />
      </path>
      <!-- Lines from Peer 1 -->
      <path
        d="M5 8v2.5 M5 10.5h1.5 M5 10.5H4.5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      >
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.5s"
          begin="0s"
          fill="freeze"
        />
      </path>

      <!-- Peer 2 -->
      <path
        d="M18 19.5h1c1.414 0 2.121 0 2.56-.44c.44-.439.44-1.146.44-2.56s0-2.121-.44-2.56c-.439-.44-1.146-.44-2.56-.44h-2c-1.414 0-2.121 0-2.56.44c-.44.439-.44 1.146-.44 2.56s0 2.121.44 2.56c.439-.44 1.146.44 2.56.44z"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      >
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.5s"
          begin="0s"
          fill="freeze"
        />
      </path>
      <!-- Lines from Peer 2 -->
      <path
        d="M18 19.5V22 M18 22h1.5 M18 22h-1.5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      >
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.5s"
          begin="0s"
          fill="freeze"
        />
      </path>

      <!-- Connecting Line 1 -->
      <path
        d="M13 5c2.828 0 4.243 0 5.121.879C19 6.757 19 8.172 19 11l-2-1"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="1"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          to="1"
          dur="0.01s"
          begin="0.5s"
          fill="freeze"
        />
        <animate
          attributeName="stroke-dashoffset"
          from="1"
          to="0"
          dur="0.5s"
          begin="0.5s"
          fill="freeze"
        />
      </path>

      <!-- Connecting Line 2 -->
      <path
        d="M11 19c-2.828 0-4.243 0-5.121-.879C5 17.243 5 15.828 5 13l2 1"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="1"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          to="1"
          dur="0.01s"
          begin="1s"
          fill="freeze"
        />
        <animate
          attributeName="stroke-dashoffset"
          from="1"
          to="0"
          dur="1s"
          begin="1s"
          fill="freeze"
        />
      </path>
    </svg>`;
  }
}
