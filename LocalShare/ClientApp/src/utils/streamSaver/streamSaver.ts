import { FileMetadata } from "../../models/FileMetadata";
import { debugLog } from "../utils";

export function createWriteStream(
  fileTransferMetadata: FileMetadata,
  closeCallback?: () => void
): { stream: WritableStream; readyPromise: Promise<void> } {
  const channelId = window.crypto.randomUUID();
  navigator.serviceWorker.controller?.postMessage({
    fileTransferMetadata,
    channelId,
  });
  const chunkStream = new WritableChunkStream(
    fileTransferMetadata,
    channelId,
    closeCallback
  );
  return {
    stream: new WritableStream(chunkStream),
    readyPromise: chunkStream.readyPromise,
  };
}

class WritableChunkStream {
  fileTransferMetadata: FileMetadata;
  chunkBroadcast: BroadcastChannel;
  downloadUrl: string | null = null;
  bytesWritten = 0;
  downloadStarted = false;
  closeCallback?: () => void;
  public readyPromise: Promise<void>;
  private _readyResolve!: () => void;
  constructor(
    fileTransferMetadata: FileMetadata,
    channelId: string,
    closeCallback?: () => void
  ) {
    this.closeCallback = closeCallback;
    this.chunkBroadcast = new BroadcastChannel(channelId);
    this.fileTransferMetadata = fileTransferMetadata;

    this.readyPromise = new Promise<void>((resolve) => {
      this._readyResolve = resolve;
    });

    this.chunkBroadcast.onmessage = (event) => {
      if (event.data.confirmedWriteSize) {
        this.bytesWritten = event.data.confirmedWriteSize;
        debugLog(
          "Client: bytesWritten confirmation",
          this.bytesWritten,
          this.fileTransferMetadata.size
        );
        if (!this.downloadStarted) {
          this.startDownload(this.downloadUrl!);
        }
        if (this.bytesWritten >= this.fileTransferMetadata.size) {
          this.close();
        }
      } else if (event.data.download) {
        this.downloadUrl = event.data.download;
        this._readyResolve();
      }
    };
  }
  write(chunk: Uint8Array) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("Can only write Uint8Arrays");
    }

    this.chunkBroadcast.postMessage({ chunkData: chunk });
  }

  startDownload(downloadUrl: string) {
    if (this.downloadStarted) return;

    this.downloadStarted = true;
    debugLog("Client: Starting download for URL:", downloadUrl);
    const anchorElement = document.createElement("a");
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
      anchorElement.setAttribute("download", "");
    }
    anchorElement.href = downloadUrl;
    anchorElement.click();
    anchorElement.remove();
    this.chunkBroadcast.postMessage({ readStarted: true });
    debugLog("Client: 'readStarted' signal sent to service worker.");
  }

  close() {
    debugLog(
      "Client: Closing WritableChunkStream. Bytes written:",
      this.bytesWritten
    );
    this.chunkBroadcast.postMessage({ clientDoneSending: true });
    debugLog("Client: 'clientDoneSending' signal sent to service worker.");
    this.closeCallback?.();
    this.chunkBroadcast.close();
  }
}
