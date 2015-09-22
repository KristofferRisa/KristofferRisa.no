using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Mvc;

namespace kristofferrisa.no.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View("~/Views/Shared/Error.cshtml");
        }

        public RedirectResult Vedlegg()
        {
            return RedirectPermanent("http://goo.gl/oX2Wat");
        }
    }
}