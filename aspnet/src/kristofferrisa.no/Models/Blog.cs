using System;
using System.Collections.Generic;

namespace kristofferrisa.no.Models
{
    public class Blog
    {
        public int Id { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public List<string> Tags { get; set; }
        public string url { get; set; }
        public string Author { get; set; }
        public DateTime Modifed { get; set; }
        public DateTime Created { get; set; }
    }
}