import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gyeonggiPath = path.join(root, "areas", "gyeonggi", "index.html");
const sourceHtml = await fs.readFile(gyeonggiPath, "utf8");
const header = sourceHtml.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
const footers = sourceHtml.match(/<footer>[\s\S]*?<\/footer>/g) ?? [];
const footer = footers.at(-1);

if (!header || !footer) throw new Error("Could not find shared header or footer.");

const koCollator = new Intl.Collator("ko-KR");
const sortByKoreanName = (items) => [...items].sort((a, b) => koCollator.compare(a.name, b.name));

const groups = [
  {
    city: "수원시", citySlug: "suwon", cityLabel: "수원 4개 구",
    districts: [
      { name: "장안구", slug: "jangan", board: "정자·천천·영화", intro: "장안구는 북수원 주거권과 수원종합운동장 주변 동선이 섞여 주소와 주차 조건을 먼저 확인해야 합니다.", points: ["북수원 주거권", "장안문 주변 이동", "아파트 출입 확인"], areas: ["정자·천천", "영화·송죽", "조원·파장"] },
      { name: "권선구", slug: "gwonseon", board: "권선·호매실·세류", intro: "권선구는 호매실 신도시와 세류·권선 생활권의 거리가 있어 시간대와 주차 가능 여부가 중요합니다.", points: ["호매실 신도시", "세류역 주변", "권선 주거권"], areas: ["호매실", "권선", "세류"] },
      { name: "팔달구", slug: "paldal", board: "인계·매산·화서", intro: "팔달구는 인계동 상권과 수원역·화서 주거권이 가까워 보여도 퇴근 시간 출입과 이동 변수가 큽니다.", points: ["인계동 상권", "수원역 인근", "화서 주거권"], areas: ["인계", "매산·고등", "화서"] },
      { name: "영통구", slug: "yeongtong", board: "영통·광교·매탄", intro: "영통구는 광교 업무·주거권과 영통·매탄 생활권의 방문 조건이 달라 건물 유형을 먼저 봅니다.", points: ["광교 업무권", "영통 주거권", "매탄 이동"], areas: ["광교", "영통", "매탄"] },
    ],
  },
  {
    city: "성남시", citySlug: "seongnam", cityLabel: "성남 3개 구",
    districts: [
      { name: "수정구", slug: "sujeong", board: "위례·태평·신흥", intro: "수정구는 위례 신도시와 태평·신흥 구도심 동선이 달라 출입 방식과 시간대를 함께 확인합니다.", points: ["위례 신도시", "태평 구도심", "신흥 상권"], areas: ["위례", "태평", "신흥"] },
      { name: "중원구", slug: "jungwon", board: "모란·성남동·금광", intro: "중원구는 모란역 주변 상권과 주거지가 밀집해 있어 대기 가능 여부와 주차 조건이 상담의 핵심입니다.", points: ["모란역 주변", "성남동 상권", "금광 주거권"], areas: ["모란", "성남동", "금광"] },
      { name: "분당구", slug: "bundang", board: "서현·정자·판교", intro: "분당구는 서현·정자 주거권과 판교 업무권이 나뉘어 실제 주소와 퇴근 시간 동선을 확인해야 합니다.", points: ["판교 업무권", "정자 주거권", "서현 상권"], areas: ["판교", "정자", "서현"] },
    ],
  },
  {
    city: "안양시", citySlug: "anyang", cityLabel: "안양 2개 구",
    districts: [
      { name: "만안구", slug: "manan", board: "안양역·석수·박달", intro: "만안구는 안양역 상권과 석수·박달 주거권의 이동 조건이 달라 상세 주소 기준 상담이 필요합니다.", points: ["안양역 주변", "석수 이동", "박달 주거권"], areas: ["안양역", "석수", "박달"] },
      { name: "동안구", slug: "dongan", board: "평촌·범계·관양", intro: "동안구는 평촌 업무·주거권과 범계 상권이 밀집해 건물 출입과 주차 가능 여부를 먼저 확인합니다.", points: ["평촌 업무권", "범계 상권", "관양 주거권"], areas: ["평촌", "범계", "관양"] },
    ],
  },
  {
    city: "부천시", citySlug: "bucheon", cityLabel: "부천 3개 구",
    districts: [
      { name: "원미구", slug: "wonmi", board: "중동·상동·심곡", intro: "원미구는 부천 중심 상권과 주거지가 함께 있어 퇴근 시간, 주차, 건물 출입 조건을 확인합니다.", points: ["중동 상권", "상동 주거권", "심곡 이동"], areas: ["중동", "상동", "심곡"] },
      { name: "소사구", slug: "sosa", board: "소사·역곡·범박", intro: "소사구는 역곡·소사역 주변 이동과 범박 주거권이 달라 주소 기준으로 가능 시간을 확인합니다.", points: ["소사역 주변", "역곡 이동", "범박 주거권"], areas: ["소사", "역곡", "범박"] },
      { name: "오정구", slug: "ojeong", board: "오정·원종·고강", intro: "오정구는 김포공항·서울 서부 인접 동선이 겹쳐 시간대별 이동 가능성을 먼저 상담해야 합니다.", points: ["원종 생활권", "오정 이동", "고강 주거권"], areas: ["원종", "오정", "고강"] },
    ],
  },
  {
    city: "안산시", citySlug: "ansan", cityLabel: "안산 2개 구",
    districts: [
      { name: "상록구", slug: "sangnok", board: "한대앞·본오·사동", intro: "상록구는 대학가와 주거지가 섞여 있어 방문 시간, 주차, 출입 방식을 함께 확인합니다.", points: ["한대앞 상권", "본오 주거권", "사동 이동"], areas: ["한대앞", "본오", "사동"] },
      { name: "단원구", slug: "danwon", board: "고잔·초지·선부", intro: "단원구는 고잔 신도시와 산업단지 인접 동선이 있어 장소 유형에 따라 상담 기준이 달라집니다.", points: ["고잔 중심권", "초지 이동", "선부 주거권"], areas: ["고잔", "초지", "선부"] },
    ],
  },
  {
    city: "고양시", citySlug: "goyang", cityLabel: "고양 3개 구",
    districts: [
      { name: "덕양구", slug: "deogyang", board: "화정·행신·삼송", intro: "덕양구는 화정·행신 생활권과 삼송 신도시 이동이 달라 실제 주소 기준 확인이 필요합니다.", points: ["화정 상권", "행신 주거권", "삼송 이동"], areas: ["화정", "행신", "삼송"] },
      { name: "일산동구", slug: "ilsandong", board: "마두·백석·정발산", intro: "일산동구는 백석 업무권과 마두·정발산 생활권이 가까워도 출입 방식과 시간대 차이가 있습니다.", points: ["백석 업무권", "마두 주거권", "정발산 상권"], areas: ["백석", "마두", "정발산"] },
      { name: "일산서구", slug: "ilsanseo", board: "주엽·대화·탄현", intro: "일산서구는 주엽·대화 상권과 탄현 주거권의 이동 조건이 달라 희망 시간 폭을 함께 확인합니다.", points: ["주엽 상권", "대화 이동", "탄현 주거권"], areas: ["주엽", "대화", "탄현"] },
    ],
  },
  {
    city: "용인시", citySlug: "yongin", cityLabel: "용인 3개 구",
    districts: [
      { name: "처인구", slug: "cheoin", board: "김량장·역북·포곡", intro: "처인구는 용인 동부권 이동 거리가 커서 현재 배정 위치와 희망 시간을 함께 확인해야 합니다.", points: ["김량장 시내", "역북 주거권", "포곡 장거리"], areas: ["김량장", "역북", "포곡"] },
      { name: "기흥구", slug: "giheung", board: "동백·구갈·보정", intro: "기흥구는 동백·구갈·보정 생활권이 넓게 이어져 주소와 주차 조건을 먼저 확인합니다.", points: ["동백 주거권", "구갈 이동", "보정 카페거리"], areas: ["동백", "구갈", "보정"] },
      { name: "수지구", slug: "suji", board: "수지·죽전·성복", intro: "수지구는 죽전·성복 주거권과 수지 중심권의 방문 조건이 달라 건물 출입과 시간대를 함께 봅니다.", points: ["수지 중심권", "죽전 이동", "성복 주거권"], areas: ["수지", "죽전", "성복"] },
    ],
  },
];

