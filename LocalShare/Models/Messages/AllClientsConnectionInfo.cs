namespace LocalShare.Models.Messages;

public class AllClientsConnectionInfo
{
    public required ClientConnectionInfo Self { get; set; }
    public required ClientConnectionInfo[] OtherClients { get; set; }

}
