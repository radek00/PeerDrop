namespace LocalShare.Hubs.Messages;

public class CleintInfo
{
    public required string SelfId { get; set; }
    public required string[] OtherClients { get; set; }
}
