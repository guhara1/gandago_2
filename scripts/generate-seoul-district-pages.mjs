import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seoulPath = path.join(root, "areas", "seoul", "index.html");
const seoulHtml = await fs.readFile(seoulPath, "utf8");
const header = seoulHtml.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
const footers = seoulHtml.match(/<footer>[\s\S]*?<\/footer>/g) ?? [];
const footer = footers.at(-1);

if (!header || !footer) {
  throw new Error("Could not find shared header or footer in Seoul page.");
}

const koCollator = new Intl.Collator("ko-KR");
const sortByKoreanName = (items) => [...items].sort((a, b) => koCollator.compare(a.name, b.name));

const districts = [
  { name: "강남구", slug: "gangnam", board: "강남·역삼·삼성", intro: "강남구는 업무지구와 주거지가 촘촘히 겹쳐 퇴근 시간, 건물 출입, 주차 조건을 함께 확인해야 합니다.", points: ["오피스텔·호텔 출입 방식", "퇴근 시간 이동 변수", "강남대로·테헤란로 동선"], areas: ["강남·역삼", "삼성·대치", "청담·논현"] },
  { name: "강동구", slug: "gangdong", board: "천호·길동·고덕", intro: "강동구는 동부 생활권과 주거 단지가 넓게 이어져 실제 주소와 희망 시간을 기준으로 상담하는 편이 정확합니다.", points: ["주거 단지 출입", "동부권 이동 시간", "야간 방문 조건"], areas: ["천호·성내", "길동·둔촌", "고덕·명일"] },
  { name: "강북구", slug: "gangbuk", board: "수유·미아·번동", intro: "강북구는 주거지와 상권 사이 이동 차이가 있어 역명보다 상세 주소와 건물 출입 조건 확인이 중요합니다.", points: ["수유역 주변 동선", "주거지 출입 방식", "주차 가능 여부"], areas: ["수유", "미아", "번동"] },
  { name: "강서구", slug: "gangseo", board: "마곡·화곡·공항", intro: "강서구는 마곡 업무지구와 화곡 주거권, 공항 인근 동선이 달라 시간대별 배정 가능성을 먼저 봅니다.", points: ["마곡 업무지구", "화곡 주거권", "공항 인근 이동"], areas: ["마곡·발산", "화곡", "공항·방화"] },
  { name: "관악구", slug: "gwanak", board: "봉천·신림·낙성대", intro: "관악구는 생활권이 촘촘하고 골목 이동이 많아 정확한 주소, 주차, 방문 시간 확인이 필요합니다.", points: ["신림 상권", "봉천 주거지", "골목 이동 변수"], areas: ["신림", "봉천", "낙성대"] },
  { name: "광진구", slug: "gwangjin", board: "건대·구의·자양", intro: "광진구는 건대입구 상권과 한강 인접 주거지가 섞여 출입 방식과 시간대별 이동 차이를 함께 확인합니다.", points: ["건대 상권", "오피스텔 출입", "한강 인접 동선"], areas: ["화양·자양", "구의", "중곡"] },
  { name: "구로구", slug: "guro", board: "구로·신도림·가산 인접", intro: "구로구는 업무시설과 주거지가 섞여 있어 퇴근 시간대 이동, 건물 보안, 주차 여부가 상담의 핵심입니다.", points: ["업무지구 방문", "신도림 환승권", "주차·출입 확인"], areas: ["구로", "신도림", "개봉·오류"] },
  { name: "금천구", slug: "geumcheon", board: "가산·독산·시흥", intro: "금천구는 가산 업무권과 독산·시흥 주거권의 조건이 달라 방문 장소 유형을 먼저 구분합니다.", points: ["가산 업무지구", "독산 주거권", "야간 대기 조건"], areas: ["가산", "독산", "시흥"] },
  { name: "노원구", slug: "nowon", board: "상계·중계·공릉", intro: "노원구는 북부 주거권이 넓어 생활권과 시간대를 함께 봐야 실제 도착 가능 시간이 분명해집니다.", points: ["상계 주거권", "중계·하계 이동", "야간 출입"], areas: ["상계", "중계·하계", "공릉"] },
  { name: "도봉구", slug: "dobong", board: "창동·방학·쌍문", intro: "도봉구는 북부권 이동 거리와 주거지 출입 조건이 중요해, 상담 때 주소 기준으로 가능 여부를 확인합니다.", points: ["창동역 주변", "주거지 출입", "북부권 이동"], areas: ["창동", "방학", "쌍문"] },
  { name: "동대문구", slug: "dongdaemun", board: "청량리·장안·회기", intro: "동대문구는 역세권과 주거지가 밀집해 있어 방문 시간, 건물 유형, 대기 가능 여부를 함께 확인합니다.", points: ["청량리 역세권", "장안 주거권", "회기 대학가"], areas: ["청량리", "장안", "회기"] },
  { name: "동작구", slug: "dongjak", board: "사당·노량진·상도", intro: "동작구는 사당 환승권과 노량진·상도 생활권의 이동 흐름이 달라 희망 시간 조정이 중요합니다.", points: ["사당 환승권", "노량진 상권", "상도 주거지"], areas: ["사당", "노량진", "상도"] },
  { name: "마포구", slug: "mapo", board: "홍대·공덕·상암", intro: "마포구는 숙박시설, 업무지구, 주거지가 함께 있어 장소 유형에 따라 상담 기준이 달라집니다.", points: ["홍대·합정 상권", "공덕 업무권", "상암 이동"], areas: ["홍대·합정", "공덕", "상암"] },
  { name: "서대문구", slug: "seodaemun", board: "신촌·홍제·가좌", intro: "서대문구는 대학가와 주거지가 섞여 있어 시간대, 건물 출입, 주차 조건을 먼저 확인합니다.", points: ["신촌 대학가", "홍제 주거권", "가좌 이동"], areas: ["신촌", "홍제", "가좌"] },
  { name: "서초구", slug: "seocho", board: "서초·방배·양재", intro: "서초구는 업무시설과 고급 주거지가 혼재해 방문 장소의 보안, 주차, 시간대 조건을 함께 봅니다.", points: ["서초 업무권", "방배 주거권", "양재 이동"], areas: ["서초", "방배", "양재"] },
  { name: "성동구", slug: "seongdong", board: "왕십리·성수·금호", intro: "성동구는 성수 업무권과 왕십리·금호 생활권이 달라 실제 위치에 따라 안내가 달라질 수 있습니다.", points: ["성수 업무권", "왕십리 환승", "금호 주거지"], areas: ["성수", "왕십리", "금호"] },
  { name: "성북구", slug: "seongbuk", board: "성신·길음·정릉", intro: "성북구는 언덕과 주거지 이동 변수가 있어 주소, 주차, 출입 정보를 함께 확인해야 합니다.", points: ["성신여대 상권", "길음 주거권", "정릉 이동"], areas: ["성신·돈암", "길음", "정릉"] },
  { name: "송파구", slug: "songpa", board: "잠실·문정·가락", intro: "송파구는 잠실 상권과 문정 업무권, 주거 단지가 넓어 시간대와 건물 유형을 구분해 상담합니다.", points: ["잠실 상권", "문정 업무권", "가락·오금 주거지"], areas: ["잠실", "문정", "가락·오금"] },
  { name: "양천구", slug: "yangcheon", board: "목동·신정·신월", intro: "양천구는 목동 주거권과 신월·신정 생활권의 이동 조건이 달라 주소 기준 확인이 필요합니다.", points: ["목동 주거권", "신정 생활권", "신월 이동"], areas: ["목동", "신정", "신월"] },
  { name: "영등포구", slug: "yeongdeungpo", board: "여의도·문래·당산", intro: "영등포구는 여의도 업무지구와 문래·당산 생활권이 달라 퇴근 시간과 출입 조건이 중요합니다.", points: ["여의도 업무권", "문래 상권", "당산 주거권"], areas: ["여의도", "문래", "당산"] },
  { name: "용산구", slug: "yongsan", board: "한남·이태원·용산역", intro: "용산구는 호텔, 오피스, 주거지가 섞여 방문 장소 유형과 보안 출입 방식을 먼저 확인합니다.", points: ["호텔·숙소 방문", "오피스 출입", "용산역 인근"], areas: ["한남·이태원", "용산역", "효창·후암"] },
  { name: "은평구", slug: "eunpyeong", board: "불광·연신내·응암", intro: "은평구는 서북권 주거지가 넓어 생활권과 도로 흐름에 따라 가능 시간이 달라질 수 있습니다.", points: ["연신내 상권", "불광 이동", "응암 주거지"], areas: ["연신내", "불광", "응암"] },
  { name: "종로구", slug: "jongno", board: "광화문·종각·혜화", intro: "종로구는 도심 업무지와 숙박시설, 구도심 골목 동선이 섞여 방문 조건 확인이 중요합니다.", points: ["도심 업무권", "호텔 출입", "구도심 골목"], areas: ["광화문·종각", "혜화", "평창·부암"] },
  { name: "중구", slug: "jung", board: "명동·을지로·약수", intro: "중구는 업무시설과 호텔, 상업시설이 밀집해 있어 로비 대기, 출입 방식, 시간대 확인이 필요합니다.", points: ["호텔·상업시설", "을지로 업무권", "명동 이동"], areas: ["명동", "을지로", "약수"] },
  { name: "중랑구", slug: "jungnang", board: "상봉·면목·망우", intro: "중랑구는 동북권 주거지가 넓어 실제 주소와 희망 시간, 야간 출입 조건을 함께 확인합니다.", points: ["상봉 환승권", "면목 주거권", "망우 이동"], areas: ["상봉", "면목", "망우"] },
];

