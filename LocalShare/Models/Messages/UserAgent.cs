namespace LocalShare.Models.Messages;

public class UserAgent
{
        public required string BrowserName { get; set; }
        public required string BrowserVersion { get; set; }
        public required string OSName { get; set; }
        public required string OSVersion { get; set; }
}
