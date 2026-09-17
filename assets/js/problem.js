/* ReLeaf problem section. Four independent pieces; each stops if its element
   is missing. With JS off or motion reduced, everything shows its final state. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var span = function (v, a, b) { return clamp01((v - a) / (b - a)); };
  var ease = function (t) { return t * t * (3 - 2 * t); };

  // progress of a tall wrapper whose sticky child is one screen high
  function progress(wrap) {
    var total = wrap.offsetHeight - window.innerHeight;
    return total > 0 ? clamp01(-wrap.getBoundingClientRect().top / total) : 1;
  }

  var frames = [];
  var ticking = false;
  function tick() {
    ticking = false;
    frames.forEach(function (f) { f(); });
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }

  /* 1  map: opens on the weather, then lays the farms over it */
  (function () {
    var atlas = document.getElementById("pb-atlas");
    if (!atlas) return;
    var buttons = document.querySelectorAll(".pb-map__toggle button");
    var touched = false;
    function show(view) {
      atlas.setAttribute("data-view", view);
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.view === view));
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { touched = true; show(b.dataset.view); });
    });
    if (reduced || !("IntersectionObserver" in window)) return;
    show("weather");
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () { if (!touched) show("farms"); }, 2200);
    }, { threshold: 0.5 });
    io.observe(atlas);
  })();

  /* 2  the distance: the camera follows the discovery from lab to shelf */
  (function () {
    var wrap = document.getElementById("journey");
    if (!wrap || reduced) return;
    var scene = document.getElementById("jr-scene");
    var orb = document.getElementById("jr-orb");
    var trail = document.getElementById("jr-trail");
    var far = document.getElementById("jr-far");
    var mid = document.getElementById("jr-mid");
    var yearEl = document.getElementById("jr-year");
    var ageEl = document.getElementById("jr-age");
    var sumEl = document.getElementById("jr-summers");
    var posts = wrap.querySelectorAll(".jr-post");
    var suns = wrap.querySelectorAll(".jr-summer");
    wrap.classList.add("is-live");

    // scene units: 6000 x 1000. Year k sits at X0 + k * STEP.
    var X0 = 1100, STEP = 325, LAB = { x: 806, y: 640 }, ROAD = 760, SHELF = 5000, FARMER = 5470;
    var AGE = 63, YEARS = 12;
    var last = -1;

    frames.push(function () {
      var p = progress(wrap);
      var unit = scene.clientHeight / 1000;
      var vw = window.innerWidth;

      // 0–0.08 in the lab, 0.08–0.86 on the road, then the camera moves on to her
      var ox, oy;
      if (p < 0.08) {
        var t = ease(span(p, 0, 0.08));
        ox = LAB.x + (X0 - LAB.x) * t;
        oy = LAB.y + (ROAD - LAB.y) * t;
      } else {
        ox = X0 + (SHELF - X0) * span(p, 0.08, 0.86);
        oy = ROAD;
      }
      orb.setAttribute("transform", "translate(" + ox.toFixed(1) + " " + oy.toFixed(1) + ")");
      trail.setAttribute("x2", Math.max(X0, ox).toFixed(1));

      var camX = ox + (FARMER - SHELF) * ease(span(p, 0.86, 1));
      var maxPan = 6000 * unit - vw;
      var pan = Math.max(0, Math.min(maxPan, camX * unit - vw / 2));
      scene.style.transform = "translate3d(" + (-pan).toFixed(1) + "px,0,0)";
      var panUnits = pan / unit;
      far.setAttribute("transform", "translate(" + (panUnits * 0.55).toFixed(1) + " 0)");
      mid.setAttribute("transform", "translate(" + (panUnits * 0.25).toFixed(1) + " 0)");

      var year = Math.max(0, Math.min(YEARS, Math.floor((ox - X0) / STEP + 0.001)));
      if (year !== last) {
        last = year;
        yearEl.textContent = year;
        ageEl.textContent = AGE + year;
        sumEl.textContent = year;
        posts.forEach(function (g) { g.classList.toggle("on", +g.dataset.y <= year); });
        suns.forEach(function (g) { g.classList.toggle("on", +g.dataset.y <= year); });
      }
      wrap.style.setProperty("--endIn", ease(span(p, 0.9, 0.98)).toFixed(3));
    });
  })();

  /* 3  the chain: hold, collapse onto the farmer, become the light, name */
  (function () {
    var wrap = document.getElementById("chain");
    if (!wrap || reduced) return;
    wrap.classList.add("is-live");
    frames.push(function () {
      var p = progress(wrap);
      var s = wrap.style;
      var t = ease(span(p, 0.18, 0.34));
      s.setProperty("--text", (1 - t).toFixed(3));
      s.setProperty("--line", (1 - t).toFixed(3));
      s.setProperty("--grey", (1 - ease(span(p, 0.22, 0.38))).toFixed(3));
      s.setProperty("--conv", ease(span(p, 0.22, 0.42)).toFixed(3));
      s.setProperty("--paper", (1 - ease(span(p, 0.32, 0.55))).toFixed(3));
      s.setProperty("--recentre", ease(span(p, 0.45, 0.60)).toFixed(3));
      s.setProperty("--spark", ease(span(p, 0.55, 0.75)).toFixed(3));
      s.setProperty("--hand", ease(span(p, 0.68, 0.90)).toFixed(3));
    });
  })();

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  tick();
})();
