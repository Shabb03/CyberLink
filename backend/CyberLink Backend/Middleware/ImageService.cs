
public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file, string fileName, string username);
}

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly String _imageStoragePath;

    public ImageService(IWebHostEnvironment environment, IConfiguration config)
    {
        _environment = environment;
        _imageStoragePath = Path.Combine(environment.ContentRootPath, config["ImageStoragePath"]);
    }

    public async Task<string> SaveImageAsync(IFormFile file, string imageName, string username)
    {
        if (!Directory.Exists(_imageStoragePath))
        {
            Directory.CreateDirectory(_imageStoragePath);
        }
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("No file uploaded.");
        }

        var fileName = $"{username}_{imageName}{Path.GetExtension(file.FileName)}";

        var filePath = Path.Combine(_imageStoragePath, fileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        return fileName;
    }
}