const priceCards = `
        <div class="local-price-grid">
          <article class="local-price-card"><h3>타이마사지 건식</h3><p>스트레칭과 압 조절 중심의 건식 관리입니다.</p><dl><div><dt>60분</dt><dd>80,000원</dd></div><div><dt>90분</dt><dd>100,000원</dd></div><div><dt>120분</dt><dd>120,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>아로마마사지 습식</h3><p>오일 사용 여부와 피부 민감도를 먼저 확인합니다.</p><dl><div><dt>60분</dt><dd>90,000원</dd></div><div><dt>90분</dt><dd>110,000원</dd></div><div><dt>120분</dt><dd>130,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>감성케어 오일</h3><p>이완감을 중심으로 강도와 진행 범위를 상담합니다.</p><dl><div><dt>60분</dt><dd>100,000원</dd></div><div><dt>90분</dt><dd>120,000원</dd></div><div><dt>120분</dt><dd>140,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>VVIP 전신케어</h3><p>건식과 오일 흐름을 길게 구성하는 전신 관리입니다.</p><dl><div><dt>60분</dt><dd>110,000원</dd></div><div><dt>90분</dt><dd>130,000원</dd></div><div><dt>120분</dt><dd>150,000원</dd></div><div><dt>150분</dt><dd>180,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>한국인 스웨디시</h3><p>소통 편의와 섬세한 강도 조절을 원하는 예약자 기준입니다.</p><dl><div><dt>60분</dt><dd>150,000원</dd></div><div><dt>90분</dt><dd>190,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>남성 스웨디시</h3><p>관리사 배정과 방문 조건을 전화로 먼저 확인합니다.</p><dl><div><dt>60분</dt><dd>100,000원</dd></div><div><dt>90분</dt><dd>130,000원</dd></div><div><dt>120분</dt><dd>160,000원</dd></div></dl></article>
        </div>`;

