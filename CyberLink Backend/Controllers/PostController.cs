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
    public class PostController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public PostController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        // GET: api/post/posts
        [HttpGet("posts")]
        public async Task<IActionResult> Posts()
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == userEmail);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var allPosts = await _context.Posts
                .OrderByDescending(post => post.Id)
                .Join(_context.Users,
                    post => post.userId,
                    postUser => postUser.Id,
                    (post, postUser) => new
                    {
                        post.Id,
                        post.content,
                        post.image,
                        postUser.username,
                        IsLiked = _context.Likes.Any(like => like.postId == post.Id && like.userId == user.Id),
                        IsBookmarked = _context.Bookmarks.Any(bookmark => bookmark.postId == post.Id && bookmark.userId == user.Id),
                        LikeCount = _context.Likes.Count(like => like.postId == post.Id),
                        CommentCount = _context.Comments.Count(comment => comment.postId == post.Id)
                    })
                    .ToListAsync();

            return new JsonResult(new { posts = allPosts });
        }

        // GET: api/post/posts/{id}
        [HttpGet("posts/{id}")]
        public async Task<IActionResult> GetPosts(int id)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == userEmail);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            var postUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == post.userId);

            if (postUser == null)
            {
                return NotFound(new { message = "Post author not found" });
            }

            var likeCount = await _context.Likes
                .CountAsync(l => l.postId == id);

            var commentCount = await _context.Comments
                .CountAsync(c => c.postId == id);

            var result = new
            {
                post.Id,
                post.content,
                post.image,
                postUser.username,
                likeCount,
                commentCount,
                isLiked = await _context.Likes.AnyAsync(like => like.postId == post.Id && like.userId == user.Id),
                isBookmarked = await _context.Bookmarks.AnyAsync(bookmark => bookmark.postId == post.Id && bookmark.userId == user.Id),
            };

            return new JsonResult(new { post = result });
        }

        // GET: api/post/bookmarkedposts
        [HttpGet("bookmarkedposts")]
        public async Task<IActionResult> BookmarkedPosts()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var bookmarkedPosts = await _context.Bookmarks
                .Where(b => b.userId == user.Id)
                .Join(_context.Posts,
                    bookmark => bookmark.postId,
                    post => post.Id,
                    (bookmark, post) => new { post, bookmark })
                        .Join(_context.Users,
                        combined => combined.post.userId,
                        postUser => postUser.Id,
                        (combined, postUser) => new
                        {
                            combined.post.Id,
                            combined.post.content,
                            combined.post.image,
                            postUser.username,
                            isLiked = _context.Likes.Any(like => like.postId == combined.post.Id && like.userId == user.Id),
                            LikeCount = _context.Likes.Count(like => like.postId == combined.post.Id),
                            CommentCount = _context.Comments.Count(comment => comment.postId == combined.post.Id)
                        })
                        .ToListAsync();

            return new JsonResult(new { posts = bookmarkedPosts });
        }

        // GET: api/post/comments/{id}
        [HttpGet("comments/{id}")]
        public async Task<IActionResult> Comments(int id)
        {
            var comments = await _context.Comments
            .Where(comment => comment.postId == id)
            .Select(comment => new
            {
                comment.Id,
                comment.content,
                username = _context.Users.FirstOrDefault(user => user.Id == comment.userId).username,
                image = _context.Users.FirstOrDefault(user => user.Id == comment.userId).profilePicture
            })
            .ToListAsync();

            return new JsonResult(new { comments = comments });
        }

        // POST: api/post/likepost
        [HttpPost("likepost")]
        public async Task<IActionResult> LikePost([FromBody] PostRequest request)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var user = await _context.Users
                .Where(u => u.email == email)
                .FirstOrDefaultAsync();

            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.userId == user.Id && l.postId == request.postId);

            if (existingLike != null)
            {
                return BadRequest(new { message = "Liked" });
            }

            var like = new Likes
            {
                postId = request.postId,
                userId = user.Id 
            };

            _context.Likes.Add(like);

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == request.postId);
            await _notificationService.SendNotification(post.userId, user.Id, user.username + " Liked your Post");
            await _context.SaveChangesAsync();

            return new JsonResult(new { message = "Liked" });
        }

        // POST: api/post/unlikepost
        [HttpPost("unlikepost")]
        public async Task<IActionResult> UnlikePost([FromBody] PostRequest request)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var user = await _context.Users
                .Where(u => u.email == email)
                .FirstOrDefaultAsync();

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == request.postId);

            var like = await _context.Likes.FirstOrDefaultAsync(l => l.userId == user.Id && l.postId == request.postId);
            if (like == null)
            {
                return new JsonResult(new { message = "Post not found" });
            }

            _context.Likes.Remove(like);
            await _context.SaveChangesAsync();

            return new JsonResult(new { message = "Unliked" });
        }

        // POST: api/post/bookmarkpost
        [HttpPost("bookmarkpost")]
        public async Task<IActionResult> BookmarkPost([FromBody] PostRequest request)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var user = await _context.Users
                .Where(u => u.email == email)
                .FirstOrDefaultAsync();

            var existingBookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.userId == user.Id && b.postId == request.postId);

            if (existingBookmark != null)
            {
                return BadRequest(new { message = "Post already Bookmarked" });
            }

            var bookmark = new Bookmarks
            {
                postId = request.postId,
                userId = user.Id 
            };

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();

            return new JsonResult(new { message = "Post Bookmarked" });
        }

        // POST: api/post/unbookmarkpost
        [HttpPost("unbookmarkpost")]
        public async Task<IActionResult> UnbookmarkPost([FromBody] PostRequest request)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var user = await _context.Users
                .Where(u => u.email == email)
                .FirstOrDefaultAsync();

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == request.postId);

            var bookmark = await _context.Bookmarks.FirstOrDefaultAsync(b => b.userId == user.Id && b.postId == request.postId);
            if (bookmark == null)
            {
                return new JsonResult(new { message = "Post not bookmarked" });
            }

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();

            return new JsonResult(new { message = "Post Unbookmarked" });
        }
    }

    public class PostRequest
    {
        public int postId { get; set; }
    }
}
