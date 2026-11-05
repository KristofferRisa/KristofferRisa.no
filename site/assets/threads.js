// "Threads": the hero's signature animation. Gold particles drift in a slow flow field and
// gather into the KR monogram; the pointer scatters them and they find their way back.
// A nod to the work: many loose ends, joined into one thing. No dependencies.
(function () {
  "use strict";
  var canvas = document.querySelector("[data-threads]");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var host = canvas.parentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, parts = [], running = false, visible = true, raf = 0, t = 0;
  var pointer = { x: -9999, y: -9999, active: false };
  var GOLD = [201, 169, 110];

  // Sample points from the monogram drawn on an offscreen canvas.
  function targets(w, h) {
    var small = w < 720;
    var size = small ? Math.min(w * 0.78, 340) : Math.min(h * 0.78, w * 0.42, 560);
    var cx = small ? w * 0.5 : w * 0.73;
    var cy = small ? h * 0.3 : h * 0.5;
    var off = document.createElement("canvas");
    var ow = Math.ceil(size * 1.3), oh = Math.ceil(size);
    off.width = ow; off.height = oh;
    var o = off.getContext("2d");
    o.fillStyle = "#fff";
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.font = "400 " + Math.round(size * 0.95) + "px 'Instrument Serif', Georgia, serif";
    o.fillText("KR", ow / 2, oh * 0.54);
    var data = o.getImageData(0, 0, ow, oh).data;
    var pts = [], step = Math.max(3, Math.round(size / 110));
    for (var y = 0; y < oh; y += step) {
      for (var x = 0; x < ow; x += step) {
        if (data[(y * ow + x) * 4 + 3] > 128) pts.push([cx - ow / 2 + x, cy - oh / 2 + y]);
      }
    }
    return pts;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0, tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function build() {
    var r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var pts = shuffle(targets(W, H));
    var max = W < 720 ? 700 : 1400;
    if (pts.length > max) pts.length = max;
    var old = parts;
    parts = pts.map(function (p, i) {
      var prev = old[i];
      return {
        hx: p[0], hy: p[1],
        x: prev ? prev.x : Math.random() * W,
        y: prev ? prev.y : Math.random() * H,
        vx: 0, vy: 0,
        s: 0.6 + Math.random() * 1.1,
        a: 0.35 + Math.random() * 0.65,
        ph: Math.random() * Math.PI * 2
      };
    });
    // A few free drifters that never settle: the loose ends.
    for (var k = 0; k < (W < 720 ? 40 : 90); k++) {
      parts.push({ hx: null, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, s: 0.5 + Math.random() * 0.8, a: 0.25 + Math.random() * 0.4, ph: Math.random() * 6.28 });
    }
  }

  function field(x, y) {
    // Cheap smooth flow: layered sines, slowly evolving.
    var a = Math.sin(x * 0.0042 + t * 0.00031) + Math.cos(y * 0.0051 - t * 0.00023) + Math.sin((x + y) * 0.0023 + t * 0.00017);
    return a * Math.PI;
  }

  function step() {
    t += 16;
    // Fade previous frame towards transparent: short trails, no flat background.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var ang = field(p.x, p.y);
      var fx = Math.cos(ang) * 0.06, fy = Math.sin(ang) * 0.06;
      if (p.hx !== null) {
        var breathe = Math.sin(t * 0.0012 + p.ph) * 1.6;
        fx += (p.hx + breathe - p.x) * 0.012;
        fy += (p.hy + Math.cos(t * 0.001 + p.ph) * 1.6 - p.y) * 0.012;
      } else {
        fx *= 4; fy *= 4;
      }
      if (pointer.active) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          var f = (1 - d2 / 16000) * 2.4, d = Math.sqrt(d2) || 1;
          fx += (dx / d) * f + (-dy / d) * f * 0.5;
          fy += (dy / d) * f + (dx / d) * f * 0.5;
        }
      }
      p.vx = (p.vx + fx) * 0.9;
      p.vy = (p.vy + fy) * 0.9;
      p.x += p.vx; p.y += p.vy;
      if (p.hx === null) {
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }
      var speed = Math.min(1, Math.abs(p.vx) + Math.abs(p.vy));
      var alpha = p.a * (0.45 + speed * 0.55);
      ctx.fillStyle = "rgba(" + GOLD[0] + "," + GOLD[1] + "," + GOLD[2] + "," + alpha.toFixed(3) + ")";
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
  }

  function loop() {
    if (!running) return;
    step();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false; cancelAnimationFrame(raf);
  }

  function still() {
    // Reduced motion: the monogram, drawn once, settled.
    ctx.clearRect(0, 0, W, H);
    parts.forEach(function (p) {
      if (p.hx !== null) { p.x = p.hx; p.y = p.hy; }
      ctx.fillStyle = "rgba(201,169,110," + (p.a * 0.6).toFixed(3) + ")";
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });
  }

  function init() {
    build();
    if (reduce) { still(); return; }
    start();
  }

  var fontReady = document.fonts && document.fonts.load
    ? document.fonts.load("400 100px 'Instrument Serif'").catch(function () {})
    : Promise.resolve();
  fontReady.then(init);

  var rt = 0;
  addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { build(); if (reduce) still(); }, 150);
  });
  host.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
  }, { passive: true });
  host.addEventListener("pointerleave", function () { pointer.active = false; });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start(); else stop();
    }).observe(host);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
})();
