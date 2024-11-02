using CyberLink_Backend.Data;
using CyberLink_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CyberLink_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FollowerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public FollowerController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        // GET: api/follower/searchuser
        [HttpGet("searchuser/{search}")]
        public async Task<IActionResult> SearchUser(String search)
        {
            try
            {
                if (string.IsNullOrEmpty(search))
                {
                    return new JsonResult(new { users = new string[] { } });
                }

                var matchingUsers = await _context.Users
                    .Where(u => u.username.Contains(search))
                    .Select(u => u.username)
                    .ToListAsync();

                if (matchingUsers == null || !matchingUsers.Any())
                {
                    return new JsonResult(new { users = new string[] { } });
                }

                return new JsonResult(new { users = matchingUsers });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: /api/follower/user/{username}
        [HttpGet("user/{username}")]
        public async Task<IActionResult> GetUserProfile(String username)
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

                var requestUser = await _context.Users
                    .Where(u => u.username == username)
                    .FirstOrDefaultAsync();

                Console.WriteLine("\n\n\nHERE");
                Console.WriteLine(requestUser.username);

                if (requestUser == null)
                {
                    return new JsonResult(new { message = "User does not exist" });
                }

                var posts = await _context.Posts
                    .Where(p => p.userId == requestUser.Id)
                    .ToListAsync();

                var postCount = posts.Count;

                var followerCount = await _context.Followers
                    .Where(f => f.userId == requestUser.Id)
                    .CountAsync();

                var followingCount = await _context.Followers
                    .Where(f => f.followerId == requestUser.Id)
                    .CountAsync();

                var isFollowing = await _context.Followers
                    .AnyAsync(f => f.userId == requestUser.Id && f.followerId == user.Id);

                var isBlocked = await _context.Blocked
                    .AnyAsync(b => b.userId == user.Id && b.blockedId == requestUser.Id);

                var userProfile = new
                {
                    requestUser.Id,
                    requestUser.username,
                    requestUser.biography,
                    requestUser.profilePicture,
                    posts = posts.Select(p => new
                    {
                        p.Id,
                        p.content,
                        p.image
                    }),
                    postCount = postCount,
                    followerCount = followerCount,
                    followingCount = followingCount,
                    isFollowing = isFollowing,
                    isBlocked = isBlocked
                };

                return new JsonResult(new { userProfile = userProfile });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/follower/follow
        [HttpPost("follow")]
        public async Task<IActionResult> Follow([FromBody] UserRequest request)
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

                var existingFollower = await _context.Followers
                    .FirstOrDefaultAsync(f => f.userId == request.userId && f.followerId == user.Id);

                if (existingFollower != null)
                {
                    return BadRequest(new { message = "Already following this user." });
                }

                var following = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == request.userId);

                if (following == null)
                {
                    return BadRequest(new { message = "User does not exist." });
                }

                var follower = new Followers
                {
                    userId = request.userId,
                    followerId = user.Id
                };

                _context.Followers.Add(follower);
                await _notificationService.SendNotification(request.userId, user.Id, user.username + " is following you");
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Followed Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/follower/unfollow
        [HttpPost("unfollow")]
        public async Task<IActionResult> Unfollow([FromBody] UserRequest request)
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

                var follower = await _context.Followers.FirstOrDefaultAsync(f => f.userId == request.userId && f.followerId == user.Id);
                if (follower == null)
                {
                    return new JsonResult(new { message = "Not following user" });
                }

                _context.Followers.Remove(follower);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "User unfollowed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/follower/block
        [HttpPost("block")]
        public async Task<IActionResult> Block([FromBody] UserRequest request)
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

                var existingBlock = await _context.Blocked
                    .FirstOrDefaultAsync(b => b.userId == user.Id && b.blockedId == request.userId);

                if (existingBlock != null)
                {
                    return BadRequest(new { message = "User already blocked" });
                }

                var following = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == request.userId);

                if (following == null)
                {
                    return BadRequest(new { message = "User does not exist." });
                }

                var blocked = new Blocked
                {
                    userId = user.Id,
                    blockedId = request.userId
                };

                _context.Blocked.Add(blocked);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Blocked Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/follower/unblock
        [HttpPost("unblock")]
        public async Task<IActionResult> UnBlock([FromBody] UserRequest request)
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

                var blocked = await _context.Blocked.FirstOrDefaultAsync(b => b.userId == user.Id && b.blockedId == request.userId);
                if (blocked == null)
                {
                    return new JsonResult(new { message = "User not blocked" });
                }

                _context.Blocked.Remove(blocked);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "User unblocked" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/follower/blocked
        [HttpGet("blocked")]
        public async Task<IActionResult> GetBlockedUsers()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var user = await _context.Users
                .Where(u => u.email == email)
                .FirstOrDefaultAsync();

            var blockedUsers = await _context.Blocked
                .Where(b => b.userId == user.Id)
                .Join(
                    _context.Users,
                    blocked => blocked.blockedId,
                    blockedUser => blockedUser.Id,
                    (blocked, blockedUser) => new
                    {
                        blockedUser.Id,
                        blockedUser.username,
                        blockedUser.profilePicture
                    })
                .ToListAsync();

            if (blockedUsers == null || !blockedUsers.Any())
            {
                return Ok(new { message = "No blocked users found." });
            }
            return Ok(new { blockedUsers });
        }
    }

    public class UserRequest
    {
        public int userId { get; set; }
    }
}
