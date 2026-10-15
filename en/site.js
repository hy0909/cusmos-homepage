/* 영어 버전 설정: 메뉴 순서, 문의 버튼, 푸터 문구 */
window.SITE = {
  lang: "en",
  locale: "en-US",
  labels: {
    nav: "Main navigation",
    language: "Change language",
    menu: "Open menu",
    overview: "Overview",
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
    { label: "News & notices", href: "news.html", children: [["Notices", "notice.html"], ["News", "news.html"], ["Brand identity (CI)", "ci.html"]] },
  ],
  // 회사 주소를 이 나라 말로 적은 값. 관리자 DB의 한국어 주소 대신 보여 준다
  address: "Room 208-1, 1 Gangwondaehak-gil, Chuncheon-si, Gangwon State, Republic of Korea",
  cta: { label: "Book a demo", href: "contact.html" },
  tagline: "Sound intelligence for cities and industrial sites. Edge AI sensors that identify each sound and show where it came from.",
  legal: [],
  companyRows: (s) => [["Address", s.address], ["Phone", s.phone], ["Email", s.email]],
  pageGroup: { "notice.html": "news.html", "ci.html": "news.html", },
};