const seoMeta = {
  gangnam: {
    title: "강남구 출장마사지, 역삼·삼성 오피스텔 방문 전 확인할 것 | 마사지KING",
    description: "강남구는 테헤란로 퇴근 정체와 오피스텔 출입 방식이 변수입니다. 역삼·삼성·청담 예약 전 주소, 주차, 희망 시간을 먼저 확인하세요.",
  },
  gangdong: {
    title: "강동구 출장마사지, 천호·고덕 주거 단지 예약 체크 | 마사지KING",
    description: "강동구는 천호 상권과 고덕 주거 단지의 이동 조건이 다릅니다. 야간 출입, 주차 등록, 동부권 이동 시간을 상담에서 확인합니다.",
  },
  gangbuk: {
    title: "강북구 출장마사지, 수유·미아 주거지 방문 가능 시간 | 마사지KING",
    description: "강북구는 역세권과 주거 골목의 도착 조건이 달라집니다. 수유·미아·번동 예약 전 상세 주소와 건물 출입 방식을 확인하세요.",
  },
  gangseo: {
    title: "강서구 출장마사지, 마곡 업무지구와 화곡 주거권 상담 | 마사지KING",
    description: "강서구는 마곡, 화곡, 공항권 동선이 서로 다릅니다. 업무시설·숙소·주거지 방문 전 시간대와 출입 조건을 나눠 안내합니다.",
  },
  gwanak: {
    title: "관악구 출장마사지, 신림·봉천 골목 동선까지 확인 | 마사지KING",
    description: "관악구는 신림 상권과 봉천 주거지의 이동·주차 조건이 중요합니다. 방문 전 주소, 희망 시간, 피해야 할 부위를 함께 확인합니다.",
  },
  gwangjin: {
    title: "광진구 출장마사지, 건대입구·자양동 방문 전 확인사항 | 마사지KING",
    description: "광진구는 건대 상권, 구의·자양 주거지, 한강 인접 동선이 섞여 있습니다. 건물 유형과 시간대별 이동 차이를 확인하세요.",
  },
  guro: {
    title: "구로구 출장마사지, 구로·신도림 업무시설 방문 기준 | 마사지KING",
    description: "구로구는 업무지구와 환승권 이동이 겹치는 지역입니다. 퇴근 시간, 보안 출입, 주차 가능 여부를 기준으로 상담합니다.",
  },
  geumcheon: {
    title: "금천구 출장마사지, 가산·독산은 방문 장소부터 확인 | 마사지KING",
    description: "금천구는 가산 업무권과 독산·시흥 주거권의 조건이 다릅니다. 오피스, 숙소, 주거지 여부에 따라 안내가 달라집니다.",
  },
  nowon: {
    title: "노원구 출장마사지, 상계·중계·공릉 방문 가능 시간 | 마사지KING",
    description: "노원구는 북부 주거권이 넓어 생활권과 시간대를 함께 봐야 합니다. 야간 출입과 주소 기준 상담으로 가능 시간을 확인합니다.",
  },
  dobong: {
    title: "도봉구 출장마사지, 창동·쌍문·방학 가능 여부 확인 | 마사지KING",
    description: "도봉구는 북부권 이동 거리와 주거지 출입 조건이 중요합니다. 창동·방학·쌍문 예약 전 상세 주소와 시간을 확인하세요.",
  },
  dongdaemun: {
    title: "동대문구 출장마사지, 청량리·장안·회기 방문 전 상담 | 마사지KING",
    description: "동대문구는 역세권, 대학가, 주거지가 밀집한 지역입니다. 방문 시간, 대기 가능 여부, 건물 유형을 함께 확인합니다.",
  },
  dongjak: {
    title: "동작구 출장마사지, 사당·노량진·상도 예약 전 확인 | 마사지KING",
    description: "동작구는 사당 환승권과 노량진·상도 생활권의 흐름이 다릅니다. 희망 시간 조정과 출입 조건을 상담에서 확인하세요.",
  },
  mapo: {
    title: "마포구 출장마사지, 홍대 숙소와 공덕 업무권 예약 안내 | 마사지KING",
    description: "마포구는 홍대·합정 숙소, 공덕 업무권, 상암 이동 조건이 다릅니다. 장소 유형별 출입 방식과 가능 시간을 확인합니다.",
  },
  seodaemun: {
    title: "서대문구 출장마사지, 신촌·홍제·가좌 방문 전 체크 | 마사지KING",
    description: "서대문구는 대학가와 주거지가 섞여 시간대별 이동 차이가 있습니다. 신촌·홍제·가좌 상담 전 주소와 주차를 확인하세요.",
  },
  seocho: {
    title: "서초구 출장마사지, 서초·방배·양재 보안·주차 확인 | 마사지KING",
    description: "서초구는 업무시설과 주거지가 함께 있어 보안 출입과 주차 조건이 중요합니다. 서초·방배·양재별 가능 시간을 확인합니다.",
  },
  seongdong: {
    title: "성동구 출장마사지, 성수 업무권과 왕십리 생활권 상담 | 마사지KING",
    description: "성동구는 성수 업무권, 왕십리 환승권, 금호 주거지 조건이 다릅니다. 실제 위치에 맞춰 이동과 출입을 확인합니다.",
  },
  seongbuk: {
    title: "성북구 출장마사지, 성신·길음·정릉 주거지 방문 체크 | 마사지KING",
    description: "성북구는 언덕과 주거지 이동 변수가 있어 주소와 주차 확인이 필요합니다. 생활권별 도착 조건을 상담에서 안내합니다.",
  },
  songpa: {
    title: "송파구 출장마사지, 잠실·문정·가락 시간대 확인부터 | 마사지KING",
    description: "송파구는 잠실 상권, 문정 업무권, 가락·오금 주거지가 넓게 이어집니다. 시간대와 출입 방식을 나눠 확인합니다.",
  },
  yangcheon: {
    title: "양천구 출장마사지, 목동·신정·신월 주거권 상담 기준 | 마사지KING",
    description: "양천구는 목동 주거권과 신정·신월 생활권의 이동 조건이 다릅니다. 주소 기준으로 방문 가능 시간과 출입 조건을 확인합니다.",
  },
  yeongdeungpo: {
    title: "영등포구 출장마사지, 여의도 업무지구와 당산 예약 안내 | 마사지KING",
    description: "영등포구는 여의도 업무지구와 문래·당산 생활권의 조건이 다릅니다. 퇴근 시간, 로비 출입, 주차 여부를 확인합니다.",
  },
  yongsan: {
    title: "용산구 출장마사지, 한남·이태원·용산역 숙소 방문 상담 | 마사지KING",
    description: "용산구는 호텔, 오피스, 주거지가 섞인 지역입니다. 한남·이태원·용산역 인근 방문 전 보안 출입과 대기 조건을 확인합니다.",
  },
  eunpyeong: {
    title: "은평구 출장마사지, 연신내·불광·응암 방문 가능 시간 | 마사지KING",
    description: "은평구는 서북권 주거지가 넓어 도로 흐름과 생활권에 따라 가능 시간이 달라집니다. 주소와 희망 시간을 함께 확인하세요.",
  },
  jongno: {
    title: "종로구 출장마사지, 광화문·종각·혜화 도심 예약 확인 | 마사지KING",
    description: "종로구는 도심 업무지, 호텔, 구도심 골목 동선이 섞여 있습니다. 로비 대기와 건물 출입 방식을 먼저 확인합니다.",
  },
  jung: {
    title: "중구 출장마사지, 명동·을지로 호텔과 업무시설 상담 | 마사지KING",
    description: "중구는 호텔, 상업시설, 업무시설이 밀집한 지역입니다. 명동·을지로·약수권 예약 전 출입 방식과 시간대를 확인하세요.",
  },
  jungnang: {
    title: "중랑구 출장마사지, 상봉·면목·망우 동북권 예약 안내 | 마사지KING",
    description: "중랑구는 상봉 환승권과 면목·망우 주거권의 이동 조건이 다릅니다. 실제 주소와 야간 출입 여부를 기준으로 안내합니다.",
  },
};

