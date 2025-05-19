// Parts.cs
using System;

namespace Parts
{
    public class AccessRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
    }

    public enum AccessLevel
    {
        Guest = 0,
        Employee = 1,
        Admin = 2
    }

    public class User
    {
        public string Name { get; set; } = string.Empty;
        public AccessLevel Level { get; set; }
    }

    public class Room
    {
        public string Name { get; set; } = string.Empty;
        public AccessLevel RequiredLevel { get; set; }
    }

    public class AccessLog
    {
        public DateTime Timestamp { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public bool AccessGranted { get; set; }
    }
}
