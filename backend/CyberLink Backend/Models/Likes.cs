using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Likes
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int postId { get; set; }
        [Required]
        public int userId { get; set; }
    }
}