// kristofferrisa.no — the site's own script. No dependencies.
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var en = doc.lang === "en";

  function track(name, value) {
    if (window.vakt && window.vakt.event) window.vakt.event(name, value);
  }

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

  // Header border and the thin gold scroll-progress line.
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".progress");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      var max = doc.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
    }
  }
  addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Reveal on scroll.
  var items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Spotlight that follows the pointer across cards.
  document.querySelectorAll("[data-spotlight]").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  });

  // Local time in Norway, so you know whether I'm likely awake.
  var clock = document.querySelector("[data-clock]");
  if (clock && window.Intl) {
    var fmt = new Intl.DateTimeFormat(en ? "en-GB" : "nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 20000);
  }

  // "Download CV" prints the page; the print stylesheet turns it into an A4 CV.
  function printCv() {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    window.print();
  }
  document.querySelectorAll("[data-print]").forEach(function (b) { b.addEventListener("click", printCv); });

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // Keyboard first: vim-style shortcuts, which-key style help on "?".
  var keys = document.querySelector("[data-keys]");
  if (!keys || typeof keys.showModal !== "function") return;
  var go = function (id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
  };
  var sections = en
    ? { n: "now", p: "person", e: "experience", s: "expertise", k: "contact" }
    : { n: "na", p: "person", e: "erfaring", s: "kompetanse", k: "kontakt" };
  var leader = false, leaderTimer = 0;
  function openKeys() { if (!keys.open) { keys.showModal(); track("shortcut", "help"); } }
  document.querySelectorAll("[data-keys-open]").forEach(function (b) { b.addEventListener("click", openKeys); });
  keys.addEventListener("click", function (e) { if (e.target === keys) keys.close(); });

  addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = e.key;
    if (leader) {
      leader = false; clearTimeout(leaderTimer); doc.classList.remove("leader");
      if (sections[k]) { e.preventDefault(); if (keys.open) keys.close(); go(sections[k]); track("shortcut", "g" + k); }
      else if (k === "g") { e.preventDefault(); scrollTo({ top: 0 }); track("shortcut", "gg"); }
      return;
    }
    if (k === "?") { e.preventDefault(); keys.open ? keys.close() : openKeys(); return; }
    if (keys.open && k !== "g") return;
    switch (k) {
      case "g":
        leader = true; doc.classList.add("leader");
        leaderTimer = setTimeout(function () { leader = false; doc.classList.remove("leader"); }, 1200);
        break;
      case "G": scrollTo({ top: doc.scrollHeight }); break;
      case "j": scrollBy({ top: innerHeight * 0.18 }); break;
      case "k": scrollBy({ top: -innerHeight * 0.18 }); break;
      case "p": e.preventDefault(); track("shortcut", "p"); printCv(); break;
      case "l": track("shortcut", "l"); location.href = en ? "/" : "/en/"; break;
      default: return;
    }
  });
})();
