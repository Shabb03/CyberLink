using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Stories
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int userId { get; set; }
        [Required]
        public String image { get; set; }
    }
}