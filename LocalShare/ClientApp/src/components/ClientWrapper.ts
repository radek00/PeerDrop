import { HubConnection } from "@microsoft/signalr";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createSignalRConnection } from "../utils/signalr";
import { repeat } from "lit/directives/repeat.js";
import "./ConnectedClient";
import { SignallingEvents } from "../models/SignallingEvents";
import { ClientInfo } from "../models/ClientInfo";

type Client = {
  id: string;
  name: string;
};

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
    .client-wrapper {
      display: flex;
      height: 100vh;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }
  `;

  @state()
  private _clients: string[] = [];
  @state()
  private _currentClient: string | null = null;

  connection: HubConnection = createSignalRConnection("signalr/signalling");
  constructor() {
    super();
    this.connection.start();
    this.addConnectedClient = this.addConnectedClient.bind(this);
    this.updateSelf = this.updateSelf.bind(this);
    this.removeDisconnectedClient = this.removeDisconnectedClient.bind(this);
    this.connection.on(SignallingEvents.UpdateSelf, this.updateSelf);
    this.connection.on(SignallingEvents.AddConnectedClient, this.addConnectedClient);
    this.connection.on(SignallingEvents.RemoveDisconnectedClient, this.removeDisconnectedClient);

  }
  updateSelf(clientInfo: ClientInfo) {
    console.log("Updating self", clientInfo);
    this._currentClient = clientInfo.selfId;
    this._clients = clientInfo.otherClients;
  }

  addConnectedClient(connectionId: string) {
    console.log("Client connected: " + connectionId);
    this._clients = [...this._clients, connectionId];
  }

  removeDisconnectedClient(connectionId: string) {
    console.log("Client disconnected: " + connectionId);
    this._clients = this._clients.filter((client) => client !== connectionId);
  }
  render() {
    console.log("Rendering with clients:", this._clients);
    return html`
      <div class="client-wrapper">
        ${repeat(
          this._clients,
          (client) => client,
          (client) => html`
            <connected-client .name=${client}></connected-client>
          `
        )}
      </div>
      <signal-icon></signal-icon>
    `;
  }
}
