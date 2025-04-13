import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./ConnectedClient";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { ClientSelectedEvent } from "../models/events/ClientSelectedEvent";
import "./WaveProgress";
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
  `;

  @property({ type: Array })
  private clients: ClientConnectionInfo[] = [];

  // @property({ type: Object, hasChanged: () => true })
  // private progressMap: Map<string, number> = new Map();

  // updated(changedProperties: PropertyValues): void {
  //   if (changedProperties.has("progressMap")) {{
  //     console.log("Progress map updated:", this.progressMap);
  //   }}  
  // }

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

  private updateWavePosition(percentage: number, currentPosition: number) {
    // Find the connected-client component
    const connectedClient = this.shadowRoot?.querySelector("connected-client");
    if (!connectedClient) {
      console.warn("Connected client not found");
      return;
    }

    const icon = connectedClient.shadowRoot?.querySelector(
      ".icon-wrapper"
    ) as HTMLElement;
    icon.style.backgroundColor = "black";

    // Find the slot inside the connected-client component
    const slot = connectedClient.shadowRoot?.querySelector(
      "slot[name='icon']"
    ) as HTMLSlotElement;
    if (!slot) {
      console.warn("Slot not found in connected-client");
      return;
    }

    // Get the assigned elements in the slot
    const slottedElements = slot.assignedElements({ flatten: true });
    const container = slottedElements.find((el) =>
      el.classList.contains("container")
    ) as HTMLElement;
    const waveChange = container?.querySelector(".wave-change") as HTMLElement;

    if (container && waveChange) {
      const containerHeight = container.offsetHeight; // Get the height of the container
      const position =
        currentPosition + containerHeight * (percentage / 100) + 10; // Calculate the position
      waveChange.style.bottom = `${position}px`; // Update the bottom property
      if (percentage >= 100) {
        icon.style.backgroundColor = "var(--color-primary-700)"; // Reset the background color
      }
    } else {
      console.warn("Container or wave-change not found in slotted content");
    }
  }

  // Simulate an upload progress update
  private simulateUploadProgress() {
    let percentage = 0;
    let initialPosition = -135;

    const interval = setInterval(() => {
      if (percentage > 100) {
        clearInterval(interval);
        return;
      }

      this.updateWavePosition(percentage, initialPosition); // Update the wave position
      percentage += 5; // Increment the percentage
      console.log("Percentage:", percentage);
    }, 1000); // Update every 500ms
  }

  render() {
    console.log("Rendering with clients:", this.clients);
    return html`
      <button @click=${this.simulateUploadProgress}>Simulate progress</button>
      <div class="client-wrapper">
        ${repeat(
          this.clients,
          (client) => client,
          (client) => html`
            <div class="file-input-wrapper">
              <label>
                <connected-client icon="phone" .client=${client}>
                  <wave-progress .client=${client} slot="icon"></wave-progress>
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
