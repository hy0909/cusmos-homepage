/* CUSMOS 홈페이지 관리자
 * Supabase 계정으로 로그인하고, 글은 Supabase DB에, 파일은 Storage(uploads 버킷)에 저장한다.
 * 저장하는 즉시 사이트에 반영된다. */
(function () {
  const CONF = window.CUSMOS_SUPABASE || {};
  const BUCKET = "uploads";
  const MAX_FILE = 25 * 1024 * 1024;
  let sb = null;
  const $ = (s, el = document) => el.querySelector(s);

  // ───────── 게시판 정의 ─────────
  const OPEN_CLOSED = [["open", "채용 중"], ["closed", "마감"]];
  // 공지·뉴스·CI는 언어별로 따로 쓴다. 고른 언어의 사이트 게시판에만 올라간다
  const LANGS = [["ko", "한국어"], ["en", "English"], ["ja", "日本語"], ["de", "Deutsch"]];
  const LANG_FIELD = { k: "lang", label: "언어", type: "select", options: LANGS, def: "ko", hint: "고른 언어 사이트의 게시판에만 올라갑니다." };
  let listLang = "";
  const SCHEMAS = {
    notices: {
      label: "공지사항", file: "notices", prefix: "n", desc: "사이트의 게시판 > 공지사항에 올라갑니다.",
      fields: [
        LANG_FIELD,
        { k: "title", label: "제목", type: "text", req: true },
        { k: "date", label: "게시일", type: "date", req: true, half: true },
        { k: "pinned", label: "목록 맨 위에 고정", type: "check", half: true },
        { k: "body", label: "본문", type: "md" },
        { k: "attachments", label: "첨부파일", type: "files" },
        { k: "published", label: "사이트에 공개", type: "check", def: true },
      ],
      head: ["제목", "게시일", "상태"],
      row: (n) => [`${n.pinned ? '<span class="pill pin">고정</span> ' : ""}<span class="t">${esc(n.title)}</span>`, fmtDate(n.date), pub(n)],
    },
    news: {
      label: "뉴스", file: "news", prefix: "w", desc: "언론 기사는 링크만 넣어도 되고, 본문을 직접 써도 됩니다.",
      fields: [
        LANG_FIELD,
        { k: "title", label: "기사 제목", type: "text", req: true },
        { k: "source", label: "언론사", type: "text", half: true, hint: "예: 전자신문" },
        { k: "date", label: "보도일", type: "date", req: true, half: true },
        { k: "thumbnail", label: "대표 이미지", type: "image", hint: "가로로 긴 이미지(16:10)를 권장합니다." },
        { k: "link", label: "기사 원문 링크", type: "url", hint: "본문을 비워 두면 목록에서 누를 때 이 링크로 바로 이동합니다." },
        { k: "body", label: "본문 (선택)", type: "md" },
        { k: "published", label: "사이트에 공개", type: "check", def: true },
      ],
      head: ["", "제목", "언론사", "보도일", "상태"],
      row: (n) => [thumb(n.thumbnail), `<span class="t">${esc(n.title)}</span>`, `<span class="hide-m">${esc(n.source || "")}</span>`, fmtDate(n.date), pub(n)],
    },
    ci: {
      label: "CI", file: "ci_items", prefix: "ci", desc: "로고 파일과 브랜드 컬러를 관리합니다. 순서 숫자가 작을수록 앞에 나옵니다.",
      fields: [
        LANG_FIELD,
        { k: "kind", label: "종류", type: "select", options: [["logo", "로고"], ["color", "컬러"]], def: "logo", half: true },
        { k: "sort_order", label: "순서", type: "number", def: 10, half: true },
        { k: "title", label: "이름", type: "text", req: true },
        { k: "description", label: "설명", type: "text", hint: "예: 어두운 배경에 사용" },
        { k: "preview", label: "미리보기 이미지", type: "image", show: (d) => d.kind !== "color", hint: "투명 배경 PNG 또는 SVG" },
        { k: "bg", label: "미리보기 배경", type: "select", options: [["dark", "어두운 배경"], ["light", "밝은 배경"]], def: "dark", show: (d) => d.kind !== "color" },
        { k: "files", label: "다운로드 파일", type: "files", show: (d) => d.kind !== "color", hint: "AI·SVG·PNG 등 형식별로 올리고, 버튼에 보일 이름을 적어 주세요." },
        { k: "hex", label: "색상 값", type: "color", show: (d) => d.kind === "color" },
        { k: "published", label: "사이트에 공개", type: "check", def: true },
      ],
      head: ["", "이름", "종류", "순서", "상태"],
      row: (n) => [n.kind === "color" ? `<div class="sw" style="background:${esc(n.hex)}"></div>` : thumb(n.preview, true), `<span class="t">${esc(n.title)}</span>`, n.kind === "color" ? "컬러" : "로고", n.sort_order ?? "", pub(n)],
      sort: (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99),
    },
    careers: {
      label: "채용", file: "careers", prefix: "j", desc: "마감일이 지나면 사이트에서 자동으로 마감 표시됩니다.",
      fields: [
        { k: "title", label: "공고 제목", type: "text", req: true, hint: "예: AI 음향 신호처리 엔지니어" },
        { k: "team", label: "직무·팀", type: "text", half: true },
        { k: "location", label: "근무지", type: "text", half: true },
        { k: "type", label: "고용 형태", type: "select", options: [["정규직", "정규직"], ["계약직", "계약직"], ["인턴", "인턴"], ["프리랜서", "프리랜서"]], def: "정규직", half: true },
        { k: "career", label: "경력", type: "select", options: [["경력 무관", "경력 무관"], ["신입", "신입"], ["경력", "경력"], ["신입·경력", "신입·경력"]], def: "경력 무관", half: true },
        { k: "date", label: "게시일", type: "date", req: true, half: true },
        { k: "deadline", label: "마감일", type: "date", half: true, hint: "비워 두면 상시 채용" },
        { k: "status", label: "모집 상태", type: "select", options: OPEN_CLOSED, def: "open", half: true },
        { k: "apply", label: "지원 방법", type: "text", half: true, hint: "지원 링크 또는 이메일 주소" },
        { k: "body", label: "상세 내용", type: "md", def: "## 하는 일\n- \n\n## 자격 요건\n- \n\n## 우대 사항\n- \n\n## 전형 절차\n서류 전형 → 면접 → 최종 합격" },
        { k: "published", label: "사이트에 공개", type: "check", def: true },
      ],
      head: ["제목", "고용 형태", "마감일", "모집", "상태"],
      row: (n) => [`<span class="t">${esc(n.title)}</span>`, `<span class="hide-m">${esc(n.type || "")}</span>`, n.deadline ? fmtDate(n.deadline) : "상시", openPill(n), pub(n)],
    },
  };
  const SITE_FIELDS = [
    { k: "company", label: "상호", type: "text", half: true },
    { k: "ceo", label: "대표자", type: "text", half: true },
    { k: "biz_no", label: "사업자등록번호", type: "text", half: true },
    { k: "phone", label: "대표 전화", type: "text", half: true },
    { k: "email", label: "문의 이메일", type: "text", hint: "도입 문의 메일이 이 주소로 갑니다." },
    { k: "address", label: "주소", type: "text" },
  ];

  const pub = (n) => (n.published === false ? '<span class="pill">비공개</span>' : '<span class="pill on">공개</span>');
  const openPill = (n) => {
    const closed = n.status === "closed" || (n.deadline && n.deadline < today());
    return closed ? '<span class="pill">마감</span>' : '<span class="pill on">채용 중</span>';
  };
  const thumb = (p, contain) => (p ? `<img class="thumb" style="${contain ? "object-fit:contain;background:#05060d" : ""}" src="${esc(asset(p))}" alt="">` : '<div class="thumb"></div>');
  const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  // 저장된 경로를 관리자 화면에서 볼 수 있는 주소로 바꾸기
  function asset(p) {
    if (!p) return "";
    if (/^https?:/i.test(p)) return p;
    return "../" + p;
  }

  // ───────── Supabase 데이터 ─────────
  // 빈 칸은 DB에 null로 저장한다 (날짜·숫자 칸이 빈 문자열이면 오류가 나기 때문)
  function toRow(d, s) {
    const row = {};
    s.fields.forEach((f) => {
      let v = d[f.k];
      if (v === "" || v === undefined) v = f.type === "files" ? [] : f.type === "check" ? false : null;
      row[f.k] = v;
    });
    if (d.id) row.id = d.id;
    row.updated_at = new Date().toISOString();
    return row;
  }
  function fail(error) {
    if (!error) return;
    const m = error.message || "";
    if (/row-level security|permission denied|violates row-level/i.test(m)) throw new Error("이 계정에는 저장 권한이 없어요. admins 표에 이메일이 등록돼 있는지 확인해 주세요.");
    if (/'lang' column|column .*lang/i.test(m)) throw new Error("DB에 언어 칸이 아직 없어요. supabase/migrations/20261014000000_board_lang.sql을 SQL Editor에서 실행해 주세요.");
    if (/JWT|session/i.test(m)) { logout(); throw new Error("로그인이 만료되었어요. 다시 로그인해 주세요."); }
    throw new Error(m || "저장하지 못했어요.");
  }
  async function loadItems(table) {
    const { data, error } = await sb.from(table).select("*");
    fail(error);
    for (const r of data) for (const k of Object.keys(r)) if (r[k] === null) delete r[k];
    store[table] = { items: data };
    return store[table];
  }
  async function saveItem(s, d) {
    const row = toRow(d, s);
    let { error } = await sb.from(s.file).upsert(row);
    // DB에 언어 칸이 아직 없을 때: 한국어 글은 언어 칸을 빼고 다시 저장한다
    if (error && /lang/i.test(error.message || "") && (row.lang || "ko") === "ko" && "lang" in row) {
      delete row.lang;
      ({ error } = await sb.from(s.file).upsert(row));
    }
    fail(error);
  }
  async function deleteItem(s, id) {
    const { error } = await sb.from(s.file).delete().eq("id", id);
    fail(error);
  }
  async function uploadFile(file) {
    if (file.size > MAX_FILE) throw new Error("25MB보다 큰 파일은 올릴 수 없어요.");
    const ext = (file.name.match(/\.[a-z0-9]+$/i) || [""])[0].toLowerCase();
    const base = file.name.slice(0, file.name.length - ext.length).normalize("NFC").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "file";
    const d = new Date();
    const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${Date.now().toString(36)}-${base}${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
    fail(error);
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // ───────── 공통 UI ─────────
  let toastT;
  function toast(msg, err) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show" + (err ? " err" : "");
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.className = "toast"), err ? 5000 : 3200);
  }
  async function busy(fn) {
    const o = document.createElement("div");
    o.className = "busy-overlay";
    document.body.appendChild(o);
    try { return await fn(); } finally { o.remove(); }
  }

  // ───────── 로그인 ─────────
  function showLogin(view) {
    $("#app").hidden = true;
    $("#login").hidden = false;
    $("#login-form").hidden = view !== "login";
    $("#reset-form").hidden = view !== "reset";
    $("#newpw-form").hidden = view !== "newpw";
  }
  async function logout() {
    try { await sb.auth.signOut(); } catch (e) {}
    showLogin("login");
  }
  async function enter(session) {
    const email = session.user.email;
    const { data, error } = await sb.from("admins").select("email").limit(1);
    if (error || !data.length) {
      await sb.auth.signOut();
      showLogin("login");
      $("#login-err").textContent = `${email} 계정은 관리자로 등록돼 있지 않아요.`;
      return;
    }
    $("#login").hidden = true;
    $("#app").hidden = false;
    $("#me").textContent = `${email} 로그인 중`;
    route();
  }

  // ───────── 화면 ─────────
  const store = {};
  let dirty = false;

  function menu(cur) {
    $("#menu").innerHTML = Object.entries(SCHEMAS).map(([k, s]) => `<a href="#${k}" class="${cur === k ? "on" : ""}">${s.label}<span class="cnt">${store[s.file] ? (store[s.file].items || []).length : ""}</span></a>`).join("")
      + `<div class="sep"></div><a href="#site" class="${cur === "site" ? "on" : ""}">회사 정보</a><a href="../ko/index.html" target="_blank">홈페이지 보기 ↗</a>`;
  }

  async function route() {
    const [key, mode, id] = location.hash.slice(1).split("/");
    const k = key || "notices";
    menu(k);
    const main = $("#main");
    main.innerHTML = '<p class="empty">불러오는 중…</p>';
    try {
      if (k === "site") return await siteForm(main);
      const s = SCHEMAS[k];
      if (!s) return (location.hash = "#notices");
      const data = await loadItems(s.file);
      menu(k);
      if (mode === "new") return editForm(main, k, null);
      if (mode === "edit") {
        const item = (data.items || []).find((i) => i.id === decodeURIComponent(id));
        if (!item) { toast("게시물을 찾을 수 없어요.", true); return (location.hash = "#" + k); }
        return editForm(main, k, item);
      }
      listView(main, k, data);
    } catch (e) {
      main.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
    }
  }

  function listView(main, k, data) {
    const s = SCHEMAS[k];
    const hasLang = s.fields.includes(LANG_FIELD);
    const langName = (v) => (LANGS.find((l) => l[0] === (v || "ko")) || LANGS[0])[1];
    const all = [...(data.items || [])].sort(s.sort || ((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date))));
    main.innerHTML = `
      <div class="page-title"><div><h1>${s.label}</h1><p>${s.desc}</p></div><a class="btn primary" href="#${k}/new">+ 새로 쓰기</a></div>
      <div class="panel">
        <div class="tools"><input type="search" id="q" placeholder="제목으로 찾기">${hasLang ? `<select id="lg"><option value="">모든 언어</option>${LANGS.map((l) => `<option value="${l[0]}" ${l[0] === listLang ? "selected" : ""}>${l[1]}</option>`).join("")}</select>` : ""}<select id="st"><option value="">전체</option><option value="on">공개</option><option value="off">비공개</option></select></div>
        <div id="rows"></div>
      </div>`;
    const draw = () => {
      const q = $("#q").value.trim().toLowerCase(), st = $("#st").value;
      if (hasLang) listLang = $("#lg").value;
      const rows = all.filter((n) => (!q || String(n.title).toLowerCase().includes(q)) && (!st || (st === "on") === (n.published !== false)) && (!listLang || !hasLang || (n.lang || "ko") === listLang));
      const head = hasLang ? ["언어", ...s.head] : s.head;
      const cells = (n) => (hasLang ? [`<span class="pill">${langName(n.lang)}</span>`, ...s.row(n)] : s.row(n));
      $("#rows").innerHTML = rows.length
        ? `<table class="list"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}<th></th></tr></thead><tbody>
          ${rows.map((n) => `<tr data-id="${esc(n.id)}">${cells(n).map((c) => `<td>${c}</td>`).join("")}<td class="act"><a class="btn sm" href="#${k}/edit/${encodeURIComponent(n.id)}">수정</a><button class="btn sm danger" data-del>삭제</button></td></tr>`).join("")}
          </tbody></table>`
        : `<p class="empty">${all.length ? "조건에 맞는 글이 없어요." : "아직 올린 글이 없어요. 오른쪽 위 ‘새로 쓰기’를 눌러 시작하세요."}</p>`;
    };
    draw();
    $("#q").addEventListener("input", draw);
    $("#st").addEventListener("change", draw);
    if (hasLang) $("#lg").addEventListener("change", draw);
    $("#rows").addEventListener("click", async (e) => {
      const tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      const id = tr.dataset.id, item = all.find((i) => i.id === id);
      if (e.target.closest(".t")) return (location.hash = `#${k}/edit/${encodeURIComponent(id)}`);
      if (!e.target.closest("[data-del]")) return;
      if (!confirm(`‘${item.title}’을(를) 삭제할까요?\n사이트에서도 사라지고 되돌릴 수 없어요.`)) return;
      try {
        await busy(() => deleteItem(s, id));
        toast("삭제했어요. 사이트에서도 바로 사라집니다.");
        route();
      } catch (err) { toast(err.message, true); }
    });
  }

  // 입력 칸 그리기
  function fieldHtml(f, v) {
    const id = `f-${f.k}`;
    const lb = `<label class="lb" for="${id}">${f.label}${f.req ? '<span class="req">*</span>' : ""}</label>`;
    const hint = f.hint ? `<div class="hint">${f.hint}</div>` : "";
    switch (f.type) {
      case "check":
        return `<div class="field"><label class="toggle"><input type="checkbox" id="${id}" data-k="${f.k}" ${v ? "checked" : ""}> ${f.label}</label>${hint}</div>`;
      case "select":
        return `<div class="field">${lb}<select id="${id}" data-k="${f.k}">${f.options.map((o) => `<option value="${esc(o[0])}" ${o[0] === v ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>${hint}</div>`;
      case "md":
        return `<div class="field">${lb}<div class="mdbar" data-for="${id}">
            <button type="button" data-md="h2" title="큰 제목">제목</button><button type="button" data-md="b" title="굵게"><b>B</b></button>
            <button type="button" data-md="ul" title="목록">• 목록</button><button type="button" data-md="link" title="링크">링크</button>
            <button type="button" data-md="quote" title="인용">인용</button><button type="button" data-md="img" title="이미지 넣기">이미지 올리기</button></div>
          <textarea class="mdarea" id="${id}" data-k="${f.k}">${esc(v || "")}</textarea>
          <div class="hint">줄을 한 칸 비우면 문단이 나뉘어요. ## 로 시작하면 제목, - 로 시작하면 목록이 됩니다.</div></div>`;
      case "textarea":
        return `<div class="field">${lb}<textarea id="${id}" data-k="${f.k}">${esc(v || "")}</textarea>${hint}</div>`;
      case "image":
        return `<div class="field">${lb}<div class="upl"><img id="${id}-pv" src="${esc(asset(v))}" alt="" ${v ? "" : "hidden"}>
            <div><div class="row"><label class="btn sm">파일 선택<input type="file" accept="image/*" data-img="${f.k}" hidden></label>${v ? `<button type="button" class="btn sm danger" data-clear="${f.k}">지우기</button>` : ""}</div>
            <div class="path" style="margin-top:6px">${v ? esc(v) : "선택한 이미지가 없어요"}</div></div></div>${hint}</div>`;
      case "files":
        return `<div class="field">${lb}<div class="filelist">${(v || []).map((x, i) => `<div class="f"><input value="${esc(x.name)}" data-fname="${f.k}:${i}" aria-label="버튼 이름"><span class="path" title="${esc(x.path)}">${esc(x.path)}</span><button type="button" class="btn sm danger" data-frm="${f.k}:${i}">빼기</button></div>`).join("")}</div>
          <label class="btn sm">+ 파일 추가<input type="file" multiple data-files="${f.k}" hidden></label>${hint}</div>`;
      case "color":
        return `<div class="field">${lb}<div class="row"><input type="color" value="${esc(v || "#a46bff")}" data-k="${f.k}" data-sync="hex-text" style="width:56px;height:44px;border:1px solid var(--line);border-radius:10px;padding:4px"><input type="text" id="${id}" value="${esc(v || "")}" data-k="${f.k}" placeholder="#A46BFF" style="max-width:200px"></div>${hint}</div>`;
      default:
        return `<div class="field">${lb}<input type="${f.type === "url" ? "url" : f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}" id="${id}" data-k="${f.k}" value="${esc(v ?? "")}">${hint}</div>`;
    }
  }

  function renderFields(fields, d) {
    let html = "", half = [];
    const flush = () => { if (half.length) { html += `<div class="grid2">${half.join("")}</div>`; half = []; } };
    fields.forEach((f) => {
      if (f.show && !f.show(d)) return;
      const h = fieldHtml(f, d[f.k]);
      if (f.half) { half.push(h); if (half.length === 2) flush(); } else { flush(); html += h; }
    });
    flush();
    return html;
  }

  function editForm(main, k, item) {
    const s = SCHEMAS[k];
    const isNew = !item;
    const d = item ? JSON.parse(JSON.stringify(item)) : {};
    if (isNew) s.fields.forEach((f) => { if (f.def !== undefined) d[f.k] = f.def; if (f.type === "date" && f.req) d[f.k] = today(); });
    if (isNew && listLang && s.fields.includes(LANG_FIELD)) d.lang = listLang;
    dirty = false;
    main.innerHTML = `
      <div class="page-title"><div><h1>${s.label} ${isNew ? "새로 쓰기" : "수정"}</h1><p>${s.desc}</p></div><a class="btn" href="#${k}">← 목록</a></div>
      <div class="editor">
        <form class="panel" id="ef"><div class="form-panel" id="fields"></div>
          <div class="actions">${isNew ? "" : '<button type="button" class="btn danger left" id="del">삭제</button>'}<a class="btn" href="#${k}">취소</a><button class="btn primary" type="submit">저장하고 사이트에 올리기</button></div></form>
        <div class="panel preview" id="pv"></div>
      </div>`;
    const draw = () => { $("#fields").innerHTML = renderFields(s.fields, d); preview(); };
    const preview = () => {
      const pv = $("#pv");
      if (k === "ci") {
        pv.innerHTML = `<div class="cap">미리보기</div>${d.kind === "color"
          ? `<div style="height:160px;border-radius:14px;background:${/^#[0-9a-f]{3,8}$/i.test(d.hex || "") ? d.hex : "#ddd"}"></div><h2 class="pt" style="margin-top:16px">${esc(d.title || "")}</h2><div class="pm">${esc(d.hex || "")} ${esc(d.description || "")}</div>`
          : `<div style="height:220px;border-radius:14px;display:flex;align-items:center;justify-content:center;padding:32px;background:${d.bg === "light" ? "#f5f6fa" : "#05060d"}">${d.preview ? `<img src="${esc(asset(d.preview))}" style="max-height:100%;max-width:70%">` : '<span style="color:#9aa0b5">이미지를 올려 주세요</span>'}</div><h2 class="pt" style="margin-top:16px">${esc(d.title || "")}</h2><div class="pm">${esc(d.description || "")}</div>`}`;
        return;
      }
      const meta = k === "careers" ? [d.team, d.type, d.career, d.location, d.deadline ? `마감 ${fmtDate(d.deadline)}` : "상시 채용"] : [d.source, fmtDate(d.date)];
      const body = md(d.body || "").replace(/src="(uploads\/[^"]+)"/g, (m, p) => `src="${asset(p)}"`);
      pv.innerHTML = `<div class="cap">사이트 미리보기</div>
        ${d.thumbnail ? `<img src="${esc(asset(d.thumbnail))}" style="width:100%;border-radius:12px;margin-bottom:20px">` : ""}
        <h2 class="pt">${esc(d.title || "제목을 입력하세요")}</h2><div class="pm">${meta.filter(Boolean).map(esc).join(" · ")}</div>
        <div class="md">${body || '<p style="color:#9aa0b5">본문이 여기에 보여요.</p>'}</div>
        ${(d.attachments || []).length ? `<p style="margin-top:24px;font-weight:600">첨부파일</p>${d.attachments.map((a) => `<div>📎 ${esc(a.name)}</div>`).join("")}` : ""}`;
    };
    draw();

    const form = $("#ef");
    form.addEventListener("input", (e) => {
      const el = e.target, key = el.dataset.k;
      dirty = true;
      if (el.dataset.fname) { const [fk, i] = el.dataset.fname.split(":"); d[fk][+i].name = el.value; return preview(); }
      if (!key) return;
      const f = s.fields.find((x) => x.k === key);
      d[key] = el.type === "checkbox" ? el.checked : f.type === "number" ? (el.value === "" ? "" : +el.value) : el.value;
      if (f.type === "color") form.querySelectorAll(`[data-k="${key}"]`).forEach((o) => o !== el && (o.value = el.value));
      preview();
    });
    form.addEventListener("change", (e) => {
      const key = e.target.dataset.k;
      if (key && s.fields.some((f) => f.k === key && f.type === "select")) draw(); // 종류가 바뀌면 칸 다시 그리기
    });
    form.addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.clear) { d[b.dataset.clear] = ""; dirty = true; return draw(); }
      if (b.dataset.frm) { const [fk, i] = b.dataset.frm.split(":"); d[fk].splice(+i, 1); dirty = true; return draw(); }
      if (b.dataset.md) {
        const ta = $("#" + b.parentElement.dataset.for);
        if (b.dataset.md === "img") return pickImageInto(ta);
        mdInsert(ta, b.dataset.md);
      }
    });
    form.addEventListener("change", async (e) => {
      const el = e.target;
      if (el.dataset.img && el.files[0]) {
        try {
          const p = await busy(() => uploadFile(el.files[0]));
          d[el.dataset.img] = p; dirty = true; draw(); toast("이미지를 올렸어요.");
        } catch (err) { toast(err.message, true); }
      }
      if (el.dataset.files && el.files.length) {
        try {
          const list = d[el.dataset.files] || (d[el.dataset.files] = []);
          for (const file of el.files) list.push({ name: file.name, path: await busy(() => uploadFile(file)) });
          dirty = true; draw(); toast("파일을 올렸어요.");
        } catch (err) { toast(err.message, true); }
      }
    });
    function pickImageInto(ta) {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*";
      inp.onchange = async () => {
        try {
          const p = await busy(() => uploadFile(inp.files[0]));
          insertAt(ta, `\n![](${p})\n`);
        } catch (err) { toast(err.message, true); }
      };
      inp.click();
    }
    function insertAt(ta, text, selStart, selEnd) {
      const a = ta.selectionStart, z = ta.selectionEnd;
      ta.setRangeText(text, a, z, "end");
      if (selStart !== undefined) ta.setSelectionRange(a + selStart, a + selEnd);
      ta.focus();
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function mdInsert(ta, kind) {
      const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      if (kind === "b") return insertAt(ta, `**${sel || "굵은 글씨"}**`, 2, 2 + (sel || "굵은 글씨").length);
      if (kind === "h2") return insertAt(ta, `\n## ${sel || "소제목"}\n`, 4, 4 + (sel || "소제목").length);
      if (kind === "ul") return insertAt(ta, `\n- ${sel || "항목"}\n`);
      if (kind === "quote") return insertAt(ta, `\n> ${sel || "인용문"}\n`);
      if (kind === "link") { const u = prompt("연결할 주소(https://...)를 입력하세요"); if (u) insertAt(ta, `[${sel || "링크 글자"}](${u})`); }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const miss = s.fields.filter((f) => f.req && (!f.show || f.show(d)) && !String(d[f.k] ?? "").trim());
      if (miss.length) return toast(`${miss.map((f) => f.label).join(", ")}을(를) 입력해 주세요.`, true);
      if (d.hex && !/^#[0-9a-f]{3,8}$/i.test(d.hex)) return toast("색상 값은 #A46BFF 같은 형식으로 입력해 주세요.", true);
      if (!d.id) d.id = `${s.prefix}-${Date.now().toString(36)}`;
      try {
        await busy(() => saveItem(s, d));
        dirty = false;
        toast("저장했어요. 사이트에 바로 반영됩니다.");
        location.hash = "#" + k;
      } catch (err) { toast(err.message, true); }
    });
    const del = $("#del");
    if (del) del.addEventListener("click", async () => {
      if (!confirm(`‘${item.title}’을(를) 삭제할까요?\n사이트에서도 사라지고 되돌릴 수 없어요.`)) return;
      try {
        await busy(() => deleteItem(s, item.id));
        dirty = false;
        toast("삭제했어요.");
        location.hash = "#" + k;
      } catch (err) { toast(err.message, true); }
    });
  }

  async function siteForm(main) {
    const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    fail(error);
    const d = { ...(data || {}) };
    for (const k of Object.keys(d)) if (d[k] === null) d[k] = "";
    dirty = false;
    main.innerHTML = `<div class="page-title"><div><h1>회사 정보</h1><p>사이트 아래쪽 정보, 오시는 길, 도입 문의에 쓰입니다. 비워 둔 항목은 사이트에 보이지 않아요.</p></div></div>
      <div class="editor single"><form class="panel" id="sf"><div class="form-panel">${renderFields(SITE_FIELDS, d)}</div>
      <div class="actions"><button class="btn primary" type="submit">저장하고 사이트에 올리기</button></div></form></div>`;
    $("#sf").addEventListener("input", (e) => { if (e.target.dataset.k) { d[e.target.dataset.k] = e.target.value; dirty = true; } });
    $("#sf").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const row = { id: 1, updated_at: new Date().toISOString() };
        SITE_FIELDS.forEach((f) => (row[f.k] = String(d[f.k] ?? "").trim() || null));
        await busy(async () => fail((await sb.from("site_settings").upsert(row)).error));
        dirty = false;
        toast("저장했어요. 사이트에 바로 반영됩니다.");
      } catch (err) { toast(err.message, true); }
    });
  }

  // ───────── 시작 ─────────
  let lastHash = location.hash;
  addEventListener("hashchange", () => {
    if (dirty && !confirm("저장하지 않은 내용이 있어요. 나갈까요?")) {
      history.replaceState(null, "", lastHash);
      return;
    }
    dirty = false;
    lastHash = location.hash;
    route();
  });
  addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  document.addEventListener("DOMContentLoaded", async () => {
    if (!CONF.url || !CONF.anonKey || !window.supabase) {
      showLogin("login");
      $("#login-form").hidden = true;
      $("#login-err").textContent = "Supabase 연결 정보가 없어요. assets/js/config.js에 Project URL과 anon 키를 넣어 주세요.";
      return;
    }
    sb = window.supabase.createClient(CONF.url, CONF.anonKey, { auth: { persistSession: true, storageKey: "cusmos-admin-auth" } });
    $("#logout").addEventListener("click", logout);

    $("#login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      $("#login-err").textContent = "";
      const { data, error } = await busy(() => sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value }));
      if (error) return ($("#login-err").textContent = /invalid/i.test(error.message) ? "이메일 또는 비밀번호가 맞지 않아요." : error.message);
      $("#password").value = "";
      enter(data.session);
    });
    $("#to-reset").addEventListener("click", () => { showLogin("reset"); $("#reset-email").value = $("#email").value; });
    $("#to-login").addEventListener("click", () => showLogin("login"));
    $("#reset-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const { error } = await busy(() => sb.auth.resetPasswordForEmail($("#reset-email").value.trim(), { redirectTo: location.origin + location.pathname }));
      $("#reset-msg").textContent = error ? error.message : "비밀번호 재설정 메일을 보냈어요. 메일의 링크를 눌러 주세요.";
    });
    $("#newpw-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const pw = $("#newpw").value;
      if (pw.length < 8) return ($("#newpw-msg").textContent = "8자 이상으로 정해 주세요.");
      const { data, error } = await busy(() => sb.auth.updateUser({ password: pw }));
      if (error) return ($("#newpw-msg").textContent = error.message);
      toast("비밀번호를 바꿨어요.");
      const { data: s } = await sb.auth.getSession();
      enter(s.session);
    });

    let recovering = false;
    sb.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") { recovering = true; showLogin("newpw"); } });
    const { data } = await sb.auth.getSession();
    if (recovering || /type=recovery/.test(location.hash)) return showLogin("newpw");
    if (data.session) enter(data.session); else showLogin("login");
  });
})();
