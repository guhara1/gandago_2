import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = path.join(root, "areas", "gyeonggi", "index.html");
const sourceHtml = await fs.readFile(pagePath, "utf8");
const header = sourceHtml.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
const footer = sourceHtml.match(/<footer>[\s\S]*?<\/footer>/)?.[0];

if (!header || !footer) throw new Error("Could not find shared header or footer.");

const cities = [
  { name: "수원시", slug: "suwon", board: "영통·광교·인계", intro: "수원시는 영통 업무권, 광교 신도시, 인계동 상권의 방문 조건이 달라 주소와 시간대 확인이 중요합니다.", points: ["영통·광교 이동", "인계동 상권 출입", "아파트 주차 확인"], areas: ["영통·광교", "인계·권선", "팔달·장안"] },
  { name: "성남시", slug: "seongnam", board: "분당·판교·수정", intro: "성남시는 분당 주거권과 판교 업무권, 수정·중원 생활권이 나뉘어 실제 위치 기준 상담이 필요합니다.", points: ["판교 업무권", "분당 주거권", "수정·중원 이동"], areas: ["분당", "판교", "수정·중원"] },
  { name: "의정부시", slug: "uijeongbu", board: "의정부역·민락·송산", intro: "의정부시는 북부 생활권과 신도시 주거지가 섞여 있어 시간대와 주차 조건을 함께 확인합니다.", points: ["의정부역 주변", "민락 신도시", "북부권 이동"], areas: ["의정부역", "민락·송산", "금오·호원"] },
  { name: "안양시", slug: "anyang", board: "평촌·범계·안양역", intro: "안양시는 평촌 업무·주거권과 안양역 상권의 동선이 달라 방문 장소 유형을 먼저 구분합니다.", points: ["평촌 업무권", "범계 상권", "안양역 이동"], areas: ["평촌·범계", "안양역", "석수·관양"] },
  { name: "부천시", slug: "bucheon", board: "상동·중동·역곡", intro: "부천시는 서울 인접 이동과 내부 생활권이 겹쳐 퇴근 시간과 주거지 출입 조건이 중요합니다.", points: ["상동·중동 주거권", "역곡 이동", "서울 인접 동선"], areas: ["상동·중동", "역곡", "소사·오정"] },
  { name: "광명시", slug: "gwangmyeong", board: "철산·하안·광명역", intro: "광명시는 서울 인접 동선과 광명역 주변 이동이 겹쳐 실제 주소와 주차 가능 여부를 확인해야 합니다.", points: ["철산 상권", "광명역 이동", "하안 주거권"], areas: ["철산", "하안", "광명역"] },
  { name: "평택시", slug: "pyeongtaek", board: "고덕·송탄·평택역", intro: "평택시는 생활권이 넓고 고덕·송탄·평택역 이동 차이가 커서 예약 시간을 넓게 상담하는 편이 좋습니다.", points: ["고덕 신도시", "송탄 생활권", "평택역 주변"], areas: ["고덕", "송탄", "평택역"] },
  { name: "동두천시", slug: "dongducheon", board: "지행·송내·중앙", intro: "동두천시는 북부 이동 거리가 변수라 당일 배정 위치와 희망 시간을 함께 확인해야 합니다.", points: ["지행역 주변", "북부권 이동", "야간 출입"], areas: ["지행·송내", "중앙", "생연"] },
  { name: "안산시", slug: "ansan", board: "중앙·상록·단원", intro: "안산시는 상록구와 단원구 생활권이 넓고 산업단지 동선이 있어 방문 장소 유형을 먼저 확인합니다.", points: ["중앙역 상권", "상록 주거권", "단원 산업권"], areas: ["중앙·고잔", "상록", "단원"] },
  { name: "고양시", slug: "goyang", board: "일산·화정·덕양", intro: "고양시는 일산 동서권과 덕양 생활권의 이동 시간이 달라 주소 기준 상담이 필요합니다.", points: ["일산 주거권", "화정 상권", "덕양 이동"], areas: ["일산", "화정", "덕양"] },
  { name: "과천시", slug: "gwacheon", board: "정부청사·별양·문원", intro: "과천시는 지역은 작지만 보안 시설과 주거 단지가 있어 출입 방식과 방문 시간을 함께 확인합니다.", points: ["정부청사 인근", "주거 단지 출입", "서울 인접 이동"], areas: ["정부청사", "별양", "문원"] },
  { name: "구리시", slug: "guri", board: "구리역·인창·갈매", intro: "구리시는 서울 동부 인접 이동과 갈매 신도시 생활권이 달라 실제 위치 기준 안내가 필요합니다.", points: ["구리역 주변", "인창 주거권", "갈매 이동"], areas: ["구리역", "인창", "갈매"] },
  { name: "남양주시", slug: "namyangju", board: "다산·별내·평내", intro: "남양주시는 권역이 넓어 다산, 별내, 평내·호평의 이동 시간을 별도로 확인해야 합니다.", points: ["다산 신도시", "별내 생활권", "평내·호평 이동"], areas: ["다산", "별내", "평내·호평"] },
  { name: "오산시", slug: "osan", board: "오산역·세교·원동", intro: "오산시는 세교 신도시와 오산역 생활권의 이동 조건이 달라 주소와 주차 정보를 먼저 확인합니다.", points: ["세교 주거권", "오산역 주변", "원동 이동"], areas: ["세교", "오산역", "원동"] },
  { name: "시흥시", slug: "siheung", board: "배곧·정왕·능곡", intro: "시흥시는 배곧, 정왕, 능곡 생활권의 거리가 있어 희망 시간과 이동 동선을 함께 상담합니다.", points: ["배곧 신도시", "정왕 산업권", "능곡 이동"], areas: ["배곧", "정왕", "능곡"] },
  { name: "군포시", slug: "gunpo", board: "산본·금정·당동", intro: "군포시는 산본 주거권과 금정 환승권이 가까워 보여도 시간대별 이동 차이를 확인해야 합니다.", points: ["산본 주거권", "금정 환승", "당동 이동"], areas: ["산본", "금정", "당동"] },
  { name: "의왕시", slug: "uiwang", board: "내손·포일·오전", intro: "의왕시는 안양·군포 인접 동선과 주거 단지 출입 조건이 겹쳐 상세 주소 확인이 중요합니다.", points: ["내손·포일 주거권", "오전동 이동", "인접 도시 동선"], areas: ["내손·포일", "오전", "청계"] },
  { name: "하남시", slug: "hanam", board: "미사·감일·덕풍", intro: "하남시는 미사·감일 신도시와 덕풍 생활권의 이동 흐름이 달라 방문 시간 기준 상담이 필요합니다.", points: ["미사 신도시", "감일 이동", "덕풍 주거권"], areas: ["미사", "감일", "덕풍"] },
  { name: "용인시", slug: "yongin", board: "수지·기흥·처인", intro: "용인시는 수지, 기흥, 처인 생활권이 넓게 갈라져 실제 주소와 배정 동선을 함께 확인해야 합니다.", points: ["수지 주거권", "기흥 업무·주거", "처인 장거리 이동"], areas: ["수지", "기흥", "처인"] },
  { name: "파주시", slug: "paju", board: "운정·금촌·문산", intro: "파주시는 운정 신도시와 금촌·문산 이동 거리가 있어 당일 가능 시간 확인이 중요합니다.", points: ["운정 신도시", "금촌 생활권", "문산 장거리"], areas: ["운정", "금촌", "문산"] },
  { name: "이천시", slug: "icheon", board: "이천역·부발·마장", intro: "이천시는 생활권 간 거리가 있어 예약 시간과 이전 배정 위치를 함께 확인해야 합니다.", points: ["이천역 주변", "부발 이동", "마장 물류권"], areas: ["이천역", "부발", "마장"] },
  { name: "안성시", slug: "anseong", board: "공도·안성맞춤·중앙", intro: "안성시는 공도와 시내 생활권의 이동 조건이 달라 가능 여부를 주소 기준으로 확인합니다.", points: ["공도 생활권", "안성 시내", "장거리 이동"], areas: ["공도", "안성 시내", "중앙"] },
  { name: "김포시", slug: "gimpo", board: "장기·구래·사우", intro: "김포시는 한강신도시와 사우·풍무 생활권의 이동 조건이 달라 시간대 확인이 필요합니다.", points: ["한강신도시", "구래·장기 이동", "사우·풍무"], areas: ["장기·구래", "사우", "풍무"] },
  { name: "화성시", slug: "hwaseong", board: "동탄·병점·향남", intro: "화성시는 동탄, 병점, 향남의 거리가 커서 상세 위치와 시간 폭을 함께 상담해야 합니다.", points: ["동탄 신도시", "병점 이동", "향남 장거리"], areas: ["동탄", "병점", "향남"] },
  { name: "광주시", slug: "gwangju-gg", board: "경안·태전·오포", intro: "경기 광주시는 산지와 주거지 이동 변수가 있어 도로 흐름과 주차 가능 여부를 함께 확인합니다.", points: ["경안 시내", "태전 주거권", "오포 이동"], areas: ["경안", "태전", "오포"] },
  { name: "양주시", slug: "yangju", board: "옥정·회천·덕정", intro: "양주시는 옥정 신도시와 덕정·회천 생활권 이동이 달라 당일 배정 위치 확인이 필요합니다.", points: ["옥정 신도시", "회천 이동", "덕정 생활권"], areas: ["옥정", "회천", "덕정"] },
  { name: "포천시", slug: "pocheon", board: "소흘·송우·포천동", intro: "포천시는 북부권 이동 거리가 커서 방문 가능 시간과 안전한 출입 조건을 먼저 확인합니다.", points: ["소흘·송우", "포천동 이동", "북부 장거리"], areas: ["소흘·송우", "포천동", "신읍"] },
  { name: "여주시", slug: "yeoju", board: "여주역·홍문·오학", intro: "여주시는 생활권 간 이동 거리가 있어 예약 가능 여부를 현재 배정 동선과 함께 확인합니다.", points: ["여주역 주변", "홍문 생활권", "오학 이동"], areas: ["여주역", "홍문", "오학"] },
  { name: "연천군", slug: "yeoncheon", board: "전곡·연천읍·청산", intro: "연천군은 경기 북부 장거리 이동 지역이라 희망 시간과 방문 조건을 넓게 상담해야 합니다.", points: ["전곡 생활권", "연천읍 이동", "북부 장거리"], areas: ["전곡", "연천읍", "청산"] },
  { name: "가평군", slug: "gapyeong", board: "가평읍·청평·설악", intro: "가평군은 숙박시설과 관광지 이동이 많아 정확한 주소와 대기 가능 여부를 먼저 확인합니다.", points: ["숙박시설 방문", "청평 이동", "관광지 동선"], areas: ["가평읍", "청평", "설악"] },
  { name: "양평군", slug: "yangpyeong", board: "양평읍·용문·서종", intro: "양평군은 동부권 이동 거리가 크고 숙소 방문이 많아 시간대와 출입 조건을 함께 확인합니다.", points: ["양평읍 생활권", "용문 이동", "숙박시설 출입"], areas: ["양평읍", "용문", "서종"] },
];

