import { ClientConnectionInfo } from "../messages/ClientInfo";
import { Events } from "./Events";


export class ClientSelectedEvent extends Event {
  client: ClientConnectionInfo;
  file: File;
  constructor(client: ClientConnectionInfo, file: File) {
    super(Events.OnClientSelected, { bubbles: true, composed: true });
    this.client = client;
    this.file = file;
  }
}
