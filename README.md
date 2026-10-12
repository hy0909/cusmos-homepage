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

## 관리자 페이지 쓰는 법

관리자 페이지에서 저장하면 `data/` 폴더의 JSON 파일과 `uploads/` 폴더에 바로 커밋되고, 1~2분 뒤 사이트에 반영됩니다.

1. GitHub에서 fine-grained 토큰을 만듭니다. 저장소는 `hy0909/cusmos-homepage`만 고르고, 권한은 Contents를 Read and write, Pages를 Read-only로 줍니다.
2. 관리자 페이지에 토큰을 붙여 넣고 로그인합니다.
3. 다른 사람에게 관리를 맡기려면 그 사람의 GitHub 계정을 저장소 협업자로 초대하고, 본인 토큰을 만들게 합니다.

## 처음에 채워야 할 것

- 관리자 > 회사 정보: 문의 이메일, 전화, 주소, 사업자등록번호. 문의 이메일이 비어 있으면 도입 문의 양식이 동작하지 않습니다.
- 회사소개 > 연혁: IR 자료에 날짜가 있는 항목만 넣었습니다. 설립일과 한전 PoC 시기를 확인해 `company.html`에 추가해 주세요.
- 브랜드 컬러: 홈페이지에 쓴 색을 넣어 두었습니다. 공식 CI 색상 값이 따로 있으면 관리자 > CI에서 바꿔 주세요.

## 로컬에서 보기

```bash
python3 -m http.server 4173
```

브라우저에서 http://localhost:4173 을 엽니다.
