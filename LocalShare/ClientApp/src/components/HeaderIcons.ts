import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "../icons/InfoIcon";
import { headerIcon } from "../styles/sharedStyle";

@customElement("header-icons")
export class HeaderIcons extends LitElement {
  static styles = [
    headerIcon,
    css`
      .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.4rem;
        padding-top: 1rem;
        padding-right: 1rem;

        button {
          all: unset;
          width: 60px;
          height: 60px;
        }
      }
    `,
  ];

  render() {
    return html`
      <div class="wrapper">
        <button>
          <info-icon></info-icon>
        </button>
        <!-- <peer-icon></peer-icon> -->
      </div>
    `;
  }
}
