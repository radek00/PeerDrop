self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

const chunkStream = new ChunkStream();

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    if (new URL(event.request.url).pathname === '/download') {
        const headers = {
            'Content-Type': 'image/jpg',
            'Content-Disposition': 'attachment; filename="index.jpg"',
        }
        console.log('download');
        const stream = new ReadableStream(chunkStream);
        event.respondWith(
            new Response(stream, { headers })
        );
        //     event.respondWith(
        //         decrypt(
        //             new URL(event.request.url).searchParams.get("id"),
        //         event.request.url
        // )
        // );
    }
});

class ChunkStream {
    fileMetadata;
    receivedSize = 0;
    broadcast = new BroadcastChannel('worker');
    
    constructor(fileMetadata) {
        this.fileMetadata = fileMetadata;
    }
    
    start(controller) {
        this.broadcast.onmessage = (event) => {
            controller.enqueue(new Uint8Array(event.data.chunkData));
            if (this.fileMetadata == null) {
                this.fileMetadata = event.data.fileTransferMetadata;
            }
            this.receivedSize += event.data.chunkData.byteLength;

            if (this.receivedSize >= this.fileMetadata.size) {
                controller.close();
                this.broadcast.close();
            }
        }
    }
    
    pull(controller) {
        // Do nothing
    }
    
    cancel(reason) {
        console.log(reason);
    }
    
}