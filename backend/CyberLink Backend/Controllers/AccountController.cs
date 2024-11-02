using CyberLink_Backend.Data;
using CyberLink_Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace CyberLink_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AccountController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string CreateToken(Users user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(30),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }

        // POST: api/account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Users user)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.username == user.username || u.email == user.email))
                {
                    return BadRequest(new { message = "Username or email already exists." });
                }

                user.password = BCrypt.Net.BCrypt.HashPassword(user.password);

                _context.Users.Add(user);
                user.profilePicture = "default.jpg";
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users.Where(u => u.email == request.email).FirstOrDefaultAsync();

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                if (!BCrypt.Net.BCrypt.Verify(request.password, user.password))
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                string token = CreateToken(user);
                return new JsonResult(new { token = token, username = user.username });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/account/passwordotp
        [HttpPost("passwordotp")]
        public async Task<IActionResult> PasswordOTP([FromBody] EmailRequest request)
        {
            try
            {
                var emailService = new EmailService();

                string recipientEmail = request.email;
                string subject = "Test Email Subject";
                string body = "<h1>This is a test email</h1><p>It contains HTML content.</p>";

                await emailService.SendEmailAsync(recipientEmail, subject, body);
                return new JsonResult(new { message = "One Time Password sent" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/account/changepassword
        [HttpPost("changepassword")]
        public async Task<IActionResult> ChangePassword([FromBody] OTPRequest request)
        {
            try
            {
                if (request.otp == "")
                {
                    return BadRequest(new { message = "Invalid one time password." });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.email == request.email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                user.password = BCrypt.Net.BCrypt.HashPassword(request.newPassword);

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/account/authentication
        [HttpGet("authentication")]
        [Authorize]

        public async Task<IActionResult> Authentication()
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return new JsonResult(new { message = "Unauthorised", authorised = false });
                }
                return new JsonResult(new { message = "Authorised", authorised = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/account/deleteaccount
        [HttpPost("deleteaccount")]
        [Authorize]

        public async Task<IActionResult> DeleteAccount([FromBody] LoginRequest request)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return new JsonResult(new { message = "Unauthorised" });
                }

                var user = await _context.Users
                .Where(u => u.email == request.email)
                .FirstOrDefaultAsync();

                if (!BCrypt.Net.BCrypt.Verify(request.password, user.password))
                {
                    return Unauthorized(new { message = "Invalid password." });
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return new JsonResult(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        [Required]
        public String email { get; set; }

        [Required]
        public String password { get; set; }
    }

    public class EmailRequest
    {
        public String email { get; set; }
    }

    public class OTPRequest
    {
        public String email { get; set; }

        public String otp { get; set; }
        public String newPassword { get; set; }
    }
}
