# CUSMOS 홈페이지

커즈모스 회사 홈페이지와 관리자 페이지입니다. 별도 서버 없이 GitHub Pages로 운영합니다.

- 사이트: https://hy0909.github.io/cusmos-homepage/
- 관리자: https://hy0909.github.io/cusmos-homepage/admin/

## 언어별 사이트

첫 주소(`/`)로 들어오면 접속한 국가를 보고 해당 언어 폴더로 보냅니다. 한국은 `/ko/`, 일본은 `/ja/`, 독일·오스트리아·스위스·리히텐슈타인은 `/de/`, 그 밖의 국가는 `/en/`입니다. 주소에 `?lang=ja`처럼 적으면 국가와 상관없이 그 언어로 엽니다.

| 폴더 | 내용 |
|---|---|
| `en/` | 영어. 기본값 |
| `ja/` | 일본어 |
| `de/` | 독일어. 법적으로 필요한 Impressum, Datenschutz 포함 |
| `ko/` | 개선 전 한국어 원본. 채용은 여기에만 있음 |
| `compare.html` | 개선 전 한국어와 개선 후 언어별 화면을 나란히 보는 비교 페이지 |

나라마다 메뉴 순서, 메인 섹션 순서, 정보량, 색과 글꼴, 사람 이미지가 다릅니다. 기준과 사이트맵은 [docs/information-architecture.md](docs/information-architecture.md)에, 이미지 자리와 생성 프롬프트는 [docs/image-prompts.md](docs/image-prompts.md)에 있습니다.

| 파일 | 역할 |
|---|---|
| `assets/css/global.css` | 세 언어가 같이 쓰는 스타일 |
| `assets/js/global.js` | 헤더, 푸터, 언어 선택, 모션 |
| `{언어}/site.js` | 그 언어의 메뉴와 문구 |
| `{언어}/locale.css` | 그 언어의 글꼴, 정보량, 섹션 배치. 색은 넣지 않음 |
| `assets/js/board-i18n.js` | 영어·일본어·독일어 게시판(공지·뉴스·CI) |
| `assets/css/style.css`, `assets/js/common.js` | 한국어 원본 전용 |

## 관리자 페이지 (Supabase)

글은 Supabase DB에, 이미지와 첨부파일은 Supabase Storage의 `uploads` 버킷에 저장됩니다. 저장하면 사이트에 바로 반영됩니다.

| 위치 | 내용 |
|---|---|
| `assets/js/config.js` | Supabase Project URL과 Publishable(anon) 키 |
| `supabase/migrations/` | 표, 접근 권한, 저장소 버킷, 처음 데이터를 만드는 SQL |
| `data/*.json` | Supabase 연결 전에 쓰던 예비 데이터. 연결 후에는 읽지 않음 |

처음 한 번만 하면 되는 설정입니다.

1. Supabase 대시보드 > SQL Editor에 `supabase/migrations/20261013000000_init.sql` 내용을 붙여 넣고 실행합니다. GitHub 연동을 켜 두었다면 main에 올릴 때 자동으로 실행됩니다.
2. Authentication > Users > Add user에서 관리자 계정을 만듭니다. Auto Confirm User를 켭니다.
3. SQL Editor에서 `insert into public.admins (email) values ('관리자이메일');`를 실행해 그 계정을 관리자로 등록합니다.
4. Authentication > Sign In / Providers에서 Allow new users to sign up을 끕니다. 꺼 두지 않아도 admins 표에 없는 계정은 글을 쓸 수 없습니다.
5. Authentication > URL Configuration의 Redirect URLs에 `https://hy0909.github.io/cusmos-homepage/admin/`을 추가합니다. 비밀번호 재설정 메일 링크가 이 주소로 돌아옵니다.

관리자를 더 늘리려면 2, 3번을 반복합니다.

게시판을 언어별로 쓰려면 `supabase/migrations/20261014000000_board_lang.sql`도 SQL Editor에서 한 번 실행합니다. 실행 전에도 한국어 글은 그대로 쓸 수 있습니다. 다른 언어를 골라 저장하면 이 SQL을 실행하라는 안내가 뜹니다.

## 처음에 채워야 할 것

- 관리자 > 회사 정보: 문의 이메일, 전화, 주소, 사업자등록번호. 문의 이메일이 비어 있으면 도입 문의 양식이 동작하지 않습니다.
- 회사소개 > 연혁: IR 자료에 날짜가 있는 항목만 넣었습니다. 설립일과 한전 PoC 시기를 확인해 각 언어의 `company.html`에 추가해 주세요.
- 다국어 버전에서 `TBD`로 표시한 항목: [docs/information-architecture.md](docs/information-architecture.md) 7장 목록을 봐 주세요.
- 브랜드 컬러: 홈페이지에 쓴 색을 넣어 두었습니다. 공식 CI 색상 값이 따로 있으면 관리자 > CI에서 바꿔 주세요.

## 로컬에서 보기

```bash
python3 -m http.server 4173
```

브라우저에서 http://localhost:4173 을 엽니다. 특정 언어로 보려면 http://localhost:4173/?lang=ja 처럼 엽니다.
