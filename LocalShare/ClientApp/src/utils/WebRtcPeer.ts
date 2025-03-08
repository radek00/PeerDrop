import { SignallingEvents } from "../models/SignallingEvents";
import { SendAnswer } from "../models/messages/SendAnswer";
import { SendIceCandidate } from "../models/messages/SendIceCandidate";
import { SendOffer } from "../models/messages/SendOffer";

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

enum TransferStatus {
    Pending,
    InProgress,
    Completed,
    Error
}

interface FileMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    status: TransferStatus;
}
export class WebRtcPeer {
    private _peerConnection: RTCPeerConnection;
    private _signalRConnection: signalR.HubConnection;
    public metadataChannel?: RTCDataChannel;
    public fileTransferChannel?: RTCDataChannel;
    private _file?: File;
    private _fileData?: FileMetadata;

    constructor(signalRConnection: signalR.HubConnection, file?: File) {
        this._signalRConnection = signalRConnection;
        this._peerConnection = new RTCPeerConnection(configuration);
        this.handleDataChannel = this.handleDataChannel.bind(this);
        this._file = file;
    }

    async initConnection(targetClient: string) {
        this._peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                const payload: SendIceCandidate = {
                    targetConnectionId: targetClient,
                    candidate: event.candidate
                  };
                this._signalRConnection.invoke(SignallingEvents.SendIceCandidate, payload)
            }
        });
        this.metadataChannel =  this._peerConnection.createDataChannel("file-metadata-channel");
        this.fileTransferChannel = this._peerConnection.createDataChannel("file-transfer");

        const offer = await this._peerConnection.createOffer();
        await this._peerConnection.setLocalDescription(offer);
        const payload: SendOffer = {
            targetConnectionId: targetClient,
            offer: offer
        }
        this._signalRConnection.invoke(SignallingEvents.SendOffer, payload)
        this.metadataChannel.onopen = () => {
            //send file metadata
            this._fileData = {
                name: this._file!.name,
                size: this._file!.size,
                type: this._file!.type,
                lastModified: this._file!.lastModified,
                status: TransferStatus.Pending
            }
            this.metadataChannel?.send(JSON.stringify(this._fileData));
        }
        this.metadataChannel.onmessage = event => {
            const data = JSON.parse(event.data) as FileMetadata;
            this._fileData = data;
            console.log(data);
            if (data.status === TransferStatus.InProgress) {
                    //send file data
                    console.log("Sending file data");
            }
        }
    }

    async receiveOffer(offer: RTCSessionDescriptionInit, senderConnectionId: string) {
        this._peerConnection.setRemoteDescription(offer);
        this._peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                const payload: SendIceCandidate = {
                    targetConnectionId: senderConnectionId,
                    candidate: event.candidate
                  };
                this._signalRConnection.invoke(SignallingEvents.SendIceCandidate, payload)
            }
        });
        this._peerConnection.ondatachannel = this.handleDataChannel;
        const answer = await this._peerConnection.createAnswer();
        await this._peerConnection.setLocalDescription(answer);
        const payload: SendAnswer = {
            answer: answer,
            targetConnectionId: senderConnectionId
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
            this.metadataChannel.onmessage = event => {
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
            // fileTransferDataChannel.onmessage = onReceiveMessageCallback;
            // fileTransferDataChannel.addEventListener('open', onChannelStateChange);
            // fileTransferDataChannel.addEventListener('close', onChannelStateChange);
            // fileTransferDataChannel.addEventListener('error', onFileTransferChannelError);
        }
    }

}