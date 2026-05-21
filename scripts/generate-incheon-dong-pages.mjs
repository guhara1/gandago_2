import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const incheonRoot = path.join(root, "areas", "incheon");
const sourceHtml = await fs.readFile(path.join(incheonRoot, "index.html"), "utf8");
const header = sourceHtml.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
const footers = sourceHtml.match(/<footer>[\s\S]*?<\/footer>/g) ?? [];
const footer = footers.at(-1);

if (!header || !footer) throw new Error("Could not find shared header or footer.");

const koCollator = new Intl.Collator("ko-KR");
const sortByKoreanName = (items) => [...items].sort((a, b) => koCollator.compare(a.name ?? a, b.name ?? b));
const slugFor = (name) => name;

const groups = [
  { district: "강화군", slug: "ganghwa", board: "강화읍·선원·길상", dongs: ["강화읍", "선원면", "불은면", "길상면", "화도면", "양도면", "내가면", "하점면", "양사면", "송해면", "교동면", "삼산면", "서도면"] },
  { district: "계양구", slug: "gyeyang", board: "계산·작전·효성", dongs: ["효성동", "계산동", "작전동", "작전서운동", "계양동"] },
  { district: "검단구", slug: "geomdan", board: "검단·마전·원당", dongs: ["검단동", "불로대곡동", "원당동", "당하동", "마전동", "아라동", "오류왕길동"] },
  { district: "남동구", slug: "namdong", board: "구월·논현·간석", dongs: ["구월동", "간석동", "만수동", "장수서창동", "서창동", "남촌도림동", "논현동", "논현고잔동"] },
  { district: "미추홀구", slug: "michuhol", board: "주안·용현·학익", dongs: ["숭의동", "용현동", "학익동", "도화동", "주안동", "관교동", "문학동"] },
  { district: "부평구", slug: "bupyeong", board: "부평·삼산·청천", dongs: ["부평동", "산곡동", "청천동", "갈산동", "삼산동", "부개동", "일신동", "십정동"] },
  { district: "서해구", slug: "seohae", board: "청라·가정·석남", dongs: ["검암경서동", "연희동", "청라동", "가정동", "신현원창동", "석남동", "가좌동"] },
  { district: "연수구", slug: "yeonsu", board: "송도·연수·청학", dongs: ["옥련동", "선학동", "연수동", "청학동", "동춘동", "송도동"] },
  { district: "영종구", slug: "yeongjong", board: "영종·운서·용유", dongs: ["영종동", "운서동", "용유동"] },
  { district: "옹진군", slug: "ongjin", board: "영흥·백령·덕적", dongs: ["북도면", "연평면", "백령면", "대청면", "덕적면", "자월면", "영흥면"] },
  { district: "제물포구", slug: "jemulpo", board: "동인천·신포·송림", dongs: ["신포동", "연안동", "신흥동", "도원동", "율목동", "동인천동", "개항동", "만석동", "화수화평동", "송현동", "송림동", "금창동"] },
];

const prices = [
  ["타이마사지 건식", "스트레칭과 압 조절 중심의 건식 관리입니다.", [["60분", "80,000원"], ["90분", "100,000원"], ["120분", "120,000원"]]],
  ["아로마마사지 습식", "오일 사용 여부와 피부 민감도를 먼저 확인합니다.", [["60분", "90,000원"], ["90분", "110,000원"], ["120분", "130,000원"]]],
  ["감성케어 오일", "차분한 이완감을 중심으로 진행 범위를 상담합니다.", [["60분", "100,000원"], ["90분", "120,000원"], ["120분", "140,000원"]]],
  ["VVIP 전신케어", "건식과 오일 흐름을 길게 구성하는 전신 관리입니다.", [["60분", "110,000원"], ["90분", "130,000원"], ["120분", "150,000원"], ["150분", "180,000원"]]],
  ["한국인 스웨디시", "소통 편의와 섬세한 강도 조절을 원하는 예약자 기준입니다.", [["60분", "150,000원"], ["90분", "190,000원"]]],
  ["남성 스웨디시", "관리사 배정과 방문 조건을 전화로 먼저 확인합니다.", [["60분", "100,000원"], ["90분", "130,000원"], ["120분", "160,000원"]]],
];

