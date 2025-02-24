import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../icons/PhoneIcon";
import "../icons/SignalIcon";
import { ClientConnectionInfo } from "../models/ClientInfo";
import { Events } from "../models/Events";

type IconType = "phone" | "signal";

@customElement("connected-client")
export class ConnectedClient extends LitElement {
  @property({ type: Object })
  client?: ClientConnectionInfo;

  iconMap: Record<IconType, TemplateResult> = {
    phone: html`<phone-icon></phone-icon>`,
    // computer: html`<computer-icon></computer-icon>`,
    // tablet: html`<tablet-icon></tablet-icon>`,
    signal: html`<signal-icon></signal-icon>`,
  };

  @property({ type: String })
  icon: IconType = "phone";

  static styles = css`
    .client {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }

    .client--name {
      color: var(--text-light);
      font-weight: 600;
    }
  `;

  constructor() {
    super();
    this.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent(Events.OnClientClick, {
          bubbles: true,
          detail: this.client,
          composed: true,
        })
      );
    });
  }

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
      <div class="client">
        ${this.iconMap[this.icon]} ${this.renderClient()}
        <slot></slot>
      </div>
    `;
  }
}
