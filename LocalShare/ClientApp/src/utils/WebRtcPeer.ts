import { FileMetadata } from "../models/FileMetadata";
import { SignallingEvents } from "../models/SignallingEvents";
import { SendAnswer } from "../models/messages/SendAnswer";
import { SendIceCandidate } from "../models/messages/SendIceCandidate";
import { SendOffer } from "../models/messages/SendOffer";
import { TransferStatus } from "../models/TransferStatus";
import { createWriteStream } from "./streamSaver/streamSaver";
import { UploadStatus } from "../models/UploadStatus";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export interface WebRtcPeerOptions {
  signalRConnection: signalR.HubConnection;
  file?: File;
  closeCallback?: () => void;
  progressCallback?: (progress: number, status: UploadStatus) => void;
  confirmationCallback?: (file: FileMetadata) => Promise<boolean>;
  rejectionCallback?: () => void;
}

export class WebRtcPeer {
  private _peerConnection: RTCPeerConnection;
  private _signalRConnection: signalR.HubConnection;
  public metadataChannel?: RTCDataChannel;
  public fileTransferChannel?: RTCDataChannel;
  private _file?: File;
  private _fileData?: FileMetadata;
  private _receivedSize = 0;
  private _writer?: WritableStreamDefaultWriter<Uint8Array>;
  private _closeCallback?: () => void;
  private _progressCallback?: (progress: number, status: UploadStatus) => void;
  private _targetClientId?: string;
  private _confirmationCallback: (file: FileMetadata) => Promise<boolean>;
  private _rejectionCallback?: () => void;

  constructor(options: WebRtcPeerOptions) {
    this._signalRConnection = options.signalRConnection;
    this._peerConnection = new RTCPeerConnection(configuration);
    this._file = options.file;
    this._closeCallback = options.closeCallback;
    this._progressCallback = options.progressCallback;
    this._confirmationCallback = options.confirmationCallback
      ? options.confirmationCallback
      : () => Promise.resolve(true);
    this._rejectionCallback = options.rejectionCallback;

    this._handleIceCandidate = this._handleIceCandidate.bind(this);
    this.handleDataChannel = this.handleDataChannel.bind(this);
    this._handleMetadataMessage = this._handleMetadataMessage.bind(this);
    this.onFileDataReceived = this.onFileDataReceived.bind(this);
  }

  // --- Public Methods ---

  async initConnection(targetClient: string) {
    this._targetClientId = targetClient;
    this._setupPeerConnectionListeners();
    this._setupDataChannels();

    const offer = await this._peerConnection.createOffer();
    await this._peerConnection.setLocalDescription(offer);

    const payload: SendOffer = { targetConnectionId: targetClient, offer };
    this._signalRConnection.invoke(SignallingEvents.SendOffer, payload);
  }

  async receiveOffer(
    offer: RTCSessionDescriptionInit,
    senderConnectionId: string
  ) {
    this._targetClientId = senderConnectionId;
    this._setupPeerConnectionListeners();
    this._peerConnection.ondatachannel = this.handleDataChannel;

    await this._peerConnection.setRemoteDescription(offer);
    const answer = await this._peerConnection.createAnswer();
    await this._peerConnection.setLocalDescription(answer);

    const payload: SendAnswer = {
      answer,
      targetConnectionId: senderConnectionId,
    };
    this._signalRConnection.invoke(SignallingEvents.SendAnswer, payload);
  }

  async receiveAnswer(answer: RTCSessionDescriptionInit) {
    await this._peerConnection.setRemoteDescription(answer);
  }

  async receiveIceCandidate(candidate: RTCIceCandidate) {
    await this._peerConnection.addIceCandidate(candidate);
  }

  // --- Private Setup Methods ---

  private _setupPeerConnectionListeners() {
    this._peerConnection.addEventListener(
      "icecandidate",
      this._handleIceCandidate
    );
  }

  private _setupDataChannels() {
    this.metadataChannel = this._peerConnection.createDataChannel(
      "file-metadata-channel"
    );
    this.fileTransferChannel =
      this._peerConnection.createDataChannel("file-transfer");

    this.metadataChannel.onopen = this._handleMetadataChannelOpen.bind(this);
    this.metadataChannel.onmessage = this._handleMetadataMessage;

    this.fileTransferChannel.binaryType = "arraybuffer";
    this.fileTransferChannel.addEventListener(
      "close",
      this.closeConnections.bind(this)
    );
  }

  // --- Event Handlers ---

