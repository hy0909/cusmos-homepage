/* 일본어 사이트 설정: 메뉴, 문구, 회사 정보 표시 방식
 * global.js보다 먼저 불러온다. */
window.SITE = {
  lang: "ja",
  locale: "ja-JP",
  labels: {
    nav: "グローバルメニュー",
    language: "言語を変更",
    menu: "メニューを開く",
    overview: "概要",
  },
  // 메뉴 순서는 docs/information-architecture.md 3번 기준: ソリューション → 導入事例 → 技術 → 会社情報
  nav: [
    { label: "ソリューション", href: "solutions.html", children: [
      ["スマートシティ騒音観測", "solutions.html#city"],
      ["産業安全 異常音検知", "solutions.html#industry"],
      ["携帯型超音波カメラ", "solutions.html#ucam"],
    ] },
    { label: "導入事例", href: "cases.html", children: [
      ["二輪車騒音の実証（始興市）", "cases.html#siheung"],
      ["PoC（韓国電力公社）", "cases.html#kepco"],
      ["導入機関", "cases.html#clients"],
    ] },
    { label: "技術", href: "technology.html", children: [
      ["エッジAI音響センサー", "technology.html#sensor"],
      ["マイクアレイ設計", "technology.html#array"],
      ["現場分析・選別送信", "technology.html#edge"],
      ["音の文脈データ", "technology.html#data"],
    ] },
    { label: "会社情報", href: "company.html", children: [
      ["会社概要", "company.html#overview"],
      ["ビジョン", "company.html#vision"],
      ["チーム", "company.html#team"],
      ["沿革", "company.html#history"],
      ["特許・商標", "company.html#patent"],
      ["アクセス", "company.html#access"],
    ] },
    { label: "掲示板", href: "news.html", children: [["お知らせ", "notice.html"], ["ニュース", "news.html"], ["CI", "ci.html"]] },
  ],
  // 회사 주소를 이 나라 말로 적은 값. 관리자 DB의 한국어 주소 대신 보여 준다
  address: "大韓民国 江原特別自治道 春川市 江原大学キル1 208-1号",
  cta: { label: "資料請求", href: "contact.html#request" },
  tagline: "CUSMOSは、小型のエッジAI音響センサーで都市と産業現場の音の種類と発生場所を特定する、サウンドインテリジェンス企業です。",
  legal: [],
  companyRows: (s) => [["メール", s.email], ["電話", s.phone], ["所在地", s.address]],
  pageGroup: { "notice.html": "news.html", "ci.html": "news.html", },
};

// 회사 정보(주소·전화·메일)를 data-site 칸에 채운다. 값이 없으면 TBD 표시를 그대로 둔다
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.getSite) return;
  const s = await window.getSite();
  document.querySelectorAll("[data-site]").forEach((el) => {
    const v = s[el.dataset.site];
    if (v) { el.textContent = v; el.classList.remove("tbd"); }
  });
});
