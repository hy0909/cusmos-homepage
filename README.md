# CUSMOS 홈페이지

커즈모스 회사 홈페이지와 관리자 페이지입니다. 별도 서버 없이 GitHub Pages로 운영합니다.

- 사이트: https://hy0909.github.io/cusmos-homepage/
- 관리자: https://hy0909.github.io/cusmos-homepage/admin/

## 페이지 구성

| 메뉴 | 파일 | 내용 |
|---|---|---|
| 메인 | `index.html` | 히어로, 문제 제기, 작동 방식, 제품, 솔루션, 실증 성과, 최신 소식 |
| 회사소개 | `company.html` | 비전, 팀, 연혁, 특허, 오시는 길 |
| 기술 | `technology.html` | 엣지 AI 음향센서, 마이크 배열, 선별 전송, 맥락 데이터 |
| 솔루션 | `solutions.html` | 스마트시티 소음 관측, 산업안전 이상음 탐지, 휴대용 초음파 카메라 |
| 도입 사례 | `cases.html` | 시흥 배곧 실증, 한전 태안화력 PoC, 도입 기관 |
| 홍보센터 | `notice.html`, `news.html`, `ci.html` | 관리자 페이지에서 올린 글이 자동으로 보임 |
| 채용 | `careers.html` | 채용공고 목록과 상세, 인재상 |
| 도입 문의 | `contact.html` | 문의 내용을 메일로 보내는 양식 |

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

## 처음에 채워야 할 것

- 관리자 > 회사 정보: 문의 이메일, 전화, 주소, 사업자등록번호. 문의 이메일이 비어 있으면 도입 문의 양식이 동작하지 않습니다.
- 회사소개 > 연혁: IR 자료에 날짜가 있는 항목만 넣었습니다. 설립일과 한전 PoC 시기를 확인해 `company.html`에 추가해 주세요.
- 브랜드 컬러: 홈페이지에 쓴 색을 넣어 두었습니다. 공식 CI 색상 값이 따로 있으면 관리자 > CI에서 바꿔 주세요.

## 로컬에서 보기

```bash
python3 -m http.server 4173
```

브라우저에서 http://localhost:4173 을 엽니다.