  private _handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate && this._targetClientId) {
      const payload: SendIceCandidate = {
        targetConnectionId: this._targetClientId,
        candidate: event.candidate,
      };
      this._signalRConnection.invoke(
        SignallingEvents.SendIceCandidate,
        payload
      );
    }
  }

  private _handleMetadataChannelOpen() {
    this._fileData = {
      name: this._file!.name,
      size: this._file!.size,
      type: this._file!.type,
      lastModified: this._file!.lastModified,
      status: TransferStatus.Pending,
    };
    this.metadataChannel?.send(JSON.stringify(this._fileData));
  }

  private _handleMetadataMessage(event: MessageEvent) {
    const data = JSON.parse(event.data) as FileMetadata;
    this._fileData = data;

    switch (data.status) {
      case TransferStatus.Pending:
        this._handlePendingTransfer();
        break;
      case TransferStatus.InProgress:
        this._startSendingFileData();
        break;
      case TransferStatus.Completed:
        console.log("File transfer complete signal received via metadata.");
        this.closeConnections();
        break;
      case TransferStatus.Rejected:
        this._rejectionCallback?.();
        this.closeConnections();
        break;
    }
  }

  private async _handlePendingTransfer() {
    if (await this._confirmationCallback(this._fileData!)) {
      this._updateMetadataStatus(TransferStatus.InProgress);
    } else {
      this._updateMetadataStatus(TransferStatus.Rejected);
    }
  }

  private _updateMetadataStatus(status: TransferStatus) {
    if (this.metadataChannel && this._fileData) {
      this._fileData.status = status;
      this.metadataChannel.send(JSON.stringify(this._fileData));
    }
  }

  private _startSendingFileData() {
    if (this.fileTransferChannel?.readyState === "open") {
      this.sendFileData();
    } else {
      // Wait for the channel to open if it's not ready yet
      this.fileTransferChannel?.addEventListener("open", () => {
        this.sendFileData();
      });
    }
  }

  // Handler for the datachannel event on the receiving peer
  public handleDataChannel(event: RTCDataChannelEvent) {
    const { channel } = event;
    if (channel.label === "file-metadata-channel") {
      this.metadataChannel = channel;
      this.metadataChannel.onmessage = this._handleMetadataMessage;
    } else if (channel.label === "file-transfer") {
      this.fileTransferChannel = channel;
      this.fileTransferChannel.binaryType = "arraybuffer";
      this.fileTransferChannel.onmessage = this.onFileDataReceived;
      this.fileTransferChannel.addEventListener(
        "close",
        this.closeConnections.bind(this)
      );
    }
  }

  // --- File Transfer Logic ---

  private sendFileData() {
    const chunkSize = 5 * 1024;
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.addEventListener("error", (error) =>
      console.error("Error reading file:", error)
    );
    fileReader.addEventListener("abort", (event) =>
      console.log("File reading aborted:", event)
    );
    this._progressCallback?.(0, UploadStatus.STARTING);
    fileReader.addEventListener("load", (e) => {
      try {
        if (!e.target?.result) return;
        const result = e.target.result as ArrayBuffer;
        this.fileTransferChannel!.send(result);
        offset += result.byteLength;
        console.log("File data sent", offset, this._file!.size);
        const progress = Math.round((offset / this._file!.size) * 100);
        this._progressCallback?.(
          progress,
          progress !== 100 ? UploadStatus.UPLOADING : UploadStatus.COMPLETED
        );
        if (offset < this._file!.size) {
          readSlice(offset);
        }
      } catch (error) {
        this._progressCallback?.(
          Math.round((offset / this._file!.size) * 100),
          UploadStatus.ERROR
        );
        console.error(
          "Error sending file data. Download might have been cancelled:",
          error
        );
      }
    });

    const readSlice = (o: number) => {
      const slice = this._file!.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  }

  private async onFileDataReceived(event: MessageEvent) {
    try {
      if (this._receivedSize === 0) {
        const fileStream = createWriteStream(this._fileData!, () => {
          this.closeConnections();
        });
        this._writer = fileStream.getWriter();
      }

      await this._writer!.write(new Uint8Array(event.data));
      this._receivedSize += event.data.byteLength;
      console.log(
        "Received file data",
        this._receivedSize,
        this._fileData?.size
      );
    } catch (error) {
      console.error("Error writing file data:", error);
      this._writer?.close();
      this.closeConnections();
    }
  }

  // --- Cleanup ---

  public closeConnections() {
    console.log("Closing WebRTC Peer Connections and Channels.");
    this.fileTransferChannel?.close();
    this.metadataChannel?.close();
    this._peerConnection.close();
    this._closeCallback?.();
  }
}
