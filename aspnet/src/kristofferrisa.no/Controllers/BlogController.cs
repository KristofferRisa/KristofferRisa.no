using Microsoft.AspNet.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace kristofferrisa.no.Controllers
{
    public class BlogController : Controller
    {
        // GET: /Blog/
        public IActionResult Index()
        {
            /*
                TODO: 
                Add blog context and get the 10 last posts
                Add a underconstructs site
                Add analysis
                Add Ads sections
            */
            return View();
        }
    }
}
