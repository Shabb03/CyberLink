using System.ComponentModel.DataAnnotations;

namespace CyberLink_Backend.Models
{
    public class Users
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public String username { get; set; }
        [Required]
        public String email { get; set; }
        [Required]
        public String password { get; set; }
        [Required]
        public String firstName { get; set; }
        [Required]
        public String lastName { get; set; }
        public String? biography { get; set; }
        public String? profilePicture { get; set; }
        public String? otp { get; set; }
    }
}