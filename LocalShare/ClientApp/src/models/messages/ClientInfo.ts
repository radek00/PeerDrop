import { IconType } from "../enums/IconType";

export interface ClientConnectionInfo {
  id: string;
  userAgent: UserAgent;
  name: string;
}

export interface AllClientsConnectionInfo {
  self: ClientConnectionInfo;
  otherClients: ClientConnectionInfo[];
}

export interface UserAgent {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  icon: IconType;
}
