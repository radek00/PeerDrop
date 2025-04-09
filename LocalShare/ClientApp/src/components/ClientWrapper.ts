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

    .container {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      overflow: hidden;
    }

    /* Wave container positioned at the bottom */
    .wave-change {
      position: absolute;
      /* width: 200px;
      height: 200px; */
      left: 50%;
      bottom: -135px;
      /* animation: change 12s infinite linear; */
    }

    .wave-change::before,
    .wave-change::after {
      content: "";
      position: absolute;
      width: 400px;
      height: 400px;
      bottom: 0;
      left: 50%;
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 48% 47% 43% 46%;
      /* Use a positive vertical translate so that the circle originates from the bottom */
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 7s linear infinite;
      z-index: 1;
    }

    .wave-change::after {
      border-radius: 47% 42% 46% 44%;
      background-color: rgba(255, 255, 255, 0.8);
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 9s linear -4s infinite;
      z-index: 2;
    }

    .wave {
      background-color: rgb(118, 218, 255);
      border-radius: 50%;
    }

    p {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      color: #000;
      z-index: 10;
    }

    @keyframes rotate {
      50% {
        transform: translate(-50%, 70%) rotate(180deg);
      }
      100% {
        transform: translate(-50%, 70%) rotate(360deg);
      }
    }

    @keyframes change {
      from {
        top: 80px;
      }
      to {
        top: -120px;
      }
    }
  `;

  @property({ type: Array })
  private clients: ClientConnectionInfo[] = [];

  constructor() {
    super();
    this.simulateUploadProgress(); // Start the upload progress simulation
  }

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
    }, 500); // Update every 500ms
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
                  <div slot="icon" class="container">
                    <div class="wave-change"></div>
                    <div class="wave"></div>
                  </div>
                  <!-- <div slot="icon" class="progress">
                    <div class="progress--title">30%</div>
                    <div clasa="progress--wave"></div>
                  </div> -->
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