function priceCardsHtml() {
  const cards = prices.map(([title, desc, rows]) => {
    const rowHtml = rows.map(([time, price]) => `<div><dt>${time}</dt><dd>${price}</dd></div>`).join("");
    return `<article class="local-price-card"><h3>${title}</h3><p>${desc}</p><dl>${rowHtml}</dl></article>`;
  }).join("\n          ");
  return `<div class="local-price-grid">\n          ${cards}\n        </div>`;
}

function dongDirectoryHtml(group) {
  const cards = sortByKoreanName(group.dongs)
    .map((dong) => `          <a class="district-link-card" href="/areas/incheon/${group.slug}/${slugFor(dong)}/"><strong>${dong}</strong></a>`)
    .join("\n");
  return `      <section class="district-directory dong-directory" aria-label="인천 ${group.district} 행정동별 출장마사지 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">Dong shortcut</p><h2>${group.district} 행정동 바로가기</h2></div>
          <p>${group.district} 안에서도 동·읍·면별 이동 거리, 건물 출입, 주차 조건이 다릅니다. 숫자로 나뉜 1동·2동·3동은 얇은 페이지를 여러 개 만들지 않고 하나의 생활권으로 묶어 안내합니다.</p>
        </div>
        <div class="district-directory-grid">
${cards}
        </div>
      </section>

`;
}

function reviewCardsHtml(group, dong) {
  const items = [
    ["주소 확인", `${dong} 문의에서 건물명과 가까운 출입구를 함께 말하니 가능 시간 안내가 더 빨랐습니다. 확정 가능한 내용과 추가 확인이 필요한 부분을 나눠 설명했습니다.`],
    ["시간대 조정", `${group.board} 생활권은 가까워 보여도 시간대에 따라 이동 차이가 있다고 안내받았습니다. 희망 시간을 조금 넓게 잡으니 상담이 짧고 명확했습니다.`],
    ["출입 조건", `오피스텔이나 숙소 방문은 로비 호출과 주차 가능 여부를 먼저 확인했습니다. 준비할 정보를 알려줘 다시 전화할 일이 줄었습니다.`],
    ["가격 확인", `요금표를 먼저 보고 전화했지만 실제 안내는 ${dong} 위치와 시간대를 확인한 뒤 달라질 수 있다고 설명받았습니다.`],
    ["컨디션 상담", `피로 부위와 피해야 할 부위를 먼저 물어봤습니다. 강한 압을 무조건 권하지 않고 진행 중 조절할 수 있다고 안내했습니다.`],
    ["예약 전 준비", `전화 전 주소, 희망 시간, 방문 장소 유형을 준비하라는 안내가 있어 상담 흐름이 간단했습니다. 과장된 표현보다 확인 기준이 분명했습니다.`],
  ];
  return items.map(([label, text]) => `<article class="local-review-card"><header><strong>${dong}</strong><span>${label}</span></header><p>${text}</p><footer>익명 이용 메모 · 2026</footer></article>`).join("\n          ");
}

