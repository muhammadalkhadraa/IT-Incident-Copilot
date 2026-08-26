using System;

namespace ITIncidentCopilot.Api.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "EMPLOYEE"; // EMPLOYEE, TECHNICIAN, IT_MANAGER, ADMINISTRATOR
        public string Department { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
