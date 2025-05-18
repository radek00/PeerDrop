namespace LocalShare.Models.Messages;

public class ClientConnectionInfo
{
    public required string Id { get; set; }
    public required UserAgent UserAgent { get; set; }
    public required string Name { get; set; }
}
