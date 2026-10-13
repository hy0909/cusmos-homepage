# 나라별 이미지 자리와 생성 프롬프트

작성: hy0909 · 2026-10-13

지금은 Unsplash 무료 사진을 임시로 쓴다. Unsplash 라이선스는 상업적 사용과 수정이 가능하고 출처 표기가 필수는 아니다. 생성 이미지가 준비되면 `assets/img/{언어}/` 폴더에 아래 파일 이름으로 넣고, 페이지의 Unsplash 주소를 그 파일로 바꾸면 된다.

프롬프트는 영어로 썼다. Midjourney, DALL·E, Firefly 어디에 넣어도 되는 문장이고, 끝의 공통 조건은 모든 이미지에 붙인다.

공통 조건: `photorealistic, natural light, shallow depth of field, no text, no logos, no watermark, 16:9`

제품이 들어가는 장면은 실제 센서 사진(`assets/img/product-sensor.jpg`)을 참고 이미지로 함께 넣어야 모양이 비슷하게 나온다.

## 영어 버전

여러 인종이 섞인 팀, 도시적이고 자신감 있는 분위기. 색은 어두운 남색에 보라·분홍 빛을 살짝 더한다.

| 파일 | 쓰는 곳 | 임시 사진 | 프롬프트 |
|---|---|---|---|
| `en/hero.jpg` | 메인 히어로 | [밤의 도시 도로](https://unsplash.com/photos/TDDPRyUe0LI) | Wide night shot of a modern North American city street, light trails from traffic, a small white acoustic sensor mounted on a street pole in the foreground, deep navy sky with subtle violet and pink city glow |
| `en/ops.jpg` | 작동 방식, 스마트시티 솔루션 | [관제실 운영자](https://unsplash.com/photos/vwo_izFVy-k) | City operations center, a Black female operator and a white male colleague looking at a large wall display showing a city map with sound alert markers, calm and focused, dark room lit by screens |
| `en/team.jpg` | 회사 소개 | [설계도를 보는 팀](https://unsplash.com/photos/df7erzy97sg) | Diverse engineering team of four (East Asian, Black, white, South Asian) discussing hardware prototypes around a workbench in a bright modern lab, candid and friendly |
| `en/engineer.jpg` | 산업안전 솔루션 | [안전모를 쓴 엔지니어](https://unsplash.com/photos/cdSKgXv2Vz4) | Female field engineer in hard hat and safety vest at a power plant, holding a tablet showing an acoustic heatmap, industrial pipes behind her |
| `en/office.jpg` | 문의 페이지 | [회의 중인 세 사람](https://unsplash.com/photos/mpN7xjKQ_Ns) | Small meeting between a city official and a technology consultant reviewing a laptop dashboard, bright office, approachable mood |

## 일본어 버전

동양인 인물, 밝고 깨끗한 사무 공간, 정돈된 분위기. 색은 흰색과 남색, 연한 하늘색.

| 파일 | 쓰는 곳 | 임시 사진 | 프롬프트 |
|---|---|---|---|
| `ja/hero.jpg` | 메인 히어로 오른쪽 | [안경 쓴 여성 직원](https://unsplash.com/photos/APjRQ59peUg) | Japanese female engineer in her 30s in a bright clean office, smiling gently, looking at a monitor showing a city noise map, soft daylight, white and navy tones |
| `ja/city.jpg` | 스마트시티 솔루션, 문제 섹션 | [시부야 교차로](https://unsplash.com/photos/icdVDptHxpM) | Busy Tokyo intersection at dusk seen from above, orderly traffic and pedestrians, a small acoustic sensor on a traffic signal pole, clean and calm atmosphere |
| `ja/meeting.jpg` | 회사 정보, 도입 절차 | [서류를 보는 회의](https://unsplash.com/photos/dMUUUv5erIY) | Japanese municipal staff and a company representative in suits reviewing printed reports at a meeting table, respectful and attentive, bright meeting room |
| `ja/inspector.jpg` | 산업안전 솔루션, 사례 | [클립보드를 든 점검자](https://unsplash.com/photos/8iDaJg7TPz4) | Japanese maintenance engineer in work uniform and helmet inspecting equipment in a power plant with a handheld ultrasonic camera, careful and precise |
| `ja/office.jpg` | 문의 페이지 | [책장 앞의 직원](https://unsplash.com/photos/yMvtbUgiJh4) | Japanese customer support staff member at a tidy desk with headset, polite smile, bright office with plants |

## 독일어 버전

서양인 인물, 차분하고 사실적인 장면. 연출된 웃음보다 일하는 모습. 색은 회색과 진한 파랑.

| 파일 | 쓰는 곳 | 임시 사진 | 프롬프트 |
|---|---|---|---|
| `de/hero.jpg` | 메인 히어로 | [브란덴부르크 문 앞 도로](https://unsplash.com/photos/mtfTz0FnwBw) | Overcast morning on a wide German city boulevard with trams and cyclists, a compact acoustic sensor on a lamp post in sharp focus, muted grey-blue palette, documentary style |
| `de/street.jpg` | 스마트시티 솔루션 | [유럽 도시 거리](https://unsplash.com/photos/Sukc6OqtAI4) | Residential street in a German city at evening, motorcycles passing, neighbours on balconies, realistic and unstaged |
| `de/team.jpg` | 회사, 산업안전 솔루션 | [안전 조끼를 입은 작업자들](https://unsplash.com/photos/hFp9q58_NRE) | Two German industrial engineers in high-visibility vests reviewing sensor data on a rugged tablet at a plant, serious and focused |
| `de/plant.jpg` | 산업안전 솔루션, 사례 | [발전소 전경](https://unsplash.com/photos/Xb8IoeiWJvM) | Power plant exterior under clear sky, transmission lines, neutral colours, wide technical photograph |
| `de/industry.jpg` | 기술 페이지 | [배관이 늘어선 설비](https://unsplash.com/photos/5OvIgxlLlxs) | Close-up of industrial pipework and valves with a small acoustic monitoring device mounted on a bracket, cool grey tones, crisp detail |

## 바꾸는 방법

1. 생성한 이미지를 위 파일 이름으로 `assets/img/en/`, `assets/img/ja/`, `assets/img/de/`에 넣는다.
2. 페이지에서 `images.unsplash.com` 주소를 찾아 해당 파일 경로로 바꾼다. 경로는 `../assets/img/ja/hero.jpg`처럼 쓴다.
3. 가로 1600px, 200KB 안팎의 JPG로 줄여서 넣으면 첫 화면이 빨리 뜬다.
