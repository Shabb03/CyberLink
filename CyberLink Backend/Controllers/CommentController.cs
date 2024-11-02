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
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/comment/comment
        [HttpPost("comment")]
        public async Task<IActionResult> Comment([FromBody] CommentRequest request)
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

                var comment = new Comments
                {
                    postId = request.postId,
                    userId = user.Id,
                    content = request.message
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Comment added successfully", commentId = comment.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/comment/editcomment
        [HttpPost("editcomment")]
        public async Task<IActionResult> EditComment([FromBody] EditCommentRequest request)
        {
            try
            {
                var comment = await _context.Comments
                    .Where(c => c.Id == request.commentId)
                    .FirstOrDefaultAsync();

                if (comment == null)
                {
                    return NotFound(new { message = "Comment not found" });
                }

                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                if (user == null || user.Id != comment.userId)
                {
                    return Unauthorized(new { message = "You are not authorized to update this comment" });
                }

                comment.content = request.message;
                await _context.SaveChangesAsync();

                return new JsonResult(new { message = "Comment updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }

        // POST: api/comment/deletecomment
        [HttpPost("deletecomment")]
        public async Task<IActionResult> DeleteComment([FromBody] DeleteCommentRequest request)
        {
            try
            {
                var comment = await _context.Comments
                    .Where(c => c.Id == request.commentId)
                    .FirstOrDefaultAsync();

                if (comment == null)
                {
                    return NotFound(new { message = "Comment not found" });
                }

                var email = User.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var user = await _context.Users
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                if (user == null || user.Id != comment.userId)
                {
                    return Unauthorized(new { message = "You are not authorized to delete this comment" });
                }

                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();
                return new JsonResult(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }
    }

    public class CommentRequest
    {
        public int postId { get; set; }
        public String message { get; set; }
    }

    public class EditCommentRequest
    {
        public int commentId { get; set; }
        public String message { get; set; }
    }

    public class DeleteCommentRequest
    {
        public int commentId { get; set; }
    }
}
