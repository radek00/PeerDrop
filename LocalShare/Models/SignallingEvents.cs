namespace LocalShare.Models
{
    public static class SignallingEvents
    {
        public const string UpdateSelf = "UpdateSelf";
        public const string AddConnectedClient = "AddConnectedClient";
        public const string ReceiveOffer = "ReceiveOffer";
        public const string ReceiveAnswer = "ReceiveAnswer";
        public const string ReceiveIceCandidate = "ReceiveIceCandidate";
        public const string RemoveDisconnectedClient = "RemoveDisconnectedClient";
    }
}