/* 동의 창 (영어·독일어 페이지 전용). 일본어·한국어 페이지에는 불러오지 않는다.
 *
 * 저장: localStorage "cusmos-consent" = {v:1, choice:"accepted"|"declined", date:"ISO 시각"}
 * 사용 (나중에 분석이나 외부 미디어를 붙일 때):
 *   CUSMOS_CONSENT.granted()  선택 후 "accepted"일 때만 true
 *   CUSMOS_CONSENT.onGrant(fn) 동의하면 fn 실행. 이미 동의한 상태면 바로 실행
 *   CUSMOS_CONSENT.open()     동의 창 다시 열기. 개인정보 페이지 링크에 data-consent-open 속성을 붙여도 된다
 */
(function () {
  "use strict";

  var KEY = "cusmos-consent";
  var VERSION = 1;
  var lang = (document.documentElement.lang || "en").toLowerCase().slice(0, 2);

  var STR = {
    en: {
      label: "Privacy choice",
      text: "We use no tracking cookies. Your browser only stores this choice. If we add analytics or embedded media later, they will run only if you accept.",
      link: "Privacy notice",
      accept: "Accept",
      decline: "Decline"
    },
    de: {
      label: "Datenschutz-Auswahl",
      text: "Wir setzen keine Tracking-Cookies ein. Ihr Browser speichert nur diese Auswahl. Falls wir später Statistiken oder eingebettete Medien einsetzen, laufen diese nur mit Ihrer Einwilligung.",
      link: "Datenschutzerklärung",
      accept: "Akzeptieren",
      decline: "Ablehnen"
    }
  };

  if (!STR[lang]) return;
  var S = STR[lang];

  function readStored() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (d && d.v === VERSION && (d.choice === "accepted" || d.choice === "declined")) return d;
    } catch (e) { /* 저장소를 못 쓰는 브라우저(비공개 창 등)는 선택이 없는 것으로 본다 */ }
    return null;
  }

  function writeStored(choice) {
    var d = { v: VERSION, choice: choice, date: new Date().toISOString() };
    try { window.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* 저장 실패 시 이번 방문 동안만 기억 */ }
    return d;
  }

  var current = readStored();
  var grantFns = [];
  var root = null;
  var btnAccept = null;
  var lastFocus = null;

  function granted() {
    return !!current && current.choice === "accepted";
  }

  function fire(fn) {
    try { fn(); } catch (e) { if (window.console) console.error(e); }
  }

  function onGrant(fn) {
    if (typeof fn !== "function") return;
    if (granted()) { fire(fn); return; }
    grantFns.push(fn);
  }

  function build() {
    root = document.createElement("div");
    root.className = "cc-banner";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", S.label);
    root.setAttribute("aria-modal", "false");
    root.hidden = true;
    root.innerHTML =
      '<div class="cc-inner">' +
        '<p class="cc-text">' + S.text + ' <a class="cc-link" href="privacy.html">' + S.link + '</a></p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn" data-choice="accepted">' + S.accept + '</button>' +
          '<button type="button" class="cc-btn" data-choice="declined">' + S.decline + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    btnAccept = root.querySelector('[data-choice="accepted"]');
    root.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-choice]") : null;
      if (b) choose(b.getAttribute("data-choice"));
    });
  }

  function show(focusFirst) {
    if (!root) build();
    lastFocus = document.activeElement;
    root.hidden = false;
    if (focusFirst) btnAccept.focus();
  }

  function hide() {
    if (!root || root.hidden) return;
    var hadFocus = root.contains(document.activeElement);
    root.hidden = true;
    if (hadFocus && lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function choose(choice) {
    var wasGranted = granted();
    current = writeStored(choice);
    hide();
    if (choice === "accepted" && !wasGranted) {
      for (var i = 0; i < grantFns.length; i++) fire(grantFns[i]);
    }
  }

  function open() {
    show(true);
  }

  // 선택 전에는 Esc로 닫히지 않는다. 선택한 뒤 다시 연 창은 Esc로 닫을 수 있다.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !root || root.hidden || !current) return;
    hide();
  });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-consent-open]") : null;
    if (!t) return;
    e.preventDefault();
    open();
  });

  window.CUSMOS_CONSENT = {
    open: open,
    granted: granted,
    onGrant: onGrant
  };

  function init() {
    if (!current) show(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
