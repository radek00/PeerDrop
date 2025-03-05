import { SignallingEvents } from "../models/SignallingEvents";
import { SendAnswer } from "../models/messages/SendAnswer";
import { SendIceCandidate } from "../models/messages/SendIceCandidate";

export class WebRtcPeer {
    private _peerConnection: RTCPeerConnection;
    private _signalRConnection: signalR.HubConnection;
    public metadataChannel?: RTCDataChannel;
    public fileTransferChannel?: RTCDataChannel;

    constructor(signalRConnection: signalR.HubConnection) {
        this._signalRConnection = signalRConnection;
        this._peerConnection = new RTCPeerConnection();
        this.handleDataChannel = this.handleDataChannel.bind(this);
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
        this._signalRConnection.invoke(SignallingEvents.SendOffer)
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
            // metaDataChannel.onmessage = event => {
            //     const data = JSON.parse(event.data);
            //     data.isTransferReady = true;
            //     fileTransferMetadata = data;
            //     metaDataChannel.send(JSON.stringify(data));
            // };
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