import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "../icons/InfoIcon";
import "../icons/GithubIcon";
import { buttons, headerIcon } from "../styles/sharedStyle";
import { ConfirmDialogController } from "../utils/controllers/ConfirmDialogController";

@customElement("header-icons")
export class HeaderIcons extends LitElement {
  static styles = [
    headerIcon,
    buttons, // Ensure buttons is correctly referenced if it's a separate style module
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
          width: 40px;
          height: 40px;
        }
      }
      .version-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 0.5rem; /* Add some space above the version */
      }
      .version-text {
        font-size: 0.8em;
        color: var(--secondary-text-color, #6c757d); /* Muted color */
        margin-top: 0.25rem; /* Space between icon and text */
      }

      h1 {
        margin-block: 0;
      }
    `,
  ];

  dialogController = new ConfirmDialogController(this);

  private _onInfoClick() {
    this.dialogController.reveal();
  }

  render() {
    return html`
      <div class="wrapper">
        <button>
          <info-icon @click=${this._onInfoClick}></info-icon>
        </button>
      </div>
      ${this.dialogController.isRevealed
        ? html` <confirm-dialog
            @confirm=${() => this.dialogController.confirm()}
            @cancel=${() => this.dialogController.cancel()}
            ><div slot="title">
              <h1>Peerdrop</h1>
            </div>
            <div slot="message">
              <p>
                Peerdrop is an open source application designed for sharing
                files between devices on the same network. It uses WebRTC for
                direct peer-to-peer communication and supports large files.
              </p>
              <div class="version-info">
                <a
                  href="https://github.com/radek00/LocalShare"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <github-icon></github-icon>
                </a>
                <p class="version-text">v${APP_VERSION}</p>
              </div>
            </div>
            <div slot="buttons">
              <button
                @click=${() => this.dialogController.confirm()}
                class="btn primary"
              >
                <span>Close</span>
              </button>
            </div>
          </confirm-dialog>`
        : ""}
    `;
  }
}
