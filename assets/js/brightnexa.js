/* BrightNexa AI System — UI interactions (vanilla, no deps) */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- scroll state: navbar + scrollspy ---------------- */
  var nav = $(".bn-nav");
  var hero = $(".bn-hero");
  var banner = document.body.classList.contains("home");

  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) {
      if (banner) nav.classList.toggle("solid", y > 40);
      nav.classList.toggle("scrolled", y > 8);
    }
    // scrollspy for nav links
    var links = $$("a[data-spy]");
    if (links.length) {
      var current = "";
      $$("[data-section]").forEach(function (sec) {
        var top = sec.getBoundingClientRect().top;
        if (top <= 120) current = sec.getAttribute("data-section");
      });
      links.forEach(function (a) {
        a.classList.toggle("on", a.getAttribute("data-spy") === current);
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile burger ---------------- */
  var burger = $("#bnBurger");
  var linksPanel = $("#bnLinks");
  if (burger && linksPanel) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      linksPanel.classList.toggle("open");
    });
    linksPanel.addEventListener("click", function (e) {
      if (e.target.closest("a")) linksPanel.classList.remove("open");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".bn-nav")) linksPanel.classList.remove("open");
    });
  }

  /* ---------------- hero slideshow ---------------- */
  var slides = $$(".bn-hero-slides .slide");
  if (slides.length > 1 && !reduce) {
    var idx = 0;
    slides[0].classList.add("on");
    setInterval(function () {
      slides[idx].classList.remove("on");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("on");
    }, 6500);
  }

  /* ---------------- favourites (persist) ---------------- */
  var store = null;
  try { store = JSON.parse(localStorage.getItem("bnSaved") || "[]"); } catch (e) { store = []; }
  var savedSet = store.map(function (s) { return String(s); });

  function heartKey(btn) {
    var key = (btn.getAttribute("data-key") || btn.closest("[data-key]") && btn.closest("[data-key]").getAttribute("data-key")) || "";
    if (!key) {
      var card = btn.closest(".pc, .mini-card");
      key = card ? (card.getAttribute("data-key") || card.querySelector("h3,h4") && (card.querySelector("h3,h4").textContent || "").trim()) : "";
    }
    return key;
  }
  function paintHeart(btn) {
    var k = heartKey(btn);
    var on = savedSet.indexOf(k) !== -1;
    btn.classList.toggle("saved", on);
    btn.setAttribute("aria-label", on ? "Remove from saved" : "Save to favourites");
    btn.innerHTML = on ? "&#9829;" : "&#9825;";
  }
  function persist() {
    try { localStorage.setItem("bnSaved", JSON.stringify(savedSet)); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".pc-fav, .mini-fav, .bn-fav");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var k = heartKey(btn);
    if (!k) return;
    var i = savedSet.indexOf(k);
    if (i === -1) savedSet.push(k); else savedSet.splice(i, 1);
    persist();
    $$(".pc-fav, .mini-fav, .bn-fav").forEach(function (b) {
      if (!k || heartKey(b) === k) paintHeart(b);
    });
  });
  $$(".pc-fav, .mini-fav, .bn-fav").forEach(paintHeart);

  /* ---------------- search dropdowns ---------------- */
  var fields = $$(".bn-field");
  document.addEventListener("click", function (e) {
    var f = e.target.closest(".bn-field");
    fields.forEach(function (x) { if (x !== f) x.classList.remove("open"); });
    if (f) {
      f.classList.toggle("open");
      var inp = f.querySelector('input[data-filter]');
      if (inp) { inp.value = ""; applyFilter(inp, ""); }
    }
  });
  if (fields.length) {
    fields.forEach(function (f) {
      var filter = f.querySelector("input[data-filter]");
      if (filter) filter.addEventListener("input", function () { applyFilter(filter, filter.value); });
    });
  }
  function applyFilter(input, term) {
    var t = term.toLowerCase();
    $$(".bn-dd .opt", input.parentElement).forEach(function (o) {
      o.style.display = o.textContent.toLowerCase().indexOf(t) === -1 ? "none" : "";
    });
  }
  $$(".bn-dd .opt").forEach(function (opt) {
    opt.addEventListener("click", function (e) {
      e.stopPropagation();
      var field = opt.closest(".bn-field");
      var label = opt.textContent.trim();
      var target = field.querySelector(".val .txt");
      if (target) target.textContent = label;
      $$(".opt", field).forEach(function (o) { o.classList.toggle("on", o === opt); });
      field.classList.remove("open");
    });
  });
  var searchGo = $("#bnSearchGo");
  var searchGoM = $("#bnSearchGoM");
  [searchGo, searchGoM].forEach(function (b) {
    if (b) b.addEventListener("click", function () {
      var target = document.getElementById("properties");
      if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------------- property modal ---------------- */
  var propModal = $("#modalProperty");
  function openModal(el) {
    if (!el) return;
    $$(".bn-modal.open").forEach(function (m) { if (m !== el) m.classList.remove("open"); });
    el.classList.add("open");
    document.body.style.overflow = "hidden";
    function close(e) {
      if (e && e.target.closest(".bn-modal-card")) return;
      el.classList.remove("open");
      var anyOpen = $$(".bn-modal.open").length;
      if (!anyOpen) document.body.style.overflow = "";
      document.removeEventListener("click", close);
    }
    setTimeout(function () { document.addEventListener("click", close); }, 0);
    var x = $(".bn-modal-close", el);
    if (x) x.addEventListener("click", function (e) { e.stopPropagation(); close(); });
  }
  $$(".pc").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".pc-fav")) return;
      var pid = card.getAttribute("data-modal");
      var target = pid ? $("#modal-" + pid) : propModal;
      if (!target) return;
      // hydrate the shared property modal from the card's data
      var body = $("#modal-property .pm-body"),
          heroEl = $("#modal-property .pm-hero"),
          heroImg = $("#modal-property .pm-hero img"),
          proj = target === propModal;
      if (proj) {
        heroImg.src = card.querySelector(".pc-img img").src;
        $("#modal-property .pc-badge").textContent = card.getAttribute("data-badge") || "For Sale";
        $("#modal-property .pc-badge").className = "pc-badge" + ((card.getAttribute("data-badge") || "").toLowerCase() === "for rent" ? " rent" : "");
        $("#modal-property .pc-loc").textContent = card.getAttribute("data-loc") || "";
        $("#modal-property h3").textContent = card.getAttribute("data-title") || "";
        $("#modal-property .pm-price").textContent = card.getAttribute("data-price") || "";
        $("#modal-property .beds").textContent = card.getAttribute("data-beds") || "-";
        $("#modal-property .baths").textContent = card.getAttribute("data-baths") || "-";
        $("#modal-property .sqft").textContent = card.getAttribute("data-sqft") || "-";
        $("#modal-property .pm-desc").textContent = card.getAttribute("data-desc") || "";
        var g1 = $("#modal-property .pm-g1"), g2 = $("#modal-property .pm-g2"), g3 = $("#modal-property .pm-g3");
        if (g3) { g3.src = card.querySelector(".pc-img img").src; }
        if (g2) { g2.src = (card.getAttribute("data-g2") || card.querySelector(".pc-img img").src); }
        if (g1) { g1.src = (card.getAttribute("data-g1") || card.querySelector(".pc-img img").src); }
      }
      openModal(target);
    });
  });

  /* ---------------- 3D viewer tabs ---------------- */
  var tabs = $$("#tourTabs button");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("on"); });
      tab.classList.add("on");
      var img = $("#viewerImg");
      var cap = $("#viewerCap");
      if (img) img.src = tab.getAttribute("data-img");
      if (cap) cap.textContent = tab.getAttribute("data-cap");
    });
  });

  /* ---------------- 360° fullscreen tour ---------------- */
  var t360 = $("#modal360");
  var startBtns = $$(".js-360");
  startBtns.forEach(function (b) {
    b.addEventListener("click", function (e) {
      if (t360) {
        openModal(t360);
        var big = $("#t360Big");
        if (big) {
          var src = $("#viewerImg").src;
          big.src = src || big.src;
          big.style.transform = "translateX(0)";
        }
      } else {
        e.preventDefault();
      }
    });
  });
  if (t360) {
    var big = $("#t360Big");
    var stage = $(".bn-modal-card", t360);
    t360.addEventListener("mousedown", function (e) { if (e.target.closest(".bn-modal-close")) return; dragging = true; startX = e.clientX; });
    window.addEventListener("mousemove", function (e) { if (!dragging) return; curX = (e.clientX - startX); if (big) big.style.transform = "translateX(" + (curX * -0.25) + "px)"; });
    window.addEventListener("mouseup", function () { dragging = false; });
    t360.addEventListener("touchstart", function (e) { dragging = true; startX = e.touches[0].clientX; }, { passive: true });
    t360.addEventListener("touchmove", function (e) { if (!dragging) return; curX = (e.touches[0].clientX - startX); if (big) big.style.transform = "translateX(" + (curX * -0.25) + "px)"; }, { passive: true });
    t360.addEventListener("touchend", function () { dragging = false; });
  }

  /* ---------------- video + map modals ---------------- */
  $$(".js-video").forEach(function (b) { b.addEventListener("click", function () { openModal($("#modalVideo")); }); });
  $$(".js-map").forEach(function (b) { b.addEventListener("click", function () { openModal($("#modalMap")); }); });

  /* ---------------- hero quick controls ---------------- */
  $$('.bn-hero-controls button[aria-label="Photos"]').forEach(function (b) {
    b.addEventListener("click", function () { location.href = "gallery.html"; });
  });
  var navFav = $(".bn-fav");
  if (navFav) {
    navFav.addEventListener("click", function () {
      var t = document.getElementById("properties");
      if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    // reveal hero content instantly
    $$(".bn-hero [data-reveal]").forEach(function (el) { el.classList.add("in"); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();