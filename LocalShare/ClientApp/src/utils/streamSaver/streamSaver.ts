import { FileMetadata } from "../../models/FileMetadata";

export function createWriteStream(
  fileTransferMetadata: FileMetadata,
  closeCallback?: () => void
) {
  navigator.serviceWorker.controller?.postMessage({ fileTransferMetadata });
  return new WritableStream(
    new WritableChunkStream(fileTransferMetadata, closeCallback)
  );
}

class WritableChunkStream {
  fileTransferMetadata: FileMetadata;
  chunkBroadcast: BroadcastChannel;
  downloadUrl: string | null = null;
  bytesWritten = 0;
  closeCallback?: () => void;

  constructor(fileTransferMetadata: FileMetadata, closeCallback?: () => void) {
    this.closeCallback = closeCallback;
    this.chunkBroadcast = new BroadcastChannel(
      `chunk-${fileTransferMetadata.name}`
    );
    this.fileTransferMetadata = fileTransferMetadata;

    this.chunkBroadcast.onmessage = (event) => {
      console.log("chunkBroadcast", event.data);
      if (event.data.confirmedWriteSize) {
        this.bytesWritten = event.data.confirmedWriteSize;
        console.log(
          "bytesWritten confirmation",
          this.bytesWritten,
          this.fileTransferMetadata.size
        );
        if (this.bytesWritten === this.fileTransferMetadata.size) {
          this.close();
        }
      } else if (event.data.download) {
        console.log("metadataBroadcast", event.data);
        if (this.bytesWritten) {
          this.startDownload(event.data.download);
        } else {
          this.downloadUrl = event.data.download;
        }
      } else if (event.data.close) {
        console.log("Closing WritableChunkStream", this.bytesWritten);
        this.closeCallback?.();
      }
    };
  }

  write(chunk: Uint8Array) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("Can only write Uint8Arrays");
    }
    //console.log("Writing chunk", chunk);
    this.chunkBroadcast.postMessage({ chunkData: chunk });
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
    console.log("Closing WritableChunkStream", this.bytesWritten);
    this.closeCallback?.();
  }
}
