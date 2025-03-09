/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

let map = new Map();
let metadataBroadcast = new BroadcastChannel("metadata");
let chunkBroadcast = new BroadcastChannel("chunk");

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  console.log("download");
  const streamData = map.get(event.request.url);
  if (!streamData) {
    return;
  }

  const headers = {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${streamData.fileTransferMetadata.name}"`,
    "Content-Length": streamData.fileTransferMetadata.size,
  };
  event.respondWith(new Response(streamData.stream, { headers }));
});

self.onmessage = (event) => {
  if (event.data === "ping") {
    return;
  }
  const { fileTransferMetadata } = event.data;
  const downloadUrl =
    self.registration.scope + Math.random() + "/" + fileTransferMetadata.name;

  const streamData = {
    fileTransferMetadata,
    stream: new ReadableStream(new ReadableChunkStream(downloadUrl)),
  };
  map.set(downloadUrl, streamData);
  metadataBroadcast.postMessage({ download: downloadUrl });
};

class ReadableChunkStream {
  downloadUrl = null;
  constructor(downloadUrl) {
    this.downloadUrl = downloadUrl;
  }
  start(controller) {
    chunkBroadcast.onmessage = (event) => {
      if (event.data.done) {
        controller.close();
        return;
      }
      if (event.data.abort) {
        controller.error(new Error("Download aborted"));
        return;
      }
      controller.enqueue(new Uint8Array(event.data.chunkData));
    };
  }

  close() {
    console.log("Closing readable chunk stream");
    map.delete(this.downloadUrl);
  }
}
