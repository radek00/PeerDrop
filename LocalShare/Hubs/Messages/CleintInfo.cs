namespace LocalShare.Hubs.Messages;

public class ClientInfo
{
    public required string SelfId { get; set; }
    public required string[] OtherClients { get; set; }
}
