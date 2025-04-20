import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./ConnectedClient";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { ClientSelectedEvent } from "../models/events/ClientSelectedEvent";
import "./WaveProgress";
import { UploadStatus } from "../models/UploadStatus";
import { classMap } from "lit/directives/class-map.js";
import { scaleUpAnimation } from "../styles/sharedStyle";
@customElement("client-wrapper")
export class ClientWrapper extends LitElement {
  static styles = [scaleUpAnimation,css`
    .client-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2.5rem;
      height: 100%;
    }

    .file-input-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .file-input-wrapper input {
      position: absolute;
      opacity: 0;
    }

    .file-input-wrapper label.disabled {
      pointer-events: none;
    }

    .no-clients-message {
      color: var(--secondary-text-color);
      font-size: 1.2rem;
      font-style: italic;
      animation: scaleUp 0.5s ease-out forwards, pulse 2s infinite ease-in-out;
    }

    @keyframes pulse {
      0% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.7;
      }
    }
  `];

  @property({ type: Array })
  private clients: ClientConnectionInfo[] = [];

  private _onInputChange(event: Event, client: ClientConnectionInfo) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.dispatchEvent(new ClientSelectedEvent(client, file));
  }

  private _onInputClick(event: Event) {
    (event.target as HTMLInputElement).value = "";
  }

  render() {
    console.log("Rendering with clients:", this.clients);
    return html`
      <div class="client-wrapper">
        ${this.clients.length > 0 ? repeat(
          this.clients,
          (client) => client.id,
          (client) => {
            return html`
              <div class="file-input-wrapper">
                <label
                  class="${classMap({
                    disabled: client.uploadStatus === UploadStatus.STARTING,
                  })}"
                  for="file-input-${client.id}"
                >
                  <connected-client icon="phone" .client=${client}>
                    <wave-progress
                      .client=${client}
                      slot="icon"
                    ></wave-progress>
                  </connected-client>
                  <input
                    @input=${(event: Event) =>
                      this._onInputChange(event, client)}
                    @click=${this._onInputClick}
                    type="file"
                    class="file-input"
                    id="file-input-${client.id}"
                    ?disabled=${client.uploadStatus === UploadStatus.STARTING}
                  />
                </label>
              </div>
            `;
          }
        ) : html`<div class="no-clients-message">No clients connected. Waiting for connections...</div>`}
      </div>
    `;
  }
}
