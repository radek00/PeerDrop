import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../icons/PhoneIcon";

@customElement("connected-client")
export class ConnectedClient extends LitElement {
  static styles = css`
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
    // Make property reactive
    @property({ type: String })
    name = "";


    render() {
        console.log('rendering client', this.name);
        return html`
            <div class="client">
                <phone-icon></phone-icon>
                <div class="client--name">${this.name}</div>
            </div>
        `;
    }
}