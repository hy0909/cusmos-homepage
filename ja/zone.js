/* 일본어 사이트 공통: #앵커 부드러운 이동과 구역 바(현재 구역 표시)
 * index.html과 모든 하위 페이지가 같이 쓴다. global.js 뒤에 불러온다. */
(function () {
  // #앵커 클릭은 이 페이지 안에서 부드럽게 이동시킨다 (scroll-margin-top이 헤더와 구역 바 높이를 뺀다)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: "smooth", block: "start" });
    try { history.replaceState(null, "", "#" + id); } catch (err) { /* file:// 등에서 무시 */ }
  });

  // 구역 바: 화면 위쪽(헤더+바 아래의 얇은 띠)에 걸린 구역을 현재로 표시한다. 첫 화면·문의 구역에서는 표시가 없다
  var bar = document.querySelector(".f-zonebar");
  if (!bar || !("IntersectionObserver" in window)) return;
  var list = bar.querySelector(".f-zonebar-list");
  var links = Array.prototype.slice.call(bar.querySelectorAll('a[href^="#"]'));
  var zones = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if (!zones.length) return;
  var seen = {};
  function show(id) {
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      if (on && list.scrollWidth > list.clientWidth) {
        var lr = list.getBoundingClientRect(), ar = a.getBoundingClientRect();
        list.scrollBy({ left: ar.left - lr.left - (lr.width - ar.width) / 2, behavior: "smooth" });
      }
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
    var cur = "";
    zones.forEach(function (z) { if (seen[z.id]) cur = z.id; });
    show(cur);
    if (!cur && list.scrollLeft) list.scrollTo({ left: 0, behavior: "smooth" });
  }, { rootMargin: "-110px 0px -84% 0px", threshold: 0 });
  zones.forEach(function (z) { io.observe(z); });
})();
