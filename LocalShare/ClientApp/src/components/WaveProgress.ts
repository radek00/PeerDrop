import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Events } from "../models/events/Events";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { ProgressUpdateEvent } from "../models/events/ProgressUpdateEvent";

@customElement("wave-progress")
export class WaveProgress extends LitElement {
  static styles = css`
    .wave-container {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      overflow: hidden;
      display: none; /* Initially hidden */
      background-color: rgba(5, 65, 95, 0.45);
    }

    .wave-change {
      position: absolute;
      left: 50%;
      bottom: -135px; /* Start position */
      transition: bottom 0.5s ease-in-out;
    }

    .wave-change::before,
    .wave-change::after {
      content: "";
      position: absolute;
      width: 400px;
      height: 400px;
      bottom: 0;
      left: 50%;
      background-color: rgba(0, 133, 184, 0.75);
      border-radius: 48% 47% 43% 46%;
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 7s linear infinite;
      z-index: 1;
    }

    .wave-change::after {
      border-radius: 47% 42% 46% 44%;
      background-color: rgba(37, 139, 184, 0.55);
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 9s linear -4s infinite;
      z-index: 2;
    }

    .wave-percentage {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.25rem;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
      z-index: 10;
      opacity: 1;
      transition: opacity 0.3s ease-out;
    }

    .wave-percentage.hidden {
      opacity: 0;
    }

    @keyframes rotate {
      50% {
        transform: translate(-50%, 70%) rotate(180deg);
      }
      100% {
        transform: translate(-50%, 70%) rotate(360deg);
      }
    }

    .checkmark {
      position: absolute;
      top: 50%;
      left: 50%;
      /* Start scaled down and invisible */
      transform: translate(-50%, -50%) scale(0);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(39, 174, 96, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      opacity: 0;
      transition:
        transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        opacity 0.3s ease-in-out;
    }

    .checkmark.visible {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }

    .checkmark svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: white;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .check-path {
      stroke-dasharray: 30;
      stroke-dashoffset: 30;
      transition: stroke-dashoffset 0.5s ease-in-out 0.2s;
    }

    .checkmark.visible .check-path {
      stroke-dashoffset: 0;
    }
  `;

  @query(".wave-container") private container!: HTMLDivElement;
  @query(".wave-change") private waveChange!: HTMLDivElement;
  @query(".wave-percentage") private wavePercentage!: HTMLDivElement;
  @query(".checkmark") private checkmark!: HTMLDivElement;

  constructor() {
    super();
    window.addEventListener(Events.OnProgressUpdate, (event: Event) => {
      const progressEvent = event as ProgressUpdateEvent;
      if (progressEvent.clientId === this.client?.id) {
        this.updateWavePosition(progressEvent.progress, -135);
      }
    });
  }

  @property({ type: Object })
  client: ClientConnectionInfo | null = null;

  private updateWavePosition(percentage: number, initialPosition: number) {
    this.container.style.display = "block";

    if (percentage < 100) {
      this.waveChange.style.display = "block";
      this.wavePercentage.style.display = "block";
      this.wavePercentage.classList.remove("hidden");
      this.checkmark.classList.remove("visible");

      this.wavePercentage.textContent = `${percentage}%`;
      const containerHeight = this.container.offsetHeight;
      const position =
        initialPosition + containerHeight * (percentage / 100) + 10;
      this.waveChange.style.bottom = `${position}px`;
    } else if (percentage >= 100) {
      this.waveChange.style.display = "none";
      this.wavePercentage.classList.add("hidden");

      setTimeout(() => {
        if (this.checkmark) {
          this.checkmark.classList.add("visible");
        }
      }, 300);
    }
  }

  render() {
    return html`
      <div class="wave-container">
        <div class="wave-change"></div>
        <div class="wave-percentage"></div>
        <div class="checkmark">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            {/* Use a path suitable for stroke animation */}
            <path class="check-path" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    `;
  }
}
