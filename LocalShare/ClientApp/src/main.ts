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
import { WebRtcPeer, WebRtcPeerOptions } from "./utils/WebRtcPeer";
import { ReceiveOffer } from "./models/messages/ReceiveOffer";
import { ReceiveIceCandidate } from "./models/messages/ReceiveIceCandidate";
import { ReceiveAnswer } from "./models/messages/ReceiveAnswer";
import { ClientSelectedEvent } from "./models/events/ClientSelectedEvent";
import { ProgressUpdateEvent } from "./models/events/ProgressUpdateEvent";
import { UploadStatus } from "./models/UploadStatus";
import {
  ConfirmDialogController,
  DialogType,
} from "./utils/controllers/ConfirmDialogController";
import "./components/ConfirmDialog";
import { FileMetadata } from "./models/FileMetadata";
import { buttons, scaleUpAnimation } from "./styles/sharedStyle";
import { fileSize, registerServiceWorker } from "./utils/utils";
import "./icons/PeerIcon";
import "./components/HeaderIcons";

registerServiceWorker();
@customElement("app-component")
export class App extends LitElement {
  static styles = [
    buttons,
    scaleUpAnimation,
    css`
      .client-main {
        position: absolute;
        bottom: 5%;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-direction: column;
        width: 100%;
        animation: scaleUp 0.5s ease-out backwards;
        animation-delay: 0.2s;

        .client-name {
          color: var(--text-primary);
          font-weight: 400;
          span {
            font-style: italic;
            color: var(--color-primary-600);
            font-weight: bold;
          }
        }

        signal-icon {
          color: var(--color-primary-600);
          width: 60px;
          height: 60px;
        }
      }
      .message {
        margin-top: 0;
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-size: 2em;
      }
    `,
  ];

  grid = new ClientGrid();
  @state()
  private _clients: ClientConnectionInfo[] = [];
  @state()
  private _currentClient: ClientConnectionInfo | null = null;

  private _connectionMap: Map<string, WebRtcPeer> = new Map();

  @state()
  private _clientsInProgress: Array<[clientId: string, status: UploadStatus]> =
    [];

  connection: HubConnection = createSignalRConnection("signalr/signalling");

  dialogController = new ConfirmDialogController(this);
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
    this._currentClient = allClientsInfo.self;
    this._clients = allClientsInfo.otherClients;
    if (this._clients.length > 0 && this.grid.state === AnimationState.IDLE)
      this.grid.toggleState();
  }

  addConnectedClient(clientInfo: ClientConnectionInfo) {
    this._clients = [...this._clients, clientInfo];
    if (this._clients.length > 0 && this.grid.state === AnimationState.IDLE)
      this.grid.toggleState();
  }

  removeDisconnectedClient(connectionId: string) {
    this._clients = this._clients.filter(
      (client) => client.id !== connectionId
    );
    if (this._clients.length === 0 && this.grid.state === AnimationState.ACTIVE)
      this.grid.toggleState();
  }

  receiveOffer(payload: ReceiveOffer) {
    const peerOptions: WebRtcPeerOptions = {
      signalRConnection: this.connection,
      closeCallback: () => {
        this._connectionMap.delete(payload.senderConnectionId);
      },
      confirmationCallback: async (file: FileMetadata) => {
        const result = await this.dialogController.reveal(
          {
            title: "Transfer confirmation",
            message: `Would you like to accept a file transfer of ${file.name}(${fileSize(file.size)})?`,
          },
          DialogType.CONFIRM
        );
        return result.isCanceled === false;
      },
    };
    const peerConnection = new WebRtcPeer(peerOptions);
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
    const peerOptions: WebRtcPeerOptions = {
      signalRConnection: this.connection,
      file: event.file,
      closeCallback: () => {
        this._connectionMap.delete(event.client.id);
        this._clientsInProgress = this._clientsInProgress.filter(
          (client) => client[0] !== event.client.id
        );
      },
      progressCallback: (progress: number, status: UploadStatus) => {
        if (
          status === UploadStatus.STARTING ||
          status === UploadStatus.COMPLETED ||
          status === UploadStatus.ERROR
        ) {
          const requestedClient = this._clientsInProgress.find(
            (client) => client[0] === event.client.id
          );
          requestedClient![1] = status;
          this._clientsInProgress = [...this._clientsInProgress];
        }
        this.dispatchEvent(
          new ProgressUpdateEvent(event.client.id, [progress, status])
        );
      },
      rejectionCallback: () => {
        this.dialogController.reveal(
          {
            title: "Transfer rejection",
            message: "File transfer rejected by the recipient.",
            confirmButtonText: "OK",
          },
          DialogType.ALERT
        );
      },
    };
    const peerConnection = new WebRtcPeer(peerOptions);
    await peerConnection.initConnection(event.client.id);
    this._connectionMap.set(event.client.id, peerConnection);
    this._clientsInProgress = [
      ...this._clientsInProgress,
      [event.client.id, UploadStatus.STARTING],
    ];
  };

  getCurrentClient() {
    if (this._currentClient) {
      return html`
        <signal-icon></signal-icon>
        <span class="client-name"
          >You're known as <span  data-testid="client-name">${this._currentClient.name}</span></span
        >
      `;
    }
    return html``;
  }

  render() {
    return html` ${this._currentClient === null
      ? html`<div class="loading-overlay">Loading...</div>`
      : html` <client-wrapper
            @onClientSelected=${this._clientSelectedListener}
            .clients=${this._clients}
            .clientsInProgress=${this._clientsInProgress}
          ></client-wrapper>
          <div class="client-main">${this.getCurrentClient()}</div>`}
    ${this.dialogController.isRevealed
      ? html`<confirm-dialog
          @confirm=${() => this.dialogController.confirm()}
          @cancel=${() => this.dialogController.cancel()}
          ><div slot="title">${this.dialogController.dialogContent?.title}</div>
          <div slot="message" class="message">
            ${this.dialogController.dialogContent?.message}
          </div>
          ${this.dialogController.dialogType === DialogType.ALERT
            ? html` <div slot="buttons" class="buttons">
                <button
                  @click=${() => this.dialogController.confirm()}
                  class="btn primary"
                >
                  <span>OK</span>
                </button>
              </div>`
            : ""}
        </confirm-dialog>`
      : ""}`;
  }
}
