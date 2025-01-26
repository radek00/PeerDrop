self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

let map = new Map();
let url;
let metadataBroadcast = new BroadcastChannel("metadata");
let chunkBroadcast = new BroadcastChannel("chunk");


self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
        console.log('download');
        const streamData = map.get(event.request.url);
        if (!streamData) {
            return;
        }

        const headers = {
            'Content-Type': 'image/jpg',
            'Content-Disposition': `attachment; filename="${streamData.fileTransferMetadata.name}"`,
            'Content-Length': streamData.fileTransferMetadata.size
        }        
        event.respondWith(
            new Response(streamData.stream, { headers })
        );
        //     event.respondWith(
        //         decrypt(
        //             new URL(event.request.url).searchParams.get("id"),
        //         event.request.url
        // )
        // );
    
});

self.onmessage = (event) => {
    if (event.data === 'ping') {
        return;
    }
    const {fileTransferMetadata} = event.data;
    const downloadUrl = self.registration.scope + Math.random() + '/' + fileTransferMetadata.name;
    
    const streamData = {
        fileTransferMetadata,
        stream: new ReadableStream({
            start(controller) {
                chunkBroadcast.onmessage = (event) => {
                    if (event.data.done) {
                        controller.close();
                        return;
                    }
                    controller.enqueue(new Uint8Array(event.data.chunkData));
                }
            }
        })
    }
    url = downloadUrl;
    map.set(downloadUrl, streamData);
    
    
    metadataBroadcast.postMessage({download: downloadUrl});
    
}