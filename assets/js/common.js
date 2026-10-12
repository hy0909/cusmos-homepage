/* 헤더·푸터·공통 기능 */
(function () {
  const NAV = [
    { label: "회사소개", href: "company.html", children: [["비전", "company.html#vision"], ["팀", "company.html#team"], ["연혁", "company.html#history"], ["특허", "company.html#patent"], ["오시는 길", "company.html#location"]] },
    { label: "기술", href: "technology.html", children: [["엣지 AI 음향센서", "technology.html#sensor"], ["마이크 배열 설계", "technology.html#array"], ["현장 분석·선별 전송", "technology.html#edge"], ["소리 맥락 데이터", "technology.html#data"]] },
    { label: "솔루션", href: "solutions.html", children: [["스마트시티 소음 관측", "solutions.html#city"], ["산업안전 이상음 탐지", "solutions.html#industry"], ["휴대용 초음파 카메라", "solutions.html#ucam"]] },
    { label: "도입 사례", href: "cases.html", children: [["시흥 배곧 이륜차 소음", "cases.html#siheung"], ["한전 태안화력 PoC", "cases.html#kepco"], ["도입 기관", "cases.html#clients"]] },
    { label: "홍보센터", href: "news.html", children: [["공지사항", "notice.html"], ["뉴스", "news.html"], ["CI", "ci.html"]] },
    { label: "채용", href: "careers.html", children: [["채용공고", "careers.html"], ["인재상", "careers.html#culture"]] },
  ];
  window.CUSMOS_NAV = NAV;

  const ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10h12M11 5l5 5-5 5"/></svg>';
  window.ARROW = ARROW;
  const page = location.pathname.split("/").pop() || "index.html";
  const pageGroup = { "notice.html": "news.html", "ci.html": "news.html" }[page] || page;

  function header() {
    const el = document.getElementById("site-header");
    if (!el) return;
    el.className = "site-header" + (document.body.dataset.hero ? "" : " solid");
    el.innerHTML = `
      <div class="mega-bg"><div class="mega-intro"><strong>도시의 소리를<br>데이터로</strong><span>Smart City Sound Intelligence</span></div></div>
      <div class="gnb-line"></div>
      <div class="bar"><div class="wrap">
        <a class="logo" href="index.html" aria-label="CUSMOS 홈">
          <img class="sym" src="assets/img/logo-symbol.png" alt=""><img class="word" src="assets/img/logo-wordmark.png" alt="CUSMOS">
        </a>
        <ul class="gnb">
          ${NAV.map((n) => `<li class="${n.href === pageGroup ? "current" : ""}"><a href="${n.href}">${n.label}</a>
            <div class="sub">${n.children.map((c) => `<a href="${c[1]}">${c[0]}</a>`).join("")}</div></li>`).join("")}
        </ul>
        <div class="util">
          <a class="btn btn-ghost btn-sm" href="contact.html">도입 문의</a>
          <button class="menu-btn" aria-label="메뉴 열기"><span></span></button>
        </div>
      </div></div>`;

    const gnb = el.querySelector(".gnb");
    const subs = el.querySelectorAll(".gnb .sub");
    function setMegaH() {
      let max = 0;
      subs.forEach((s) => (max = Math.max(max, s.scrollHeight)));
      el.style.setProperty("--mega-h", el.querySelector(".bar").offsetHeight + max + 64 + "px");
    }
    let closeT;
    const open = () => { clearTimeout(closeT); setMegaH(); el.classList.add("open"); };
    const close = () => { closeT = setTimeout(() => el.classList.remove("open"), 120); };
    gnb.addEventListener("mouseenter", open);
    el.addEventListener("mouseleave", close);
    el.querySelector(".mega-bg").addEventListener("mouseenter", () => clearTimeout(closeT));
    gnb.addEventListener("focusin", open);
    el.addEventListener("focusout", (e) => { if (!el.contains(e.relatedTarget)) close(); });

    // 스크롤 방향에 따라 헤더 숨김
    let lastY = scrollY;
    function onScroll() {
      const y = scrollY;
      el.classList.toggle("scrolled", y > 40);
      if (!el.classList.contains("open")) {
        const hide = y > lastY && y > 200;
        el.classList.toggle("hide", hide);
        document.body.classList.toggle("header-visible", !hide);
      }
      lastY = y;
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 모바일 메뉴
    const m = document.createElement("div");
    m.className = "m-nav";
    m.innerHTML = `<div class="m-top"><img src="assets/img/logo-wordmark.png" alt="CUSMOS" style="height:15px;width:auto"><button class="m-close" aria-label="메뉴 닫기">×</button></div>
      ${NAV.map((n) => `<details><summary>${n.label}</summary><ul>${n.children.map((c) => `<li><a href="${c[1]}">${c[0]}</a></li>`).join("")}</ul></details>`).join("")}
      <a class="btn btn-grad" href="contact.html">도입 문의</a>`;
    document.body.appendChild(m);
    el.querySelector(".menu-btn").addEventListener("click", () => { m.classList.add("open"); document.body.style.overflow = "hidden"; });
    const mClose = () => { m.classList.remove("open"); document.body.style.overflow = ""; };
    m.querySelector(".m-close").addEventListener("click", mClose);
    m.querySelectorAll("a").forEach((a) => a.addEventListener("click", mClose));
  }

  async function footer() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const site = await getData("site", {});
    const info = [["대표", site.ceo], ["사업자등록번호", site.bizNo], ["주소", site.address], ["전화", site.phone], ["이메일", site.email]].filter((r) => r[1]);
    el.className = "site-footer";
    el.innerHTML = `<div class="wrap">
      <div class="top">
        <div class="brand"><img class="word" src="assets/img/logo-wordmark.png" alt="CUSMOS"><p>시민의 문제를 발견하고, 원인을 밝히고, 해결책을 만드는 회사입니다.</p></div>
        <div class="cols">${NAV.map((n) => `<div><strong>${n.label}</strong><ul>${n.children.slice(0, 4).map((c) => `<li><a href="${c[1]}">${c[0]}</a></li>`).join("")}</ul></div>`).join("")}</div>
      </div>
      <div class="bottom">
        <dl>${[["상호", site.company || "주식회사 커즈모스"], ...info].map((r) => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join("")}</dl>
        <span>© ${new Date().getFullYear()} CUSMOS. All rights reserved.</span>
      </div></div>`;
  }

  // 화면에 들어오면 나타나는 모션
  // 스크롤할 때마다 화면 안에 들어온 요소를 확인한다
  let ticking = false;
  function checkInView() {
    ticking = false;
    const limit = innerHeight * 0.9;
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < limit) el.classList.add("in"); });
    document.querySelectorAll("[data-count]:not(.counted)").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.85) countUp(el); });
  }
  function onView() { if (!ticking) { ticking = true; requestAnimationFrame(checkInView); } }
  window.observeReveal = checkInView;

  // 숫자 카운트업
  function countUp(el) {
    el.classList.add("counted");
    const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
    const fmt = (v) => v.toLocaleString("ko-KR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return (el.textContent = fmt(to));
    const t0 = performance.now(), dur = 1600;
    (function tick(t) {
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // 데이터 읽기 (관리자 페이지에서 저장한 JSON)
  const cache = {};
  async function getData(name, fallback) {
    if (cache[name]) return cache[name];
    try {
      const base = document.body.dataset.base || "";
      const r = await fetch(`${base}data/${name}.json?t=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw 0;
      cache[name] = await r.json();
    } catch (e) { cache[name] = fallback; }
    return cache[name];
  }
  window.getData = getData;

  function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  window.esc = esc;
  window.fmtDate = (d) => (d ? String(d).slice(0, 10).replace(/-/g, ".") : "");

  // 간단한 마크다운 → HTML
  window.md = function (src) {
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    const inline = (t) => esc(t)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => `<img src="${safeUrl(u)}" alt="${a}">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => `<a href="${safeUrl(u)}" target="_blank" rel="noopener">${a}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
    let out = "", list = null, para = [];
    const flushP = () => { if (para.length) { out += `<p>${para.map(inline).join("<br>")}</p>`; para = []; } };
    const flushL = () => { if (list) { out += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const l = raw.trimEnd();
      let m;
      if (!l.trim()) { flushP(); flushL(); continue; }
      if ((m = l.match(/^(#{2,3})\s+(.*)/))) { flushP(); flushL(); out += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; continue; }
      if (/^---+$/.test(l)) { flushP(); flushL(); out += "<hr>"; continue; }
      if ((m = l.match(/^>\s?(.*)/))) { flushP(); flushL(); out += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
      if ((m = l.match(/^\s*[-*]\s+(.*)/))) { flushP(); if (list !== "ul") { flushL(); out += "<ul>"; list = "ul"; } out += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = l.match(/^\s*\d+\.\s+(.*)/))) { flushP(); if (list !== "ol") { flushL(); out += "<ol>"; list = "ol"; } out += `<li>${inline(m[1])}</li>`; continue; }
      flushL(); para.push(l);
    }
    flushP(); flushL();
    return out;
  };
  function safeUrl(u) { return /^(https?:|mailto:|\/|\.\.?\/|[\w-]+\/)/i.test(u) && !/^javascript:/i.test(u) ? u.replace(/"/g, "%22") : "#"; }
  window.safeUrl = safeUrl;

  document.addEventListener("DOMContentLoaded", () => {
    header(); footer(); checkInView();
    addEventListener("scroll", onView, { passive: true });
    addEventListener("resize", onView);
  });
})();
