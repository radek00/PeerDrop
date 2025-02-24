import { css, html, LitElement } from "lit";
import { AnimationState, ClientGrid } from "./utils/ClientGrid";
import { customElement, state } from "lit/decorators.js";
import "./components/ClientWrapper";
import { HubConnection } from "@microsoft/signalr";
import { SignallingEvents } from "./models/SignallingEvents";
import { createSignalRConnection } from "./utils/signalr";
import {
  AllClientsConnectionInfo,
  ClientConnectionInfo,
} from "./models/ClientInfo";

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}${import.meta.env.VITE_WORKER}`,
        { scope: "/" }
      );
      const devMode = import.meta.env.DEV;
      if (devMode) {
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();

@customElement("app-component")
export class App extends LitElement {
  static styles = css`
    .client-main {
      position: absolute;
      bottom: -3%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .client--name {
      color: var(--text-light);
      font-weight: 400;
    }
  `;

  grid = new ClientGrid();
  @state()
  private _clients: ClientConnectionInfo[] = [];
  @state()
  private _currentClient: ClientConnectionInfo | null = null;

  connection: HubConnection = createSignalRConnection("signalr/signalling");
  constructor() {
    super();
    this.grid.start();
    this.connection.start();
    this.addConnectedClient = this.addConnectedClient.bind(this);
    this.updateSelf = this.updateSelf.bind(this);
    this.removeDisconnectedClient = this.removeDisconnectedClient.bind(this);
    this.connection.on(SignallingEvents.UpdateSelf, this.updateSelf);
    this.connection.on(
      SignallingEvents.AddConnectedClient,
      this.addConnectedClient
    );
    this.connection.on(
      SignallingEvents.RemoveDisconnectedClient,
      this.removeDisconnectedClient
    );
  }
  updateSelf(allClientsInfo: AllClientsConnectionInfo) {
    console.log("Updating self", allClientsInfo);
    this._currentClient = allClientsInfo.self;
    this._clients = allClientsInfo.otherClients;
    if (this._clients.length > 0 && this.grid.state === AnimationState.IDLE)
      this.grid.toggleState();
  }

  addConnectedClient(clientInfo: ClientConnectionInfo) {
    console.log("Client connected: " + clientInfo);
    this._clients = [...this._clients, clientInfo];
    if (this._clients.length > 0 && this.grid.state === AnimationState.IDLE)
      this.grid.toggleState();
  }

  removeDisconnectedClient(connectionId: string) {
    console.log("Client disconnected: " + connectionId);
    this._clients = this._clients.filter(
      (client) => client.id !== connectionId
    );
    if (this._clients.length === 0 && this.grid.state === AnimationState.ACTIVE)
      this.grid.toggleState();
  }

  private _clientClickListener = (event: CustomEvent<ClientConnectionInfo>) => {
    console.log("Client clicked", event.detail);
  };

  getCurrentClient() {
    if (this._currentClient) {
      return html`<connected-client .clickable=${false} icon="signal">
        <span class="client--name"
          >You're known as ${this._currentClient.userAgent.browser}</span
        >
      </connected-client>`;
    }
  }
  render() {
    console.log("Rendering app");
    return html`<client-wrapper
        @onClientClick=${this._clientClickListener}
        .clients=${this._clients}
      ></client-wrapper>
      <div class="client-main">${this.getCurrentClient()}</div> `;
  }
}
