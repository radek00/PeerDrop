import { UploadStatus } from "../UploadStatus";

export interface ClientConnectionInfo {
  id: string;
  userAgent: UserAgent;
  uploadStatus: UploadStatus;
}

export interface AllClientsConnectionInfo {
  self: ClientConnectionInfo;
  otherClients: ClientConnectionInfo[];
}

export interface UserAgent {
  browser: string;
  os: string;
}
