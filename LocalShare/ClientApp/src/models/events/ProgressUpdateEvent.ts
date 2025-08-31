import { TransferStatus } from "../TransferStatus";
import { Events } from "./Events";

export type ProgressTuple = [percentage: number, status: TransferStatus];
export class ProgressUpdateEvent extends Event {
  clientId: string;
  progressTuple: ProgressTuple;
  constructor(clientId: string, progressTuple: ProgressTuple) {
    super(Events.OnProgressUpdate, { bubbles: true, composed: true });
    this.clientId = clientId;
    this.progressTuple = progressTuple;
  }
}