const priceCards = `
        <div class="local-price-grid">
          <article class="local-price-card"><h3>타이마사지 건식</h3><p>스트레칭과 압 조절 중심의 건식 관리입니다.</p><dl><div><dt>60분</dt><dd>80,000원</dd></div><div><dt>90분</dt><dd>100,000원</dd></div><div><dt>120분</dt><dd>120,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>아로마마사지 습식</h3><p>오일 사용 여부와 피부 민감도를 먼저 확인합니다.</p><dl><div><dt>60분</dt><dd>90,000원</dd></div><div><dt>90분</dt><dd>110,000원</dd></div><div><dt>120분</dt><dd>130,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>감성케어 오일</h3><p>이완감을 중심으로 강도와 진행 범위를 상담합니다.</p><dl><div><dt>60분</dt><dd>100,000원</dd></div><div><dt>90분</dt><dd>120,000원</dd></div><div><dt>120분</dt><dd>140,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>VVIP 전신케어</h3><p>건식과 오일 흐름을 길게 구성하는 전신 관리입니다.</p><dl><div><dt>60분</dt><dd>110,000원</dd></div><div><dt>90분</dt><dd>130,000원</dd></div><div><dt>120분</dt><dd>150,000원</dd></div><div><dt>150분</dt><dd>180,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>한국인 스웨디시</h3><p>소통 편의와 섬세한 강도 조절을 원하는 예약자 기준입니다.</p><dl><div><dt>60분</dt><dd>150,000원</dd></div><div><dt>90분</dt><dd>190,000원</dd></div></dl></article>
          <article class="local-price-card"><h3>남성 스웨디시</h3><p>관리사 배정과 방문 조건을 전화로 먼저 확인합니다.</p><dl><div><dt>60분</dt><dd>100,000원</dd></div><div><dt>90분</dt><dd>130,000원</dd></div><div><dt>120분</dt><dd>160,000원</dd></div></dl></article>
        </div>`;

