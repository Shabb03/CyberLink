using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Posts
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int userId { get; set; }
        public String content { get; set; }
        [Required]
        public String image { get; set; }
    }
}