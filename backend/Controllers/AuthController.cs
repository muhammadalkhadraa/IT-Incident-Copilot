using System;
using System.Linq;
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

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "EMPLOYEE";
        public string Department { get; set; } = "General Department";
        public string Title { get; set; } = "Staff User";
    }

    public class RefreshRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class UpdateUserRoleRequest
    {
        public string Role { get; set; } = "EMPLOYEE";
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
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

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.NewPassword))
            {
                return BadRequest(new { message = "Email and new password are required fields." });
            }

            if (req.NewPassword.Length < 8)
            {
                return BadRequest(new { message = "New password must be at least 8 characters long." });
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower());
            if (user == null)
            {
                return NotFound(new { message = "No account registered with this email address." });
            }

            user.PasswordHash = _jwtService.HashPassword(req.NewPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully. You can now log in with your new password." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower());
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password) || string.IsNullOrWhiteSpace(req.Name))
            {
                return BadRequest(new { message = "Name, email, and password are required fields." });
            }

            if (req.Password.Length < 8)
            {
                return BadRequest(new { message = "Password must be at least 8 characters long." });
            }

            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower());
            if (existingUser != null)
            {
                return BadRequest(new { message = "An account with this email address already exists." });
            }

            var hashedPassword = _jwtService.HashPassword(req.Password);
            var nameParts = req.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var initials = string.Join("", nameParts.Select(n => n[0])).ToUpper();
            if (string.IsNullOrEmpty(initials)) initials = "US";

            var role = (req.Role ?? "").ToUpper();
            if (role == "DEVELOPER") role = "TECHNICIAN";
            if (string.IsNullOrEmpty(role)) role = "EMPLOYEE";

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = req.Name,
                Email = req.Email.ToLower(),
                PasswordHash = hashedPassword,
                Role = role,
                Department = req.Department,
                Title = req.Title,
                Avatar = initials
            };

            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _db.Users.Add(user);
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

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users
                .OrderBy(u => u.Name)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Department,
                    u.Title,
                    u.Avatar
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest req)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            var role = (req.Role ?? "").ToUpper();
            if (role == "DEVELOPER") role = "TECHNICIAN";
            if (string.IsNullOrEmpty(role)) role = "EMPLOYEE";

            user.Role = role;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.Department,
                user.Title,
                user.Avatar
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower() && u.RefreshToken == req.RefreshToken);
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
