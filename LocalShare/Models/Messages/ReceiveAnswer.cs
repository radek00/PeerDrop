namespace LocalShare.Models.Messages
{
    public class ReceiveAnswer
    {
        public required string SenderConnectionId { get; set; }
        public required object Answer { get; set; }
    }
}
