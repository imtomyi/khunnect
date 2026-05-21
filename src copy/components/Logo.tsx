// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/Logo.tsx                                       ║
// ║  역할: "khunnect." 워드마크 로고 컴포넌트                               ║
// ║        size prop으로 비율을 유지하며 크기 조절 가능                      ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - Logo (default)                                                  ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/components/Navbar.tsx   (size=22, 상단 네비게이션 바)          ║
// ║    - src/components/Footer.tsx   (size=22, 하단 푸터)                 ║
// ╚══════════════════════════════════════════════════════════════════════╝

// ── 폰트 스타일 정의 ────────────────────────────────────────────────────────
// 로고는 두 가지 서체를 조합해 "khu"와 "nnect."를 시각적으로 구분
// CSS-in-JS 방식(인라인 스타일 객체)을 사용해 외부 CSS 의존성 없이 스타일을 캡슐화

/**
 * "khu" 파트의 스타일
 * - 경희대학교 브랜드 레드 (#9A001F) 색상
 * - AvantGarde LT Bold 폰트 — public/ 에 직접 추가한 커스텀 폰트
 */
const khuStyle: React.CSSProperties = {
  color: "#9A001F",                     // 경희대 공식 브랜드 컬러
  fontFamily: '"AvantGarde LT Bold"',   // public/AvantGardeLT-Bold.otf 파일로 로드
  fontSize: "32px",                     // 기본 크기 — scale 계산의 기준값
  fontWeight: 400,
  lineHeight: "20px",
  letterSpacing: "-1px",                // 자간을 좁혀 두 파트가 자연스럽게 붙어 보이게
};

/**
 * "nnect." 파트의 스타일
 * - 차분한 회갈색 (#524949) 색상으로 "khu"와 대비
 * - AvantGarde Bk BT 폰트 — public/avantgarde-bk-bt-2/ 폴더에 추가한 커스텀 폰트
 */
const nnectStyle: React.CSSProperties = {
  color: "#524949",                     // khu 파트보다 연한 색상으로 시각적 위계 형성
  fontFamily: '"AvantGarde Bk BT"',     // public/avantgarde-bk-bt-2/ 폴더 내 폰트 파일
  fontSize: "32px",                     // 기본 크기 — scale 계산의 기준값
  fontWeight: 400,
  lineHeight: "20px",
  letterSpacing: "-1px",
};

/**
 * Logo
 *
 * @description
 * "khu" + "nnect." 두 텍스트 스팬을 나란히 배치해 로고를 구성.
 * size prop을 기준 크기(32px)로 나눈 배율(scale)을 곱해 폰트 크기와 라인높이를 조정하므로
 * 어느 크기에서도 비율이 깨지지 않음.
 *
 * @param size - 렌더링할 폰트 크기(px). 기본값 32. Navbar/Footer에서는 22로 사용.
 */
export default function Logo({ size = 32 }: { size?: number }) {
  // 기준 크기(32px) 대비 현재 크기의 배율 계산
  // 예) size=22 이면 scale = 22/32 = 0.6875
  const scale = size / 32;

  return (
    // inline-flex + alignItems: baseline — 두 스팬의 폰트 기준선을 맞춰 자연스럽게 정렬
    <span style={{ display: "inline-flex", alignItems: "baseline", lineHeight: `${20 * scale}px` }}>
      {/* "khu" — 경희대 브랜드 컬러 */}
      <span style={{ ...khuStyle, fontSize: `${32 * scale}px`, lineHeight: `${20 * scale}px` }}>khu</span>
      {/* "nnect." — 부드러운 회색으로 대비 */}
      <span style={{ ...nnectStyle, fontSize: `${32 * scale}px`, lineHeight: `${20 * scale}px` }}>nnect.</span>
    </span>
  );
}
