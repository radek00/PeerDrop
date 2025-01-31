import {
  HubConnectionBuilder,
  LogLevel,
  IHttpConnectionOptions,
  HttpTransportType,
} from "@microsoft/signalr";

export const createSignalRConnection = (path: string) => {
  const options: IHttpConnectionOptions = {
    logMessageContent: true,
    logger: LogLevel.Information,
    skipNegotiation: true,
    transport: HttpTransportType.WebSockets,
  };

  const connection = new HubConnectionBuilder()
    .withUrl(import.meta.env.BASE_URL + path, options)
    .withAutomaticReconnect()
    .build();

  connection.serverTimeoutInMilliseconds = 60000;
  connection.keepAliveIntervalInMilliseconds = 15000;

  return connection;
};
