/// <reference lib="webworker" />
import { FileMetadata } from "./src/models/FileMetadata";
declare let self: ServiceWorkerGlobalScope;

const CACHE_NAME = "asset-cache-v1";
const ASSET_DESTINATIONS: RequestDestination[] = [
  "script",
  "style",
  "document",
  "image",
  "font",
  "manifest",
];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log("Service Worker: deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
    ])
  );
});

let map = new Map();

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  console.log(url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/download")) {
    const streamData = map.get(request.url);
    if (streamData) {
      console.log("Service Worker: Handling stream download for:", request.url);
      const headers = {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${streamData.fileTransferMetadata.name}"`,
        "Content-Length": streamData.fileTransferMetadata.size.toString(),
      };
      event.respondWith(new Response(streamData.stream, { headers }));
    }
    return;
  }
  if (ASSET_DESTINATIONS.includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("Service Worker: Serving from cache:", request.url);
          return cachedResponse;
        }

        console.log(
          "Service Worker: Not in cache, fetching from network:",
          request.url
        );
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            console.warn(
              "Service Worker: Network failed and not in cache:",
              request.url
            );
            return new Response(`Network error and not in cache`, {
              status: 408,
              headers: { "Content-Type": "text/plain" },
            });
          });
      })
    );
    return;
  }
});

self.onmessage = (event: ExtendableMessageEvent) => {
  if (event.data === "ping") {
    console.log("Service worker is alive", map);
    return;
  }
  const { fileTransferMetadata, channelId } = event.data as {
    fileTransferMetadata: FileMetadata;
    channelId: string;
  };
  const downloadUrl = self.registration.scope + "download/" + channelId;

  const streamData = {
    fileTransferMetadata,
    stream: new ReadableStream(
      new ReadableChunkStream(
        downloadUrl,
        new BroadcastChannel(channelId),
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
  expectedMessages = 0;
  receivedMessages = 0;

  constructor(
    downloadUrl: string,
    chunkBroadcast: BroadcastChannel,
    expectedBytes: number
  ) {
    this.downloadUrl = downloadUrl;
    this.chunkBroadcast = chunkBroadcast;
    this._expectedBytes = expectedBytes;
    this.expectedMessages = Math.ceil(expectedBytes / 5120);
    this.chunkBroadcast.postMessage({ download: downloadUrl });
  }

  start(controller: ReadableStreamDefaultController) {
    this._controller = controller;
    this.chunkBroadcast.onmessage = (event) => {
      if (event.data.chunkData) {
        this.receivedMessages++;
        console.log(
          "expected messages",
          this.receivedMessages,
          this.expectedMessages
        );
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
