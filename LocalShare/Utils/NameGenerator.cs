public class NameGenerator
{
    private static readonly Random Random = Random.Shared;

    // Use string arrays instead of List<string>
    private static readonly string[] Adjectives = {
        "Bouncy", "Crazy", "Dizzy", "Fluffy", "Giddy", "Happy", "Jolly", "Lazy", "Merry", "Nifty",
        "Quirky", "Silly", "Wacky", "Zany", "Agile", "Brave", "Calm", "Daring", "Eager", "Fierce",
        "Gentle", "Humble", "Intrepid", "Jovial", "Keen", "Loyal", "Mighty", "Noble", "Optimistic",
        "Proud", "Quiet", "Resourceful", "Swift", "Thoughtful", "Unique", "Valiant", "Wise", "Youthful",
        "Zealous", "Amusing", "Blissful", "Charming", "Delightful", "Energetic", "Fantastic", "Gracious",
        "Harmonious", "Illustrious", "Joyful", "Kindhearted", "Lively", "Magnificent", "Nimble", "Outgoing",
        "Peaceful", "Radiant", "Serene", "Terrific", "Upbeat", "Vibrant", "Wonderful", "Xenial", "Yare", "Zesty"
    };

    private static readonly string[] Animals = {
        "Gorilla", "Tiger", "Lion", "Elephant", "Panda", "Koala", "Kangaroo", "Zebra", "Giraffe", "Hippo",
        "Rhino", "Leopard", "Cheetah", "Wolf", "Fox", "Bear", "Monkey", "Penguin", "Owl", "Eagle",
        "Parrot", "Dolphin", "Whale", "Shark", "Octopus", "Crab", "Lobster", "Turtle", "Snake", "Lizard",
        "Frog", "Alligator", "Badger", "Bat", "Beaver", "Buffalo", "Camel", "Cobra", "Coyote", "Crow",
        "Deer", "Donkey", "Duck", "Falcon", "Ferret", "Goat", "Goose", "Hawk", "Hyena", "Jaguar",
        "Jellyfish", "Lemur", "Mole", "Moose", "Mouse", "Otter", "Panther", "Pelican", "Pigeon", "Rabbit",
        "Raccoon", "Rat", "Raven", "Seal", "Skunk", "Squirrel", "Swan", "Vulture", "Walrus", "Weasel", "Woodpecker"
    };

    public static string GenerateName()
    {
        var adjectiveIndex = Random.Next(Adjectives.Length);
        var animalIndex = Random.Next(Animals.Length);

        return $"{Adjectives[adjectiveIndex]} {Animals[animalIndex]}";
    }
}