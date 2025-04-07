import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./ConnectedClient";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { ClientSelectedEvent } from "../models/events/ClientSelectedEvent";

@customElement("client-wrapper")
export class ClientWrapper extends LitElement {
  static styles = css`
    .client-wrapper {
      display: flex;
      height: 100vh;
      justify-content: center;
      align-items: center;
      gap: 2.5rem;
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

    .progress {
      position: absolute;
      width: 100%;
      height: 100%;
      text-align: center;
      top: 0;
      background-color: rgba(14, 75, 108, 0.5);
      border-radius: 50%;
      backdrop-filter: blur(5px);
    }
  `;

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
        ${repeat(
          this.clients,
          (client) => client,
          (client) => html`
            <div class="file-input-wrapper">
              <label>
                <connected-client icon="phone" .client=${client}>
                  <div slot="icon" class="progress">
                    <div class="progress--title">30%</div>
                    <div clasa="progress--wave"></div>
                  </div>
                </connected-client>
                <input
                  @input=${(event: Event) => this._onInputChange(event, client)}
                  @click=${this._onInputClick}
                  type="file"
                  class="file-input"
                  id="file-input-${client.id}"
                />
              </label>
            </div>
          `
        )}
      </div>
    `;
  }
}
