using CyberLink_Backend.Data;
using CyberLink_Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public interface INotificationService
{
    Task SendNotification(int userId, int followerId, String type);
}

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;

    public NotificationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SendNotification(int userId, int followerId, string type)
    {
        var notification = new Notifications
        {
            userId = userId,
            followerId = followerId,
            type = type,
            read = false
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }
}
