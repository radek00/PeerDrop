namespace LocalShare.Models.Messages;

public class SendAnswer
{
    public required string TargetConnectionId { get; set; }
    public required object Answer { get; set; }
}
