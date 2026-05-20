export function fileSize(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export async function registerServiceWorker(): Promise<boolean> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}${import.meta.env.VITE_WORKER}`,
        { type: "module", scope: "/" }
      );
      if (registration.installing) {
        debugLog("Service worker installing");
      } else if (registration.waiting) {
        debugLog("Service worker installed");
      } else if (registration.active) {
        debugLog("Service worker active");
      }

      await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error(`Registration failed with ${error}`);
      return false;
    }
  } else {
    return false;
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
