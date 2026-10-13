/* 독일어 버전 설정: 메뉴, 푸터, 회사 정보 표시 방식 */
window.SITE = {
  lang: "de",
  locale: "de-DE",
  labels: {
    nav: "Hauptnavigation",
    language: "Sprache wechseln",
    menu: "Menü öffnen",
    overview: "Übersicht",
    original: "Original (vor der Überarbeitung)",
  },
  // 메뉴 순서: 기술 → 솔루션 → 레퍼런스 → 회사 (IA 문서 3장)
  nav: [
    {
      label: "Technologie", href: "technology.html",
      children: [
        ["Edge-KI-Schallsensor", "technology.html#sensor"],
        ["Mikrofonarray", "technology.html#array"],
        ["Verarbeitung und Übertragung", "technology.html#edge"],
        ["Kontextdaten", "technology.html#data"],
      ],
    },
    {
      label: "Lösungen", href: "solutions.html",
      children: [
        ["Lärmmonitoring in Städten", "solutions.html#city"],
        ["Anomalieerkennung in der Industrie", "solutions.html#industry"],
        ["Tragbare Ultraschallkamera", "solutions.html#ucam"],
      ],
    },
    {
      label: "Referenzen", href: "cases.html",
      children: [
        ["Stadt Siheung", "cases.html#siheung"],
        ["KEPCO, Kraftwerk Taean", "cases.html#kepco"],
        ["Referenzkunden", "cases.html#clients"],
      ],
    },
    {
      label: "Unternehmen", href: "company.html",
      children: [
        ["Vision", "company.html#vision"],
        ["Team", "company.html#team"],
        ["Chronik", "company.html#history"],
        ["Patente", "company.html#patent"],
        ["Standort", "company.html#location"],
      ],
    },
  ],
  cta: { label: "Kontakt", href: "contact.html" },
  tagline: "Akustische Sensorik mit Edge-KI zur Erkennung und Ortung von Geräuschen in Städten und Industrieanlagen.",
  legal: [["Impressum", "impressum.html"], ["Datenschutz", "privacy.html"]],
  // 값이 없는 항목은 global.js가 숨긴다
  companyRows: (s) => [["E-Mail", s.email], ["Tel.", s.phone], ["Anschrift", s.address]],
  pageGroup: {},
};
