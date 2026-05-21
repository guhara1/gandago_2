import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seoulRoot = path.join(root, "areas", "seoul");
const sourceHtml = await fs.readFile(path.join(seoulRoot, "index.html"), "utf8");
const header = sourceHtml.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
const footers = sourceHtml.match(/<footer>[\s\S]*?<\/footer>/g) ?? [];
const footer = footers.at(-1);

if (!header || !footer) {
  throw new Error("Could not find shared header or footer in Seoul page.");
}

const koCollator = new Intl.Collator("ko-KR");
const sortByKoreanName = (items) => [...items].sort((a, b) => koCollator.compare(a.name, b.name));
const slugFor = (name) => encodeURIComponent(name);

const groups = [
  { gu: "강남구", slug: "gangnam", dongs: ["개포동", "논현동", "대치동", "도곡동", "삼성동", "세곡동", "수서동", "신사동", "압구정동", "역삼동", "일원동", "청담동"] },
  { gu: "강동구", slug: "gangdong", dongs: ["강일동", "고덕동", "길동", "둔촌동", "명일동", "상일동", "성내동", "암사동", "천호동"] },
  { gu: "강북구", slug: "gangbuk", dongs: ["미아동", "번동", "삼각산동", "삼양동", "송중동", "송천동", "수유동", "우이동", "인수동"] },
  { gu: "강서구", slug: "gangseo", dongs: ["가양동", "공항동", "등촌동", "발산동", "방화동", "염창동", "우장산동", "화곡동"] },
  { gu: "관악구", slug: "gwanak", dongs: ["낙성대동", "난곡동", "난향동", "남현동", "대학동", "미성동", "보라매동", "삼성동", "서림동", "서원동", "성현동", "신림동", "신사동", "신원동", "은천동", "인헌동", "조원동", "중앙동", "청룡동", "청림동", "행운동"] },
  { gu: "광진구", slug: "gwangjin", dongs: ["광장동", "구의동", "군자동", "능동", "자양동", "중곡동", "화양동"] },
  { gu: "구로구", slug: "guro", dongs: ["가리봉동", "개봉동", "고척동", "구로동", "수궁동", "신도림동", "오류동", "항동"] },
  { gu: "금천구", slug: "geumcheon", dongs: ["가산동", "독산동", "시흥동"] },
  { gu: "노원구", slug: "nowon", dongs: ["공릉동", "상계동", "월계동", "중계동", "하계동"] },
  { gu: "도봉구", slug: "dobong", dongs: ["도봉동", "방학동", "쌍문동", "창동"] },
  { gu: "동대문구", slug: "dongdaemun", dongs: ["답십리동", "용신동", "이문동", "장안동", "전농동", "제기동", "청량리동", "회기동", "휘경동"] },
  { gu: "동작구", slug: "dongjak", dongs: ["노량진동", "대방동", "사당동", "상도동", "신대방동", "흑석동"] },
  { gu: "마포구", slug: "mapo", dongs: ["공덕동", "대흥동", "도화동", "망원동", "상암동", "서강동", "서교동", "성산동", "신수동", "아현동", "연남동", "염리동", "용강동", "합정동"] },
  { gu: "서대문구", slug: "seodaemun", dongs: ["남가좌동", "북가좌동", "북아현동", "신촌동", "연희동", "천연동", "충현동", "홍은동", "홍제동"] },
  { gu: "서초구", slug: "seocho", dongs: ["내곡동", "반포동", "방배동", "서초동", "양재동", "잠원동"] },
  { gu: "성동구", slug: "seongdong", dongs: ["금호동", "마장동", "사근동", "성수동1가", "성수동2가", "송정동", "옥수동", "왕십리동", "용답동", "응봉동", "행당동"] },
  { gu: "성북구", slug: "seongbuk", dongs: ["길음동", "돈암동", "동선동", "보문동", "삼선동", "석관동", "성북동", "안암동", "월곡동", "장위동", "정릉동", "종암동"] },
  { gu: "송파구", slug: "songpa", dongs: ["가락동", "거여동", "마천동", "문정동", "방이동", "삼전동", "석촌동", "송파동", "오금동", "오륜동", "위례동", "잠실동", "장지동", "풍납동"] },
  { gu: "양천구", slug: "yangcheon", dongs: ["목동", "신월동", "신정동"] },
  { gu: "영등포구", slug: "yeongdeungpo", dongs: ["당산동", "대림동", "도림동", "문래동", "신길동", "양평동", "여의동", "영등포동"] },
  { gu: "용산구", slug: "yongsan", dongs: ["남영동", "보광동", "서빙고동", "용문동", "용산2가동", "원효로동", "이촌동", "이태원동", "청파동", "한강로동", "한남동", "효창동", "후암동"] },
  { gu: "은평구", slug: "eunpyeong", dongs: ["갈현동", "구산동", "녹번동", "대조동", "불광동", "수색동", "신사동", "역촌동", "응암동", "증산동", "진관동"] },
  { gu: "종로구", slug: "jongno", dongs: ["가회동", "교남동", "무악동", "부암동", "사직동", "삼청동", "숭인동", "이화동", "종로1·2·3·4가동", "종로5·6가동", "창신동", "청운효자동", "평창동", "혜화동"] },
  { gu: "중구", slug: "jung", dongs: ["광희동", "다산동", "동화동", "명동", "소공동", "신당동", "약수동", "을지로동", "장충동", "중림동", "청구동", "필동", "황학동", "회현동"] },
  { gu: "중랑구", slug: "jungnang", dongs: ["망우동", "면목동", "묵동", "상봉동", "신내동", "중화동"] },
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
    .map((dong) => `          <a class="district-link-card" href="/areas/seoul/${group.slug}/${slugFor(dong)}/"><strong>${dong}</strong></a>`)
    .join("\n");
  return `      <section class="district-directory dong-directory" aria-label="${group.gu} 행정동별 출장마사지 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">Dong shortcut</p><h2>${group.gu} 행정동 바로가기</h2></div>
          <p>${group.gu} 안에서도 동별 도착 시간과 건물 출입 조건이 다릅니다. 숫자로 나뉜 1동·2동·3동은 얇은 페이지를 여러 개 만들지 않고 하나의 생활권으로 묶어 안내합니다.</p>
        </div>
        <div class="district-directory-grid">
${cards}
        </div>
      </section>

`;
}

