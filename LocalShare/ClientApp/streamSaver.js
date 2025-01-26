function createWriteStream(fileTransferMetadata) {
    navigator.serviceWorker.controller.postMessage({fileTransferMetadata});
    return new WritableStream(new WritableChunkStream(fileTransferMetadata));
}

class WritableChunkStream{
    fileTransferMetadata = null;
    metadataBroadcast = new BroadcastChannel("metadata");
    chunkBroadcast = new BroadcastChannel("chunk");
    downloadUrl = null;
    bytesWritten = 0;
    
    constructor(fileTransferMetadata) {
        this.fileTransferMetadata = fileTransferMetadata;
        this.metadataBroadcast.onmessage = (event) => {
            if (event.data.download) {
                if (this.bytesWritten) {
                    this.startDownload(event.data.download);
                } else {
                    this.downloadUrl = event.data.download
                }
            }
        }
    }

    write(chunk) {
        if (!(chunk instanceof Uint8Array)) {
            throw new TypeError('Can only write Uint8Arrays')
        }
        this.chunkBroadcast.postMessage({chunkData: chunk})
        this.bytesWritten += chunk.length

        if (this.downloadUrl) {
            this.startDownload();
        }
    }
    startDownload() {
        const atag = document.createElement('a');
        atag.href = event.data.download;
        atag.click();
        this.downloadUrl = null
    }
    close() {
        console.log('close')
        this.chunkBroadcast.postMessage({done: true});
        this.closeChannels();
    }
    abort() {
        console.log('abort')
        this.chunkBroadcast.postMessage({abort: true});
        this.closeChannels();
    }
    closeChannels() {
        this.metadataBroadcast.close();
        this.chunkBroadcast.close();
    }
}