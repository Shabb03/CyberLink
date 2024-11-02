using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Messages
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int senderId { get; set; }
        [Required]
        public int receiverId { get; set; }
        [Required]
        public String content { get; set; }
        [Required]
        public Boolean read { get; set; }
        public DateTime time { get; set; }
    }
}