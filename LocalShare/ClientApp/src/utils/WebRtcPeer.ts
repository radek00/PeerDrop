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
    private _fileDataBuffer: Array<ArrayBuffer> = [];
    private _receivedSize = 0;

    constructor(signalRConnection: signalR.HubConnection, file?: File) {
        this._signalRConnection = signalRConnection;
        this._peerConnection = new RTCPeerConnection(configuration);
        this.handleDataChannel = this.handleDataChannel.bind(this);
        this.onFileDataReceived = this.onFileDataReceived.bind(this);
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
                    if (this.fileTransferChannel?.readyState === 'open') {
                        console.log("Sending file data");
                        this.sendFileData();
                    } else {
                        this.fileTransferChannel?.addEventListener('open', () => {
                            this.sendFileData();
                        });
                    }
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
            this.fileTransferChannel.onmessage = this.onFileDataReceived;
            // fileTransferDataChannel.addEventListener('open', onChannelStateChange);
            // fileTransferDataChannel.addEventListener('close', onChannelStateChange);
            // fileTransferDataChannel.addEventListener('error', onFileTransferChannelError);
        }
    }

    private sendFileData() {
        const chunkSize = 16384;
        const fileReader = new FileReader();
        let offset = 0;

        fileReader.addEventListener('error', error => console.error('Error reading file:', error));
        fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
        fileReader.addEventListener('load', e => {
            if (!e.target?.result)
                return;
            const result = e.target.result as ArrayBuffer;
                this.fileTransferChannel!.send(result);
                offset += result.byteLength;
                if (offset < this._file!.size) {
                    readSlice(offset);
                }
            
        });

        const readSlice = (o: number) => {
            const slice = this._file!.slice(offset, o + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        };
        readSlice(0);
    }

    private onFileDataReceived(event: MessageEvent) {
        const data = event.data as ArrayBuffer;
        this._receivedSize += data.byteLength;
        this._fileDataBuffer.push(data);
        console.log("Received data", data.byteLength, this._receivedSize);
        if (this._receivedSize === this._fileData!.size) {
            console.log("File transfer complete");
            this._fileData!.status = TransferStatus.Completed;
            this.metadataChannel?.send(JSON.stringify(this._fileData));
            const anchor = document.createElement('a');
            anchor.href = URL.createObjectURL(new Blob(this._fileDataBuffer));
            anchor.download = this._fileData!.name;
            anchor.click();
        }
    }

}