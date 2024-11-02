using Microsoft.EntityFrameworkCore;
using CyberLink_Backend.Models;

namespace CyberLink_Backend.Data
{
    public class ApplicationDbContext :DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<Blocked> Blocked { get; set; }
        public DbSet<Bookmarks> Bookmarks { get; set; }
        public DbSet<Comments> Comments { get; set; }
        public DbSet<Followers> Followers { get; set; }
        public DbSet<Likes> Likes { get; set; }
        public DbSet<Messages> Messages { get; set; }
        public DbSet<Notifications> Notifications { get; set; }
        public DbSet<Posts> Posts { get; set; }
        public DbSet<Requests> Requests { get; set; }
        public DbSet<Stories> Stories { get; set; }
        public DbSet<Users> Users { get; set; }
    }
}
