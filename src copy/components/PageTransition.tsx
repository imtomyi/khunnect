// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/PageTransition.tsx                             ║
// ║  역할: 라우트 변경 시 스크롤을 맨 위로 올리고 CSS 전환 애니메이션을 적용  ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - usePathname : 현재 URL 경로 감지용 Next.js 훅                    ║
// ║    - useEffect   : 경로 변경 감지 후 사이드이펙트 실행                  ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - PageTransition (default)                                        ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/app/(main)/layout.tsx  (본문 영역 전체를 감쌈)                ║
// ╚══════════════════════════════════════════════════════════════════════╝

"use client"; // usePathname, useEffect 등 브라우저 API를 사용하므로 클라이언트 컴포넌트 필수

import { usePathname } from "next/navigation"; // URL 경로 변경을 감지하기 위한 Next.js 훅
import { useEffect } from "react";             // 경로 변경 시 스크롤 초기화 사이드이펙트 실행

/**
 * PageTransition
 *
 * @description
 * 페이지 이동 시 두 가지 UX 개선을 처리하는 래퍼 컴포넌트:
 *
 * 1. 스크롤 초기화:
 *    pathname이 바뀔 때마다 window.scrollTo(0, 0)을 호출해
 *    새 페이지가 항상 최상단에서 시작하도록 보장.
 *    Next.js App Router는 기본적으로 스크롤 복원을 시도하지만
 *    레이아웃이 공유되는 경우 동작하지 않을 수 있어 명시적으로 처리.
 *
 * 2. CSS 전환 애니메이션:
 *    div에 key={pathname}을 사용해 경로가 바뀔 때 DOM 노드를 새로 마운트.
 *    globals.css의 .page-transition 클래스에 정의된 fade-in 애니메이션이
 *    매 페이지 이동마다 재실행됨.
 *
 * @param children - 애니메이션 래퍼 안에 렌더링할 페이지 트리
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  // 현재 URL 경로 — 경로가 바뀌면 useEffect와 key가 동시에 반응
  const pathname = usePathname();

  // 라우트가 변경될 때마다 스크롤을 최상단으로 이동
  // 의존성 배열에 pathname을 넣어 경로 변경 시마다 실행
  useEffect(() => {
    window.scrollTo(0, 0); // 이전 페이지의 스크롤 위치를 초기화해 새 페이지가 상단에서 시작
  }, [pathname]); // pathname이 바뀔 때만 실행

  return (
    // key={pathname}: 경로가 바뀌면 React가 이 div를 언마운트 후 재마운트
    // → .page-transition CSS 애니메이션이 매번 새로 트리거됨
    // → globals.css에 .page-transition { animation: fadeIn 0.2s ease; } 등으로 정의
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
