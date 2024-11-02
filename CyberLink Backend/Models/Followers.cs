using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Followers
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int userId { get; set; }
        [Required]
        public int followerId { get; set; }
    }
}