// kristofferrisa.no — the only script of our own. No dependencies.
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  // vakt frontend logging: errors and click events only. Page views are counted
  // server-side by vakt-edge on the prod hostname, so no data-pageview here.
  // Test reports to vakt's test environment; local development reports nowhere.
  var rum = { "kristofferrisa.no": "rum", "test.kristofferrisa.no": "rum-test" }[location.hostname];
  if (rum) {
    var s = document.createElement("script");
    s.src = "https://" + rum + ".kristoffer.dev/v.js";
    s.defer = true;
    document.head.appendChild(s);
  }

  // Header border once the page has scrolled.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  // Reveal on scroll.
  var items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // "Download CV" prints the page; the print stylesheet turns it into an A4 CV.
  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      window.print();
    });
  });

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
