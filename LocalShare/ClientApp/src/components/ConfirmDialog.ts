import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("confirm-dialog")
export class ConfirmDialog extends LitElement {
  static styles = css`
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

    .message {
      margin-top: 0;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .buttons {
      display: flex;
      justify-content: space-around;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    button {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition:
        background-color 0.2s ease,
        transform 0.1s ease;
      min-width: 80px;
    }

    button:active {
      transform: scale(0.95);
    }

    .confirm-button {
      background-color: var(--color-primary-600);
      color: white;
    }

    .confirm-button:hover {
      background-color: var(--color-primary-700);
    }

    .cancel-button {
      background-color: #e0e0e0;
      color: var(--text-dark);
    }

    .cancel-button:hover {
      background-color: #bdbdbd;
    }

    @media (prefers-color-scheme: dark) {
      .confirm-button {
        background-color: var(--color-primary-500);
      }
      .confirm-button:hover {
        background-color: var(--color-primary-400);
      }
      .cancel-button {
        background-color: #424242;
        color: var(--text-light);
      }
      .cancel-button:hover {
        background-color: #616161;
      }
    }
  `;

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
          <div class="message">
            <slot name="message">Are you sure you want to proceed?</slot>
          </div>
          <div class="buttons">
            <button class="cancel-button" @click=${this._handleCancel}>
              <slot name="cancel-text">No</slot>
            </button>
            <button class="confirm-button" @click=${this._handleConfirm}>
              <slot name="confirm-text">Yes</slot>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
