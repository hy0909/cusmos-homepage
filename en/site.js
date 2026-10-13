/* 영어 버전 설정: 메뉴 순서, 문의 버튼, 푸터 문구 */
window.SITE = {
  lang: "en",
  locale: "en-US",
  labels: {
    nav: "Main navigation",
    language: "Change language",
    menu: "Open menu",
    overview: "Overview",
    original: "original (before redesign)",
  },
  nav: [
    { label: "Solutions", href: "solutions.html", children: [
      ["Smart city noise monitoring", "solutions.html#city"],
      ["Industrial safety sound detection", "solutions.html#industry"],
      ["Handheld ultrasonic camera", "solutions.html#ucam"],
    ] },
    { label: "Technology", href: "technology.html", children: [
      ["Edge AI acoustic sensor", "technology.html#sensor"],
      ["Microphone array design", "technology.html#array"],
      ["Edge processing", "technology.html#edge"],
      ["Context data", "technology.html#data"],
    ] },
    { label: "Case studies", href: "cases.html", children: [
      ["Siheung City pilot", "cases.html#siheung"],
      ["KEPCO Taean plant PoC", "cases.html#kepco"],
      ["Clients", "cases.html#clients"],
    ] },
    { label: "About", href: "company.html", children: [
      ["Mission", "company.html#mission"],
      ["Team", "company.html#team"],
      ["History", "company.html#history"],
      ["Patents", "company.html#patents"],
    ] },
    { label: "Board", href: "news.html", children: [["Notices", "notice.html"], ["News", "news.html"], ["CI", "ci.html"]] },
  ],
  cta: { label: "Book a demo", href: "contact.html" },
  tagline: "Sound intelligence for cities and industrial sites. Edge AI acoustic sensors that identify a sound and locate where it came from.",
  legal: [],
  companyRows: (s) => [["Address", s.address], ["Tel", s.phone], ["Email", s.email]],
  pageGroup: { "notice.html": "news.html", "ci.html": "news.html", },
};
