$ErrorActionPreference = "Stop"

if ($PSScriptRoot) {
  $root = Split-Path -Parent $PSScriptRoot
} else {
  $root = (Get-Location).Path
}
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Escape-Html([string]$value) {
  return $value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;")
}

function Write-Utf8File([string]$path, [string]$content) {
  $directory = Split-Path -Parent $path
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Force $directory | Out-Null
  }
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}

$menu = @"
      <nav class="nav" aria-label="주요 메뉴">
        <div class="nav-item">
          <a href="/areas/">지역별 찾기</a>
          <div class="submenu" aria-label="지역별 찾기 하위 메뉴">
            <a href="/areas/seoul/">서울</a>
            <a href="/areas/gyeonggi/">경기</a>
            <a href="/areas/incheon/">인천</a>
            <a href="/areas/busan/">부산</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="/service/">서비스 안내</a>
          <div class="submenu" aria-label="서비스 안내 하위 메뉴">
            <a href="/service/business-trip-massage/">출장마사지 안내</a>
            <a href="/service/hometai/">홈타이 안내</a>
            <a href="/service/swedish/">스웨디시 안내</a>
            <a href="/service/aroma/">아로마 관리 안내</a>
            <a href="/service/dry-massage/">건식 관리 안내</a>
            <a href="/service/before-reservation/">예약 전 확인사항</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="/guide/">이용 방법</a>
          <div class="submenu" aria-label="이용 방법 하위 메뉴">
            <a href="/guide/reservation/">예약 절차</a>
            <a href="/guide/price/">요금 안내</a>
            <a href="/guide/service-time/">이용 가능 시간</a>
            <a href="/guide/available-area/">방문 가능 지역</a>
            <a href="/guide/prepare/">이용 전 준비사항</a>
            <a href="/guide/safety/">안전 이용 안내</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="/reviews/">이용 후기</a>
          <div class="submenu" aria-label="이용 후기 하위 메뉴">
            <a href="/reviews/seoul/">서울 이용 기준</a>
            <a href="/reviews/gyeonggi/">경기 이용 기준</a>
            <a href="/reviews/incheon/">인천 이용 기준</a>
            <a href="/reviews/busan/">부산 이용 기준</a>
            <a href="/reviews/first-time/">첫 이용 체크</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="/magazine/">매거진</a>
          <div class="submenu" aria-label="매거진 하위 메뉴">
            <a href="/magazine/fatigue/">피로 관리</a>
            <a href="/magazine/local-life/">지역 생활 정보</a>
            <a href="/magazine/knowledge/">마사지 상식</a>
            <a href="/magazine/before-booking/">예약 전 알아두기</a>
            <a href="/magazine/office-fatigue/">직장인 피로 회복</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="/contact/">고객센터</a>
          <div class="submenu" aria-label="고객센터 하위 메뉴">
            <a href="/contact/#notice">공지사항</a>
            <a href="/contact/#faq">자주 묻는 질문</a>
            <a href="tel:05082024743">1:1 문의</a>
            <a href="/contact/partnership/">제휴 문의</a>
            <a href="/policy/editorial/">운영 정책</a>
          </div>
        </div>
      </nav>
"@