const priceCards = `
        <div class="local-price-grid">
          <article class="local-price-card"><h3>타이마사지 건식</h3><p>스트레칭과 압 조절 중심의 건식 관리입니다.</p><dl><div><dt>60분</dt><dd>70,000원</dd></div><div><dt>90분</dt><dd>90,000원</dd></div><div><dt>120분</dt><dd>110,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>아로마마사지 습식</h3><p>오일 사용 여부와 피부 민감도를 먼저 확인합니다.</p><dl><div><dt>60분</dt><dd>80,000원</dd></div><div><dt>90분</dt><dd>100,000원</dd></div><div><dt>120분</dt><dd>120,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>감성케어 오일</h3><p>이완감을 중심으로 강도와 진행 범위를 상담합니다.</p><dl><div><dt>60분</dt><dd>90,000원</dd></div><div><dt>90분</dt><dd>110,000원</dd></div><div><dt>120분</dt><dd>130,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>VVIP 전신케어</h3><p>건식과 오일 흐름을 길게 구성하는 전신 관리입니다.</p><dl><div><dt>60분</dt><dd>100,000원</dd></div><div><dt>90분</dt><dd>120,000원</dd></div><div><dt>120분</dt><dd>140,000원</dd></div><div><dt>150분</dt><dd>170,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>한국인 스웨디시</h3><p>소통 편의와 섬세한 강도 조절을 원하는 예약자 기준입니다.</p><dl><div><dt>60분</dt><dd>140,000원</dd></div><div><dt>90분</dt><dd>180,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>남성 스웨디시</h3><p>관리사 배정과 방문 조건을 전화로 먼저 확인합니다.</p><dl><div><dt>60분</dt><dd>90,000원</dd></div><div><dt>90분</dt><dd>120,000원</dd></div><div><dt>120분</dt><dd>150,000원</dd></div></dl></article>
        </div>`;

