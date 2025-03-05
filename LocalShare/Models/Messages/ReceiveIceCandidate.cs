namespace LocalShare.Models.Messages;

public class ReceiveIceCandidate
{
    public required string SenderConnectionId { get; set; }
    public required object Candidate { get; set; }
}