$pages = @(
  @{
    Path = "areas/index.html"; Title = "지역별 찾기"; Kicker = "Coverage";
    Description = "서울, 경기, 인천, 부산 출장마사지 예약 가능 지역을 한 번에 확인하는 안내 페이지입니다.";
    Lead = "마사지KING은 권역명을 많이 나열하기보다 실제 이동 가능성과 방문 환경을 기준으로 상담합니다.";
    Sections = @(
      @{H="지역 안내 원칙"; P="지역 페이지는 검색어 반복을 위해 만들지 않고, 예약자가 실제로 알아야 할 이동 조건과 상담 기준을 설명합니다."},
      @{H="상담에서 확인하는 정보"; P="주소, 희망 시간, 주차 또는 출입 방식, 관리 목적, 피해야 할 부위를 먼저 확인합니다."},
      @{H="예약 가능성 고지"; P="같은 지역이라도 시간대와 배정 상황에 따라 가능 여부가 달라질 수 있어 전화 상담으로 최종 확인합니다."}
    )
  },
  @{
    Path = "areas/seoul/index.html"; Title = "서울 출장마사지 가능 지역 안내"; Kicker = "Seoul";
    Description = "서울 출장마사지 예약 전 확인해야 할 권역, 이동 시간, 방문 환경 안내입니다.";
    Lead = "서울은 가까운 거리라도 시간대별 이동 차이가 커서 주소와 희망 시간을 함께 확인해야 합니다.";
    Sections = @(
      @{H="서울 상담 기준"; P="강남권, 강북권, 도심권처럼 큰 생활권으로 먼저 파악하고 실제 주소 기준으로 이동 가능 여부를 확인합니다."},
      @{H="방문 전 체크"; P="오피스텔, 호텔, 주거지 등 방문 환경에 따라 출입 방식과 대기 장소를 미리 알려주면 상담이 빨라집니다."},
      @{H="서울 예약 팁"; P="퇴근 시간대와 주말 저녁은 이동 시간이 늘어날 수 있으므로 가능한 시간대를 넓게 잡는 것이 좋습니다."}
    )
  },
  @{
    Path = "areas/gyeonggi/index.html"; Title = "경기 출장마사지 가능 지역 안내"; Kicker = "Gyeonggi";
    Description = "경기도 출장마사지 예약 전 시군별 이동 거리와 시간대 확인 기준을 안내합니다.";
    Lead = "경기는 시군 사이 이동 거리가 넓기 때문에 지역명보다 실제 동선과 예약 시간이 더 중요합니다.";
    Sections = @(
      @{H="경기 상담 기준"; P="성남, 수원, 용인, 고양, 부천 등 주요 생활권을 기준으로 확인하되 세부 주소에 따라 안내가 달라집니다."},
      @{H="시간대 변수"; P="광역 이동이 필요한 경우 당일 교통 상황과 이전 예약 종료 위치가 도착 시간에 영향을 줍니다."},
      @{H="정확한 안내 방법"; P="희망 시간, 인원, 주차 가능 여부를 함께 알려주면 가능한 일정과 준비 사항을 더 정확히 안내할 수 있습니다."}
    )
  },
  @{
    Path = "areas/incheon/index.html"; Title = "인천 출장마사지 가능 지역 안내"; Kicker = "Incheon";
    Description = "인천 출장마사지 예약 전 송도, 부평, 연수, 남동 등 생활권별 확인 기준을 안내합니다.";
    Lead = "인천은 송도, 부평, 계양, 남동처럼 생활권 차이가 있어 실제 위치와 이동 시간을 같이 확인합니다.";
    Sections = @(
      @{H="인천 상담 기준"; P="송도와 연수권, 부평과 계양권, 남동권 등 이동 축을 기준으로 가능 여부를 확인합니다."},
      @{H="방문 환경"; P="상업시설, 숙박시설, 주거지에 따라 출입 절차가 달라질 수 있어 예약 전에 안내가 필요합니다."},
      @{H="예약 전 유의"; P="야간 예약은 이동과 안전 조건을 함께 확인하며, 불명확한 장소나 부적절한 요청은 안내하지 않습니다."}
    )
  },
  @{
    Path = "service/index.html"; Title = "서비스 안내"; Kicker = "Service";
    Description = "출장마사지, 홈타이, 아로마, 건식 관리 등 마사지KING 서비스 범위와 예약 전 확인사항입니다.";
    Lead = "서비스명보다 중요한 것은 예약자의 컨디션과 안전한 진행 가능 여부입니다.";
    Sections = @(
      @{H="서비스 선택 기준"; P="휴식, 피로 완화, 가벼운 컨디션 관리처럼 목적을 먼저 정리하면 적합한 관리 방식을 상담하기 쉽습니다."},
      @{H="제공하지 않는 것"; P="의료 진단, 치료, 재활, 불법 또는 부적절한 요청은 제공하지 않습니다."},
      @{H="상담 후 확정"; P="서비스 시간과 방식은 지역, 예약 시간, 컨디션 메모를 확인한 뒤 안내합니다."}
    )
  },
  @{
    Path = "service/business-trip-massage/index.html"; Title = "출장마사지 안내"; Kicker = "Mobile care";
    Description = "출장마사지 예약 방식, 방문 전 확인사항, 이용 한계를 투명하게 안내합니다.";
    Lead = "출장마사지는 이동 편의가 장점이지만 방문 환경과 안전 기준을 먼저 확인해야 합니다.";
    Sections = @(
      @{H="출장마사지의 핵심"; P="예약자가 있는 장소로 방문해 휴식과 컨디션 관리를 돕는 방식입니다."},
      @{H="필수 확인사항"; P="주소, 출입 방식, 희망 시간, 피해야 할 부위, 건강상 주의 사항을 전화 상담에서 확인합니다."},
      @{H="서비스 한계"; P="치료 목적의 의료 행위가 아니며 통증을 참고 받는 강한 관리는 권하지 않습니다."}
    )
  },
  @{
    Path = "service/hometai/index.html"; Title = "홈타이 안내"; Kicker = "Home care";
    Description = "홈타이 예약 전 관리 강도, 공간 준비, 상담 기준을 안내합니다.";
    Lead = "홈타이는 편안한 공간에서 진행되는 관리이므로 공간 준비와 강도 조절이 중요합니다.";
    Sections = @(
      @{H="공간 준비"; P="누울 수 있는 공간, 환기, 조용한 환경을 준비하면 안정적으로 진행하기 좋습니다."},
      @{H="강도 조절"; P="처음부터 강하게 받기보다 현장에서 불편함을 바로 말하며 조절하는 것이 좋습니다."},
      @{H="예약 메모"; P="수면 부족, 장시간 운전, 운동 후 피로 등 현재 상태를 미리 알려주면 상담에 도움이 됩니다."}
    )
  },
  @{
    Path = "service/swedish/index.html"; Title = "스웨디시 안내"; Kicker = "Swedish";
    Description = "스웨디시 관리 예약 전 목적, 진행 방식, 주의사항을 안내합니다.";
    Lead = "스웨디시는 부드러운 흐름과 이완감을 중시하는 관리로, 컨디션 확인이 먼저입니다.";
    Sections = @(
      @{H="이완 중심 관리"; P="강한 압보다 긴장 완화와 편안한 리듬을 원하는 분에게 적합한 방향으로 상담합니다."},
      @{H="사전 고지"; P="피부 민감도, 알레르기, 불편한 부위가 있다면 예약 전에 알려야 합니다."},
      @{H="부적절 요청 제한"; P="서비스 범위를 벗어난 요청은 받지 않으며 안전하고 명확한 예약만 안내합니다."}
    )
  },
  @{
    Path = "service/aroma/index.html"; Title = "아로마 관리 안내"; Kicker = "Aroma";
    Description = "아로마 관리 예약 전 향, 피부 민감도, 관리 목적을 확인하는 안내입니다.";
    Lead = "아로마 관리는 향과 피부 반응이 중요하므로 개인 상태를 먼저 확인해야 합니다.";
    Sections = @(
      @{H="향과 민감도"; P="특정 향에 민감하거나 피부 반응이 있었던 경험이 있다면 상담 단계에서 알려주세요."},
      @{H="이용 목적"; P="휴식, 긴장 완화, 가벼운 컨디션 회복 등 원하는 방향을 말하면 안내가 구체화됩니다."},
      @{H="주의사항"; P="상처, 염증, 알레르기 의심 부위가 있다면 무리하게 진행하지 않습니다."}
    )
  },
  @{
    Path = "service/dry-massage/index.html"; Title = "건식 관리 안내"; Kicker = "Dry care";
    Description = "건식 마사지 예약 전 복장, 강도, 부위별 주의사항을 안내합니다.";
    Lead = "건식 관리는 오일 사용 없이 진행하는 방식으로 강도 조절과 부위 확인이 중요합니다.";
    Sections = @(
      @{H="건식 관리 특징"; P="간편하게 받을 수 있지만 압이 강하면 불편할 수 있어 처음부터 강도를 높이지 않습니다."},
      @{H="복장과 환경"; P="움직임이 편한 복장과 누울 수 있는 공간을 준비하면 진행이 수월합니다."},
      @{H="주의 부위"; P="허리, 목, 어깨 등 민감한 부위는 통증 이력과 불편함을 먼저 공유해야 합니다."}
    )
  },
  @{
    Path = "service/before-reservation/index.html"; Title = "예약 전 확인사항"; Kicker = "Before reservation";
    Description = "출장마사지 예약 전 지역, 시간, 건강상 주의사항, 방문 환경을 확인하는 체크리스트입니다.";
    Lead = "정확한 상담은 예약자의 상황을 먼저 이해하는 데서 시작합니다.";
    Sections = @(
      @{H="기본 정보"; P="이용 지역, 희망 시간, 인원, 연락 가능한 번호를 먼저 준비해주세요."},
      @{H="건강 메모"; P="수술 후 회복, 임신, 질환, 심한 통증이 있다면 의료 전문가 상담이 우선입니다."},
      @{H="방문 조건"; P="주차, 출입, 엘리베이터, 숙소 체크인 상태 등 현장 조건을 알려주세요."}
    )
  },
  @{
    Path = "guide/index.html"; Title = "이용 방법"; Kicker = "Guide";
    Description = "마사지KING 예약 절차, 요금 안내, 이용 가능 시간, 준비사항을 정리했습니다.";
    Lead = "처음 이용하는 분도 상담 흐름을 이해할 수 있도록 단계별 기준을 정리했습니다.";
    Sections = @(
      @{H="문의"; P="전화로 지역, 시간, 희망 관리 방향을 알려주세요."},
      @{H="확인"; P="가능 지역, 예상 도착 시간, 준비 사항을 상담에서 안내합니다."},
      @{H="진행"; P="현장에서 컨디션과 강도를 다시 확인한 뒤 편안한 범위에서 진행합니다."}
    )
  },
  @{
    Path = "guide/reservation/index.html"; Title = "예약 절차"; Kicker = "Reservation";
    Description = "출장마사지 예약 문의부터 방문 진행까지의 절차를 안내합니다.";
    Lead = "예약은 빠르게 진행되더라도 확인해야 할 정보는 빠뜨리지 않는 것이 중요합니다.";
    Sections = @(
      @{H="1단계 문의"; P="전화 상담에서 이용 지역과 희망 시간을 알려주세요."},
      @{H="2단계 확인"; P="이동 가능 여부, 예상 도착 시간, 진행 가능한 서비스 범위를 안내합니다."},
      @{H="3단계 진행"; P="현장 도착 후 컨디션과 주의사항을 다시 확인합니다."}
    )
  },
  @{
    Path = "guide/price/index.html"; Title = "요금 안내"; Kicker = "Price";
    Description = "출장마사지 요금 안내 시 확인되는 시간, 거리, 서비스 조건을 설명합니다.";
    Lead = "요금은 단순 표기보다 지역, 시간, 이동 조건에 따라 상담으로 확인하는 것이 정확합니다.";
    Sections = @(
      @{H="요금 확인 기준"; P="관리 시간, 이동 거리, 예약 시간대, 요청 사항을 기준으로 상담합니다."},
      @{H="추가 안내"; P="변동 가능성이 있는 항목은 예약 전에 먼저 설명하고 동의 없이 임의 진행하지 않습니다."},
      @{H="정확한 확인"; P="최종 안내는 전화 상담에서 현재 가능한 일정 기준으로 확인해주세요."}
    )
  },
  @{
    Path = "guide/service-time/index.html"; Title = "이용 가능 시간"; Kicker = "Service time";
    Description = "서울 경기 인천 출장마사지 이용 가능 시간과 당일 예약 확인 기준입니다.";
    Lead = "이용 가능 시간은 고정 문구보다 당일 배정과 이동 상황에 따라 달라집니다.";
    Sections = @(
      @{H="운영 시간"; P="기본 상담 가능 시간은 10:00부터 23:00까지이며 상황에 따라 안내가 달라질 수 있습니다."},
      @{H="당일 예약"; P="당일 문의는 이전 예약 위치와 교통 상황을 함께 확인합니다."},
      @{H="여유 시간"; P="방문 준비와 이동 지연 가능성을 고려해 희망 시간을 여유 있게 잡는 것이 좋습니다."}
    )
  },
  @{
    Path = "guide/available-area/index.html"; Title = "방문 가능 지역"; Kicker = "Available area";
    Description = "서울, 경기, 인천 방문 가능 지역을 확인하는 기준과 상담 방법입니다.";
    Lead = "방문 가능 지역은 지도상 거리보다 실제 이동 동선과 시간대가 중요합니다.";
    Sections = @(
      @{H="권역 확인"; P="서울, 경기, 인천 큰 권역을 먼저 확인하고 세부 주소로 가능 여부를 판단합니다."},
      @{H="동선 변수"; P="교통량, 주차, 출입 절차에 따라 도착 시간이 달라질 수 있습니다."},
      @{H="정확한 상담"; P="주소 일부만으로는 판단이 어렵기 때문에 구체적인 위치를 알려주세요."}
    )
  },
  @{
    Path = "guide/prepare/index.html"; Title = "이용 전 준비사항"; Kicker = "Prepare";
    Description = "출장마사지 이용 전 공간, 복장, 컨디션 메모 등 준비사항을 안내합니다.";
    Lead = "작은 준비가 현장 진행의 안전성과 만족도를 높입니다.";
    Sections = @(
      @{H="공간"; P="조용하고 누울 수 있는 공간, 환기, 기본 위생 상태를 준비해주세요."},
      @{H="컨디션"; P="피로 부위, 피해야 할 부위, 최근 운동이나 수면 상태를 알려주면 좋습니다."},
      @{H="진행 중 대화"; P="불편함이 있으면 즉시 말하고 강도나 자세를 조절하세요."}
    )
  },
  @{
    Path = "guide/safety/index.html"; Title = "안전 이용 안내"; Kicker = "Safety";
    Description = "출장마사지 이용 시 안전한 예약과 진행을 위한 기준을 안내합니다.";
    Lead = "마사지KING은 명확한 상담과 안전한 방문 환경을 우선합니다.";
    Sections = @(
      @{H="명확한 장소"; P="방문 장소와 연락 방식이 불명확하면 예약 안내가 제한될 수 있습니다."},
      @{H="건강상 주의"; P="심한 통증, 질환, 수술 후 회복, 임신 등은 의료 전문가 상담을 먼저 권합니다."},
      @{H="범위 준수"; P="서비스 범위를 벗어난 요청은 받지 않으며 예약 안내를 중단할 수 있습니다."}
    )
  },
  @{
    Path = "reviews/index.html"; Title = "이용 후기 안내"; Kicker = "Review policy";
    Description = "마사지KING 이용 후기 페이지 운영 기준과 후기 확인 방법을 안내합니다.";
    Lead = "후기는 신뢰가 중요하므로 과장된 문장이나 확인되지 않은 이야기를 만들지 않습니다.";
    Sections = @(
      @{H="후기 운영 원칙"; P="마사지KING은 허위 후기나 지역명만 바꾼 후기를 만들지 않습니다."},
      @{H="확인 가능한 기준"; P="후기는 예약 과정, 상담 정확도, 방문 전 준비사항처럼 실제 확인 가능한 항목 중심으로 다룹니다."},
      @{H="개인정보 보호"; P="이용자의 주소, 이름, 세부 상황은 공개하지 않습니다."}
    )
  },
  @{
    Path = "reviews/seoul/index.html"; Title = "서울 이용 기준"; Kicker = "Seoul review guide";
    Description = "서울 이용자가 예약 전 확인하면 좋은 이동, 시간, 방문 환경 기준입니다.";
    Lead = "서울 이용 경험은 시간대와 건물 출입 조건에 따라 크게 달라질 수 있습니다.";
    Sections = @(
      @{H="시간대"; P="퇴근 시간, 주말 저녁, 행사 지역은 이동 시간이 길어질 수 있습니다."},
      @{H="방문 환경"; P="호텔, 오피스텔, 주거지의 출입 조건을 미리 알려주면 현장 대기가 줄어듭니다."},
      @{H="상담 품질"; P="정확한 안내를 위해 주소와 희망 시간을 상담 초반에 확인합니다."}
    )
  },
  @{
    Path = "reviews/gyeonggi/index.html"; Title = "경기 이용 기준"; Kicker = "Gyeonggi review guide";
    Description = "경기 지역 출장마사지 예약 전 확인하면 좋은 거리, 시간, 동선 기준입니다.";
    Lead = "경기는 지역 간 거리가 넓어 실제 배정 위치와 이동 동선이 만족도에 영향을 줍니다.";
    Sections = @(
      @{H="거리"; P="시군명이 같아도 이동 시간이 다를 수 있어 세부 주소 확인이 필요합니다."},
      @{H="일정"; P="예약 가능한 시간대를 넓게 제시하면 배정 가능성을 더 현실적으로 안내할 수 있습니다."},
      @{H="준비"; P="주차 가능 여부와 출입 절차를 먼저 알려주세요."}
    )
  },
  @{
    Path = "reviews/incheon/index.html"; Title = "인천 이용 기준"; Kicker = "Incheon review guide";
    Description = "인천 지역 출장마사지 예약 전 생활권별 이동과 방문 조건을 안내합니다.";
    Lead = "인천은 생활권별 이동 축이 달라 주소와 시간대 확인이 중요합니다.";
    Sections = @(
      @{H="생활권"; P="송도, 연수, 부평, 계양, 남동 등 권역별 이동 조건이 다릅니다."},
      @{H="예약 확인"; P="방문 장소와 희망 시간을 구체적으로 알려야 가능 여부를 정확히 안내할 수 있습니다."},
      @{H="안전"; P="불명확한 장소나 부적절한 요청은 안내하지 않습니다."}
    )
  },
  @{
    Path = "reviews/first-time/index.html"; Title = "첫 이용 체크"; Kicker = "First time";
    Description = "출장마사지를 처음 이용하는 분을 위한 상담, 준비, 주의사항 안내입니다.";
    Lead = "처음 이용할수록 서비스명보다 절차와 한계를 이해하는 것이 중요합니다.";
    Sections = @(
      @{H="상담"; P="원하는 시간과 지역, 피로 부위, 주의사항을 간단히 정리해 전화하세요."},
      @{H="진행"; P="현장에서 강도와 불편함을 바로 이야기하면 더 안전하게 조절할 수 있습니다."},
      @{H="주의"; P="치료 목적이라면 의료 전문가 상담이 우선입니다."}
    )
  },
  @{
    Path = "magazine/index.html"; Title = "매거진"; Kicker = "Magazine";
    Description = "피로 관리, 지역 생활 정보, 마사지 상식, 예약 전 확인사항을 다루는 마사지KING 매거진입니다.";
    Lead = "매거진은 검색어 채우기가 아니라 예약자가 실제로 확인하면 좋은 정보를 정리합니다.";
    Sections = @(
      @{H="피로 관리"; P="일상에서 쌓이는 피로를 무리하지 않고 관리하는 방법을 다룹니다."},
      @{H="예약 전 정보"; P="출장마사지 이용 전 확인해야 할 안전, 공간, 상담 기준을 정리합니다."},
      @{H="운영 원칙"; P="의료 조언처럼 보일 수 있는 표현은 피하고, 필요 시 전문가 상담을 권합니다."}
    )
  },
  @{
    Path = "magazine/fatigue/index.html"; Title = "피로 관리"; Kicker = "Fatigue";
    Description = "출장마사지 예약 전 스스로 확인할 수 있는 피로 상태와 휴식 기준입니다.";
    Lead = "피로는 무조건 강한 관리로 해결하기보다 수면, 휴식, 생활 리듬을 함께 봐야 합니다.";
    Sections = @(
      @{H="피로 신호"; P="수면 부족, 오래 앉아 있기, 반복 운동 후 뻐근함은 관리 전 상태 확인이 필요합니다."},
      @{H="무리하지 않기"; P="통증을 참는 방식보다 편안한 강도에서 긴장을 낮추는 방향이 좋습니다."},
      @{H="전문가 상담"; P="심한 통증이나 저림, 질환 의심 증상이 있다면 의료 전문가에게 먼저 문의하세요."}
    )
  },
  @{
    Path = "magazine/local-life/index.html"; Title = "지역 생활 정보"; Kicker = "Local life";
    Description = "서울 경기 인천 방문 예약 전 지역 생활권과 이동 조건을 이해하는 안내입니다.";
    Lead = "출장 서비스는 지역명보다 실제 이동 조건과 방문 환경의 영향을 크게 받습니다.";
    Sections = @(
      @{H="생활권 기준"; P="강남권, 분당권, 송도권처럼 생활권을 기준으로 보면 이동 안내가 더 현실적입니다."},
      @{H="건물 조건"; P="상업시설과 주거시설의 출입 방식이 달라 예약 전에 확인해야 합니다."},
      @{H="시간대"; P="출퇴근 시간과 주말 저녁은 이동 변수가 많습니다."}
    )
  },
  @{
    Path = "magazine/knowledge/index.html"; Title = "마사지 상식"; Kicker = "Knowledge";
    Description = "마사지 예약 전 알아두면 좋은 강도, 부위, 컨디션 관리 상식입니다.";
    Lead = "기본 상식을 알고 예약하면 상담이 더 명확해지고 무리한 진행을 피할 수 있습니다.";
    Sections = @(
      @{H="강도"; P="강한 압이 항상 좋은 것은 아니며 불편함이 있으면 즉시 조절해야 합니다."},
      @{H="부위"; P="목, 허리, 어깨는 개인차가 크므로 과거 통증이나 치료 이력을 공유하세요."},
      @{H="범위"; P="마사지는 의료 진단이나 치료를 대신하지 않습니다."}
    )
  },
  @{
    Path = "magazine/before-booking/index.html"; Title = "예약 전 알아두기"; Kicker = "Before booking";
    Description = "출장마사지 예약 전 꼭 확인해야 할 전화 상담, 방문 환경, 안전 기준입니다.";
    Lead = "예약 전 몇 가지 정보를 준비하면 상담이 짧아지고 안내가 정확해집니다.";
    Sections = @(
      @{H="전화 전 준비"; P="지역, 시간, 인원, 방문 장소 유형, 주의사항을 정리하세요."},
      @{H="현장 준비"; P="누울 수 있는 공간과 환기, 출입 안내를 준비하면 진행이 부드럽습니다."},
      @{H="주의 요청"; P="부적절하거나 불법적인 요청은 안내하지 않습니다."}
    )
  },
  @{
    Path = "magazine/office-fatigue/index.html"; Title = "직장인 피로 회복"; Kicker = "Office fatigue";
    Description = "직장인의 어깨, 목, 허리 피로를 무리 없이 관리하기 위한 예약 전 안내입니다.";
    Lead = "장시간 앉아 있는 생활은 목과 어깨, 허리에 피로를 쌓이게 할 수 있습니다.";
    Sections = @(
      @{H="상태 확인"; P="어느 부위가 언제부터 불편했는지 간단히 메모하면 상담에 도움이 됩니다."},
      @{H="강도 선택"; P="업무 후 피로가 심한 날에는 강한 관리보다 편안한 강도부터 시작하는 것이 좋습니다."},
      @{H="의료 신호"; P="저림, 감각 이상, 급성 통증이 있으면 마사지보다 의료 상담이 우선입니다."}
    )
  },
  @{
    Path = "contact/index.html"; Title = "고객센터"; Kicker = "Contact";
    Description = "마사지KING 예약 문의, 자주 묻는 질문, 운영 기준을 확인할 수 있는 고객센터입니다.";
    Lead = "예약 문의는 전화 상담으로 진행하며, 안내가 필요한 사항은 고객센터 기준에 따라 확인합니다.";
    Sections = @(
      @{H="예약 문의"; P="전화번호 0508-202-4743으로 지역과 희망 시간을 알려주세요."},
      @{H="공지사항"; P="운영 시간, 가능 지역, 안내 문구는 실제 상담 기준에 맞춰 업데이트합니다."},
      @{H="정정 요청"; P="사이트 정보가 실제 안내와 다르다면 전화로 알려주세요. 확인 후 수정합니다."}
    )
  },
  @{
    Path = "contact/partnership/index.html"; Title = "제휴 문의"; Kicker = "Partnership";
    Description = "마사지KING 제휴 문의와 콘텐츠 협업 시 확인하는 운영 기준입니다.";
    Lead = "제휴는 이용자 안전과 명확한 서비스 범위를 지키는 경우에만 검토합니다.";
    Sections = @(
      @{H="검토 기준"; P="서비스 범위, 운영 책임, 고객 응대 기준이 명확해야 합니다."},
      @{H="콘텐츠 기준"; P="허위 후기, 과장 문구, 검색 순위 조작 목적의 콘텐츠 제휴는 받지 않습니다."},
      @{H="문의 방법"; P="전화로 제휴 목적과 운영 형태를 먼저 알려주세요."}
    )
  },
  @{
    Path = "policy/editorial/index.html"; Title = "운영 정책"; Kicker = "Editorial policy";
    Description = "마사지KING 콘텐츠 작성, 검수, 업데이트, AI 활용 고지 기준입니다.";
    Lead = "마사지KING은 누가, 어떻게, 왜 작성했는지 알 수 있는 콘텐츠 운영 기준을 유지합니다.";
    Sections = @(
      @{H="작성 책임"; P="사이트 안내문은 마사지KING 운영팀이 예약 상담에서 확인되는 질문과 운영 기준을 바탕으로 작성합니다."},
      @{H="검수 방식"; P="서비스 범위, 안전 고지, 의료 행위가 아니라는 안내를 우선 확인합니다."},
      @{H="AI 활용"; P="초안 정리에는 AI 도움을 받을 수 있으나 최종 문구와 책임은 운영팀이 확인합니다."}
    )
  }
)

