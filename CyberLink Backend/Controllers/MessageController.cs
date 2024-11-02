using CyberLink_Backend.Data;
using CyberLink_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Collections.Concurrent;

namespace CyberLink_Backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private static readonly ConcurrentDictionary<int, WebSocket> _websockets = new ConcurrentDictionary<int, WebSocket>();
        private readonly ApplicationDbContext _context;

        public MessageController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("connect")]
        public async Task Connect()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                var user = await _context.Users.FirstOrDefaultAsync(u => u.email == userEmail);

                if (user == null)
                {
                    HttpContext.Response.StatusCode = 400;
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "User not found", CancellationToken.None);
                    return;
                }

                _websockets.TryAdd(user.Id, socket);
                await HandleWebSocketCommunication(user.Id, socket);
            }
            else
            {
                HttpContext.Response.StatusCode = 400;
            }
        }

        private async Task HandleWebSocketCommunication(int userId, WebSocket socket)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _websockets.TryRemove(userId, out _);
                    await socket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
                    return;
                }

                var messageJson = Encoding.UTF8.GetString(buffer, 0, result.Count);
                var messageData = System.Text.Json.JsonSerializer.Deserialize<MessageData>(messageJson);

                if (messageData != null)
                {
                    await SaveMessageToDatabase(userId, messageData);
                    await BroadcastMessage(userId, messageData);
                }
            }
        }

        private async Task SaveMessageToDatabase(int senderId, MessageData messageData)
        {
            var message = new Messages
            {
                senderId = senderId,
                receiverId = messageData.receiverId,
                content = messageData.content,
                read = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        private async Task BroadcastMessage(int senderId, MessageData messageData)
        {
            if (_websockets.TryGetValue(messageData.receiverId, out WebSocket receiverSocket) && receiverSocket.State == WebSocketState.Open)
            {
                var response = new
                {
                    senderId,
                    receiverId = messageData.receiverId,
                    content = messageData.content,
                    timestamp = DateTime.UtcNow
                };

                var responseJson = System.Text.Json.JsonSerializer.Serialize(response);
                var encodedMessage = Encoding.UTF8.GetBytes(responseJson);

                await receiverSocket.SendAsync(new ArraySegment<byte>(encodedMessage), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }

    public class MessageData
    {
        public int receiverId { get; set; }
        public string content { get; set; }
    }
}