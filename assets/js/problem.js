/* =============================================================================
   ReLeaf: problem section behaviour
   -----------------------------------------------------------------------------
   Three independent pieces, each of which stops if its element is missing.

     1  map       the weather / farms toggle, plus one automatic reveal
     2  reveal    starts the containment drawing when it scrolls in
     3  chain     scroll progress -> custom properties on .pb-stagewrap

   THE RESTING STATE IS THE FINISHED STATE. With JavaScript off or motion
   reduced, the map shows the farms, the drawing is still, and the chain and
   the handoff sit one after the other in normal flow.
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var span = function (v, a, b) { return clamp01((v - a) / (b - a)); };
  var ease = function (t) { return t * t * (3 - 2 * t); };

  /* ─────────────────────────────────────────────────────────── 1  MAP ── */
  /* The map opens on the weather alone, then lays the farms over it once the
     reader has had a moment with the colours. Touching the toggle cancels the
     automatic step, so it never fights the reader. */
  (function map() {
    var atlas = document.getElementById("pb-atlas");
    if (!atlas) return;
    var buttons = document.querySelectorAll(".pb-map__toggle button");
    var touched = false;

    function show(view) {
      atlas.setAttribute("data-view", view);
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === view));
      });
    }
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () { touched = true; show(b.getAttribute("data-view")); });
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

  /* ──────────────────────────────────────────────────────── 2  REVEAL ── */
  (function reveal() {
    var el = document.querySelector(".pb-wall");
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("in"); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { el.classList.toggle("in", e.isIntersecting); });
    });
    io.observe(el);
  })();

  /* ───────────────────────────────────────────────────────── 3  CHAIN ── */
  /* Runway, in fractions of the scrollable distance:
       0.00–0.18  hold: the chain on white, read in full
       0.18–0.40  labels go, the six off-farm dots fade and walk to the farmer
       0.32–0.55  the paper dims to ink
       0.45–0.60  the merged dot slides to centre
       0.55–0.75  it becomes the light
       0.68–0.90  the name and the five requirements arrive */
  (function chain() {
    var wrap = document.getElementById("chain");
    if (!wrap || reduced) return;
    wrap.classList.add("is-live");

    var ticking = false;
    function frame() {
      ticking = false;
      var r = wrap.getBoundingClientRect();
      var total = wrap.offsetHeight - window.innerHeight;
      var p = total > 0 ? clamp01(-r.top / total) : 1;

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
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame();
  })();
})();
