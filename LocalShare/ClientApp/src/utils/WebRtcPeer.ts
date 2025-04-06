import { FileMetadata } from "../models/FileMetadata";
import { SignallingEvents } from "../models/SignallingEvents";
import { SendAnswer } from "../models/messages/SendAnswer";
import { SendIceCandidate } from "../models/messages/SendIceCandidate";
import { SendOffer } from "../models/messages/SendOffer";
import { TransferStatus } from "../models/TransferStatus";
import { createWriteStream } from "./streamSaver/streamSaver";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

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

  constructor(
    signalRConnection: signalR.HubConnection,
    file?: File,
    closeCallback?: () => void
  ) {
    this._signalRConnection = signalRConnection;
    this._peerConnection = new RTCPeerConnection(configuration);
    this.handleDataChannel = this.handleDataChannel.bind(this);
    this.onFileDataReceived = this.onFileDataReceived.bind(this);
    this._file = file;
    this._closeCallback = closeCallback;
    //this.closeConnections = this.closeConnections.bind(this);
  }

  async initConnection(targetClient: string) {
    this._peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        const payload: SendIceCandidate = {
          targetConnectionId: targetClient,
          candidate: event.candidate,
        };
        this._signalRConnection.invoke(
          SignallingEvents.SendIceCandidate,
          payload
        );
      }
    });
    this.metadataChannel = this._peerConnection.createDataChannel(
      "file-metadata-channel"
    );
    this.fileTransferChannel =
      this._peerConnection.createDataChannel("file-transfer");

    this.fileTransferChannel.addEventListener("close", () => {
      this.closeConnections();
    });

    const offer = await this._peerConnection.createOffer();
    await this._peerConnection.setLocalDescription(offer);
    const payload: SendOffer = {
      targetConnectionId: targetClient,
      offer: offer,
    };
    this._signalRConnection.invoke(SignallingEvents.SendOffer, payload);
    this.metadataChannel.onopen = () => {
      //send file metadata
      this._fileData = {
        name: this._file!.name,
        size: this._file!.size,
        type: this._file!.type,
        lastModified: this._file!.lastModified,
        status: TransferStatus.Pending,
      };
      this.metadataChannel?.send(JSON.stringify(this._fileData));
    };
    this.metadataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data) as FileMetadata;
      this._fileData = data;
      console.log(data);
      if (data.status === TransferStatus.InProgress) {
        //send file data
        if (this.fileTransferChannel?.readyState === "open") {
          console.log("Sending file data");
          this.sendFileData();
        } else {
          this.fileTransferChannel?.addEventListener("open", () => {
            this.sendFileData();
          });
        }
      } else if (data.status === TransferStatus.Completed) {
        console.log("File transfer complete");
        this.closeConnections();
      }
    };
  }

  async receiveOffer(
    offer: RTCSessionDescriptionInit,
    senderConnectionId: string
  ) {
    this._peerConnection.setRemoteDescription(offer);
    this._peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        const payload: SendIceCandidate = {
          targetConnectionId: senderConnectionId,
          candidate: event.candidate,
        };
        this._signalRConnection.invoke(
          SignallingEvents.SendIceCandidate,
          payload
        );
      }
    });
    this._peerConnection.ondatachannel = this.handleDataChannel;
    const answer = await this._peerConnection.createAnswer();
    await this._peerConnection.setLocalDescription(answer);
    const payload: SendAnswer = {
      answer: answer,
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

  private handleDataChannel(event: RTCDataChannelEvent) {
    const { channel } = event;
    if (channel.label === "file-metadata-channel") {
      this.metadataChannel = channel;
      this.metadataChannel.onmessage = (event) => {
        //confirm that metadata was received
        const data = JSON.parse(event.data) as FileMetadata;
        data.status = TransferStatus.InProgress;
        console.log("Metadata channel message", event.data);
        this._fileData = data;
        this.metadataChannel?.send(JSON.stringify(data));
      };
    } else if (channel.label === "file-transfer") {
      this.fileTransferChannel = channel;
      this.fileTransferChannel.binaryType = "arraybuffer";
      this.fileTransferChannel.onmessage = this.onFileDataReceived;
      // fileTransferDataChannel.addEventListener('open', onChannelStateChange);
      // this.fileTransferChannel.addEventListener('close', () => {
      //   console.log("File transfer channel closed");
      // });
      // fileTransferDataChannel.addEventListener('error', onFileTransferChannelError);
    }
  }

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
    fileReader.addEventListener("load", (e) => {
      try {
        if (!e.target?.result) return;
        const result = e.target.result as ArrayBuffer;
        this.fileTransferChannel!.send(result);
        offset += result.byteLength;
        console.log("File data sent", offset, this._file!.size);
        if (offset < this._file!.size) {
          readSlice(offset);
        }
      } catch (error) {
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

    // if (this._receivedSize === this._fileData?.size) {
    //   console.log("All chunks send through web rtc");
    //   //await this._writer!.close();
    //   this.closeConnections();
    //   // setTimeout(async () => {
    //   //
    //   // }, 2000)
    // }
  }

  private closeConnections() {
    this.fileTransferChannel?.close();
    this.metadataChannel?.close();
    this._peerConnection.close();
    this._closeCallback?.();
    //this._writer = undefined;
  }
}
