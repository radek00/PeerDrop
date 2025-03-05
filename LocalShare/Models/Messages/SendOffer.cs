namespace LocalShare.Models.Messages;

public class SendOffer
{
    public required string TargetConnectionId { get; set; }
    public required object Offer { get; set; }
}