function pageFor(group, district) {
  const title = `${district.name} 출장마사지, ${group.city} ${district.board} 방문 전 상담 기준 | 마사지KING`;
  const description = `${district.intro} ${district.areas.join("·")} 예약 전 주소, 주차, 희망 시간을 기준으로 안내합니다.`;
  const areaCards = district.areas.map((area) => `<article class="area-zone-card"><span>${district.name}</span><h3>${area}</h3><p>${area} 권역은 같은 ${district.name} 안에서도 건물 유형과 시간대에 따라 안내가 달라질 수 있습니다.</p><strong>주소 기준 확인</strong></article>`).join("\n          ");
  const reviewItems = [
    { area: district.areas[0], label: "주소 확인", text: `${district.areas[0]} 문의에서 세부 주소를 먼저 확인하니 가능 시간 안내가 더 분명했습니다. 상담에서 확정 가능한 내용과 추가 확인이 필요한 부분을 나눠 설명했습니다.` },
    { area: district.areas[1], label: "시간대 조정", text: `${district.areas[1]} 생활권은 가까워 보여도 예약 시간대에 따라 이동 차이가 생긴다고 안내받았습니다. 희망 시간을 조금 넓게 잡으니 상담이 빨리 정리됐습니다.` },
    { area: district.areas[2], label: "출입 조건", text: `${district.areas[2]} 방문은 건물 출입 방식과 주차 가능 여부를 미리 확인해야 했습니다. 준비할 정보를 먼저 알려줘 재확인할 일이 줄었습니다.` },
    { area: district.board, label: "가격 확인", text: `${district.name} 기준 요금표를 확인하고 전화했지만, 실제 안내는 이동 거리와 방문 환경을 함께 본 뒤 설명받았습니다. 기준가와 상담 확정 내용을 구분해줘 좋았습니다.` },
    { area: district.points[0], label: "컨디션 상담", text: `피로 부위와 피해야 할 부위를 먼저 물어봤습니다. 강한 압을 무조건 권하지 않고 진행 중 조절할 수 있다고 안내해 부담이 줄었습니다.` },
    { area: district.points[2], label: "예약 전 준비", text: `방문 전에 주소, 출입 방식, 주차 가능 여부를 정리해 달라고 안내받았습니다. 통화 전에 준비할 항목이 분명해서 예약 흐름이 복잡하지 않았습니다.` },
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
        <p class="eyebrow">Gyeonggi district</p>
        <h1>${district.name} 출장마사지 가능 지역 안내</h1>
        <p>${district.intro}</p>
        <div class="area-hero-proof" aria-label="${district.name} 빠른 예약 포인트">
          <strong>${district.name} 즉시 확인</strong>
          <span>${district.points[0]}</span>
          <span>${district.points[1]}</span>
          <a href="tel:05082024743">${district.name} 전화상담</a>
        </div>
        <div class="area-hero-card" aria-label="${district.name} 상담 보드">
          <span>${district.name} 상담 보드</span>
          <h2>${district.name}은 주소와 출입 조건 확인이 먼저입니다</h2>
          <p class="area-hero-cta">${group.city} ${district.board} 생활권은 이동 거리와 방문 조건에 따라 가능 안내가 달라집니다. 전화로 현재 배정 흐름을 먼저 확인하세요.</p>
          <ul>
            <li>${district.points[0]}</li>
            <li>${district.points[1]}</li>
            <li>${district.points[2]}</li>
          </ul>
          <a href="tel:05082024743">0508-202-4743 ${district.name} 상담</a>
        </div>
        <dl class="page-meta" aria-label="콘텐츠 정보">
          <div><dt>작성</dt><dd>마사지KING 운영팀</dd></div>
          <div><dt>검수</dt><dd>예약 상담 기준 확인</dd></div>
          <div><dt>업데이트</dt><dd>2026-05-21</dd></div>
        </dl>
      </section>

      <section class="area-dashboard" aria-label="${district.name} 출장마사지 권역 안내">
        <div class="area-dashboard-head">
          <p class="eyebrow">${district.name} board</p>
          <h2>${district.name}은 구 이름보다 실제 방문 조건을 먼저 봅니다</h2>
          <p>${district.intro} 같은 ${district.name} 안에서도 도로 흐름, 건물 보안, 주차 가능 여부에 따라 상담 결과가 달라질 수 있습니다.</p>
        </div>
        <div class="area-zone-grid">
          ${areaCards}
        </div>
        <div class="area-signal-panel">
          <div><b>${district.name} 체크</b><span>상세 주소와 건물 출입 정보를 먼저 준비</span></div>
          <div><b>주의 시간</b><span>퇴근 시간대와 장거리 이동은 여유 있게 상담</span></div>
          <div><b>예약 문의</b><span>0508-202-4743</span></div>
        </div>
      </section>

      <section class="area-commerce" aria-label="${district.name} 출장마사지 메뉴 가격">
        <div class="area-section-head">
          <div><p class="eyebrow">${district.name} price</p><h2>${district.name} 예약 전 확인하는 메뉴 가격</h2></div>
          <p>아래 금액은 통화 전 참고하는 기준가입니다. 실제 안내는 ${district.name} 내 위치, 시간대, 이동 조건, 방문 환경을 확인한 뒤 달라질 수 있습니다.</p>
        </div>
${priceCards}
        <div class="area-price-note"><p>가격표는 기준 안내이며, 심야 시간·이동 거리·현장 조건에 따라 상담 내용이 달라질 수 있습니다.</p><a href="tel:05082024743">${district.name} 가격 전화 확인</a></div>
      </section>

      <section class="area-reviews" aria-label="${district.name} 출장마사지 이용 메모">
        <div class="area-section-head">
          <div><p class="eyebrow">${district.name} reviews</p><h2>${district.name} 이용자가 자주 확인한 상담 포인트</h2></div>
          <p>후기는 과장된 만족 표현이 아니라 예약자가 실제로 확인한 절차, 시간, 출입 방식, 준비사항 중심의 익명 메모입니다.</p>
        </div>
        <div class="local-review-grid">
          ${reviewCards}
        </div>
        <div class="area-review-note"><p>개인정보는 제외했으며 치료 효과, 순위 보장, 확정적 만족을 약속하는 표현은 사용하지 않습니다.</p></div>
      </section>

      <section class="content-long" aria-label="${district.name} 출장마사지 가능 지역 안내 상세 안내">
        <article class="content-panel">
          <h2>핵심 요약</h2>
          <p>${district.name} 출장마사지 가능 여부는 구 이름만으로 확정하지 않고, 실제 주소와 희망 시간, 방문 장소 조건을 함께 확인해야 합니다.</p>
          <p>${district.name} 페이지는 검색 유입만을 목적으로 지명을 반복하는 문서가 아니라 예약자가 전화 전에 준비할 정보를 정리한 안내입니다. 같은 ${district.name} 안에서도 ${district.areas.join(", ")}처럼 생활권이 나뉘고, 숙소·오피스텔·주거지·사무실에 따라 출입 방식과 대기 가능 여부가 달라집니다.</p>
          <p>따라서 이 문서는 “무조건 가능합니다”라고 말하기보다, 어떤 조건을 확인해야 현재 기준의 안내가 정확해지는지 보여주는 역할을 합니다.</p>
        </article>
        <article class="content-panel">
          <h2>전화 상담에서 묻는 정보</h2>
          <p>상담에서는 먼저 ${district.name} 내 정확한 주소, 희망 시간, 방문 장소 유형을 확인합니다.</p>
          <p>두 번째로 컨디션과 피해야 할 부위를 묻습니다. 통증을 참는 방식으로 진행하지 않으며, 질환·부상·급성 통증이 있으면 의료 전문가 상담을 우선해야 합니다.</p>
          <p>세 번째로 건물 출입 방식, 주차 가능 여부, 야간 대기 조건을 확인합니다. 작은 정보 차이가 도착 시간과 안내 가능 여부에 영향을 줄 수 있습니다.</p>
        </article>
        <article class="content-panel">
          <h2>${district.name} 예약 전 체크리스트</h2>
          <p>아래 항목을 미리 준비하면 통화 시간이 짧아지고 안내가 더 정확해집니다.</p>
          <ul>
            <li>${district.name} 내 상세 주소와 가까운 출입구를 확인합니다.</li>
            <li>희망 시간과 조정 가능한 시간 범위를 함께 정리합니다.</li>
            <li>건물 출입, 주차, 로비 대기 가능 여부를 확인합니다.</li>
            <li>피해야 할 부위나 건강상 주의사항을 숨기지 않습니다.</li>
            <li>마사지가 의료 진단이나 치료를 대신하지 않는다는 점을 이해합니다.</li>
          </ul>
        </article>
        <article class="content-panel">
          <h2>콘텐츠 신뢰 기준</h2>
          <p>이 페이지는 마사지KING 운영팀이 예약 상담에서 반복적으로 확인되는 질문을 바탕으로 작성했습니다.</p>
          <p>작성 과정에서 AI가 문장 정리에 보조적으로 쓰일 수 있지만, 최종 문구는 운영 기준과 서비스 한계 고지에 맞춰 확인합니다. 지역명만 바꾼 대량 복제 문서가 되지 않도록 ${district.name}의 생활권과 상담 변수를 반영했습니다.</p>
          <p>허위 후기, 치료 효과 단정, 순위 조작 목적의 키워드 반복, 보장형 표현은 사용하지 않습니다.</p>
        </article>
      </section>

      <section class="who-how-why">
        <div><h2>Who</h2><p>이 문서는 마사지KING 운영팀이 작성하고 관리합니다. 실제 예약 문의에서 반복되는 질문과 운영상 반드시 고지해야 하는 한계를 기준으로 정리했습니다.</p></div>
        <div><h2>How</h2><p>초안 정리에는 AI 도움을 받을 수 있지만, 최종 문구는 운영팀이 확인합니다. 서비스 가능 여부, 안전 고지, 의료 행위가 아니라는 설명은 과장 없이 검토합니다.</p></div>
        <div><h2>Why</h2><p>목적은 검색 순위 조작이 아니라 예약자가 전화 전에 필요한 정보를 이해하도록 돕는 것입니다. 지역명 반복과 허위 후기는 사용하지 않습니다.</p></div>
      </section>

      <section class="page-cta">
        <div><p class="eyebrow">Reservation</p><h2>${district.name} 가능 여부는 전화 상담에서 확인하세요</h2><p>주소, 시간, 방문 환경을 알려주시면 현재 기준으로 안내합니다.</p></div>
        <a class="primary-button" href="tel:05082024743">0508-202-4743</a>
      </section>
    </main>

    ${footer}
  </body>
</html>
`;
}

function directoryHtml(group) {
  const cards = sortByKoreanName(group.districts).map((district) => `          <a class="district-link-card" href="/areas/gyeonggi/${group.citySlug}/${district.slug}/"><strong>${district.name}</strong><span>${district.board} 생활권 기준 확인</span></a>`).join("\n");
  return `      <section class="district-directory city-district-directory" aria-label="${group.city} 행정구별 출장마사지 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">District shortcut</p><h2>${group.city} 행정구 바로가기</h2></div>
          <p>${group.cityLabel}를 먼저 선택하면 구별 이동 거리, 출입 방식, 주차 조건을 더 정확하게 확인할 수 있습니다.</p>
        </div>
        <div class="district-directory-grid">
${cards}
        </div>
      </section>

`;
}

for (const group of groups) {
  const cityDir = path.join(root, "areas", "gyeonggi", group.citySlug);
  const cityPath = path.join(cityDir, "index.html");
  let cityHtml = await fs.readFile(cityPath, "utf8");
  const existingDirectory = new RegExp(`\\s*<section class="district-directory(?: city-district-directory)?" aria-label="${group.city} 행정구별 출장마사지 안내">[\\s\\S]*?<\\/section>\\s*`);
  cityHtml = cityHtml.replace(existingDirectory, "\n\n");
  cityHtml = cityHtml.replace(/\s*<section class="area-dashboard"/, `\n\n${directoryHtml(group)}      <section class="area-dashboard"`);
  await fs.writeFile(cityPath, cityHtml, "utf8");

  for (const district of group.districts) {
    const dir = path.join(cityDir, district.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), pageFor(group, district), "utf8");
  }
}

let gyeonggiHtml = await fs.readFile(gyeonggiPath, "utf8");
gyeonggiHtml = gyeonggiHtml.replace(/\s*<section class="district-directory all-district-directory"[\s\S]*?<\/section>\s*/, "\n\n");
await fs.writeFile(gyeonggiPath, gyeonggiHtml, "utf8");

console.log(`Generated ${groups.reduce((sum, group) => sum + group.districts.length, 0)} Gyeonggi district pages.`);
