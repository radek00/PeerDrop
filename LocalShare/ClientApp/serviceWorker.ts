/// <reference lib="webworker" />
export default null
declare let self: ServiceWorkerGlobalScope


self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});