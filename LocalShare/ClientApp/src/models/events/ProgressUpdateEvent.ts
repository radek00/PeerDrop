import { Events } from "./Events";

export class ProgressUpdateEvent extends Event {
  clientId: string;
  progress: number;
  constructor(clientId: string, progress: number) {
    super(Events.OnProgressUpdate, { bubbles: true, composed: true });
    this.clientId = clientId;
    this.progress = progress;
  }
}
