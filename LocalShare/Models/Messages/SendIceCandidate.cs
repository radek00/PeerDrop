namespace LocalShare.Models.Messages;

public class SendIceCandidate
{
    public required string TargetConnectionId { get; set; }
    public required object Candidate { get; set; }
}
