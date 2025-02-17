import { HubConnection } from "@microsoft/signalr";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createSignalRConnection } from "../utils/signalr";
import { repeat } from "lit/directives/repeat.js";
import "./ConnectedClient";

type Client = {
    id: string;
    name: string;
}

@customElement("client-wrapper")
export class ClientWrapper extends LitElement {

    static styles = css`
    signal-icon svg {
      
  padding: 12px;
  height: 64px;
  width: 64px;
  border-radius: 50%;
  position: absolute;
  bottom: 3%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #042337;

    }
    `

    @state()
    private _clients: Client[] = [];
    @state()
    private _currentClient: Client | null = null;

    connection: HubConnection = createSignalRConnection("signalr/signalling");
    constructor() {
        super();
        this.connection.start();
        this.addConnectedClient = this.addConnectedClient.bind(this);
        this.updateSelf = this.updateSelf.bind(this);
        this.connection.on("UpdateSelf", this.updateSelf);
        this.connection.on("AddConnectedClient", this.addConnectedClient);
    }
    updateSelf(connectionId: string) {
        this._currentClient = { id: connectionId, name: "Client" };
        console.log(this._currentClient)
    }

    addConnectedClient(connectionId: string) {
        console.log("Client connected: " + connectionId);
        this._clients = [...this._clients, { id: connectionId, name: "Client" }];
        this.requestUpdate();
    }
    render() {
      console.log("Rendering with clients:", this._clients);
      return html`
        <div class="client-wrapper">
          ${repeat(
            this._clients,
            (client) => client.id,
            (client) => html`
              <connected-client .name=${client.name}></connected-client>
            `
          )}
        </div>
        <signal-icon></signal-icon>
      `;
    }
}