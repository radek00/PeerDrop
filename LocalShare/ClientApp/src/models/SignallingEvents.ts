export enum SignallingEvents {
  UpdateSelf = "UpdateSelf",
  AddConnectedClient = "AddConnectedClient",
  ReceiveOffer = "ReceiveOffer",
  ReceiveAnswer = "ReceiveAnswer",
  ReceiveIceCandidate = "ReceiveIceCandidate",
  RemoveDisconnectedClient = "RemoveDisconnectedClient",
  SendIceCandidate = "SendIceCandidate",
  SendAnswer = "SendAnswer",
  SendOffer = "SendOffer",
}
