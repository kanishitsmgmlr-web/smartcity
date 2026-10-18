/* ==========================================================================
   SmartCity — shared UX behaviours
   Scroll reveals · reading progress · floating actions · back-to-top
   ========================================================================== */
(function () {
  "use strict";
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  /* ---------- reading progress bar ---------- */
  var bar = document.createElement("div");
  bar.className = "ux-progress";
  document.body.appendChild(bar);

  /* ---------- floating actions (WhatsApp + back to top) ---------- */
  var wa = document.createElement("a");
  wa.className = "ux-wa";
  wa.href = "https://wa.me/919620585890";
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.setAttribute("aria-label", "Chat with us on WhatsApp");
  wa.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 1 1 8.38 4.63zm8.42-18.3A11.82 11.82 0 0 0 12.04 0C5.5 0 .16 5.34.16 11.92c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.72 1.46h.01c6.54 0 11.87-5.34 11.87-11.92 0-3.18-1.24-6.17-3.4-8.41z"/></svg>';
  document.body.appendChild(wa);

  var top = document.createElement("button");
  top.className = "ux-top";
  top.type = "button";
  top.setAttribute("aria-label", "Back to top");
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(top);
  top.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- scroll driven UI ---------- */
  var ticking = false;
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? (window.pageYOffset || doc.scrollTop) / max : 0;
    bar.style.width = (p * 100) + "%";
    top.classList.toggle("show", (window.pageYOffset || doc.scrollTop) > 500);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  if (reduce || !("IntersectionObserver" in window)) return;

  var auto = [
    ".section-head", ".stats > *", ".proj-grid > *",
    ".ab-card", ".values > *", ".a-stat", ".cta-inner",
    ".c-card", ".c-form", ".steps .step", ".bens > *",
    ".p-gallery > *", ".mini-grid > *", ".p-cta", ".gal a",
    ".ux-feat", ".ux-quote", ".ux-fq", ".ux-areas .chips > *", ".ux-cta .panel",
    ".fflex > *"
  ].join(",");

  var nodes = document.querySelectorAll(auto);
  var seen = [];
  nodes.forEach(function (el) {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal");
    seen.push(el);
  });

  // explicit opt-ins / overrides
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    if (!el.classList.contains("reveal")) { el.classList.add("reveal"); seen.push(el); }
  });

  // stagger siblings for grids
  seen.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent || parent.__uxStagger) return;
    var kids = Array.prototype.filter.call(parent.children, function (c) { return c.classList.contains("reveal"); });
    if (kids.length > 1) {
      kids.forEach(function (c, i) { c.style.setProperty("--d", (i * 0.08).toFixed(2) + "s"); });
      parent.__uxStagger = true;
    }
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  seen.forEach(function (el) { io.observe(el); });

  /* re-scan after images / late DOM */
  window.addEventListener("load", function () {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (!el.classList.contains("in")) { el.classList.add("reveal"); io.observe(el); }
    });
  });
})();

/* hide floating WhatsApp / back-to-top when the footer is in view */
(function () {
  var ft = document.querySelector("footer");
  if (!ft) return;
  var floatsHidden = false;
  function updateFloats() {
    var r = ft.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < h - 130) {
      if (!floatsHidden) { floatsHidden = true; document.body.classList.add("floats-hidden"); }
    } else if (floatsHidden) {
      floatsHidden = false; document.body.classList.remove("floats-hidden");
    }
  }
  updateFloats();
  window.addEventListener("scroll", updateFloats, { passive: true });
  window.addEventListener("resize", updateFloats, { passive: true });

    var vw = document.querySelector(".ux-vwrap");
    var vp = document.getElementById("uxVplay");
  var vp = document.getElementById("uxVplay");
  if (vw && vp) {
    function loadVideo() {
      if (vw.classList.contains("loaded")) return;
      vw.classList.add("loaded", "playing");
      var ifr = document.createElement("iframe");
      ifr.className = "ux-viframe";
      ifr.src = "https://www.youtube-nocookie.com/embed/8ZYzUDmCgAo?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white&iv_load_policy=3";
      ifr.title = "Shri Shaila Township layout walkthrough | SmartCity Infra Developers";
      ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      ifr.allowFullscreen = true;
      ifr.referrerPolicy = "strict-origin-when-cross-origin";
      vw.appendChild(ifr);
    }
    vp.addEventListener("click", loadVideo);
    vw.addEventListener("click", function (e) { if (e.target !== vp) loadVideo(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var a = document.activeElement;
        if (a && (a.id === "uxVplay" || a === vp)) { e.preventDefault(); loadVideo(); }
      }
    });
  }
})();
