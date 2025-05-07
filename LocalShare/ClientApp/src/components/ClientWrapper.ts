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
  static styles = [
    scaleUpAnimation,
    css`
      .client-wrapper {
        display: flex;
        align-items: center;
        gap: 2.5rem;
        height: 100%;
        width: 100vw;
        overflow-x: scroll;
        justify-content: space-around;
      }

      .client-wrapper.force-center-justify {
        justify-content: center;
      }

      @media (min-width: 729px) {
        .client-wrapper:not(.force-center-justify) {
          justify-content: center;
        }
      }

      .client-wrapper .file-input-wrapper:first-child {
        margin-left: 1rem;
      }

      .client-wrapper .file-input-wrapper:last-child {
        margin-right: 1rem;
      }

      .file-input-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        input {
          opacity: 0;
          width: 0;
        }

        label.disabled {
          pointer-events: none;
        }
      }

      .no-clients-message {
        color: var(--secondary-text-color);
        font-size: 1.2rem;
        font-style: italic;
        animation:
          scaleUp 0.5s ease-out forwards,
          pulse 2s infinite ease-in-out;
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
    `,
  ];

  @property({ type: Array })
  private clients: ClientConnectionInfo[] = [];

  @property({ type: Array })
  private clientsInProgress: Array<[clientId: string, status: UploadStatus]> =
    [];

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
      <div
        class="client-wrapper ${classMap({
          "force-center-justify": this.clients.length < 3,
        })}"
      >
        ${this.clients.length > 0
          ? repeat(
              this.clients,
              (client) => client.id,
              (client) => {
                const clientStatus = this.clientsInProgress.find(
                  (el) => el[0] === client.id
                )?.[1];
                return html`
                  <div class="file-input-wrapper">
                    <label
                      class="${classMap({
                        disabled: clientStatus === UploadStatus.STARTING,
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
                        ?disabled=${clientStatus === UploadStatus.STARTING}
                      />
                    </label>
                  </div>
                `;
              }
            )
          : html`<div class="no-clients-message">
              No clients connected. Waiting for connections...
            </div>`}
      </div>
    `;
  }
}
