import { html, LitElement, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../icons/PhoneIcon";

@customElement("connected-client")
export class ConnectedClient extends LitElement {
  @property({ type: String }) name = "";

  static styles = css`
    .client svg {
      padding: 12px;
  height: 64px;
  width: 64px;
  border-radius: 50%;
  background-color: #042337;
    }
    .client {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px
    }


    .client--name {
      color: var(--text-light);
      font-weight: 600;
    }
  `;

  render() {
    console.log(this.name)
    return html`
      <div class="client">
        <phone-icon></phone-icon>
        <div class="client--name">test</div>
      </div>
    `;
  }
}