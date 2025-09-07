import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./ConnectedClient";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { ClientSelectedEvent } from "../models/events/ClientSelectedEvent";
import "./WaveProgress";
import { classMap } from "lit/directives/class-map.js";
import { accessibility, scaleUpAnimation } from "../styles/sharedStyle";
import { TransferStatus } from "../models/TransferStatus";

@customElement("client-wrapper")
export class ClientWrapper extends LitElement {
  static styles = [
    scaleUpAnimation,
    accessibility,
    css`
      .client-wrapper {
        display: flex;
        align-items: center;
        gap: 2.5rem;
        height: 100%;
        width: 100%;
        overflow-x: auto;
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
        text-align: center;
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
  private clientsInProgress: Array<[clientId: string, status: TransferStatus]> =
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

  private _onLabelKeyUp(event: KeyboardEvent, client: ClientConnectionInfo) {
    if (event.key === "Enter" || event.key === " ") {
      const input = this.shadowRoot?.getElementById(
        `file-input-${client.id}`
      ) as HTMLInputElement | null;
      input?.click();
    }
  }

  render() {
    return html`
      <h2 class="sr-only">Devices available on network</h2>
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
                      aria-label="Select file to send to"
                      tabindex="${clientStatus === TransferStatus.Pending
                        ? -1
                        : 0}"
                      @keyup=${(event: KeyboardEvent) =>
                        this._onLabelKeyUp(event, client)}
                      class="${classMap({
                        disabled: clientStatus === TransferStatus.Pending,
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
                        tabindex="-1"
                        @input=${(event: Event) =>
                          this._onInputChange(event, client)}
                        @click=${this._onInputClick}
                        type="file"
                        class="file-input"
                        id="file-input-${client.id}"
                        ?disabled=${clientStatus === TransferStatus.Pending}
                      />
                    </label>
                  </div>
                `;
              }
            )
          : html`<div class="no-clients-message">
              Open Peerdrop on other devices to share files.
            </div>`}
      </div>
    `;
  }
}