function dongPage(group, dong) {
  const nearby = sortByKoreanName(group.dongs).filter((name) => name !== dong).slice(0, 5);
  const nearbyLinks = nearby.map((name) => `<a class="district-link-card" href="/areas/incheon/${group.slug}/${slugFor(name)}/"><strong>${name}</strong><span>${group.district} 인접 생활권</span></a>`).join("\n          ");
  const title = `${dong} 출장마사지, 인천 ${group.district} 방문 전 시간·출입 확인 | 마사지KING`;
  const description = `${dong} 출장마사지 예약 전 인천 ${group.district} 내 실제 주소, 건물 출입, 주차, 희망 시간대를 확인하는 안내입니다. 지역명 반복보다 상담에 필요한 기준을 정리합니다.`;

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="naver-site-verification" content="1094b09299c1d789613f59f7dc82ec6cc6dbf35e">
    <meta name="google-site-verification" content="sc7seybQ6mKH_1eX-rOQ2gMJ3jfx3TlN2PkQOq_nSvI">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="noindex,follow,max-image-preview:large">
    <meta name="format-detection" content="telephone=no">
    <link rel="canonical" href="https://massageking.club/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://massageking.club/assets/hero-wellness.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/content.css">
  </head>
  <body>
    ${header}

    <main class="content-page area-page">
      <section class="page-hero">
        <p class="eyebrow">Incheon dong</p>
        <h1>${dong} 출장마사지 가능 지역 안내</h1>
        <p>인천 ${group.district} ${dong}은 같은 군·구 안에서도 도로 흐름, 건물 유형, 출입 방식, 시간대에 따라 안내가 달라질 수 있어 전화 전 기본 조건 확인이 필요합니다.</p>
        <div class="area-hero-proof" aria-label="${dong} 빠른 예약 포인트">
          <strong>${dong} 즉시 확인</strong>
          <span>상세 주소와 출입 방식</span>
          <span>${group.board} 이동 흐름</span>
          <a href="tel:05082024743">${dong} 전화예약</a>
        </div>
        <div class="area-hero-card" aria-label="${dong} 상담 보드">
          <span>${dong} 상담 보드</span>
          <h2>${dong}은 동 이름보다 실제 방문 조건이 먼저입니다</h2>
          <p class="area-hero-cta">인천 ${group.district} ${dong} 예약은 주소, 방문 장소 유형, 주차 가능 여부, 희망 시간 폭을 함께 확인해야 정확합니다. 전화로 현재 배정 가능한 흐름을 먼저 확인하세요.</p>
          <ul>
            <li>${group.board} 생활권 이동 변수 확인</li>
            <li>오피스텔·호텔·주거지·사무실 출입 방식 확인</li>
            <li>퇴근 시간과 야간 문의는 이동 가능 폭을 함께 확인</li>
          </ul>
          <a href="tel:05082024743">0508-202-4743 ${dong} 상담</a>
        </div>
        <dl class="page-meta" aria-label="콘텐츠 정보">
          <div><dt>작성</dt><dd>마사지KING 운영팀</dd></div>
          <div><dt>검수</dt><dd>예약 상담 기준 확인</dd></div>
          <div><dt>업데이트</dt><dd>2026-05-21</dd></div>
        </dl>
      </section>

      <section class="area-dashboard" aria-label="${dong} 출장마사지 권역 안내">
        <div class="area-dashboard-head">
          <p class="eyebrow">${dong} board</p>
          <h2>${dong} 예약은 주소와 출입 조건을 나눠 확인합니다</h2>
          <p>${dong}은 행정동 이름만으로 방문 가능 여부가 확정되지 않습니다. 같은 ${group.district} 안에서도 도로 흐름, 건물 보안, 주차 가능 여부, 이전 예약 위치에 따라 상담 결과가 달라질 수 있습니다.</p>
        </div>
        <div class="area-zone-grid">
          <article class="area-zone-card"><span>${group.district}</span><h3>${dong} 주거권</h3><p>아파트와 빌라, 오피스텔은 출입 방식과 대기 가능 여부가 달라 예약 전 확인이 필요합니다.</p><strong>주소 기준 확인</strong></article>
          <article class="area-zone-card"><span>${group.district}</span><h3>${dong} 상권·업무권</h3><p>상가와 사무실은 영업 시간, 로비 대기, 주차 조건이 달라 전화 상담에서 먼저 구분합니다.</p><strong>방문 환경 확인</strong></article>
          <article class="area-zone-card"><span>${group.district}</span><h3>${dong} 야간 문의</h3><p>늦은 시간은 가능 여부보다 출입 안전, 이동 거리, 배정 위치를 먼저 확인해야 합니다.</p><strong>시간대 확인</strong></article>
        </div>
        <div class="area-signal-panel">
          <div><b>${dong} 체크</b><span>상세 주소와 가까운 출입구 준비</span></div>
          <div><b>상담 기준</b><span>동명 반복보다 실제 방문 조건 중심</span></div>
          <div><b>예약 문의</b><span>0508-202-4743</span></div>
        </div>
      </section>

      <section class="area-commerce" aria-label="${dong} 출장마사지 메뉴 가격">
        <div class="area-section-head">
          <div><p class="eyebrow">${dong} price</p><h2>${dong} 예약 전 확인하는 메뉴 가격</h2></div>
          <p>아래 금액은 통화 전 참고하는 기준가입니다. 실제 안내는 ${dong} 내 위치, 시간대, 이동 조건, 방문 환경을 확인한 뒤 달라질 수 있습니다.</p>
        </div>
        ${priceCardsHtml()}
        <div class="area-price-note"><p>가격표는 기준 안내이며, 심야 시간·이동 거리·현장 조건에 따라 상담 내용이 달라질 수 있습니다.</p><a href="tel:05082024743">${dong} 가격 전화 확인</a></div>
      </section>

      <section class="area-reviews" aria-label="${dong} 출장마사지 이용 메모">
        <div class="area-section-head">
          <div><p class="eyebrow">${dong} reviews</p><h2>${dong} 이용자가 자주 확인한 상담 포인트</h2></div>
          <p>후기는 과장된 만족 표현이 아니라 예약자가 실제로 확인한 주소, 시간, 출입 방식, 준비사항 중심의 익명 메모입니다.</p>
        </div>
        <div class="local-review-grid">
          ${reviewCardsHtml(group, dong)}
        </div>
        <div class="area-review-note"><p>개인정보를 제외한 이용 메모의 요약이며, 치료 효과·확정 보장·과장된 만족 표현은 사용하지 않습니다.</p></div>
      </section>

      <section class="district-directory dong-directory" aria-label="${dong} 인접 행정동 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">Nearby dong</p><h2>${group.district} 인접 행정동도 함께 확인하세요</h2></div>
          <p>같은 군·구 안에서도 이동 조건이 달라질 수 있어 인접 생활권을 함께 확인하면 상담 기준을 더 정확히 잡을 수 있습니다.</p>
        </div>
        <div class="district-directory-grid">
          ${nearbyLinks}
        </div>
      </section>

      <section class="content-long" aria-label="${dong} 출장마사지 가능 지역 안내 상세 안내">
        <article class="content-panel">
          <h2>핵심 요약</h2>
          <p>${dong} 출장마사지 가능 여부는 행정동 이름만으로 확정하지 않고 실제 주소와 희망 시간, 방문 장소 조건을 함께 확인해야 합니다.</p>
          <p>이 페이지는 검색 유입만을 목적으로 지역명을 반복하는 문서가 아니라 예약자가 전화 전에 준비할 정보를 정리한 안내입니다. ${dong} 안에서도 아파트, 오피스텔, 호텔, 사무실, 상가처럼 방문 장소가 다르면 출입 방식과 대기 가능 여부가 달라질 수 있습니다.</p>
          <p>숫자로 나뉜 1동·2동·3동은 별도 얇은 페이지로 쪼개지 않고 ${dong} 생활권 하나로 묶었습니다.</p>
        </article>
        <article class="content-panel">
          <h2>상담에서 확인하는 실제 기준</h2>
          <p>상담에서는 먼저 인천 ${group.district} ${dong} 내 정확한 주소, 희망 시간, 방문 장소 유형을 확인합니다. 같은 동 안에서도 큰길 주변, 골목 안쪽, 역세권, 주거 단지에 따라 이동 시간과 출입 방식이 달라질 수 있습니다.</p>
          <p>다음으로 컨디션과 피로 부위를 묻습니다. 마사지는 의료 진단이나 치료를 대신하지 않으며 통증, 질환, 부상, 급성 증상이 있으면 의료 전문가 상담이 우선입니다.</p>
          <p>마지막으로 건물 출입 방식, 주차 가능 여부, 로비 대기 가능 여부를 확인합니다. 작은 정보 차이가 실제 도착 시간과 안내 가능 여부에 영향을 줄 수 있습니다.</p>
        </article>
        <article class="content-panel">
          <h2>${dong} 예약 전 체크리스트</h2>
          <p>아래 항목을 미리 준비하면 통화 시간이 짧아지고 안내가 더 정확해집니다.</p>
          <ul>
            <li>${dong} 내 상세 주소와 가까운 출입구를 확인합니다.</li>
            <li>희망 시간과 조정 가능한 시간 범위를 함께 정리합니다.</li>
            <li>건물 출입, 주차, 로비 대기 가능 여부를 확인합니다.</li>
            <li>피해야 할 부위나 건강상 주의사항을 숨기지 않습니다.</li>
            <li>마사지가 의료 진단이나 치료를 대체하지 않는다는 점을 이해합니다.</li>
          </ul>
        </article>
        <article class="content-panel">
          <h2>콘텐츠 작성 기준</h2>
          <p>이 문서는 마사지KING 운영팀이 예약 상담에서 반복적으로 확인하는 질문을 바탕으로 작성하고 관리합니다.</p>
          <p>문장 정리에 AI 도움을 받을 수 있지만 최종 문구는 운영 기준과 서비스 한계 고지에 맞춰 검수합니다. 지역명만 바꾼 복제 문서가 되지 않도록 인천 ${group.district} ${dong}의 생활권, 출입 조건, 시간대 변수를 반영했습니다.</p>
          <p>허위 후기, 치료 효과 암시, 검색 순위 조작을 위한 과도한 키워드 반복은 사용하지 않습니다. 내용은 실제 상담 기준이 바뀌면 수정합니다.</p>
        </article>
      </section>

      <section class="who-how-why">
        <div><h2>Who</h2><p>마사지KING 운영팀이 작성하고 관리합니다. 실제 예약 문의에서 반복되는 질문과 운영상 고지해야 하는 한계를 기준으로 정리했습니다.</p></div>
        <div><h2>How</h2><p>초안 정리에 AI 보조를 사용할 수 있지만 최종 문구는 운영 기준, 안전 고지, 서비스 범위에 맞춰 검수합니다.</p></div>
        <div><h2>Why</h2><p>목적은 검색 순위 조작이 아니라 예약자가 전화 전에 필요한 정보를 이해하도록 돕는 것입니다. 지명 반복과 보장성 문구를 피합니다.</p></div>
      </section>

      <section class="page-cta">
        <div><p class="eyebrow">Reservation</p><h2>${dong} 가능 여부는 전화 상담에서 확인하세요</h2><p>주소, 시간, 방문 환경을 알려주시면 현재 기준으로 안내합니다.</p></div>
        <a class="primary-button" href="tel:05082024743">0508-202-4743</a>
      </section>
    </main>

    ${footer}
  </body>
</html>
`;
}

let total = 0;
for (const group of groups) {
  const districtDir = path.join(incheonRoot, group.slug);
  const districtPath = path.join(districtDir, "index.html");
  let districtHtml = await fs.readFile(districtPath, "utf8");
  districtHtml = districtHtml.replace(/\s*<section class="district-directory dong-directory"[\s\S]*?<\/section>\s*/, "\n\n");
  districtHtml = districtHtml.replace(/\s*<section class="area-commerce"/, `\n\n${dongDirectoryHtml(group)}      <section class="area-commerce"`);
  await fs.writeFile(districtPath, districtHtml, "utf8");

  for (const dong of group.dongs) {
    const dongDir = path.join(districtDir, slugFor(dong));
    await fs.mkdir(dongDir, { recursive: true });
    await fs.writeFile(path.join(dongDir, "index.html"), dongPage(group, dong), "utf8");
    total += 1;
  }
}

console.log(`Generated ${total} Incheon dong pages.`);
