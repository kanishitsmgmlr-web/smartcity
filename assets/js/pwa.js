/* ============================================================
   SmartCity — PWA install experience
   Android/desktop: native install prompt (beforeinstallprompt)
   iOS/iPadOS: "Add to Home Screen" instructions sheet
   ============================================================ */
(function () {
  "use strict";

  var DISMISS_KEY = "sc_pwa_install_dismissed";

  /* Already running as an installed app? Nothing to prompt. */
  var standalone = false;
  try {
    standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.navigator.standalone === true;
  } catch (e) {}
  if (standalone) {
    document.documentElement.setAttribute("data-pwa", "standalone");
    return;
  }

  var ua = navigator.userAgent || "";
  var isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isIOSSafari = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);

  var dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === "1"; } catch (e) {}
  if (dismissed) return;

  var deferredPrompt = null;
  var banner = null;
  var helpEl = null;

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }
  function persistDismiss() {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch (e) {}
  }

  var shareIcon =
    '<svg class="pwa-help__share" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/>' +
    '<path d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/></svg>';

  function buildBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "pwa-install";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Install the SmartCity app");
    banner.innerHTML =
      '<img class="pwa-install__icon" src="assets/icons/icon-192.png" alt="" width="44" height="44">' +
      '<span class="pwa-install__txt">' +
        "<b>Install SmartCity App</b>" +
        "<span data-pwa-desc>Full-screen app on your home screen &mdash; opens faster and works offline.</span>" +
      "</span>" +
      '<button class="pwa-install__go" type="button">' + (isIOSSafari ? "How to install" : "Install") + "</button>" +
      '<button class="pwa-install__x" type="button" aria-label="Dismiss">&#215;</button>';

    document.body.appendChild(banner);

    banner.querySelector(".pwa-install__go").addEventListener("click", function () {
      if (deferredPrompt) {
        var evt = deferredPrompt;
        deferredPrompt = null;
        evt.prompt();
        var choice = evt.userChoice;
        hide();
        if (choice && choice.then) {
          choice.then(function (res) {
            if (res && res.outcome === "accepted") persistDismiss();
            else persistDismiss();
          }).catch(function () { persistDismiss(); });
        } else {
          persistDismiss();
        }
      } else {
        openHelp();
      }
    });

    banner.querySelector(".pwa-install__x").addEventListener("click", function () {
      hide();
      persistDismiss();
    });
  }

  function show() {
    buildBanner();
    requestAnimationFrame(function () { banner.classList.add("show"); });
  }
  function hide() {
    if (banner) banner.classList.remove("show");
  }

  function openHelp() {
    if (!helpEl) {
      helpEl = document.createElement("div");
      helpEl.className = "pwa-help";
      helpEl.setAttribute("role", "dialog");
      helpEl.setAttribute("aria-modal", "true");
      helpEl.innerHTML =
        '<div class="pwa-help__card">' +
          "<h3>Add SmartCity to your Home Screen</h3>" +
          "<p>Install the app on your iPhone / iPad:</p>" +
          "<ol>" +
            "<li>Tap the <b>Share</b> button " + shareIcon + " in Safari&rsquo;s toolbar.</li>" +
            "<li>Scroll down and tap <b>Add to Home Screen</b>.</li>" +
            "<li>Tap <b>Add</b> &mdash; the SmartCity icon appears on your home screen.</li>" +
          "</ol>" +
          '<button class="pwa-help__close" type="button">Got it</button>' +
        "</div>";
      document.body.appendChild(helpEl);
      helpEl.addEventListener("click", function (e) { if (e.target === helpEl) closeHelp(); });
      helpEl.querySelector(".pwa-help__close").addEventListener("click", function () {
        closeHelp();
        persistDismiss();
      });
    }
    requestAnimationFrame(function () { helpEl.classList.add("show"); });
  }
  function closeHelp() { if (helpEl) helpEl.classList.remove("show"); }

  /* Capture the native install prompt (Android Chrome/Edge, desktop Chrome/Edge) */
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (document.body) show();
    else document.addEventListener("DOMContentLoaded", show, { once: true });
  });

  window.addEventListener("appinstalled", function () {
    hide();
    persistDismiss();
  });

  /* iOS gives no event — show the instruction banner after a short delay */
  if (isIOSSafari) {
    window.setTimeout(function () {
      if (document.body) show();
      else document.addEventListener("DOMContentLoaded", show, { once: true });
    }, 2800);
  }
})();