function Render-Page($page) {
  $title = Escape-Html($page.Title)
  $description = Escape-Html($page.Description)
  $lead = Escape-Html($page.Lead)
  $kicker = Escape-Html($page.Kicker)
  $sectionHtml = ""
  foreach ($section in $page.Sections) {
    $sectionHtml += @"
          <article>
            <h2>$(Escape-Html($section.H))</h2>
            <p>$(Escape-Html($section.P))</p>
          </article>
"@
  }

  return @"
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>$title | 마사지KING</title>
    <meta name="description" content="$description">
    <meta name="robots" content="noindex,follow,max-image-preview:large">
    <meta name="format-detection" content="telephone=no">
    <link rel="canonical" href="https://gandago.xyz/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:title" content="$title | 마사지KING">
    <meta property="og:description" content="$description">
    <meta property="og:image" content="https://gandago-2.pages.dev/assets/hero-wellness.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/content.css">
  </head>
  <body>
    <header class="site-header" aria-label="상단 메뉴">
      <a class="brand" href="/" aria-label="마사지KING 홈">
        <span class="brand-logo" aria-hidden="true"><img src="/assets/massage_king_logo_transparent.png" alt=""></span>
      </a>
$menu
      <a class="nav-cta" href="tel:05082024743">예약 문의</a>
    </header>

    <main class="content-page">
      <section class="page-hero">
        <p class="eyebrow">$kicker</p>
        <h1>$title</h1>
        <p>$lead</p>
        <dl class="page-meta" aria-label="콘텐츠 정보">
          <div>
            <dt>작성</dt>
            <dd>마사지KING 운영팀</dd>
          </div>
          <div>
            <dt>검수</dt>
            <dd>예약 상담 기준 확인</dd>
          </div>
          <div>
            <dt>업데이트</dt>
            <dd>2026-05-21</dd>
          </div>
        </dl>
      </section>

      <section class="content-grid" aria-label="$title 상세 안내">
$sectionHtml
      </section>

      <section class="who-how-why">
        <div>
          <h2>Who</h2>
          <p>이 문서는 마사지KING 운영팀이 예약 문의에서 반복적으로 확인되는 질문을 바탕으로 작성했습니다.</p>
        </div>
        <div>
          <h2>How</h2>
          <p>AI를 초안 정리에 보조적으로 활용할 수 있으며, 최종 안내와 책임은 운영팀이 확인합니다.</p>
        </div>
        <div>
          <h2>Why</h2>
          <p>검색 순위 조작이 아니라 예약자가 전화 전 필요한 정보를 확인하도록 돕기 위해 유지합니다.</p>
        </div>
      </section>

      <section class="page-cta">
        <div>
          <p class="eyebrow">Reservation</p>
          <h2>정확한 가능 여부는 전화 상담에서 확인하세요</h2>
          <p>지역, 시간, 방문 환경을 알려주시면 현재 기준으로 안내합니다.</p>
        </div>
        <a class="primary-button" href="tel:05082024743">0508-202-4743</a>
      </section>
    </main>

    <footer>
      <div>
        <strong>마사지KING</strong>
        <p>서울 · 경기 · 인천 · 부산 출장마사지 예약 안내</p>
      </div>
      <div>
        <p>예약 전화 <a href="tel:05082024743">0508-202-4743</a></p>
        <p>최종 업데이트: 2026-05-21</p>
      </div>
    </footer>
  </body>
</html>
"@
}

foreach ($page in $pages) {
  Write-Utf8File (Join-Path $root $page.Path) (Render-Page $page)
}

Write-Host "Generated $($pages.Count) content pages."
