import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../icons/PhoneIcon";
import "../icons/SignalIcon";
import { ClientConnectionInfo } from "../models/messages/ClientInfo";
import { scaleUpAnimation } from "../styles/sharedStyle";

type IconType = "phone" | "signal";

@customElement("connected-client")
export class ConnectedClient extends LitElement {
  @property({ type: Object })
  client?: ClientConnectionInfo;

  @property({ type: Boolean })
  clickable = true;

  iconMap: Record<IconType, TemplateResult> = {
    phone: html`<phone-icon></phone-icon>`,
    // computer: html`<computer-icon></computer-icon>`,
    // tablet: html`<tablet-icon></tablet-icon>`,
    signal: html`<signal-icon></signal-icon>`,
  };

  @property({ type: String })
  icon: IconType = "phone";

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
        animation: scaleUp 0.5s ease-out forwards;
      }

      .client--clickable {
        transition: transform 0.3s ease;
      }

      .client--clickable:hover {
        transform: scale(1.1);
      }

      .client--name {
        color: var(--text-primary);
        font-weight: 600;
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

      .client--clickable .icon-wrapper {
        transition: background-color 0.3s ease;
        cursor: pointer;
      }
    `,
  ];

  renderClient() {
    if (this.client) {
      return html`
        <div class="client--name">${this.client.userAgent.browser}</div>
        <div>${this.client.userAgent.os}</div>
      `;
    }
  }

  render() {
    return html`
      <div class="client ${this.clickable ? "client--clickable" : ""}">
        <div class="icon-wrapper">
          ${this.iconMap[this.icon]} <slot name="icon"></slot>
        </div>
        ${this.renderClient()}
        <slot name="footer"></slot>
      </div>
    `;
  }
}
