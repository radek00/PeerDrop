import { css, html, LitElement } from "lit";
import { ClientGrid } from "./utils/ClientGrid";
// import { createSignalRConnection } from "./utils/signalr";
import { customElement, state } from "lit/decorators.js";
import "./components/ClientWrapper";
import { HubConnection } from "@microsoft/signalr";
import { ClientInfo } from "./models/ClientInfo";
import { SignallingEvents } from "./models/SignallingEvents";
import { createSignalRConnection } from "./utils/signalr";

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

const grid = new ClientGrid();
grid.start();

const button = document.getElementById("testButton");
button?.addEventListener("click", changeStage);

function changeStage() {
  grid.toggleState();
}

@customElement("app-component")
export class App extends LitElement {
  static styles = css`
    .client-main {
      position: absolute;
      bottom: -1%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `;

  @state()
  private _clients: string[] = [];
  @state()
  private _currentClient: string = "";

  connection: HubConnection = createSignalRConnection("signalr/signalling");
  constructor() {
    super();
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
    console.log("Rendering app");
    return html`<client-wrapper .clients=${this._clients}></client-wrapper>
      <div class="client-main">
        <connected-client
          icon="signal"
          .name=${this._currentClient}
        ></connected-client>
      </div> `;
  }
}
