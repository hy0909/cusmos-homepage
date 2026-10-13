/* 메인 페이지: 히어로 캔버스, 작동 방식 단계, 최신 소식 */
(function () {
  // ── 히어로: 도시 위로 퍼지는 소리와 센서 감지 장면 ──
  function hero() {
    const cv = document.getElementById("hero-canvas");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W, H, DPR, f, horizon;
    const CAM_H = 3.4, NEAR = 1.2, FAR = 40, GRID = 3;
    let camZ = 0;
    const LABELS = ["이륜차 소음 · 84dB", "공사장 타격음 · 91dB", "차량 경적 · 78dB", "유리 파손 · 이상음", "설비 이상음 · 67dB", "고성 · 82dB"];

    function size() {
      DPR = Math.min(2, devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      f = Math.max(W, H * 1.2) * 0.5;
      horizon = H * 0.2;
    }
    function proj(x, z) {
      const zc = z - camZ;
      if (zc < 0.3) return null;
      return { x: W * 0.64 + (x * f) / zc, y: horizon + (CAM_H * f) / zc, s: f / zc, zc };
    }

    const rnd = (a, b) => a + Math.random() * (b - a);
    const sensors = [];
    function placeSensor(s, far) {
      s.x = Math.round(rnd(-9, 9) / GRID) * GRID;
      s.z = camZ + (far ? rnd(FAR * 0.7, FAR) : rnd(NEAR + 1, FAR));
      s.z = Math.round(s.z / GRID) * GRID;
      s.hit = -10; s.ph = Math.random() * 6;
      return s;
    }
    for (let i = 0; i < 26; i++) sensors.push(placeSensor({}, false));
    const events = [];
    let nextEvent = 0;

    function spawn(t) {
      events.push({ x: rnd(-2, 8), z: camZ + rnd(6, 14), t0: t, label: LABELS[(Math.random() * LABELS.length) | 0], hits: [] });
      nextEvent = t + rnd(1.6, 2.8);
    }

    function draw(now) {
      const t = now / 1000;
      if (!reduce) camZ += 0.012;
      ctx.clearRect(0, 0, W, H);

      // 거리 격자
      ctx.lineWidth = 1;
      const z0 = Math.ceil((camZ + NEAR) / GRID) * GRID;
      for (let z = z0; z < camZ + FAR; z += GRID) {
        const a = proj(-60, z), b = proj(60, z);
        if (!a) continue;
        const alpha = Math.max(0, 0.16 * (1 - (z - camZ) / FAR));
        ctx.strokeStyle = `rgba(160,170,230,${alpha})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // 화면 아래 끝에 닿는 거리부터 그려야 선이 보인다
      const zBottom = camZ + (CAM_H * f) / (H - horizon);
      for (let x = -60; x <= 60; x += GRID) {
        const a = proj(x, zBottom), b = proj(x, camZ + FAR);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, "rgba(160,170,230,0.22)"); g.addColorStop(1, "rgba(160,170,230,0)");
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // 블록(건물 바닥)
      for (let z = z0; z < camZ + FAR * 0.8; z += GRID) {
        for (let x = -12; x < 12; x += GRID) {
          const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
          if (seed - Math.floor(seed) > 0.42) continue;
          const p1 = proj(x + 0.35, z + 0.35), p2 = proj(x + GRID - 0.35, z + 0.35), p3 = proj(x + GRID - 0.35, z + GRID - 0.35), p4 = proj(x + 0.35, z + GRID - 0.35);
          if (!p1) continue;
          const alpha = 0.035 * (1 - (z - camZ) / FAR);
          ctx.fillStyle = `rgba(150,140,255,${alpha})`;
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath(); ctx.fill();
        }
      }

      // 소리 이벤트
      if (t > nextEvent && !reduce) spawn(t);
      if (reduce && !events.length) { spawn(t); events[0].t0 = t - 2.2; }
      for (let i = events.length - 1; i >= 0; i--) {
        const e = events[i], age = reduce ? 2.2 : t - e.t0;
        if (age > 5.5) { events.splice(i, 1); continue; }
        const life = 1 - age / 5.5;
        // 퍼지는 파동 3겹
        for (let k = 0; k < 3; k++) {
          const r = (age - k * 0.35) * 3.2;
          if (r <= 0) continue;
          ctx.beginPath();
          for (let s = 0; s <= 64; s++) {
            const ang = (s / 64) * Math.PI * 2;
            const p = proj(e.x + Math.cos(ang) * r, e.z + Math.sin(ang) * r);
            if (!p) continue;
            s ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
          }
          ctx.strokeStyle = `rgba(244,95,200,${Math.max(0, 0.55 * life * (1 - r / 14))})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        // 감지한 센서에서 소리 위치까지 선
        const ep = proj(e.x, e.z);
        if (!ep) continue;
        sensors.forEach((s) => {
          const d = Math.hypot(s.x - e.x, s.z - e.z);
          if (d < age * 3.2 && d < 9 && !e.hits.includes(s)) { e.hits.push(s); s.hit = t; }
        });
        e.hits.forEach((s) => {
          const sp = proj(s.x, s.z);
          if (!sp) return;
          const g = ctx.createLinearGradient(sp.x, sp.y, ep.x, ep.y);
          g.addColorStop(0, `rgba(127,168,255,${0.7 * life})`); g.addColorStop(1, `rgba(244,95,200,${0.9 * life})`);
          ctx.strokeStyle = g; ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(sp.x, sp.y); ctx.lineTo(ep.x, ep.y); ctx.stroke(); ctx.setLineDash([]);
        });
        // 소리 위치 점
        const glow = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, 26);
        glow.addColorStop(0, `rgba(244,95,200,${0.9 * life})`); glow.addColorStop(1, "rgba(244,95,200,0)");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ep.x, ep.y, 26, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${life})`; ctx.beginPath(); ctx.arc(ep.x, ep.y, 3, 0, 7); ctx.fill();
        // 분류 결과 라벨
        if (e.hits.length >= 2 && age > 0.9) {
          const la = Math.min(1, (age - 0.9) * 3) * Math.min(1, life * 2.5);
          ctx.font = "600 13px Pretendard Variable, Pretendard, sans-serif";
          const tw = ctx.measureText(e.label).width, bx = ep.x + 14, by = ep.y - 44, bw = tw + 34, bh = 30;
          ctx.globalAlpha = la;
          ctx.fillStyle = "rgba(12,13,28,0.85)"; ctx.strokeStyle = "rgba(244,95,200,0.6)"; ctx.lineWidth = 1;
          roundRect(bx, by, bw, bh, 15); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#f45fc8"; ctx.beginPath(); ctx.arc(bx + 14, by + bh / 2, 3.5, 0, 7); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.fillText(e.label, bx + 24, by + 19.5);
          ctx.strokeStyle = "rgba(244,95,200,0.5)"; ctx.beginPath(); ctx.moveTo(ep.x, ep.y); ctx.lineTo(bx, by + bh); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // 센서
      sensors.forEach((s) => {
        if (s.z - camZ < NEAR) placeSensor(s, true);
        const p = proj(s.x, s.z);
        if (!p) return;
        const fade = Math.min(1, (1 - (s.z - camZ) / FAR) * 1.6);
        const hot = Math.max(0, 1 - (t - s.hit) / 1.4);
        const r = Math.max(1.6, p.s * 0.035);
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + s.ph);
        ctx.fillStyle = `rgba(127,168,255,${(0.08 + 0.1 * pulse + 0.4 * hot) * fade})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * (3 + hot * 3), 0, 7); ctx.fill();
        ctx.fillStyle = hot > 0 ? `rgba(255,255,255,${fade})` : `rgba(190,205,255,${0.85 * fade})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
      });

      if (!reduce) requestAnimationFrame(draw);
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    size();
    addEventListener("resize", size);
    requestAnimationFrame(draw);
  }

  // ── 작동 방식: 스크롤 위치에 맞춰 그림 바꾸기 ──
  function how() {
    const steps = document.querySelectorAll(".how-step");
    const layers = document.querySelectorAll(".how-visual .layer");
    if (!steps.length) return;
    let cur = -1;
    function update() {
      const mid = innerHeight / 2;
      let i = 0;
      steps.forEach((s, k) => { if (s.getBoundingClientRect().top < mid) i = k; });
      if (i === cur) return;
      cur = i;
      steps.forEach((s, k) => s.classList.toggle("active", k === i));
      layers.forEach((l, k) => l.classList.toggle("active", k === i));
    }
    addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    update();
  }

  // ── 최신 소식 3건 ──
  async function latest() {
    const box = document.getElementById("latest");
    if (!box) return;
    const [news, notice] = await Promise.all([getData("news", { items: [] }), getData("notices", { items: [] })]);
    const all = [
      ...(news.items || []).filter((n) => n.published !== false).map((n) => ({ ...n, kind: "뉴스", href: n.link && !n.body ? n.link : `news.html?id=${n.id}`, ext: n.link && !n.body })),
      ...(notice.items || []).filter((n) => n.published !== false).map((n) => ({ ...n, kind: "공지", href: `notice.html?id=${n.id}` })),
    ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3);
    if (!all.length) { box.innerHTML = '<p class="empty" style="grid-column:1/-1">새 소식을 준비하고 있습니다.</p>'; return; }
    box.innerHTML = all.map((n, i) => `
      <a class="post-card reveal d${i + 1}" href="${esc(n.href)}" ${n.ext ? 'target="_blank" rel="noopener"' : ""}>
        <div class="thumb">${n.thumbnail ? `<img src="${esc(n.thumbnail)}" alt="" loading="lazy">` : '<div class="ph"><img src="assets/img/logo-wordmark.png" alt=""></div>'}</div>
        <div class="meta"><span>${n.kind}${n.source ? " · " + esc(n.source) : ""}</span><span>${fmtDate(n.date)}</span></div>
        <h3>${esc(n.title)}</h3>
      </a>`).join("");
    observeReveal();
  }

  document.addEventListener("DOMContentLoaded", () => { hero(); how(); latest(); });
})();
