import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { buttons } from "../styles/sharedStyle";

@customElement("confirm-dialog")
export class ConfirmDialog extends LitElement {
  static styles = [
    buttons,
    css`
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
      }

      .dialog {
        background-color: var(--bg-light);
        color: var(--text-primary);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
      }

      @media (prefers-color-scheme: dark) {
        .dialog {
          background-color: #051924;
        }
      }

      .title {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--color-primary-600);
      }

      @media (prefers-color-scheme: dark) {
        .title {
          color: var(--color-primary-400);
        }
      }

      .buttons {
        display: flex;
        justify-content: space-around;
        gap: 1rem;
        margin-top: 1.5rem;
      }
    `,
  ];

  private _handleConfirm() {
    this.dispatchEvent(
      new CustomEvent("confirm", { bubbles: true, composed: true })
    );
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent("cancel", { bubbles: true, composed: true })
    );
  }

  render() {
    return html`
      <div class="overlay">
        <div class="dialog">
          <div class="title">
            <slot name="title">Confirm Action</slot>
          </div>
          <div>
            <slot name="message">Are you sure you want to proceed?</slot>
          </div>
          <slot name="buttons">
            <div class="buttons">
              <button class="btn secondary" @click=${this._handleCancel}>
                No
              </button>
              <button class="btn primary" @click=${this._handleConfirm}>
                Yes
              </button>
            </div>
          </slot>
        </div>
      </div>
    `;
  }
}
