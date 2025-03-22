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
    const { fileTransferMetadata } = event.data as { fileTransferMetadata: FileMetadata };
    const downloadUrl =
        self.registration.scope + Math.random() + "/" + fileTransferMetadata.name;

    const streamData = {
        fileTransferMetadata,
        stream: new ReadableStream(new ReadableChunkStream(downloadUrl, new BroadcastChannel(`chunk`))),
        metadataBroadcast: new BroadcastChannel(`metadata`),
    };
    map.set(downloadUrl, streamData);
    streamData.metadataBroadcast.postMessage({ download: downloadUrl });
};

class ReadableChunkStream {
    downloadUrl?: string;
    chunkBroadcast: BroadcastChannel;
    private _isClosed = false;
    private _controller: ReadableStreamDefaultController | null = null;

    constructor(downloadUrl: string, chunkBroadcast: BroadcastChannel) {
        this.downloadUrl = downloadUrl;
        this.chunkBroadcast = chunkBroadcast;
    }

    start(controller: ReadableStreamDefaultController) {
      this._controller = controller;
        this.chunkBroadcast.onmessage = (event) => {
            if (this._isClosed) {
                console.warn("Received chunk after stream was closed, ignoring");
                return;
            }

            if (event.data.chunkData) {
                try {
                    controller.enqueue(event.data.chunkData);
                } catch (error) {
                    console.error("Error enqueuing chunk:", error);
                    this.close();
                }
            }

            if (event.data.done) {
              console.log("Closing stream");
                this.close();
            }
        };
    }

    cancel() {
        this.close();
    }

    close() {
        if (this._isClosed) return;
        this._isClosed = true;
        console.log("Closing ReadableChunkStream");
        try {
            this.chunkBroadcast.close();
            this._controller?.close();
        } catch (e) {
            console.error("Error closing chunkBroadcast:", e);
        }
        map.delete(this.downloadUrl);
    }
}