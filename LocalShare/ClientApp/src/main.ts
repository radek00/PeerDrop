import { ClientGrid } from "./utils/ClientGrid";
import { createSignalRConnection } from "./utils/signalr";

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}${import.meta.env.VITE_WORKER}`,
        { scope: "/" }
      );
      const devMode = import.meta.env.DEV;
      if (devMode) {
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();

const grid = new ClientGrid();
grid.start();

const button = document.getElementById("testButton");
button?.addEventListener("click", changeStage);

function changeStage() {
  grid.toggleState();
}

// const connection = createSignalRConnection("signalr/signalling");
// connection.start();

// connection.on("UpdateSelf", (id) => {
//   console.log(id);
// });
