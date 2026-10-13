/* 다국어 게시판(공지·뉴스·CI)
 * 관리자에서 언어를 골라 쓴 글 가운데 지금 사이트 언어(window.SITE.lang)의 글만 보여 준다. */
(function () {
  const S = window.SITE;
  const T = {
    en: { total: (n) => `${n} ${n === 1 ? "post" : "posts"}`, search: "Search", empty: "No posts yet.", noResult: "No results found.", notFound: "Post not found.", back: "Back to list", files: "Attachments", original: "Read the original article", pinned: "Pinned", source: "CUSMOS", logo: "Logo", logoLead: "Please use the logo as provided, without changing its proportions or colors.", colors: "Brand colors", soon: "Coming soon." },
    ja: { total: (n) => `全${n}件`, search: "キーワード検索", empty: "まだ投稿はありません。", noResult: "該当する投稿はありません。", notFound: "投稿が見つかりません。", back: "一覧に戻る", files: "添付ファイル", original: "元の記事を読む", pinned: "重要", source: "CUSMOS", logo: "ロゴ", logoLead: "ロゴの比率や色は変更せずにご使用ください。", colors: "ブランドカラー", soon: "準備中です。" },
    de: { total: (n) => `${n} ${n === 1 ? "Beitrag" : "Beiträge"}`, search: "Suchen", empty: "Noch keine Beiträge.", noResult: "Keine Treffer.", notFound: "Beitrag nicht gefunden.", back: "Zur Übersicht", files: "Anhänge", original: "Originalartikel lesen", pinned: "Angeheftet", source: "CUSMOS", logo: "Logo", logoLead: "Bitte verwenden Sie das Logo unverändert in Proportion und Farbe.", colors: "Markenfarben", soon: "In Vorbereitung." },
  }[S.lang];
  const PER = 10;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const TABLES = { notices: "notices", news: "news", ci: "ci_items" };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:|mailto:|\/|\.\.?\/|[\w-]+\/)/i.test(u) && !/^javascript:/i.test(u) ? u.replace(/"/g, "%22") : "#");
  // 저장소 안 파일(uploads/...)은 언어 폴더에서 한 단계 위를 가리켜야 한다
  const asset = (p) => (!p ? "" : /^(https?:|\/|\.\.\/)/i.test(p) ? p : "../" + p);
  const fmtDate = (d) => {
    if (!d) return "";
    const t = new Date(String(d).slice(0, 10) + "T00:00:00");
    return isNaN(t) ? String(d) : t.toLocaleDateString(S.locale, { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // 간단한 마크다운 → HTML (한국어 게시판과 같은 규칙)
  function md(src) {
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    const inline = (t) => esc(t)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => `<img src="${safeUrl(asset(u))}" alt="${a}">`)
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
  }

  // 글 읽기: Supabase에서 읽고 지금 언어의 글만 남긴다. 연결이 안 되면 data/*.json (한국어 글만 있어서 비게 된다)
  async function load(name, fallbackKo) {
    let rows = [];
    const sb = window.CUSMOS_SUPABASE || {};
    try {
      if (!sb.url || !sb.anonKey) throw 0;
      const r = await fetch(`${sb.url.replace(/\/$/, "")}/rest/v1/${TABLES[name]}?select=*`, { headers: { apikey: sb.anonKey }, cache: "no-store" });
      if (!r.ok) throw 0;
      rows = await r.json();
    } catch (e) {
      try { rows = ((await (await fetch(`../data/${name}.json`, { cache: "no-store" })).json()).items) || []; } catch (e2) { rows = []; }
    }
    rows = rows.map((r) => ({ ...r, order: r.order ?? r.sort_order, desc: r.desc ?? r.description })).filter((r) => r.published !== false);
    let mine = rows.filter((r) => (r.lang || "ko") === S.lang);
    // CI는 로고 파일이 언어와 상관없어서, 그 언어로 쓴 항목이 없으면 한국어 항목을 보여 준다
    if (!mine.length && fallbackKo) mine = rows.filter((r) => (r.lang || "ko") === "ko");
    return mine
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)));
  }

  function article(box, it, back, opt) {
    document.title = `${it.title} | CUSMOS`;
    const files = it.attachments && it.attachments.length
      ? `<div class="b-files"><strong>${T.files}</strong>${it.attachments.map((f) => `<a href="${esc(safeUrl(asset(f.path)))}" download>${esc(f.name)}</a>`).join("")}</div>` : "";
    box.innerHTML = `<article class="b-article">
      <header>${opt.badge || ""}<h2 class="t-h2">${esc(it.title)}</h2><div class="b-meta">${opt.meta}</div></header>
      ${opt.thumb && it.thumbnail ? `<img class="b-cover" src="${esc(asset(it.thumbnail))}" alt="">` : ""}
      <div class="b-md">${md(it.body || it.summary || "")}</div>
      ${opt.after || ""}${files}
      <div class="b-foot"><a class="btn btn-outline" href="${back}">${T.back}</a></div>
    </article>`;
  }

  function list(box, items, row, cls) {
    let q = "", page = 1;
    function render() {
      const f = items.filter((n) => !q || `${n.title} ${n.body || ""} ${n.summary || ""}`.toLowerCase().includes(q.toLowerCase()));
      const pages = Math.ceil(f.length / PER);
      const slice = f.slice((page - 1) * PER, page * PER);
      box.innerHTML = `<div class="b-tools"><span class="b-count">${T.total(f.length)}</span>
          <label class="b-search"><span class="sr-only">${T.search}</span><input type="search" placeholder="${T.search}" value="${esc(q)}"></label></div>
        ${f.length ? `<div class="${cls}">${slice.map(row).join("")}</div>` : `<p class="b-empty">${q ? T.noResult : T.empty}</p>`}
        ${pages > 1 ? `<div class="b-pager">${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === page ? "on" : ""}" data-p="${i + 1}">${i + 1}</button>`).join("")}</div>` : ""}`;
      const inp = box.querySelector(".b-search input");
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { q = inp.value.trim(); page = 1; render(); box.querySelector(".b-search input").focus(); } });
      box.querySelectorAll(".b-pager button").forEach((b) => b.addEventListener("click", () => { page = +b.dataset.p; render(); box.scrollIntoView({ behavior: "smooth" }); }));
    }
    render();
  }

  const R = {
    async notices(box) {
      const items = await load("notices");
      if (id) {
        const it = items.find((n) => n.id === id);
        if (!it) return (box.innerHTML = `<p class="b-empty">${T.notFound}</p>`);
        return article(box, it, "notice.html", { meta: `<time>${fmtDate(it.date)}</time>` });
      }
      list(box, items, (n) => `<a class="b-row" href="notice.html?id=${encodeURIComponent(n.id)}">${n.pinned ? `<span class="badge">${T.pinned}</span>` : ""}<span class="t">${esc(n.title)}</span><time>${fmtDate(n.date)}</time></a>`, "b-list");
    },
    async news(box) {
      const items = await load("news");
      if (id) {
        const it = items.find((n) => n.id === id);
        if (!it) return (box.innerHTML = `<p class="b-empty">${T.notFound}</p>`);
        return article(box, it, "news.html", {
          badge: it.source ? `<span class="badge">${esc(it.source)}</span>` : "", meta: `<time>${fmtDate(it.date)}</time>`, thumb: true,
          after: it.link ? `<p class="b-orig"><a class="link-arrow" href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener">${T.original}</a></p>` : "",
        });
      }
      list(box, items, (n) => {
        const ext = n.link && !n.body;
        return `<a class="b-card" href="${ext ? esc(safeUrl(n.link)) : "news.html?id=" + encodeURIComponent(n.id)}" ${ext ? 'target="_blank" rel="noopener"' : ""}>
          <div class="thumb">${n.thumbnail ? `<img src="${esc(asset(n.thumbnail))}" alt="" loading="lazy">` : '<div class="ph"><img src="../assets/img/logo-wordmark.png" alt=""></div>'}</div>
          <div class="meta"><span>${esc(n.source || T.source)}</span><time>${fmtDate(n.date)}</time></div>
          <h3>${esc(n.title)}</h3></a>`;
      }, "b-cards");
    },
    async ci(box) {
      const items = (await load("ci", true)).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      const logos = items.filter((i) => i.kind !== "color"), colors = items.filter((i) => i.kind === "color");
      box.innerHTML = `
        <div class="sec-head"><h2 class="t-h2">${T.logo}</h2><p>${T.logoLead}</p></div>
        <div class="b-ci">${logos.map((l) => `<div class="b-ci-item">
          <div class="pv ${l.bg === "light" ? "light" : "dark"}">${l.preview ? `<img src="${esc(asset(l.preview))}" alt="${esc(l.title)}">` : ""}</div>
          <div class="info"><div><h3>${esc(l.title)}</h3>${l.desc ? `<p>${esc(l.desc)}</p>` : ""}</div>
          <div class="dl">${(l.files || []).map((f) => `<a href="${esc(safeUrl(asset(f.path)))}" download>${esc(f.name)} ↓</a>`).join("")}</div></div></div>`).join("") || `<p class="b-empty">${T.soon}</p>`}</div>
        ${colors.length ? `<div class="sec-head" style="margin-top:clamp(56px,7vw,96px)"><h2 class="t-h2">${T.colors}</h2></div>
        <div class="b-colors">${colors.map((c) => `<div class="b-color"><div class="sw" style="background:${/^#[0-9a-f]{3,8}$/i.test(c.hex) ? c.hex : "#e3e5ee"}"></div><strong>${esc(c.title)}</strong><span>${esc(c.hex || "")}${c.desc ? " · " + esc(c.desc) : ""}</span></div>`).join("")}</div>` : ""}`;
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    const box = document.getElementById("board");
    if (box && R[box.dataset.type]) R[box.dataset.type](box);
  });
})();
