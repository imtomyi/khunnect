"use client";

// ╔══════════════════════════════════════════════════════════════╗
// ║  컴포넌트: LoadingOverlay — "계산중입니다" 전체 화면 오버레이   ║
// ║                                                              ║
// ║  문제:                                                        ║
// ║    부모인 PageTransition(.page-transition)이 CSS animation을  ║
// ║    가지면 브라우저가 합성 레이어를 생성하고,                    ║
// ║    그 안의 position:fixed가 뷰포트 기준이 아닌                 ║
// ║    해당 레이어 기준으로 동작해 스크롤 시 같이 움직인다.          ║
// ║                                                              ║
// ║  해결:                                                        ║
// ║    createPortal로 document.body에 직접 렌더링 →               ║
// ║    PageTransition 래퍼를 완전히 벗어나                        ║
// ║    position:fixed가 항상 뷰포트 기준으로 동작한다.             ║
// ║                                                              ║
// ║  사용처:                                                      ║
// ║    src/app/(main)/curriculum/page.tsx                        ║
// ║    isCalculating=true 일 때만 렌더링                          ║
// ╚══════════════════════════════════════════════════════════════╝

import { createPortal } from "react-dom"; // document.body에 직접 마운트하기 위한 React 포털
import { SpinnerIcon } from "./Icons";    // 회전 스피너 SVG 아이콘 (Icons.tsx)

/**
 * LoadingOverlay — "계산중입니다" 전체 화면 고정 오버레이
 *
 * createPortal을 사용해 document.body 바로 아래에 렌더링하므로
 * 어떤 부모 요소의 animation/transform이 있어도 항상 뷰포트에 고정된다.
 */
export function LoadingOverlay() {
  return createPortal(
    <div style={{
      position: "fixed",   // 뷰포트 기준 고정 (portal 덕분에 부모 영향 없음)
      inset: 0,            // top/right/bottom/left 모두 0 → 전체 화면
      backgroundColor: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,        // 모든 UI 위에 표시
    }}>
      <div style={{
        backgroundColor: "#FFFFFF", borderRadius: "20px",
        width: "400px", height: "160px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "16px",
      }}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }`}</style>
        <SpinnerIcon />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#1F1A1A", marginBottom: "4px" }}>계산중입니다</p>
          <p style={{ fontSize: "14px", color: "#78716C" }}>잠시만 기다려주세요</p>
        </div>
      </div>
    </div>,
    document.body  // PageTransition 래퍼 바깥 — 뷰포트 기준 fixed 보장
  );
}
