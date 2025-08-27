import { FileMetadata } from "../../models/FileMetadata";
import { debugLog } from "../utils";

export function createWriteStream(
  fileTransferMetadata: FileMetadata,
  closeCallback?: () => void
): { stream: WritableStream; readyPromise: Promise<void> } {
  const channelId = window.crypto.randomUUID();
  const chunkStream = new WritableChunkStream(
    fileTransferMetadata,
    channelId,
    closeCallback
  );
  navigator.serviceWorker.controller?.postMessage({
    fileTransferMetadata,
    channelId,
  });
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
  private _iframe: HTMLIFrameElement | null = null;
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
    this._iframe = this.createDownloadIframe(downloadUrl);
    this.chunkBroadcast.postMessage({ readStarted: true });
    debugLog("Client: 'readStarted' signal sent to service worker.");
  }

  private createDownloadIframe(src: string): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    iframe.src = src;
    iframe.style.display = "none";
    iframe.setAttribute("name", "download-iframe");
    document.body.appendChild(iframe);
    iframe.onload = () => {
      this.chunkBroadcast.postMessage({ readStarted: true });
    };
    return iframe;
  }

  close() {
    debugLog(
      "Client: Closing WritableChunkStream. Bytes written:",
      this.bytesWritten
    );
    this.chunkBroadcast.postMessage({ clientDoneSending: true });
    if (this._iframe) {
      setTimeout(() => {

        document.body.removeChild(this._iframe!);
        this._iframe = null;
      }, 5000);
    }
    debugLog("Client: 'clientDoneSending' signal sent to service worker.");
    this.closeCallback?.();
    this.chunkBroadcast.close();
  }
}
