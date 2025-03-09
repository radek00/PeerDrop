import { TransferStatus } from "./TransferStatus";

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  status: TransferStatus;
}
