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
    public class StoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageService _imageService;
        private readonly INotificationService _notificationService;

        public StoryController(ApplicationDbContext context, IImageService imageService, INotificationService notificationService)
        {
            _context = context;
            _imageService = imageService;
            _notificationService = notificationService;
        }

        // POST: api/story/addstory
        [HttpPost("addstory")]
        public async Task<IActionResult> AddStory([FromForm] StoryRequest request)
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

                var newStory = new Stories
                {
                    userId = user.Id,
                    image = filePath,
                };

                _context.Stories.Add(newStory);

                var followers = await _context.Followers
                .Where(f => f.userId == user.Id)
                .ToListAsync();

                foreach (var follower in followers)
                {
                    await _notificationService.SendNotification(follower.followerId, user.Id, "New Story");
                }
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Story added", filepath = filePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // GET: api/story/viewstory/{id}
        [HttpGet("viewstory/{id}")]
        public async Task<IActionResult> ViewStory(int id)
        {
            try
            {
                var story = await _context.Stories
                    .Where(s => s.Id == id)
                    .Select(s => new
                    {
                        username = _context.Users.Where(u => u.Id == s.userId).Select(u => u.username).FirstOrDefault(),
                        s.image
                    })
                    .FirstOrDefaultAsync();

                if (story == null)
                {
                    return NotFound(new { message = "Story not found." });
                }

                return new JsonResult(new { username = story.username, image = story.image });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }
    }

    public class StoryRequest
    {
        public IFormFile image { get; set; }
        public String imageName { get; set; }
    }
}
