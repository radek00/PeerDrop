import { UploadStatus } from "../UploadStatus";

export interface ClientConnectionInfo {
  id: string;
  userAgent: UserAgent;
  uploadStatus: UploadStatus;
  name: string;
}

export interface AllClientsConnectionInfo {
  self: ClientConnectionInfo;
  otherClients: ClientConnectionInfo[];
}

export interface UserAgent {
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
}

