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
grid.renderCanvas();

const button = document.getElementById("testButton");
button?.addEventListener("click", changeStage);

function changeStage() {
  const circle = grid.changeStage();
  const divElement = document.createElement("div");
  divElement.style.position = "absolute";
  divElement.innerHTML = "Hello World";
  divElement.style.top = `${circle.y}px`;
  divElement.style.left = `${circle.x}px`;
  document.body.appendChild(divElement);
  console.log(circle);
}

// const connection = createSignalRConnection("signalr/signalling");
// connection.start();

// connection.on("UpdateSelf", (id) => {
//   console.log(id);
// });
