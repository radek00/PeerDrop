/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { FileMetadata } from "./src/models/FileMetadata";
import { sanitizeFilename, debugLog } from "./src/utils/utils";
declare let self: ServiceWorkerGlobalScope;

const CACHE_NAME = "asset-cache-v1.0.2";
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
              debugLog("Service Worker: deleting old cache:", cacheName);
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
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/download")) {
    const streamData = map.get(request.url);
    if (streamData) {
      debugLog("Service Worker: Handling stream download for:", request.url);
      const headers = {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(streamData.fileTransferMetadata.name)}"`,
        "Content-Length": streamData.fileTransferMetadata.size.toString(),
      };
      event.respondWith(new Response(streamData.stream, { headers }));
    }
    return;
  }
  if (
    import.meta.env.PROD &&
    ASSET_DESTINATIONS.includes(request.destination)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          debugLog("Service Worker: Serving from cache:", request.url);
          return cachedResponse;
        }

        debugLog(
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
    debugLog("Service worker is alive", map);
    if (event.source) {
      event.source.postMessage("pong");
    }
    return;
  }
  const { fileTransferMetadata, channelId } = event.data as {
    fileTransferMetadata: FileMetadata;
    channelId: string;
  };
  const downloadUrl = self.registration.scope + "download/" + channelId;

  const stream = new ReadableStream(
    new ReadableChunkStream(
      downloadUrl,
      new BroadcastChannel(channelId),
      fileTransferMetadata.size
    )
  );
  const streamData = {
    fileTransferMetadata,
    stream,
  };
  map.set(downloadUrl, streamData);
};

class ReadableChunkStream {
  downloadUrl?: string;
  chunkBroadcast: BroadcastChannel;
  private _controller: ReadableStreamDefaultController | null = null;
  private _bytesWritten = 0;
  private _expectedBytes = 0;
  private isReadingStarted = false;
  private clientHasFinishedSending = false;
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
    this.isReadingStarted = false;
    this.clientHasFinishedSending = false;
    this.expectedMessages = Math.ceil(expectedBytes / 5120);
    this.chunkBroadcast.postMessage({
      download: downloadUrl,
    });
  }

  start(controller: ReadableStreamDefaultController) {
    this._controller = controller;
    this.chunkBroadcast.onmessage = (event) => {
      if (!this._controller) return;

      if (event.data.chunkData) {
        try {
          this._controller.enqueue(new Uint8Array(event.data.chunkData));
          this._bytesWritten += event.data.chunkData.byteLength;

          this.chunkBroadcast.postMessage({
            confirmedWriteSize: this._bytesWritten,
          });

          this.attemptClose();
        } catch (error) {
          console.error("Error enqueuing chunk:", error);
          this.close();
        }
      } else if (event.data.readStarted) {
        this.isReadingStarted = true;
        debugLog("Service Worker: 'readStarted' signal received from client.");
        this.attemptClose();
      } else if (event.data.clientDoneSending) {
        this.clientHasFinishedSending = true;
        debugLog(
          "Service Worker: 'clientDoneSending' signal received from client."
        );
        this.attemptClose();
      }
    };
  }

  private attemptClose() {
    const allBytesWritten = this._bytesWritten >= this._expectedBytes;

    if (
      allBytesWritten &&
      this.isReadingStarted &&
      this.clientHasFinishedSending
    ) {
      debugLog(
        "Service Worker: All conditions met (all bytes received, download started, client finished sending). Closing stream."
      );
      this.close();
    }
  }

  cancel() {
    console.warn("Stream cancelled:", this.downloadUrl);
    this.close();
  }

  close() {
    if (!this._controller) {
      return;
    }
    debugLog("Closing ReadableChunkStream for URL:", this.downloadUrl);
    debugLog(
      `Final state: bytesWritten(${this._bytesWritten}/${this._expectedBytes}), isReadingStarted(${this.isReadingStarted}), clientHasFinishedSending(${this.clientHasFinishedSending})`
    );

    try {
      this._controller.close();
      this._controller = null;
      this.chunkBroadcast.close();
      map.delete(this.downloadUrl);
      this.downloadUrl = undefined;
    } catch (e) {
      console.error("Error during ReadableChunkStream cleanup:", e);
    }
  }
}
