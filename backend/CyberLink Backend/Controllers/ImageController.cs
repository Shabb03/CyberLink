using CyberLink_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberLink_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ImageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageService _imageService;

        public ImageController(ApplicationDbContext context, IImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        // GET: api/image/getimage/{imageName}
        [HttpGet("getimage/{imageName}")]
        public IActionResult GetImage(string imageName)
        {
            try
            {
                var filePath = Path.Combine("wwwroot", "images", imageName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Image not found." });
                }

                var imageFileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                var contentType = "image/jpeg";

                return new FileStreamResult(imageFileStream, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred", error = ex.Message });
            }
        }
    }
}
