using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using ITIncidentCopilot.Api.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ITIncidentCopilot.Api.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateAccessToken(User user)
        {
            var secretKey = _config["Jwt:SecretKey"] ?? "SuperSecretKey_IT_Incident_Copilot_Enterprise_Jwt_2026!#";
            var issuer = _config["Jwt:Issuer"] ?? "ITIncidentCopilotApi";
            var audience = _config["Jwt:Audience"] ?? "ITIncidentCopilotClient";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("department", user.Department),
                new Claim("title", user.Title),
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public string HashPassword(string plaintextPassword)
        {
            return BCrypt.Net.BCrypt.HashPassword(plaintextPassword, workFactor: 11);
        }

        public bool VerifyPassword(string plaintextPassword, string passwordHash)
        {
            if (string.IsNullOrEmpty(passwordHash)) return false;
            return BCrypt.Net.BCrypt.Verify(plaintextPassword, passwordHash);
        }
    }
}
