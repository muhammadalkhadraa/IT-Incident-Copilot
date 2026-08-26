using System.Collections.Generic;
using System.Security.Claims;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        string HashPassword(string plaintextPassword);
        bool VerifyPassword(string plaintextPassword, string passwordHash);
    }
}
