import { FileMetadata } from "../../models/FileMetadata";

export function createWriteStream(
  fileTransferMetadata: FileMetadata,
  closeCallback?: () => void
) {
  const channelId = window.crypto.randomUUID();
  navigator.serviceWorker.controller?.postMessage({
    fileTransferMetadata,
    channelId,
  });
  return new WritableStream(
    new WritableChunkStream(fileTransferMetadata, channelId, closeCallback)
  );
}

class WritableChunkStream {
  fileTransferMetadata: FileMetadata;
  chunkBroadcast: BroadcastChannel;
  downloadUrl: string | null = null;
  bytesWritten = 0;
  downloadStarted = false;
  closeCallback?: () => void;

  constructor(
    fileTransferMetadata: FileMetadata,
    channelId: string,
    closeCallback?: () => void
  ) {
    this.closeCallback = closeCallback;
    this.chunkBroadcast = new BroadcastChannel(channelId);
    this.fileTransferMetadata = fileTransferMetadata;

    this.chunkBroadcast.onmessage = (event) => {
      if (event.data.confirmedWriteSize) {
        this.bytesWritten = event.data.confirmedWriteSize;
        console.log(
          "Client: bytesWritten confirmation",
          this.bytesWritten,
          this.fileTransferMetadata.size
        );
        if (this.bytesWritten >= this.fileTransferMetadata.size) {
          this.close();
        }
      } else if (event.data.download) {
        this.downloadUrl = event.data.download;
        if (!this.downloadStarted && this.downloadUrl) {
          this.startDownload(this.downloadUrl);
        }
      }
    };
  }

  write(chunk: Uint8Array) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("Can only write Uint8Arrays");
    }
    setTimeout(() => {
      this.chunkBroadcast.postMessage({ chunkData: chunk });
    }, 100);
  }

  startDownload(downloadUrl: string) {
    if (this.downloadStarted) return;

    this.downloadStarted = true;
    console.log("Client: Starting download for URL:", downloadUrl);
    const anchorElement = document.createElement("a");
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
      anchorElement.setAttribute("download", "");
    }
    anchorElement.href = downloadUrl;
    anchorElement.click();
    anchorElement.remove();
    this.chunkBroadcast.postMessage({ readStarted: true });
    console.log("Client: 'readStarted' signal sent to service worker.");
  }

  close() {
    console.log(
      "Client: Closing WritableChunkStream. Bytes written:",
      this.bytesWritten
    );
    this.chunkBroadcast.postMessage({ clientDoneSending: true });
    console.log("Client: 'clientDoneSending' signal sent to service worker.");
    this.closeCallback?.();
    this.chunkBroadcast.close();
  }
}
