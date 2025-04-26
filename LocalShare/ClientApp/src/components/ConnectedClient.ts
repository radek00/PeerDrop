import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../icons/PhoneIcon";
import "../icons/SignalIcon";
import "../icons/DesktopIcon";
import "../icons/TabletIcon";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { scaleUpAnimation } from "../styles/sharedStyle";
import { IconType } from "../models/enums/IconType";

@customElement("connected-client")
export class ConnectedClient extends LitElement {
  @property({ type: Object })
  client!: ClientConnectionInfo;

  @property({ type: Boolean })
  clickable = true;

  iconMap: Record<IconType, TemplateResult> = {
    [IconType.Phone]: html`<phone-icon></phone-icon>`,
    [IconType.Desktop]: html`<desktop-icon></desktop-icon>`,
    [IconType.Tablet]: html`<tablet-icon></tablet-icon>`,
  };

  static styles = [
    scaleUpAnimation,
    css`
      .client {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        position: relative;
        animation: scaleUp 0.5s ease-out backwards;

        /* Use standard class selector for the modifier */
        &.client-clickable {
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.1);
          }

          .icon-wrapper {
            transition: background-color 0.3s ease;
            cursor: pointer;
          }
        }

        /* Nest standard class selectors */
        .client-name {
          color: var(--text-primary);
          font-weight: 600;
        }
        .client-os {
          font-size: small;
          font-style: italic;
        }
      }

      .icon-wrapper {
        position: relative;
        width: 88px;
        height: 94px;
        border-radius: 50%;
        background: linear-gradient(
          145deg,
          var(--gradient-start),
          var(--gradient-end)
        );
        box-shadow:
          0 8px 20px rgba(0, 0, 0, 0.2),
          0 4px 8px rgba(0, 0, 0, 0.1),
          inset 0 -2px 3px rgba(0, 0, 0, 0.2),
          inset 0 2px 3px rgba(255, 255, 255, 0.2);
        padding: 5px;
      }
    `,
  ];

  renderClient() {
    if (this.client) {
      return html`
        <div class="client-name">${this.client.name}</div>
        <div class="client-os">
          ${this.client.userAgent.osName}, ${this.client.userAgent.browserName}
        </div>
      `;
    }
  }

  render() {
    console.log(
      "Rendering client:",
      this.client.userAgent.icon,
      this.iconMap[this.client.userAgent.icon]
    );
    return html`
      <div class="client ${this.clickable ? "client-clickable" : ""}">
        <div class="icon-wrapper">
          ${this.iconMap[this.client.userAgent.icon]} <slot name="icon"></slot>
        </div>
        ${this.renderClient()}
        <slot name="footer"></slot>
      </div>
    `;
  }
}
