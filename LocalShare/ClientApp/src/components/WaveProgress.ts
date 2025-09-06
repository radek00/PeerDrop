import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Events } from "../models/events/Events";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import {
  ProgressTuple,
  ProgressUpdateEvent,
} from "../models/events/ProgressUpdateEvent";
import { TransferStatus } from "../models/TransferStatus";
import { accessibility } from "../styles/sharedStyle";

@customElement("wave-progress")
export class WaveProgress extends LitElement {
  static styles = [accessibility, css`
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
      background-color: var(--wave-bg);
    }

    .wave-change {
      position: absolute;
      left: 50%;
      bottom: -135px; /* Start position */
      transition: bottom 0.5s ease-in-out;

      &::before,
      &::after {
        content: "";
        position: absolute;
        width: 400px;
        height: 400px;
        bottom: 0;
        left: 50%;
        background-color: var(--wave-color-1);
        border-radius: 48% 47% 43% 46%;
        transform: translate(-50%, 70%) rotate(0);
        animation: rotate 7s linear infinite;
        z-index: 1;
      }

      &::after {
        border-radius: 47% 42% 46% 44%;
        background-color: var(--wave-color-2);
        transform: translate(-50%, 70%) rotate(0);
        animation: rotate 9s linear -4s infinite;
        z-index: 2;
      }
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

      &.hidden {
        opacity: 0;
      }
    }

    @keyframes rotate {
      50% {
        transform: translate(-50%, 70%) rotate(180deg);
      }
      100% {
        transform: translate(-50%, 70%) rotate(360deg);
      }
    }

    .checkmark,
    .error {
      position: absolute;
      top: 30%;
      left: 30%;
      transform: scale(0);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      opacity: 0;
      transition:
        transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        opacity 0.3s ease-in-out;

      &.visible {
        transform: scale(1);
        opacity: 1;

        path {
          stroke-dashoffset: 0;
        }
      }

      svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: white;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      path {
        stroke-dasharray: 30;
        stroke-dashoffset: 30;
        transition: stroke-dashoffset 0.5s ease-in-out 0.2s;
      }
    }
    .checkmark {
      background-color: var(--checkmark-bg);
    }
    .error {
      background-color: red;
    }
  `];

  @query(".wave-container") private container!: HTMLDivElement;
  @query(".wave-change") private waveChange!: HTMLDivElement;
  @query(".wave-percentage") private wavePercentage!: HTMLDivElement;
  @query(".checkmark") private checkmark!: HTMLDivElement;
  @query(".error") private error!: HTMLDivElement;
  @query(".announcement") private announcement!: HTMLDivElement;

  constructor() {
    super();
    window.addEventListener(Events.OnProgressUpdate, this.progressListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(Events.OnProgressUpdate, this.progressListener);
  }

  @property({ type: Object })
  client: ClientConnectionInfo | null = null;

  private progressListener = (event: Event) => {
    const progressEvent = event as ProgressUpdateEvent;
    if (progressEvent.clientId === this.client?.id) {
      this.updateWavePosition(progressEvent.progressTuple, -135);
    }
  };

  private updateWavePosition(
    progresTuple: ProgressTuple,
    initialPosition: number
  ) {
    this.container.style.display = "block";

    if (progresTuple[1] === TransferStatus.InProgress) {
      const progress = progresTuple[0].toString();
      this.wavePercentage.textContent = `${progress}%`;
      this.waveChange.setAttribute("aria-valuenow", progress);
      const containerHeight = this.container.offsetHeight;
      const position =
        initialPosition + containerHeight * (progresTuple[0] / 100) + 10;
      this.waveChange.style.bottom = `${position}px`;
    } else if (progresTuple[1] === TransferStatus.Pending) {
      this.waveChange.style.display = "block";
      this.wavePercentage.style.display = "block";
      this.wavePercentage.classList.remove("hidden");
      this.checkmark.classList.remove("visible");
      this.error.classList.remove("visible");
      this.waveChange.style.bottom = `${initialPosition}px`;
      this.announcement.textContent = "";
    } else if (progresTuple[1] === TransferStatus.Completed) {
      this.wavePercentage.classList.add("hidden");
      this.waveChange.style.display = "none";
      this.announcement.textContent = "File upload completed successfully";
      setTimeout(() => {
        if (this.checkmark) {
          this.checkmark.classList.add("visible");
        }
      }, 300);
    } else if (
      progresTuple[1] === TransferStatus.Error ||
      progresTuple[1] === TransferStatus.Cancelled
    ) {
      this.wavePercentage.classList.add("hidden");
      this.waveChange.style.display = "none";
      this.announcement.textContent = "File upload failed";
      setTimeout(() => {
        if (this.error) {
          this.error.classList.add("visible");
          this.error.setAttribute("aria-hidden", "false");
        }
      }, 300);
    }
  }

  render() {
    return html`
      <div class="wave-container" aria-label="File transfer progress">
        <div class="wave-change"></div>"
        <div class="wave-percentage" role="progressbar" aria-valuenow="0"></div>
        <div class="checkmark" data-testid="upload-success" aria-hidden="true">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path class="path" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="error" data-testid="upload-error" aria-hidden="true">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6 6 L18 18 M18 6 L6 18"></path>
          </svg>
        </div>
        <!-- Screen reader announcement region -->
        <div class="announcement sr-only" aria-live="polite"></div>
      </div>
    `;
  }
}
