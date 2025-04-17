import { UploadStatus } from "../UploadStatus";
import { Events } from "./Events";

export type ProgressTuple = [percentage: number, status: UploadStatus];
export class ProgressUpdateEvent extends Event {
  clientId: string;
  progressTuple: ProgressTuple;
  constructor(clientId: string, progressTuple: ProgressTuple) {
    super(Events.OnProgressUpdate, { bubbles: true, composed: true });
    this.clientId = clientId;
    this.progressTuple = progressTuple;
  }
}
