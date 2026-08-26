using System;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Data;
using ITIncidentCopilot.Api.Entities;
using ITIncidentCopilot.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITIncidentCopilot.Api.Controllers
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RefreshRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwtService;

        public AuthController(AppDbContext db, IJwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null || !_jwtService.VerifyPassword(req.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password credentials." });
            }

            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role,
                    user.Department,
                    user.Title,
                    user.Avatar
                }
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.RefreshToken == req.RefreshToken);
            if (user == null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Expired or invalid refresh token." });
            }

            var newAccessToken = _jwtService.GenerateAccessToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            return Ok(new { accessToken = newAccessToken, refreshToken = newRefreshToken });
        }
    }
}