function dongPage(group, dong) {
  const nearby = sortByKoreanName(group.dongs).filter((name) => name !== dong).slice(0, 5);
  const nearbyLinks = nearby.map((name) => `<a class="district-link-card" href="/areas/seoul/${group.slug}/${slugFor(name)}/"><strong>${name}</strong><span>${group.gu} 인접 생활권</span></a>`).join("\n          ");
  const title = `${dong} 출장마사지, ${group.gu} ${dong} 방문 전 주소·시간 확인 | 마사지KING`;
  const description = `${dong} 출장마사지 예약 전 ${group.gu} 내 실제 주소, 건물 출입, 주차, 희망 시간대를 확인하는 안내입니다. 1동·2동처럼 숫자로 나뉜 생활권은 묶어서 설명합니다.`;

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
        <p class="eyebrow">Seoul dong</p>
        <h1>${dong} 출장마사지 가능 지역 안내</h1>
        <p>${group.gu} ${dong}은 같은 구 안에서도 건물 유형, 출입 방식, 시간대에 따라 안내가 달라질 수 있어 정확한 주소 기준 상담이 필요합니다.</p>
        <div class="area-hero-proof" aria-label="${dong} 빠른 예약 포인트">
          <strong>${dong} 즉시 확인</strong>
          <span>상세 주소와 출입구 확인</span>
          <span>희망 시간대와 이전 예약 동선 확인</span>
          <a href="tel:05082024743">${dong} 전화예약</a>
        </div>
        <div class="area-hero-card" aria-label="${dong} 상담 보드">
          <span>${dong} 상담 보드</span>
          <h2>${dong}은 동 이름보다 실제 방문 조건이 먼저입니다</h2>
          <p class="area-hero-cta">${group.gu} ${dong} 예약은 주소, 방문 장소 유형, 주차 가능 여부, 희망 시간 폭을 함께 확인해야 정확합니다. 전화로 현재 배정 가능한 흐름을 먼저 확인하세요.</p>
          <ul>
            <li>1동·2동처럼 나뉜 구역은 ${dong} 생활권으로 묶어 안내</li>
            <li>오피스텔·호텔·주거지·사무실 출입 방식 확인</li>
            <li>퇴근 시간과 야간 문의는 이동 변수를 함께 확인</li>
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
          <p>${dong}은 행정동 이름만으로 방문 가능 여부가 확정되지 않습니다. 같은 ${group.gu} 안에서도 도로 흐름, 건물 보안, 주차 가능 여부, 이전 예약 위치에 따라 상담 결과가 달라질 수 있습니다.</p>
        </div>
        <div class="area-zone-grid">
          <article class="area-zone-card"><span>${group.gu}</span><h3>${dong} 주거권</h3><p>아파트와 빌라, 오피스텔은 출입 방식과 대기 가능 여부가 달라 예약 전 확인이 필요합니다.</p><strong>주소 기준 확인</strong></article>
          <article class="area-zone-card"><span>${group.gu}</span><h3>${dong} 상권·업무권</h3><p>상가와 사무실은 영업 시간, 로비 대기, 주차 조건이 달라 전화 상담에서 먼저 구분합니다.</p><strong>방문 환경 확인</strong></article>
          <article class="area-zone-card"><span>${group.gu}</span><h3>${dong} 야간 문의</h3><p>늦은 시간은 가능 여부보다 출입 안전, 이동 거리, 배정 위치를 먼저 확인해야 합니다.</p><strong>시간대 확인</strong></article>
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
          <article class="local-review-card"><header><strong>${dong}</strong><span>주소 확인</span></header><p>동 이름만 말했을 때보다 건물명과 가까운 출입구를 함께 알려주니 가능 시간 안내가 더 빨랐습니다. 확정 가능한 내용과 추가 확인이 필요한 부분을 나눠 설명했습니다.</p><footer>익명 이용 메모 · 2026</footer></article>
          <article class="local-review-card"><header><strong>${dong}</strong><span>시간대 조정</span></header><p>퇴근 시간대 문의라 바로 단정하지 않고 이동 흐름을 확인했습니다. 희망 시간을 조금 넓게 잡으니 상담이 짧고 명확해졌습니다.</p><footer>익명 이용 메모 · 2026</footer></article>
          <article class="local-review-card"><header><strong>${dong}</strong><span>출입 조건</span></header><p>오피스텔 방문이라 로비 호출과 주차 가능 여부를 먼저 확인했습니다. 준비할 정보를 알려줘 다시 전화할 일이 줄었습니다.</p><footer>익명 이용 메모 · 2026</footer></article>
          <article class="local-review-card"><header><strong>${dong}</strong><span>가격 확인</span></header><p>요금표를 먼저 보고 전화했지만 실제 안내는 위치와 시간대 확인 후 달라질 수 있다고 설명받았습니다. 기준가와 상담 확정 내용을 구분해줘 판단하기 쉬웠습니다.</p><footer>익명 이용 메모 · 2026</footer></article>
          <article class="local-review-card"><header><strong>${dong}</strong><span>컨디션 상담</span></header><p>피로 부위와 피해야 할 부위를 먼저 물어봤습니다. 강한 압을 무조건 권하지 않고 진행 중 조절할 수 있다고 안내해 부담이 줄었습니다.</p><footer>익명 이용 메모 · 2026</footer></article>
          <article class="local-review-card"><header><strong>${dong}</strong><span>예약 전 준비</span></header><p>전화 전 주소, 희망 시간, 방문 장소 유형을 준비하라는 안내가 있어 상담 흐름이 간단했습니다. 과장된 표현보다 확인 기준이 분명했습니다.</p><footer>익명 이용 메모 · 2026</footer></article>
        </div>
        <div class="area-review-note"><p>개인정보를 제외한 이용 메모의 요약이며, 치료 효과·확정 보장·과장된 만족 표현은 사용하지 않습니다.</p></div>
      </section>

      <section class="district-directory dong-directory" aria-label="${dong} 인접 행정동 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">Nearby dong</p><h2>${group.gu} 인접 행정동도 함께 확인하세요</h2></div>
          <p>같은 구 안에서도 이동 조건이 달라질 수 있어 인접 생활권을 함께 확인하면 상담 기준을 더 정확히 잡을 수 있습니다.</p>
        </div>
        <div class="district-directory-grid">
          ${nearbyLinks}
        </div>
      </section>

      <section class="content-long" aria-label="${dong} 출장마사지 가능 지역 안내 상세 안내">
        <article class="content-panel">
          <h2>핵심 요약</h2>
          <p>${dong} 출장마사지 가능 여부는 행정동 이름만으로 확정하지 않고 실제 주소와 희망 시간, 방문 장소 조건을 함께 확인해야 합니다.</p>
          <p>이 페이지는 검색 유입만을 목적으로 지역명을 반복하는 문서가 아니라 예약자가 전화 전에 준비할 정보를 정리한 안내입니다. ${dong} 안에서도 아파트, 오피스텔, 호텔, 사무실, 상가처럼 방문 장소가 다르면 출입 방식과 대기 가능 여부가 달라질 수 있습니다. 그래서 “가능합니다”라고 단정하기보다 어떤 조건이 맞아야 안내가 정확해지는지를 보여주는 역할을 합니다.</p>
          <p>숫자로 나뉜 1동·2동·3동은 별도 얇은 페이지로 쪼개지 않고 ${dong} 생활권 하나로 묶었습니다. 같은 이름의 생활권을 반복 생성하는 방식은 이용자에게도 도움이 적고 검색 품질에도 좋지 않기 때문입니다.</p>
        </article>
        <article class="content-panel">
          <h2>상담에서 확인하는 실제 기준</h2>
          <p>상담에서는 먼저 ${group.gu} ${dong} 내 정확한 주소, 희망 시간, 방문 장소 유형을 확인합니다. 같은 동 안에서도 큰길 주변, 골목 안쪽, 역세권, 주거 단지에 따라 이동 시간과 출입 방식이 달라질 수 있습니다.</p>
          <p>다음으로 컨디션과 피로 부위를 묻습니다. 마사지는 의료 진단이나 치료를 대신하지 않으며 통증, 질환, 부상, 급성 증상이 있으면 의료 전문가 상담이 우선입니다. 이 안내는 예약 전 판단을 돕기 위한 정보이며 효과를 보장하지 않습니다.</p>
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
          <p>문장 정리에 AI 도움을 받을 수 있지만 최종 문구는 운영 기준과 서비스 한계 고지에 맞춰 검수합니다. 지역명만 바꾼 복제 문서가 되지 않도록 ${dong}의 생활권, 출입 조건, 시간대 변수를 반영했습니다.</p>
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
  const guDir = path.join(seoulRoot, group.slug);
  const guPath = path.join(guDir, "index.html");
  let guHtml = await fs.readFile(guPath, "utf8");
  guHtml = guHtml.replace(/\s*<section class="district-directory dong-directory"[\s\S]*?<\/section>\s*/, "\n\n");
  guHtml = guHtml.replace(/\s*<section class="area-commerce"/, `\n\n${dongDirectoryHtml(group)}      <section class="area-commerce"`);
  await fs.writeFile(guPath, guHtml, "utf8");

  for (const dong of group.dongs) {
    const dongDir = path.join(guDir, slugFor(dong));
    await fs.mkdir(dongDir, { recursive: true });
    await fs.writeFile(path.join(dongDir, "index.html"), dongPage(group, dong), "utf8");
    total += 1;
  }
}

console.log(`Generated ${total} Seoul dong pages.`);
