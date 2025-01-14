const broadcast = new BroadcastChannel('worker');
self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    if (new URL(event.request.url).pathname === '/download') {
        const headers = {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="file.txt"',
            'Content-Length': 100
        }
        console.log('download');
        event.respondWith(
            new Response('Hello World!', { headers })
        );
        //     event.respondWith(
        //         decrypt(
        //             new URL(event.request.url).searchParams.get("id"),
        //         event.request.url
        // )
        // );
    }
});