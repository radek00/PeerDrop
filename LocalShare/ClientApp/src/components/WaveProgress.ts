import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Events } from "../models/events/Events";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { ProgressUpdateEvent } from "../models/events/ProgressUpdateEvent";

@customElement("wave-progress")
export class WaveProgress extends LitElement {
  static styles = css`
    .wave-container {
      position: absolute;

      /* width: calc(100% - 10px);
          height: calc(100% - 20px); */
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
      transition: bottom 0.5s ease-in-out;
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
      /* background-color: rgba(5, 105, 159, 0.6); */
      background-color: black;
      border-radius: 48% 47% 43% 46%;
      /* Use a positive vertical translate so that the circle originates from the bottom */
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 7s linear infinite;
      z-index: 1;
    }

    .wave-change::after {
      border-radius: 47% 42% 46% 44%;
      /* background-color: rgba(5, 105, 159, 0.8); */
      background-color: black;
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 9s linear -4s infinite;
      z-index: 2;
    }

    @keyframes rotate {
      50% {
        transform: translate(-50%, 70%) rotate(180deg);
      }
      100% {
        transform: translate(-50%, 70%) rotate(360deg);
      }
    }
  `;


@query('.wave-container') private container!: HTMLCanvasElement;
@query('.wave-change') private waveChange!: HTMLCanvasElement;

constructor() {
  super();
  window.addEventListener(Events.OnProgressUpdate, (event: ProgressUpdateEvent) => {
    if (event.clientId === this.client?.id) {
      this.updateWavePosition(event.progress, -135);
    }
  })
}

  @property({ type: Object })
  client: ClientConnectionInfo | null = null;

    private updateWavePosition(percentage: number, initialPosition: number) {
      const containerHeight = this.container.offsetHeight;
      const position =
        initialPosition + containerHeight * (percentage / 100) + 10;
      this.waveChange.style.bottom = `${position}px`;
      if (percentage >= 100) {
        this.waveChange.style.display = "none";
        this.waveChange.style.bottom = `${initialPosition}px`; 

        //icon.style.backgroundColor = "var(--color-primary-700)"; // Reset the background color
      }
    }
  render() {
    return html`
      <div class="wave-container">
        <div class="wave-change"></div>
      </div>
    `;
  }
}
