export interface ClientConnectionInfo {
  id: string;
  userAgent: UserAgent;
}

export interface AllClientsConnectionInfo {
  self: ClientConnectionInfo;
  otherClients: ClientConnectionInfo[];
}

export interface UserAgent {
  browser: string;
  os: string;
}
