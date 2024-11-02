using CyberLink_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CyberLink_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageService _imageService;

        public UserController(ApplicationDbContext context, IImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        // POST: api/user/editbiography
        [HttpPost("editbiography")]
        public async Task<IActionResult> EditBiography([FromBody] BiographyRequest request)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                user.biography = request.biography;
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Biography updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/user/editpicture
        [HttpPost("editpicture")]
        public async Task<IActionResult> EditPicture([FromForm] EditPictureRequest request)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                var filePath = await _imageService.SaveImageAsync(request.image, request.imageName, user.username);

                user.profilePicture = filePath;
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Profile Picture updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/user/myprofile
        [HttpGet("myprofile")]
        public async Task<IActionResult> MyProfile()
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                var posts = await _context.Posts
                    .Where(p => p.userId == user.Id)
                    .ToListAsync();

                var postCount = posts.Count;

                var followerCount = await _context.Followers
                    .Where(f => f.userId == user.Id)
                    .CountAsync();

                var followingCount = await _context.Followers
                    .Where(f => f.followerId == user.Id)
                    .CountAsync();

                var userProfile = new
                {
                    user.Id,
                    user.username,
                    user.biography,
                    user.profilePicture,
                    posts = posts.Select(p => new
                    {
                        p.Id,
                        p.content,
                        p.image
                    }),
                    postCount = postCount,
                    followerCount = followerCount,
                    followingCount = followingCount
                };

                return new JsonResult(new { userProfile = userProfile });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/user/notifications
        [HttpGet("notifications")]
        public async Task<IActionResult> Notifications()
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                var unreadNotifications = await _context.Notifications
                    .Where(n => n.userId == user.Id && n.read == false)
                    .OrderByDescending(n => n.Id)
                    .ToListAsync();

                var unreadCount = unreadNotifications.Count;

                return new JsonResult(new { count = unreadCount, notifications = unreadNotifications });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/user/followers
        [HttpGet("followers")]
        public async Task<IActionResult> Followers()
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                var followers = await _context.Followers
                    .Where(f => f.userId == user.Id)
                    .Select(f => new
                    {
                        followerId = f.followerId,
                        username = _context.Users.FirstOrDefault(u => u.Id == f.followerId).username
                    })
                    .ToListAsync();

                return new JsonResult(new { followers = followers });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/user/following
        [HttpGet("following")]
        public async Task<IActionResult> Following()
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                var following = await _context.Followers
                    .Where(f => f.followerId == user.Id)
                    .Select(f => new
                    {
                        followerId = f.followerId,
                        username = _context.Users.FirstOrDefault(u => u.Id == f.userId).username
                    })
                    .ToListAsync();

                return new JsonResult(new { following = following });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }
    }

    public class BiographyRequest
    {
        public String biography { get; set; }
    }

    public class EditPictureRequest
    {
        public IFormFile image { get; set; }
        public String imageName { get; set; }
    }
}
