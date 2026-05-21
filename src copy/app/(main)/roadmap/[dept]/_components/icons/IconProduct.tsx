/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: roadmap/[dept]/_components/icons/IconProduct.tsx                    ║
║  역할: 제품/쇼케이스 모양 SVG 아이콘 컴포넌트                                ║
║  사용처: FieldCard 아이콘 (제품 디자인 분야 — 4번째 분야용)                 ║
║  색상: #9A001F (브랜드 딥 레드, fill 하드코딩)                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/**
 * IconProduct
 *
 * 제품 쇼케이스/선반 형상의 24x24 SVG 아이콘.
 * DEPT_FIELDS에서 네 번째 분야 카드(제품 디자인)의 아이콘으로 사용됨.
 * clipPath를 사용하여 24x24 뷰포트로 클리핑됨.
 */
export default function IconProduct() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* clipPath로 24x24 경계 내에 아이콘 클리핑 */}
      <g clipPath="url(#clip0_140_5616)">
        {/* 선반 두 단 + 가운데 구멍 형태의 제품 아이콘 */}
        <path d="M17 10C18.1 10 19 9.1 19 8V5C19 3.9 18.1 3 17 3H7C5.9 3 5 3.9 5 5V8C5 9.1 5.9 10 7 10H8V12H7C5.9 12 5 12.9 5 14V21H7V18H17V21H19V14C19 12.9 18.1 12 17 12H16V10H17ZM7 8V5H17V8H7ZM17 16H7V14H17V16ZM14 12H10V10H14V12Z" fill="#9A001F"/>
      </g>
      <defs>
        <clipPath id="clip0_140_5616">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