function cityPage(city) {
  const title = `${city.name} 출장마사지, ${city.board} 방문 전 확인할 상담 기준 | 마사지KING`;
  const description = `${city.intro} ${city.areas.join("·")} 예약 전 주소, 주차, 희망 시간을 기준으로 안내합니다.`;
  const areaCards = city.areas.map((area) => `<article class="area-zone-card"><span>${city.name}</span><h3>${area}</h3><p>${area} 권역은 같은 ${city.name} 안에서도 이동 거리와 건물 조건에 따라 안내가 달라질 수 있습니다.</p><strong>주소 기준 확인</strong></article>`).join("\n          ");
  const reviewItems = [
    { area: city.areas[0], label: "주소 확인", text: `${city.areas[0]} 문의에서 세부 주소를 먼저 확인하니 가능 시간 안내가 더 분명했습니다. 상담에서 확정 가능한 내용과 추가 확인이 필요한 부분을 나눠 설명했습니다.` },
    { area: city.areas[1], label: "시간대 조정", text: `${city.areas[1]} 생활권은 가까워 보여도 시간대에 따라 이동 차이가 생긴다고 안내받았습니다. 희망 시간을 조금 넓게 잡으니 상담이 빨리 정리됐습니다.` },
    { area: city.areas[2], label: "출입 조건", text: `${city.areas[2]} 방문은 건물 출입 방식과 주차 가능 여부를 미리 확인해야 했습니다. 준비할 정보를 먼저 알려줘 재확인할 일이 줄었습니다.` },
    { area: city.board, label: "가격 확인", text: `${city.name} 기준 요금표를 확인하고 전화했지만, 실제 안내는 이동 거리와 방문 환경을 함께 본 뒤 설명받았습니다. 기준가와 상담 확정 내용을 구분해줘 좋았습니다.` },
    { area: city.points[0], label: "컨디션 상담", text: `피로 부위와 피해야 할 부위를 먼저 물어봤습니다. 강한 압을 무조건 권하지 않고 진행 중 조절할 수 있다고 안내해 부담이 줄었습니다.` },
    { area: city.points[2], label: "예약 전 준비", text: `방문 전에 주소, 출입 방식, 주차 가능 여부를 정리해 달라고 안내받았습니다. 통화 전에 준비할 항목이 분명해서 예약 흐름이 복잡하지 않았습니다.` },
  ];
  const reviewCards = reviewItems.map((item) => `<article class="local-review-card"><header><strong>${item.area}</strong><span>${item.label}</span></header><p>${item.text}</p><footer>익명 이용 메모 · 2026</footer></article>`).join("\n          ");

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="noindex,follow,max-image-preview:large">
    <meta name="format-detection" content="telephone=no">
    <link rel="canonical" href="https://gandago.xyz/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://gandago-2.pages.dev/assets/hero-wellness.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/content.css">
  </head>
  <body>
    ${header}

    <main class="content-page area-page">
      <section class="page-hero">
        <p class="eyebrow">Gyeonggi city</p>
        <h1>${city.name} 출장마사지 가능 지역 안내</h1>
        <p>${city.intro}</p>
        <div class="area-hero-proof" aria-label="${city.name} 빠른 예약 포인트">
          <strong>${city.name} 즉시 확인</strong>
          <span>${city.points[0]}</span>
          <span>${city.points[1]}</span>
          <a href="tel:05082024743">${city.name} 전화상담</a>
        </div>
        <div class="area-hero-card" aria-label="${city.name} 상담 보드">
          <span>${city.name} 상담 보드</span>
          <h2>${city.name}은 동선 확인이 먼저입니다</h2>
          <p class="area-hero-cta">${city.board} 생활권은 이동 거리와 방문 조건에 따라 가능 안내가 달라집니다. 전화로 현재 배정 흐름을 먼저 확인하세요.</p>
          <ul>
            <li>${city.points[0]}</li>
            <li>${city.points[1]}</li>
            <li>${city.points[2]}</li>
          </ul>
          <a href="tel:05082024743">0508-202-4743 ${city.name} 상담</a>
        </div>
        <dl class="page-meta" aria-label="콘텐츠 정보">
          <div><dt>작성</dt><dd>마사지KING 운영팀</dd></div>
          <div><dt>검수</dt><dd>예약 상담 기준 확인</dd></div>
          <div><dt>업데이트</dt><dd>2026-05-21</dd></div>
        </dl>
      </section>

      <section class="area-dashboard" aria-label="${city.name} 출장마사지 권역 안내">
        <div class="area-dashboard-head">
          <p class="eyebrow">${city.name} board</p>
          <h2>${city.name}은 시군명보다 실제 주소와 이동 조건을 봅니다</h2>
          <p>${city.intro} 같은 ${city.name} 안에서도 도로 흐름, 건물 보안, 주차 가능 여부에 따라 상담 결과가 달라질 수 있습니다.</p>
        </div>
        <div class="area-zone-grid">
          ${areaCards}
        </div>
        <div class="area-signal-panel">
          <div><b>${city.name} 체크</b><span>상세 주소와 건물 출입 정보를 먼저 준비</span></div>
          <div><b>주의 시간</b><span>퇴근 시간대와 장거리 이동은 여유 있게 상담</span></div>
          <div><b>예약 문의</b><span>0508-202-4743</span></div>
        </div>
      </section>

      <section class="area-commerce" aria-label="${city.name} 출장마사지 메뉴 가격">
        <div class="area-section-head">
          <div><p class="eyebrow">${city.name} price</p><h2>${city.name} 예약 전 확인하는 메뉴 가격</h2></div>
          <p>아래 금액은 통화 전 참고하는 기준가입니다. 실제 안내는 ${city.name} 내 위치, 시간대, 이동 조건, 방문 환경을 확인한 뒤 달라질 수 있습니다.</p>
        </div>
${priceCards}
        <div class="area-price-note"><p>가격표는 기준 안내이며, 심야 시간·이동 거리·현장 조건에 따라 상담 내용이 달라질 수 있습니다.</p><a href="tel:05082024743">${city.name} 가격 전화 확인</a></div>
      </section>

      <section class="area-reviews" aria-label="${city.name} 출장마사지 이용 메모">
        <div class="area-section-head">
          <div><p class="eyebrow">${city.name} reviews</p><h2>${city.name} 이용자가 자주 확인한 상담 포인트</h2></div>
          <p>후기는 과장된 만족 표현이 아니라 예약자가 실제로 확인한 절차, 시간, 출입 방식, 준비사항 중심의 익명 메모입니다.</p>
        </div>
        <div class="local-review-grid">
          ${reviewCards}
        </div>
        <div class="area-review-note"><p>개인정보는 제외했으며 치료 효과, 순위 보장, 확정적 만족을 약속하는 표현은 사용하지 않습니다.</p></div>
      </section>

      <section class="content-long" aria-label="${city.name} 출장마사지 가능 지역 안내 상세 안내">
        <article class="content-panel">
          <h2>핵심 요약</h2>
          <p>${city.name} 출장마사지 가능 여부는 지역명만으로 확정하지 않고, 실제 주소와 희망 시간, 방문 장소 조건을 함께 확인해야 합니다.</p>
          <p>${city.name} 페이지는 검색 유입만을 목적으로 지명을 반복하는 문서가 아니라 예약자가 전화 전에 준비할 정보를 정리한 안내입니다. 같은 ${city.name} 안에서도 ${city.areas.join(", ")}처럼 생활권이 나뉘고, 숙소·오피스텔·주거지·사무실에 따라 출입 방식과 대기 가능 여부가 달라집니다.</p>
          <p>따라서 이 문서는 “무조건 가능합니다”라고 말하기보다, 어떤 조건을 확인해야 현재 기준의 안내가 정확해지는지 보여주는 역할을 합니다.</p>
        </article>
        <article class="content-panel">
          <h2>전화 상담에서 묻는 정보</h2>
          <p>상담에서는 먼저 ${city.name} 내 정확한 주소, 희망 시간, 방문 장소 유형을 확인합니다.</p>
          <p>두 번째로 컨디션과 피해야 할 부위를 묻습니다. 통증을 참는 방식으로 진행하지 않으며, 질환·부상·급성 통증이 있으면 의료 전문가 상담을 우선해야 합니다.</p>
          <p>세 번째로 건물 출입 방식, 주차 가능 여부, 야간 대기 조건을 확인합니다. 작은 정보 차이가 도착 시간과 안내 가능 여부에 영향을 줄 수 있습니다.</p>
        </article>
        <article class="content-panel">
          <h2>${city.name} 예약 전 체크리스트</h2>
          <p>아래 항목을 미리 준비하면 통화 시간이 짧아지고 안내가 더 정확해집니다.</p>
          <ul>
            <li>${city.name} 내 상세 주소와 가까운 출입구를 확인합니다.</li>
            <li>희망 시간과 조정 가능한 시간 범위를 함께 정리합니다.</li>
            <li>건물 출입, 주차, 로비 대기 가능 여부를 확인합니다.</li>
            <li>피해야 할 부위나 건강상 주의사항을 숨기지 않습니다.</li>
            <li>마사지가 의료 진단이나 치료를 대신하지 않는다는 점을 이해합니다.</li>
          </ul>
        </article>
        <article class="content-panel">
          <h2>콘텐츠 신뢰 기준</h2>
          <p>이 페이지는 마사지KING 운영팀이 예약 상담에서 반복적으로 확인되는 질문을 바탕으로 작성했습니다.</p>
          <p>작성 과정에서 AI가 문장 정리에 보조적으로 쓰일 수 있지만, 최종 문구는 운영 기준과 서비스 한계 고지에 맞춰 확인합니다. 지역명만 바꾼 대량 복제 문서가 되지 않도록 ${city.name}의 생활권과 상담 변수를 반영했습니다.</p>
          <p>허위 후기, 치료 효과 단정, 순위 조작 목적의 키워드 반복, 보장형 표현은 사용하지 않습니다.</p>
        </article>
      </section>

      <section class="who-how-why">
        <div><h2>Who</h2><p>이 문서는 마사지KING 운영팀이 작성하고 관리합니다. 실제 예약 문의에서 반복되는 질문과 운영상 반드시 고지해야 하는 한계를 기준으로 정리했습니다.</p></div>
        <div><h2>How</h2><p>초안 정리에는 AI 도움을 받을 수 있지만, 최종 문구는 운영팀이 확인합니다. 서비스 가능 여부, 안전 고지, 의료 행위가 아니라는 설명은 과장 없이 검토합니다.</p></div>
        <div><h2>Why</h2><p>목적은 검색 순위 조작이 아니라 예약자가 전화 전에 필요한 정보를 이해하도록 돕는 것입니다. 지역명 반복과 허위 후기는 사용하지 않습니다.</p></div>
      </section>

      <section class="page-cta">
        <div><p class="eyebrow">Reservation</p><h2>${city.name} 가능 여부는 전화 상담에서 확인하세요</h2><p>주소, 시간, 방문 환경을 알려주시면 현재 기준으로 안내합니다.</p></div>
        <a class="primary-button" href="tel:05082024743">0508-202-4743</a>
      </section>
    </main>

    ${footer}
  </body>
</html>
`;
}

function directoryHtml() {
  const cards = cities.map((city) => `          <a class="district-link-card" href="/areas/gyeonggi/${city.slug}/"><strong>${city.name}</strong><span>${city.board} 생활권 기준 확인</span></a>`).join("\n");
  return `      <section class="district-directory" aria-label="경기도 시군별 출장마사지 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">Gyeonggi cities</p><h2>경기도 31개 시·군별 가능 지역 안내</h2></div>
          <p>시군명을 단순히 나열하지 않고, 각 지역별 이동 거리와 방문 조건을 확인할 수 있도록 개별 안내 페이지로 연결합니다.</p>
        </div>
        <div class="district-directory-grid">
${cards}
        </div>
      </section>

`;
}

for (const city of cities) {
  const dir = path.join(root, "areas", "gyeonggi", city.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), cityPage(city), "utf8");
}

const marker = `      <section class="area-commerce" aria-label="경기 출장마사지 메뉴 가격">`;
let nextHtml = sourceHtml;
if (!nextHtml.includes('aria-label="경기도 시군별 출장마사지 안내"')) {
  nextHtml = nextHtml.replace(marker, directoryHtml() + marker);
}
await fs.writeFile(pagePath, nextHtml, "utf8");

console.log(`Generated ${cities.length} Gyeonggi city pages.`);
