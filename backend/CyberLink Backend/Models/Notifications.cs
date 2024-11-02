using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Notifications
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int userId { get; set; }
        [Required]
        public int followerId { get; set; }
        [Required]
        public String type { get; set; }
        [Required]
        public Boolean read { get; set; }
    }
}