// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/Footer.tsx                                     ║
// ║  역할: 서비스 하단 푸터                                                ║
// ║        로고, 카피라이트, 주요 링크 모음을 가로 레이아웃으로 표시           ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - Logo : khunnect. 워드마크 로고 컴포넌트                           ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - Footer (default)                                                ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/app/(main)/layout.tsx  (메인 레이아웃 최하단)                 ║
// ╚══════════════════════════════════════════════════════════════════════╝

"use client"; // Link/이벤트 핸들러가 추가될 경우를 대비해 클라이언트 컴포넌트로 유지

import Logo from "@/components/Logo"; // khunnect. 워드마크 — 푸터 좌측 브랜딩에 사용

/**
 * Footer
 *
 * @description
 * 메인 레이아웃의 최하단에 렌더링되는 푸터 컴포넌트.
 * - 왼쪽: 로고 + 카피라이트 문구 (세로 배치)
 * - 오른쪽: 서비스 소개 / 이용약관 / 개인정보처리방침 / 문의하기 링크 (가로 배치)
 *
 * 현재 링크 항목은 클릭 핸들러 없이 표시만 되는 placeholder 상태.
 */
export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#F3F4F6", // 본문 흰 배경과 구분되는 연회색 배경
      borderTop: "1px solid #F0EDED", // 본문과 푸터 경계를 나타내는 얇은 선
      display: "flex",
      width: "100%",
      // 디자인 시안 기준 상하좌우 패딩값 — Tailwind 기본 단위와 맞지 않아 인라인으로 지정
      padding: "77.063px 348px 77.063px 348px",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between", // 로고 그룹과 링크 그룹을 양끝으로 배치
    }}>
      {/* 왼쪽: 로고 + 카피라이트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Logo size={22} /> {/* Navbar와 동일한 22px 크기로 브랜딩 일관성 유지 */}
        <p style={{ fontSize: "12px", color: "#C4B5B5", margin: 0 }}>
          © 2026 khunnect. All rights reserved.
          {/* 연한 핑크-회색(#C4B5B5)으로 카피라이트를 시각적으로 낮은 위계로 처리 */}
        </p>
      </div>

      {/* 오른쪽: 링크 목록 */}
      <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        {/* 링크 항목 배열을 map으로 렌더링 — 항목 추가/제거 시 배열만 수정하면 됨 */}
        {["서비스 소개", "이용약관", "개인정보처리방침", "문의하기"].map((item) => (
          <span
            key={item} // 고유 텍스트를 key로 사용 (변경 가능성 낮음)
            style={{ fontSize: "13px", color: "#A8A29E", cursor: "pointer" }}
            // cursor: pointer — 향후 클릭 핸들러 또는 <Link>로 교체할 것을 의도
          >
            {item}
          </span>
        ))}
      </div>
    </footer>
  );
}
