/* 다국어 개선 버전(en/ja/de) 공통 스크립트: 헤더, 푸터, 언어 선택, 모션
 * 언어별 메뉴와 문구는 각 폴더의 site.js가 window.SITE에 넣어 둔다. */
(function () {
  const S = window.SITE;
  if (!S) return console.error("site.js가 먼저 불러와져야 합니다");

  // 언어별 실제로 있는 페이지. 언어를 바꿀 때 같은 페이지가 있으면 그대로, 없으면 메인으로 간다
  const LANGS = [
    { code: "en", label: "English", pages: ["index.html", "solutions.html", "technology.html", "cases.html", "company.html", "contact.html", "notice.html", "news.html", "ci.html"] },
    { code: "ja", label: "日本語", pages: ["index.html", "solutions.html", "technology.html", "cases.html", "company.html", "contact.html", "notice.html", "news.html", "ci.html"] },
    { code: "de", label: "Deutsch", pages: ["index.html", "solutions.html", "technology.html", "cases.html", "company.html", "contact.html", "impressum.html", "privacy.html", "notice.html", "news.html", "ci.html"] },
  ];
  const OLD = { code: "ko", label: "한국어", pages: ["index.html", "company.html", "technology.html", "solutions.html", "cases.html", "contact.html", "notice.html", "news.html", "ci.html"] };
  const KEY = "cusmos-lang";
  const page = location.pathname.split("/").pop() || "index.html";
  const IMG = "../assets/img/";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  window.esc = esc;

  const ICON = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  function langHref(l) {
    return `../${l.code}/${l.pages.includes(page) ? page : "index.html"}`;
  }

  function header() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const group = (S.pageGroup && S.pageGroup[page]) || page;
    el.className = "gh";
    el.innerHTML = `<div class="wrap">
      <a class="logo" href="index.html" aria-label="CUSMOS">
        <img class="on-light" src="${IMG}logo-wordmark-black.png" alt="CUSMOS"><img class="on-dark" src="${IMG}logo-wordmark.png" alt="CUSMOS">
      </a>
      <nav aria-label="${esc(S.labels.nav)}"><ul>
        ${S.nav.map((n) => `<li class="${n.href === group ? "current" : ""}"><a href="${n.href}">${esc(n.label)}</a>
          ${n.children && n.children.length ? `<div class="drop">${n.children.map((c) => `<a href="${c[1]}">${esc(c[0])}</a>`).join("")}</div>` : ""}</li>`).join("")}
      </ul></nav>
      <div class="util">
        <div class="lang">
          <button class="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="${esc(S.labels.language)}">${ICON.globe}<span>${S.lang.toUpperCase()}</span></button>
          <div class="lang-menu" role="menu">
            ${LANGS.map((l) => `<a role="menuitem" href="${langHref(l)}" data-lang="${l.code}" hreflang="${l.code}" ${l.code === S.lang ? 'aria-current="true"' : ""}>${l.label}</a>`).join("")}
            <div class="sep"></div>
            <a role="menuitem" class="old" href="${langHref(OLD)}" hreflang="ko">${OLD.label} · ${esc(S.labels.original)}</a>
          </div>
        </div>
        <a class="btn btn-primary btn-sm cta" href="${S.cta.href}">${esc(S.cta.label)}</a>
        <button class="menu-btn" aria-label="${esc(S.labels.menu)}" aria-expanded="false">${ICON.menu}</button>
      </div></div>`;

    // 언어 메뉴
    const lang = el.querySelector(".lang"), lb = lang.querySelector(".lang-btn");
    lb.addEventListener("click", (e) => { e.stopPropagation(); const o = lang.classList.toggle("open"); lb.setAttribute("aria-expanded", o); });
    document.addEventListener("click", () => { lang.classList.remove("open"); lb.setAttribute("aria-expanded", false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") lang.classList.remove("open"); });
    lang.querySelectorAll("[data-lang]").forEach((a) => a.addEventListener("click", () => { try { localStorage.setItem(KEY, a.dataset.lang); } catch (e) {} }));

    // 모바일 메뉴
    const m = document.createElement("div");
    m.className = "m-nav";
    m.innerHTML = `${S.nav.map((n) => `<details><summary>${esc(n.label)}</summary><ul><li><a href="${n.href}">${esc(S.labels.overview)}</a></li>${(n.children || []).map((c) => `<li><a href="${c[1]}">${esc(c[0])}</a></li>`).join("")}</ul></details>`).join("")}
      <a class="btn btn-primary btn-lg" href="${S.cta.href}">${esc(S.cta.label)}</a>`;
    document.body.appendChild(m);
    const mb = el.querySelector(".menu-btn");
    const setMenu = (o) => { m.classList.toggle("open", o); el.classList.toggle("menu-open", o); mb.innerHTML = o ? ICON.close : ICON.menu; mb.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
    mb.addEventListener("click", () => setMenu(!m.classList.contains("open")));
    m.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

    // 스크롤: 내려가면 헤더 숨김, 조금이라도 내려가면 배경 채움
    let lastY = scrollY;
    function onScroll() {
      const y = scrollY;
      el.classList.toggle("scrolled", y > 24);
      if (!m.classList.contains("open")) {
        const hide = y > lastY && y > 320;
        el.classList.toggle("hide", hide);
        document.body.classList.toggle("header-hidden", hide);
      }
      lastY = y;
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  async function footer() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const site = await getSite();
    const rows = (S.companyRows ? S.companyRows(site) : []).filter((r) => r[1]);
    el.className = "gf";
    el.innerHTML = `<div class="wrap">
      <div class="top">
        <div class="brand"><img src="${IMG}logo-wordmark.png" alt="CUSMOS"><p>${esc(S.tagline)}</p></div>
        <div class="cols">${S.nav.map((n) => `<div><strong>${esc(n.label)}</strong><ul>${(n.children || []).slice(0, 4).map((c) => `<li><a href="${c[1]}">${esc(c[0])}</a></li>`).join("")}</ul></div>`).join("")}</div>
      </div>
      <div class="bottom">
        <div class="company">${rows.map((r) => `<span>${esc(r[0])} ${esc(r[1])}</span>`).join("")}</div>
        <div class="legal">${(S.legal || []).map((l) => `<a href="${l[1]}">${esc(l[0])}</a>`).join("")}<span>© ${new Date().getFullYear()} CUSMOS</span></div>
      </div></div>`;
  }

  // 회사 정보: 관리자 페이지에서 저장한 값(Supabase)을 먼저, 없으면 data/site.json
  let siteCache;
  async function getSite() {
    if (siteCache) return siteCache;
    const sb = window.CUSMOS_SUPABASE || {};
    try {
      if (sb.url && sb.anonKey) {
        const r = await fetch(`${sb.url.replace(/\/$/, "")}/rest/v1/site_settings?select=*`, { headers: { apikey: sb.anonKey } });
        if (r.ok) { const row = (await r.json())[0]; if (row) return (siteCache = { ...row, bizNo: row.biz_no }); }
      }
    } catch (e) { console.warn("Supabase 읽기 실패, JSON 파일로 대체", e); }
    try { siteCache = await (await fetch("../data/site.json")).json(); } catch (e) { siteCache = {}; }
    return siteCache;
  }
  window.getSite = getSite;

  // 문의 양식: 사용자 메일 프로그램을 열어 내용을 채운다
  window.bindMailForm = function (form, { subject, fields, noMail }) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const s = await getSite();
      if (!s.email) return alert(noMail);
      const v = (id) => (form.querySelector("#" + id) || {}).value || "";
      const body = fields.map(([id, label]) => `${label}: ${v(id).trim()}`).join("\n");
      location.href = `mailto:${s.email}?subject=${encodeURIComponent(subject(v))}&body=${encodeURIComponent(body)}`;
    });
  };

  // 화면에 들어오면 나타나는 모션과 숫자 카운트업
  function countUp(el) {
    el.classList.add("counted");
    const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
    const fmt = (v) => v.toLocaleString(S.locale || S.lang, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return (el.textContent = fmt(to));
    const t0 = performance.now(), dur = 1400;
    (function tick(t) {
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  let ticking = false;
  function check() {
    ticking = false;
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.92) el.classList.add("in"); });
    document.querySelectorAll("[data-count]:not(.counted)").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.88) countUp(el); });
  }
  const onView = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };

  // 하위 탭: 지금 보고 있는 섹션 표시
  function subNav() {
    const links = [...document.querySelectorAll(".sub-nav a[href^='#']")];
    if (!links.length) return;
    const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    addEventListener("scroll", () => {
      let cur = secs[0];
      secs.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.35) cur = s; });
      links.forEach((a) => a.classList.toggle("on", cur && a.getAttribute("href") === "#" + cur.id));
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    header(); footer(); subNav(); check();
    addEventListener("scroll", onView, { passive: true });
    addEventListener("resize", onView);
  });
})();
