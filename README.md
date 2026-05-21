# 마사지KING 사이트

서울, 경기, 인천 출장마사지 예약 안내용 정적 웹사이트입니다.

## 구성

- `index.html`: 메인 페이지, 메타 태그, 구조화 데이터
- `styles.css`: 반응형 스타일
- `content.css`: 하위 콘텐츠 페이지 스타일
- `assets/hero-wellness.png`: 히어로 및 Open Graph 이미지
- `areas/`, `service/`, `guide/`, `reviews/`, `magazine/`, `contact/`, `policy/`: 상단 드롭다운 메뉴용 콘텐츠 페이지
- `scripts/generate-content-pages.ps1`: 하위 콘텐츠 페이지 생성 스크립트
- `robots.txt`: 크롤링 허용 및 사이트맵 위치
- `sitemap.xml`: 기본 사이트맵

## 운영 메모

구글 검색 노출을 위해 동·구 단위 대량 복제 페이지, 허위 후기, 키워드 반복 문장, 보장형 순위 문구를 만들지 않습니다. 실제 예약 상담에서 확인되는 정보와 운영 기준만 업데이트하는 방향을 권장합니다.

현재 중복 색인 방지를 위해 `noindex,follow`를 유지합니다. 신규 도메인과 독립 운영 정책이 확정되면 canonical, sitemap, robots 설정을 함께 재검토해야 합니다.
