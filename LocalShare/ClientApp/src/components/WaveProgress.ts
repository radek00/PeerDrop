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
      display: none;
      background-color: rgba(
        5,
        65,
        95,
        0.45
      ); /* Darker semi-transparent container */
      /* backdrop-filter: blur(2px); */
    }

    /* Wave container positioned at the bottom */
    .wave-change {
      position: absolute;
      display: none;
      left: 50%;
      bottom: -135px;
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
      background-color: rgba(0, 133, 184, 0.75); /* Darker blue wave */
      border-radius: 48% 47% 43% 46%;
      transform: translate(-50%, 70%) rotate(0);
      animation: rotate 7s linear infinite;
      z-index: 1;
    }

    .wave-change::after {
      border-radius: 47% 42% 46% 44%;
      background-color: rgba(37, 139, 184, 0.55); /* Darker second wave */
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
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); /* Stronger shadow for contrast */
      z-index: 10;
      display: none;
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

  @query(".wave-container") private container!: HTMLCanvasElement;
  @query(".wave-change") private waveChange!: HTMLCanvasElement;
  @query(".wave-percentage") private wavePercentage!: HTMLCanvasElement;

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
    this.waveChange.style.display = "block";
    this.wavePercentage.textContent = `${percentage}%`;
    this.wavePercentage.style.display = "block";
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
        <div class="wave-percentage">50%</div>
      </div>
    `;
  }
}
