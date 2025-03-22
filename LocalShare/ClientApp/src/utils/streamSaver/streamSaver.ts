import { FileMetadata } from "../../models/FileMetadata";

export function createWriteStream(fileTransferMetadata: FileMetadata) {
  navigator.serviceWorker.controller?.postMessage({ fileTransferMetadata });
  return new WritableStream(new WritableChunkStream(fileTransferMetadata));
}

class WritableChunkStream {
  fileTransferMetadata: FileMetadata;
  metadataBroadcast: BroadcastChannel;
  chunkBroadcast: BroadcastChannel;
  downloadUrl: string | null = null;
  bytesWritten = 0;
  private _isClosed = false;

  constructor(fileTransferMetadata: FileMetadata) {
    this.metadataBroadcast = new BroadcastChannel(
      `metadata-${fileTransferMetadata.name}`
    );
    this.chunkBroadcast = new BroadcastChannel(
      `chunk-${fileTransferMetadata.name}`
    );
    this.fileTransferMetadata = fileTransferMetadata;
    this.metadataBroadcast.onmessage = (event) => {
      console.log("metadataBroadcast", event.data);
      if (event.data.download) {
        if (this.bytesWritten) {
          this.startDownload(event.data.download);
        } else {
          this.downloadUrl = event.data.download;
        }
      }
    };
  }

  write(chunk: Uint8Array) {
    if (this._isClosed) {
      console.warn("Write called after stream was closed, ignoring");
      return;
    }

    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("Can only write Uint8Arrays");
    }
    this.chunkBroadcast.postMessage({ chunkData: chunk });
    this.bytesWritten += chunk.length;

    if (this.downloadUrl) {
      this.startDownload(this.downloadUrl);
    }
  }

  startDownload(downloadUrl: string) {
    const anchorElement = document.createElement("a");
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
      anchorElement.setAttribute("download", "");
    }
    anchorElement.href = downloadUrl;
    anchorElement.click();
    anchorElement.remove();
    this.downloadUrl = null;
  }

  close() {
    if (this._isClosed) return;
    this._isClosed = true;
    console.log("Closing WritableChunkStream");
    this.chunkBroadcast.postMessage({ done: true });
  }
}
