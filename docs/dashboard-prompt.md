# 관제 화면(대시보드) 생성 프롬프트

작성: hy0909 · 2026-10-14

Google Stitch, Figma Make에 넣는 프롬프트다. 홈페이지 첫 화면과 기능 소개에 넣을 서비스 화면 이미지를 만들 때 쓴다. 화면에 적는 숫자는 모두 예시 값이라, 실제 데이터처럼 쓰지 않는다.

## 1. 메인 관제 화면 (데스크톱)

```
Design a desktop web dashboard for "CUSMOS", an urban noise monitoring service for city governments. Acoustic AI sensors mounted on existing CCTV poles detect sounds, classify them (motorcycle, horn, construction, abnormal sound), estimate where the sound came from, and alert the control room.

Screen: "실시간 관제" (Real-time monitoring), 1440×900, dark control-room theme.

Layout:
- Left sidebar (240px, Deep Navy #05060D): CUSMOS wordmark, menu items 실시간 관제 / 소음 기록 / 민원 대응 리포트 / 센서 관리 / 설정. Active item uses Signal Violet #A46BFF.
- Top bar: district name "시흥시 배곧동", date-time, status chip "센서 4대 정상".
- Main area, 2/3 width: a grayscale city map (desaturated, like MapLibre positron) with 4 sensor pins. One pin has a pulsing ring in Pulse Pink #F45FC8 showing an active event, with a direction wedge (estimated sound direction) in Sound Sky #7FA8FF.
- Right panel, 1/3 width: live event list. Each row: time, sound type tag (이륜차 / 경적 / 공사음 / 이상음), estimated location, dB value, a small "CCTV 보기" link. Newest row highlighted.
- Bottom strip: 3 KPI cards: 오늘 감지 건수, 야간(22–06시) 건수, 평균 소음 레벨. Use the brand gradient (#7FA8FF → #A46BFF → #F45FC8) only as a thin accent line on top of each card, not as a fill.
- Small line chart "시간대별 감지 건수 (24h)" in Sound Sky.

Style:
- Colors: Deep Navy #05060D background, panels #0b0c17, borders rgba(255,255,255,.08), body text #E6E8F0, muted text #9AA0B8. Accent colors only: Sound Sky #7FA8FF, Signal Violet #A46BFF, Pulse Pink #F45FC8. Do not introduce any other hue (no green, no orange, no red).
- Font: Pretendard or Inter, 13–14px body, tabular numbers.
- Flat, functional, no glassmorphism, no 3D, no decorative gradients on large areas. Radius 8px.
- All UI text in Korean. All numbers are sample data.
```

## 2. 기록·리포트 화면 (두 번째 화면)

```
Same product, same design system as the real-time monitoring screen.

Screen: "소음 기록" (Noise records), desktop 1440×900.
- Filters on top: 기간, 지점(센서), 소리 종류, 시간대.
- Left: table of events (일시, 지점, 소리 종류, 소음 레벨 dB, 방향, 담당자 판단, 조치). "담당자 판단" column has values like 확인 / 단속 요청 / 보류.
- Right: heatmap grid "지점 × 시간대" showing how often events occur, using only Sound Sky → Signal Violet → Pulse Pink as the intensity scale.
- A button "민원 대응 리포트 만들기" in Signal Violet.
Keep the dark theme, Korean labels, sample numbers.
```

## 3. 휴대폰 알림 화면 (선택)

```
Same product. Mobile screen 390×844, dark theme.
Push-style alert card: "이상음 감지 · 배곧동 3번 센서 · 22:41", sound type tag, estimated direction, a CCTV thumbnail placeholder, buttons "영상 보기" (Signal Violet) and "확인 완료" (outline). Below, a short list of today's events. Korean text, sample data.
```

## 쓸 때 주의

| 항목 | 내용 |
|---|---|
| 색 | 브랜드 4색과 무채색만. 생성 결과에 초록·주황·빨강이 섞이면 "replace every non-brand hue with Signal Violet or Pulse Pink"라고 다시 요청 |
| 숫자 | 화면 속 수치는 전부 예시. 홈페이지에 넣을 때 "화면은 예시 데이터입니다" 한 줄을 붙인다 |
| 지도 | 실제 지명(시흥시 배곧동)은 실증 지역이라 써도 된다. 다른 지역명은 넣지 않는다 |
| 기능 | 홈페이지에 적힌 기능(실시간 감지, 위치 추정, AI 분류, CCTV 연동, 기록, 리포트)만 그린다. 없는 기능을 화면에 추가하지 않는다 |
