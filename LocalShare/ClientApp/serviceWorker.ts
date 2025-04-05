/// <reference lib="webworker" />
import { FileMetadata } from "./src/models/FileMetadata";
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

let map = new Map();

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  console.log("download");
  const streamData = map.get(event.request.url);
  if (!streamData) {
    console.warn("No stream data found for URL:", event.request.url);
    return;
  }

  const headers = {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${streamData.fileTransferMetadata.name}"`,
    "Content-Length": streamData.fileTransferMetadata.size,
  };
  event.respondWith(new Response(streamData.stream, { headers }));
});

self.onmessage = (event: ExtendableMessageEvent) => {
  if (event.data === "ping") {
    console.log("Service worker is alive", map);
    return;
  }
  const { fileTransferMetadata } = event.data as {
    fileTransferMetadata: FileMetadata;
  };
  const downloadUrl =
    self.registration.scope + Math.random() + "/" + fileTransferMetadata.name;

  const streamData = {
    fileTransferMetadata,
    stream: new ReadableStream(
      new ReadableChunkStream(
        downloadUrl,
        new BroadcastChannel(`chunk-${fileTransferMetadata.name}`),
        fileTransferMetadata.size
      )
    ),
  };
  map.set(downloadUrl, streamData);
};

class ReadableChunkStream {
  downloadUrl?: string;
  chunkBroadcast: BroadcastChannel;
  private _controller: ReadableStreamDefaultController | null = null;
  private _bytesWritten = 0;
  private _expectedBytes = 0;

  constructor(
    downloadUrl: string,
    chunkBroadcast: BroadcastChannel,
    expectedBytes: number
  ) {
    this.downloadUrl = downloadUrl;
    this.chunkBroadcast = chunkBroadcast;
    this._expectedBytes = expectedBytes;
    this.chunkBroadcast.postMessage({ download: downloadUrl });
  }

  start(controller: ReadableStreamDefaultController) {
    this._controller = controller;
    this.chunkBroadcast.onmessage = (event) => {
      if (event.data.chunkData) {
        try {
          controller.enqueue(new Uint8Array(event.data.chunkData));
          this._bytesWritten += event.data.chunkData.byteLength;
          this.chunkBroadcast.postMessage({
            confirmedWriteSize: this._bytesWritten,
          });
          console.log(
            "service worker bytesWritten",
            this._bytesWritten,
            "expectedBytes",
            this._expectedBytes
          );
          if (this._bytesWritten >= this._expectedBytes) {
            console.log("All bytes written after done signal");
            this.close();
          }
        } catch (error) {
          console.error("Error enqueuing chunk:", error);
          this.close();
        }
      }
    };
  }

  cancel() {
    console.warn("Stream cancelled:", this.downloadUrl);
    this.close();
  }

  close() {
    console.log("Closing ReadableChunkStream", this.downloadUrl);
    console.log(
      "bytesWritten",
      this._bytesWritten,
      "expectedBytes",
      this._expectedBytes
    );

    try {
      this.chunkBroadcast.postMessage({ close: true });
      this.chunkBroadcast.close();
      map.delete(this.downloadUrl);
      if (this._controller) {
        this._controller.close();
        this._controller = null;
      }
    } catch (e) {
      console.error("Error closing ReadableChunkStream:", e);
    }
  }
}
