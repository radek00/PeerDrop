export function fileSize(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}${import.meta.env.VITE_WORKER}`,
        { scope: "/", type: "module" }
      );
      const devMode = import.meta.env.DEV;
      if (devMode) {
        if (registration.installing) {
          debugLog("Service worker installing");
        } else if (registration.waiting) {
          debugLog("Service worker installed");
        } else if (registration.active) {
          debugLog("Service worker active");
        }
      }
      setInterval(() => {
        navigator.serviceWorker.controller?.postMessage("ping");
      }, 10000);
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^\./, "")
    .replace(/\.$/, "");
}

export function debugLog(...args: any[]) {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}
