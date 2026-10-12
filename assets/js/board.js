/* 홍보센터·채용 게시판 렌더링 */
(function () {
  const PER = 10;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  function search(onInput) {
    return `<label class="search"><span class="sr-only">검색</span><input type="search" placeholder="검색어를 입력하세요" value="${esc(params.get("q") || "")}"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></label>`;
  }

  function pager(total, page, go) {
    const pages = Math.ceil(total / PER);
    if (pages <= 1) return "";
    return `<div class="pager">${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === page ? "on" : ""}" data-p="${i + 1}">${i + 1}</button>`).join("")}</div>`;
  }

  function sortItems(items) {
    return items.filter((n) => n.published !== false)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)));
  }

  function filesHtml(files) {
    if (!files || !files.length) return "";
    return `<div class="files"><strong>첨부파일</strong>${files.map((f) => `<a href="${esc(safeUrl(f.path))}" download>📎 ${esc(f.name)}</a>`).join("")}</div>`;
  }

  function article(box, item, back, extraMeta) {
    document.title = `${item.title} | CUSMOS`;
    box.innerHTML = `<article class="article">
      <div class="a-head">${extraMeta.badge || ""}<h1>${esc(item.title)}</h1><div class="meta">${extraMeta.meta}</div></div>
      ${item.thumbnail && extraMeta.showThumb ? `<img src="${esc(item.thumbnail)}" alt="" style="border-radius:18px;margin-bottom:40px;width:100%">` : ""}
      <div class="md">${md(item.body || item.summary || "")}</div>
      ${extraMeta.after || ""}
      ${filesHtml(item.attachments)}
      <div class="a-foot"><a class="btn btn-sm" style="background:var(--ink);color:#fff" href="${back}">목록으로</a></div>
    </article>`;
  }

  // 공지사항
  async function notices(box) {
    const data = await getData("notices", { items: [] });
    const items = sortItems(data.items || []);
    if (id) {
      const it = items.find((n) => n.id === id);
      if (!it) return (box.innerHTML = '<p class="empty">게시물을 찾을 수 없습니다.</p>');
      return article(box, it, "notice.html", { badge: '<span class="badge gray">공지사항</span>', meta: `<span>${fmtDate(it.date)}</span>` });
    }
    list(box, items, (n, i, total) => `<li><a href="notice.html?id=${esc(n.id)}"><span class="no">${n.pinned ? '<span class="badge" style="margin:0">공지</span>' : total - i}</span><span class="t">${esc(n.title)}</span><span class="d">${fmtDate(n.date)}</span></a></li>`, "board");
  }

  // 뉴스
  async function news(box) {
    const data = await getData("news", { items: [] });
    const items = sortItems(data.items || []);
    if (id) {
      const it = items.find((n) => n.id === id);
      if (!it) return (box.innerHTML = '<p class="empty">게시물을 찾을 수 없습니다.</p>');
      return article(box, it, "news.html", {
        badge: `<span class="badge gray">${esc(it.source || "뉴스")}</span>`, meta: `<span>${fmtDate(it.date)}</span>`, showThumb: true,
        after: it.link ? `<p style="margin-top:32px"><a class="btn btn-sm" style="border:1px solid var(--ink-line)" href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener">기사 원문 보기 <i class="arr"></i></a></p>` : "",
      });
    }
    list(box, items, (n) => {
      const ext = n.link && !n.body;
      return `<a class="post-card" href="${ext ? esc(safeUrl(n.link)) : "news.html?id=" + esc(n.id)}" ${ext ? 'target="_blank" rel="noopener"' : ""}>
        <div class="thumb">${n.thumbnail ? `<img src="${esc(n.thumbnail)}" alt="" loading="lazy">` : '<div class="ph"><img src="assets/img/logo-symbol.png" alt=""></div>'}</div>
        <div class="meta"><span>${esc(n.source || "커즈모스")}</span><span>${fmtDate(n.date)}</span></div>
        <h3>${esc(n.title)}</h3></a>`;
    }, "post-grid");
  }

  // 채용
  async function careers(box) {
    const data = await getData("careers", { items: [] });
    const items = sortItems(data.items || []).sort((a, b) => (a.status === "closed") - (b.status === "closed"));
    const today = new Date().toISOString().slice(0, 10);
    const isOpen = (j) => j.status !== "closed" && (!j.deadline || j.deadline >= today);
    if (id) {
      const it = items.find((n) => n.id === id);
      if (!it) return (box.innerHTML = '<p class="empty">채용공고를 찾을 수 없습니다.</p>');
      const apply = it.apply ? (it.apply.includes("@") && !it.apply.startsWith("http") ? `mailto:${it.apply}` : it.apply) : "";
      return article(box, it, "careers.html", {
        badge: isOpen(it) ? '<span class="badge open">채용 중</span>' : '<span class="badge gray">마감</span>',
        meta: [it.team, it.type, it.career, it.location, it.deadline ? `마감 ${fmtDate(it.deadline)}` : "상시 채용"].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join(""),
        after: apply && isOpen(it) ? `<p style="margin-top:40px"><a class="btn btn-grad" href="${esc(safeUrl(apply))}" target="_blank" rel="noopener">지원하기 <i class="arr"></i></a></p>` : "",
      });
    }
    list(box, items, (j) => `<li><a href="careers.html?id=${esc(j.id)}">
        <div>${isOpen(j) ? '<span class="badge open">채용 중</span>' : '<span class="badge gray">마감</span>'}<h3>${esc(j.title)}</h3>
        <div class="tags">${[j.team, j.type, j.career, j.location].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>
        <div class="dl">${j.deadline ? fmtDate(j.deadline) + " 마감" : "상시 채용"}</div></a></li>`, "job-list", "현재 진행 중인 채용이 없습니다.");
  }

  // CI
  async function ci(box) {
    const data = await getData("ci", { items: [] });
    const items = sortItems(data.items || []).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    const logos = items.filter((i) => i.kind !== "color");
    const colors = items.filter((i) => i.kind === "color");
    box.innerHTML = `
      <div class="sec-head"><span class="eyebrow">Logo</span><h2 class="h2" style="font-size:clamp(28px,3vw,40px)">로고</h2><p>로고 비율과 색상은 바꾸지 말고 그대로 사용해 주세요.</p></div>
      <div class="ci-grid">${logos.map((l) => `<div class="ci-item">
        <div class="pv ${l.bg === "light" ? "light" : "dark"}">${l.preview ? `<img src="${esc(l.preview)}" alt="${esc(l.title)}">` : ""}</div>
        <div class="info"><div><h3>${esc(l.title)}</h3>${l.desc ? `<p>${esc(l.desc)}</p>` : ""}</div>
        <div class="ci-dl">${(l.files || []).map((f) => `<a href="${esc(safeUrl(f.path))}" download>${esc(f.name)} ↓</a>`).join("")}</div></div></div>`).join("") || '<p class="empty" style="grid-column:1/-1">준비 중입니다.</p>'}</div>
      ${colors.length ? `<div class="sec-head" style="margin-top:clamp(72px,8vw,120px)"><span class="eyebrow">Color</span><h2 class="h2" style="font-size:clamp(28px,3vw,40px)">브랜드 컬러</h2></div>
      <div class="colors">${colors.map((c) => `<div class="color"><div class="sw" style="background:${/^#[0-9a-f]{3,8}$/i.test(c.hex) ? c.hex : "#ccc"}"></div><div class="info"><strong>${esc(c.title)}</strong><span>${esc(c.hex || "")}${c.desc ? " · " + esc(c.desc) : ""}</span></div></div>`).join("")}</div>` : ""}`;
  }

  function list(box, items, row, cls, emptyMsg) {
    let q = params.get("q") || "", page = 1;
    function render() {
      const f = items.filter((n) => !q || (n.title + " " + (n.body || "") + " " + (n.summary || "")).toLowerCase().includes(q.toLowerCase()));
      const slice = f.slice((page - 1) * PER, page * PER);
      const tag = cls === "post-grid" ? "div" : "ul";
      box.innerHTML = `<div class="board-tools"><span class="count">전체 <b>${f.length}</b>건</span>${search()}</div>
        ${f.length ? `<${tag} class="${cls}">${slice.map((n, i) => row(n, (page - 1) * PER + i, f.length)).join("")}</${tag}>` : `<p class="empty">${q ? "검색 결과가 없습니다." : emptyMsg || "등록된 게시물이 없습니다."}</p>`}
        ${pager(f.length, page)}`;
      const inp = box.querySelector(".search input");
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { q = inp.value.trim(); page = 1; render(); box.querySelector(".search input").focus(); } });
      box.querySelectorAll(".pager button").forEach((b) => b.addEventListener("click", () => { page = +b.dataset.p; render(); box.scrollIntoView({ behavior: "smooth" }); }));
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const box = document.getElementById("board");
    if (!box) return;
    ({ notices, news, careers, ci })[box.dataset.type](box);
  });
})();
