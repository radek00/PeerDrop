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
    console.log("Service worker is alive");
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
    metadataBroadcast: new BroadcastChannel(
      `metadata-${fileTransferMetadata.name}`
    ),
  };
  map.set(downloadUrl, streamData);
  streamData.metadataBroadcast.postMessage({ download: downloadUrl });
};

class ReadableChunkStream {
  downloadUrl?: string;
  chunkBroadcast: BroadcastChannel;
  private _controller: ReadableStreamDefaultController | null = null;
  private _bytesWritten = 0;
  private _expectedBytes = 0;
  // private _isDone = false;

  constructor(
    downloadUrl: string,
    chunkBroadcast: BroadcastChannel,
    expectedBytes: number
  ) {
    this.downloadUrl = downloadUrl;
    this.chunkBroadcast = chunkBroadcast;
    this._expectedBytes = expectedBytes;
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
          // Check if we're done AFTER enqueuing the chunk
          if (this._bytesWritten >= this._expectedBytes) {
            console.log("All bytes written after done signal");
            this.close();
          }
        } catch (error) {
          //console.error("Error enqueuing chunk:", error);
          //this.close();
        }
      }

      // if (event.data.done) {
      //   console.log("Client is done");

      //   // Only close if we've already received all expected bytes
      //   if (this._bytesWritten === this._expectedBytes) {
      //     console.log("All bytes written when done received");
      //     this.close();
      //   }
      // }
    };
  }

  cancel() {
    //this.close();
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
      // First close the controller, then close the broadcast channel
      if (this._controller) {
        this._controller.close();
        this._controller = null;
      }
      // Give some time for any in-flight messages to be processed
      this.chunkBroadcast.close();
      map.delete(this.downloadUrl);
    } catch (e) {
      console.error("Error closing ReadableChunkStream:", e);
    }
  }
}
