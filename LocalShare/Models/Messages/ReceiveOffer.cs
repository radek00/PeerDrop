namespace LocalShare.Models.Messages;

public class ReceiveOffer
{
    public required string SenderConnectionId { get; set; }
    public required object Offer { get; set; }
}
