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
} from "./models/messages/ClientInfo";
import { WebRtcPeer } from "./utils/WebRtcPeer";
import { ReceiveOffer } from "./models/messages/ReceiveOffer";
import { ReceiveIceCandidate } from "./models/messages/ReceiveIceCandidate";
import { ReceiveAnswer } from "./models/messages/ReceiveAnswer";
import { ClientSelectedEvent } from "./models/events/ClientSelectedEvent";
import { ProgressUpdateEvent } from "./models/events/ProgressUpdateEvent";
import { UploadStatus } from "./models/UploadStatus";

setInterval(() => {
  navigator.serviceWorker.controller?.postMessage("ping");
}, 10000);

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

  private _connectionMap: Map<string, WebRtcPeer> = new Map();

  connection: HubConnection = createSignalRConnection("signalr/signalling");
  constructor() {
    super();
    this.grid.start();
    this.connection.start();
    this.addConnectedClient = this.addConnectedClient.bind(this);
    this.updateSelf = this.updateSelf.bind(this);
    this.receiveOffer = this.receiveOffer.bind(this);
    this.receiveIceCandidate = this.receiveIceCandidate.bind(this);
    this.receiveAnswer = this.receiveAnswer.bind(this);
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
    this.connection.on(SignallingEvents.ReceiveOffer, this.receiveOffer);
    this.connection.on(
      SignallingEvents.ReceiveIceCandidate,
      this.receiveIceCandidate
    );
    this.connection.on(SignallingEvents.ReceiveAnswer, this.receiveAnswer);
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

  receiveOffer(payload: ReceiveOffer) {
    const peerConnection = new WebRtcPeer(this.connection, undefined, () => {
      this._connectionMap.delete(payload.senderConnectionId);
      console.log("connection map", this._connectionMap);
    });
    this._connectionMap.set(payload.senderConnectionId, peerConnection);
    peerConnection.receiveOffer(payload.offer, payload.senderConnectionId);
  }

  receiveIceCandidate(payload: ReceiveIceCandidate) {
    const peerConnection = this._connectionMap.get(payload.senderConnectionId);
    if (peerConnection) {
      peerConnection.receiveIceCandidate(payload.candidate);
    }
  }

  receiveAnswer(payload: ReceiveAnswer) {
    const peerConnection = this._connectionMap.get(payload.senderConnectionId);
    if (peerConnection) {
      peerConnection.receiveAnswer(payload.answer);
    }
  }

  private _clientSelectedListener = async (event: ClientSelectedEvent) => {
    console.log("Client selected", event.client, event.file);
    const peerConnection = new WebRtcPeer(
      this.connection,
      event.file,
      () => {
        this._connectionMap.delete(event.client.id);
        console.log("connection map", this._connectionMap);
      },
      (progress: number, status: UploadStatus) => {
        console.log("Progress", progress);
        if (status === UploadStatus.STARTING) {
          const requestedClient = this._clients.find(
            (client) => client.id === event.client.id
          );
          requestedClient!.uploadStatus = UploadStatus.STARTING;
          this._clients = [...this._clients];
        } else if (status === UploadStatus.COMPLETED) {
          const requestedClient = this._clients.find(
            (client) => client.id === event.client.id
          );
          requestedClient!.uploadStatus = UploadStatus.COMPLETED;
          this._clients = [...this._clients];
        }
        this.dispatchEvent(
          new ProgressUpdateEvent(event.client.id, [progress, status])
        );
      }
    );
    await peerConnection.initConnection(event.client.id);
    this._connectionMap.set(event.client.id, peerConnection);
  };

  getCurrentClient() {
    if (this._currentClient) {
      return html`<connected-client .clickable=${false} icon="signal">
        <span class="client--name" slot="footer"
          >You're known as ${this._currentClient.userAgent.browser}</span
        >
      </connected-client>`;
    }
  }
  render() {
    console.log("Rendering app");
    return html`<client-wrapper
        @onClientSelected=${this._clientSelectedListener}
        .clients=${this._clients}
      ></client-wrapper>
      <div class="client-main">${this.getCurrentClient()}</div> `;
  }
}