function districtPage(d) {
  const title = seoMeta[d.slug]?.title ?? `${d.name} 출장마사지 상담 기준 | 마사지KING`;
  const description = seoMeta[d.slug]?.description ?? d.intro;
  const areaCards = d.areas.map((area) => `<article class="area-zone-card"><span>${d.name}</span><h3>${area}</h3><p>${area} 권역은 같은 구 안에서도 건물 유형과 시간대에 따라 안내가 달라질 수 있습니다.</p><strong>주소 기준 확인</strong></article>`).join("\n          ");
  const reviewItems = [
    { area: d.areas[0], label: "주소 확인", text: `${d.areas[0]} 인근 문의에서 역명보다 상세 주소를 먼저 확인하니 가능 시간 안내가 더 분명했습니다. 상담에서 확정 가능한 내용과 현장 확인이 필요한 내용을 구분해 들었습니다.` },
    { area: d.areas[1], label: "시간대 조정", text: `${d.areas[1]} 생활권은 이동 시간이 짧아 보여도 예약 시간대에 따라 달라질 수 있다는 설명을 받았습니다. 희망 시간을 조금 넓게 잡으니 상담이 빨리 정리됐습니다.` },
    { area: d.areas[2], label: "출입 조건", text: `${d.areas[2]} 방문은 건물 출입 방식과 주차 가능 여부를 미리 확인해야 했습니다. 준비할 정보를 먼저 알려줘 불필요한 재통화를 줄일 수 있었습니다.` },
    { area: d.board, label: "가격 확인", text: `${d.name} 기준 요금표를 먼저 보고 전화했지만, 실제 안내는 시간대와 방문 환경을 확인한 뒤 설명받았습니다. 추가 확인이 필요한 부분을 숨기지 않아 판단하기 쉬웠습니다.` },
    { area: d.points[0], label: "컨디션 상담", text: `피로 부위와 피해야 할 부위를 먼저 물어봤습니다. 강한 압을 무조건 권하지 않고 불편하면 조절할 수 있다고 안내해 부담이 줄었습니다.` },
    { area: d.points[2], label: "예약 전 준비", text: `방문 전에 주소, 출입 방식, 주차 가능 여부를 정리해 달라고 안내받았습니다. 통화 전에 준비할 항목이 분명해서 예약 흐름이 복잡하지 않았습니다.` },
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
        <p class="eyebrow">Seoul district</p>
        <h1>${d.name} 출장마사지 가능 지역 안내</h1>
        <p>${d.intro}</p>
        <div class="area-hero-proof" aria-label="${d.name} 빠른 예약 포인트">
          <strong>${d.name} 즉시 확인</strong>
          <span>${d.points[0]}</span>
          <span>${d.points[1]}</span>
          <a href="tel:05082024743">${d.name} 전화예약</a>
        </div>
        <div class="area-hero-card" aria-label="${d.name} 상담 보드">
          <span>${d.name} 상담 보드</span>
          <h2>${d.name}은 주소 기준 상담이 가장 빠릅니다</h2>
          <p class="area-hero-cta">${d.board} 생활권은 시간대와 출입 조건에 따라 가능 안내가 달라집니다. 전화로 현재 배정 흐름을 먼저 확인하세요.</p>
          <ul>
            <li>${d.points[0]}</li>
            <li>${d.points[1]}</li>
            <li>${d.points[2]}</li>
          </ul>
          <a href="tel:05082024743">0508-202-4743 ${d.name} 예약</a>
        </div>
        <dl class="page-meta" aria-label="콘텐츠 정보">
          <div><dt>작성</dt><dd>마사지KING 운영팀</dd></div>
          <div><dt>검수</dt><dd>예약 상담 기준 확인</dd></div>
          <div><dt>업데이트</dt><dd>2026-05-21</dd></div>
        </dl>
      </section>

      <section class="area-dashboard" aria-label="${d.name} 출장마사지 권역 안내">
        <div class="area-dashboard-head">
          <p class="eyebrow">${d.name} board</p>
          <h2>${d.name}은 지명보다 실제 방문 조건을 먼저 확인합니다</h2>
          <p>${d.intro} 같은 ${d.name} 안에서도 도로 흐름, 건물 보안, 주차 가능 여부에 따라 상담 결과가 달라질 수 있습니다.</p>
        </div>
        <div class="area-zone-grid">
          ${areaCards}
        </div>
        <div class="area-signal-panel">
          <div><b>${d.name} 체크</b><span>상세 주소와 건물 출입 정보를 먼저 준비</span></div>
          <div><b>주의 시간</b><span>퇴근 시간대와 야간 문의는 여유 있게 상담</span></div>
          <div><b>예약 문의</b><span>0508-202-4743</span></div>
        </div>
      </section>

      <section class="area-commerce" aria-label="${d.name} 출장마사지 메뉴 가격">
        <div class="area-section-head">
          <div><p class="eyebrow">${d.name} price</p><h2>${d.name} 예약 전 확인하는 메뉴 가격</h2></div>
          <p>아래 금액은 통화 전 참고하는 기준가입니다. 실제 안내는 ${d.name} 내 위치, 시간대, 이동 조건, 방문 환경을 확인한 뒤 달라질 수 있습니다.</p>
        </div>
${priceCards}
        <div class="area-price-note"><p>가격표는 기준 안내이며, 심야 시간·이동 거리·현장 조건에 따라 상담 내용이 달라질 수 있습니다.</p><a href="tel:05082024743">${d.name} 가격 전화 확인</a></div>
      </section>

      <section class="area-reviews" aria-label="${d.name} 출장마사지 이용 메모">
        <div class="area-section-head">
          <div><p class="eyebrow">${d.name} reviews</p><h2>${d.name} 이용자가 자주 확인한 상담 포인트</h2></div>
          <p>후기는 과장된 만족 표현이 아니라 예약자가 실제로 확인한 절차, 시간, 출입 방식, 준비사항 중심의 익명 메모입니다.</p>
        </div>
        <div class="local-review-grid">
          ${reviewCards}
        </div>
        <div class="area-review-note"><p>개인정보는 제외했으며 치료 효과, 순위 보장, 확정적 만족을 약속하는 표현은 사용하지 않습니다.</p></div>
      </section>

      <section class="content-long" aria-label="${d.name} 출장마사지 가능 지역 안내 상세 안내">
        <article class="content-panel">
          <h2>핵심 요약</h2>
          <p>${d.name} 출장마사지 가능 여부는 구 이름만으로 확정하지 않고, 실제 주소와 희망 시간, 방문 장소 조건을 함께 확인해야 합니다.</p>
          <p>${d.name} 페이지는 검색 유입만을 목적으로 지명을 반복하는 문서가 아니라 예약자가 전화 전에 준비할 정보를 정리한 안내입니다. 같은 ${d.name} 안에서도 ${d.areas.join(", ")}처럼 생활권이 나뉘고, 호텔·오피스텔·주거지·사무실에 따라 출입 방식과 대기 가능 여부가 달라집니다.</p>
          <p>따라서 이 문서는 “무조건 가능합니다”라고 말하기보다, 어떤 조건을 확인해야 현재 기준의 안내가 정확해지는지 보여주는 역할을 합니다.</p>
        </article>
        <article class="content-panel">
          <h2>전화 상담에서 묻는 정보</h2>
          <p>상담에서는 먼저 ${d.name} 내 정확한 주소, 희망 시간, 방문 장소 유형을 확인합니다.</p>
          <p>두 번째로 컨디션과 피해야 할 부위를 묻습니다. 통증을 참는 방식으로 진행하지 않으며, 질환·부상·급성 통증이 있으면 의료 전문가 상담을 우선해야 합니다.</p>
          <p>세 번째로 건물 출입 방식, 주차 가능 여부, 야간 대기 조건을 확인합니다. 작은 정보 차이가 도착 시간과 안내 가능 여부에 영향을 줄 수 있습니다.</p>
        </article>
        <article class="content-panel">
          <h2>${d.name} 예약 전 체크리스트</h2>
          <p>아래 항목을 미리 준비하면 통화 시간이 짧아지고 안내가 더 정확해집니다.</p>
          <ul>
            <li>${d.name} 내 상세 주소와 가까운 출입구를 확인합니다.</li>
            <li>희망 시간과 조정 가능한 시간 범위를 함께 정리합니다.</li>
            <li>건물 출입, 주차, 로비 대기 가능 여부를 확인합니다.</li>
            <li>피해야 할 부위나 건강상 주의사항을 숨기지 않습니다.</li>
            <li>마사지가 의료 진단이나 치료를 대신하지 않는다는 점을 이해합니다.</li>
          </ul>
        </article>
        <article class="content-panel">
          <h2>콘텐츠 신뢰 기준</h2>
          <p>이 페이지는 마사지KING 운영팀이 예약 상담에서 반복적으로 확인되는 질문을 바탕으로 작성했습니다.</p>
          <p>작성 과정에서 AI가 문장 정리에 보조적으로 쓰일 수 있지만, 최종 문구는 운영 기준과 서비스 한계 고지에 맞춰 확인합니다. 지역명만 바꾼 대량 복제 문서가 되지 않도록 ${d.name}의 생활권과 상담 변수를 반영했습니다.</p>
          <p>허위 후기, 치료 효과 단정, 순위 조작 목적의 키워드 반복, 보장형 표현은 사용하지 않습니다.</p>
        </article>
      </section>

      <section class="who-how-why">
        <div><h2>Who</h2><p>이 문서는 마사지KING 운영팀이 작성하고 관리합니다. 실제 예약 문의에서 반복되는 질문과 운영상 반드시 고지해야 하는 한계를 기준으로 정리했습니다.</p></div>
        <div><h2>How</h2><p>초안 정리에는 AI 도움을 받을 수 있지만, 최종 문구는 운영팀이 확인합니다. 서비스 가능 여부, 안전 고지, 의료 행위가 아니라는 설명은 과장 없이 검토합니다.</p></div>
        <div><h2>Why</h2><p>목적은 검색 순위 조작이 아니라 예약자가 전화 전에 필요한 정보를 이해하도록 돕는 것입니다. 지역명 반복과 허위 후기는 사용하지 않습니다.</p></div>
      </section>

      <section class="page-cta">
        <div><p class="eyebrow">Reservation</p><h2>${d.name} 가능 여부는 전화 상담에서 확인하세요</h2><p>주소, 시간, 방문 환경을 알려주시면 현재 기준으로 안내합니다.</p></div>
        <a class="primary-button" href="tel:05082024743">0508-202-4743</a>
      </section>
    </main>

    ${footer}
  </body>
</html>
`;
}

function directoryHtml() {
  const cards = sortByKoreanName(districts).map((d) => `          <a class="district-link-card" href="/areas/seoul/${d.slug}/"><strong>${d.name}</strong><span>${d.board} 생활권 기준 확인</span></a>`).join("\n");
  return `      <section class="district-directory" aria-label="서울 행정구별 출장마사지 안내">
        <div class="area-section-head">
          <div><p class="eyebrow">Seoul districts</p><h2>서울 25개 행정구별 가능 지역 안내</h2></div>
          <p>구 이름을 나열하는 용도가 아니라, 각 행정구별 상담 기준과 이동·출입 변수를 확인할 수 있도록 개별 안내 페이지로 연결합니다.</p>
        </div>
        <div class="district-directory-grid">
${cards}
        </div>
      </section>

`;
}

for (const district of districts) {
  const dir = path.join(root, "areas", "seoul", district.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), districtPage(district), "utf8");
}

const marker = `      <section class="area-commerce" aria-label="서울 출장마사지 메뉴 가격">`;
let nextSeoulHtml = seoulHtml;
nextSeoulHtml = nextSeoulHtml.replace(/\s*<section class="district-directory"[\s\S]*?<\/section>\s*/, "\n\n");
nextSeoulHtml = nextSeoulHtml.replace(/\s*<section class="area-commerce" aria-label="서울 출장마사지 메뉴 가격">/, `\n\n${directoryHtml()}      <section class="area-commerce" aria-label="서울 출장마사지 메뉴 가격">`);
await fs.writeFile(seoulPath, nextSeoulHtml, "utf8");

console.log(`Generated ${districts.length} Seoul district pages.`);
