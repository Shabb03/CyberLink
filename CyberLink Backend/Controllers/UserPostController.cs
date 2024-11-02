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
    public class UserPostController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageService _imageService;
        private readonly INotificationService _notificationService;

        public UserPostController(ApplicationDbContext context, IImageService imageService, INotificationService notificationService)
        {
            _context = context;
            _imageService = imageService;
            _notificationService = notificationService;
        }

        // POST: api/userpost/addpost
        [HttpPost("addpost")]
        public async Task<IActionResult> AddPost([FromForm] AddPostRequest request)
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

                var newPost = new Posts
                {
                    userId = user.Id,
                    image = filePath,
                    content = request.content,
                };

                _context.Posts.Add(newPost);

                var followers = await _context.Followers
                    .Where(f => f.userId == user.Id)
                    .ToListAsync();

                foreach (var follower in followers)
                {
                    await _notificationService.SendNotification(follower.followerId, user.Id, "New Post");
                }
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Post added", filepath = filePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/userpost/editpost
        [HttpPost("editpost")]
        public async Task<IActionResult> EditPost([FromBody] EditPostRequest request)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.postId);

                if (post == null)
                {
                    return NotFound(new { message = "Post not found." });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                if (user == null || user.Id != post.userId)
                {
                    return new JsonResult(new { message = "You are not authorised!" });
                }

                post.content = request.content;

                _context.Posts.Update(post);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Post Updated Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/userpost/deletepost
        [HttpPost("deletepost")]
        public async Task<IActionResult> DeletePost([FromBody] DeletePostRequest request)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var post = await _context.Posts
                    .Where(p => p.Id == request.postId)
                    .FirstOrDefaultAsync();

                if (post == null)
                {
                    return NotFound(new { message = "Post not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                if (user == null || user.Id != post.userId)
                {
                    return new JsonResult(new { message = "You are not authorized" });
                }

                _context.Posts.Remove(post);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Post deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }
    }

    public class AddPostRequest
    {
        public IFormFile image { get; set; }
        public String imageName { get; set; }
        public String content { get; set; }
    }

    public class EditPostRequest
    {
        public int postId { get; set; }
        public String content { get; set; }
    }

    public class DeletePostRequest
    {
        public int postId { get; set; }
    }
}
