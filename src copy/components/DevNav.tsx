// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/DevNav.tsx                                     ║
// ║  역할: 개발 환경 전용 페이지 이동 패널                                   ║
// ║        NODE_ENV !== "development" 일 때는 null 반환(프로덕션 미노출)    ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - Link        : 클라이언트 사이드 라우팅                             ║
// ║    - usePathname : 현재 경로로 활성 링크 하이라이트                     ║
// ║    - useState    : 패널 열림/닫힘 상태 관리                             ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - DevNav (default)                                                ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/app/layout.tsx  (루트 레이아웃 — 모든 페이지에 마운트)          ║
// ╚══════════════════════════════════════════════════════════════════════╝

"use client"; // 상태 관리와 usePathname 사용으로 클라이언트 컴포넌트 필수

import Link from "next/link";                    // 클라이언트 사이드 페이지 이동
import { usePathname } from "next/navigation";   // 현재 경로 감지 — 활성 링크 강조에 사용
import { useState } from "react";                // 패널 열림/닫힘 토글 상태 관리

/**
 * 개발 중 빠른 페이지 이동을 위한 페이지 목록
 * label: 패널에 표시되는 이름
 * href: 이동할 경로
 */
const PAGES = [
  { label: "홈", href: "/" },
  { label: "커리큘럼", href: "/curriculum" },
  { label: "선배 목록", href: "/seniors" },
  { label: "선배 상세", href: "/seniors/senior-1" }, // 상세 페이지 UI 확인용 예시 경로
  { label: "마이페이지", href: "/mypage" },
  { label: "프로필 설정", href: "/mypage/settings" },
  { label: "캘린더", href: "/calendar" },
  { label: "메시지", href: "/messages" },
  { label: "로그인", href: "/login" },
  { label: "회원가입", href: "/signup" },
  { label: "온보딩", href: "/onboarding" },
];

/**
 * DevNav
 *
 * @description
 * 개발 환경에서만 표시되는 화면 왼쪽 고정 내비게이션 패널.
 * - 토글 버튼(◀/▶)으로 패널을 열고 닫을 수 있음
 * - 현재 경로와 일치하는 링크는 밝은 색으로 강조
 * - 프로덕션 빌드에서는 process.env.NODE_ENV 체크 후 null 반환 → 번들에서 제거 가능
 *
 * 패널은 left CSS 속성을 transition으로 애니메이션해 슬라이드 효과를 구현.
 * (CSS class가 아닌 인라인 스타일로 처리해 Tailwind purge 이슈 없이 동작)
 */
export default function DevNav() {
  const pathname = usePathname(); // 현재 URL 경로 — 활성 링크 스타일 결정에 사용

  /**
   * open
   * 패널의 열림/닫힘 상태
   * - true  : 패널이 left=0 위치에 슬라이드-인, 토글 버튼도 144px 오른쪽으로 이동
   * - false : 패널이 left=-144px 으로 슬라이드-아웃, 토글 버튼만 화면 왼쪽 끝에 표시
   */
  const [open, setOpen] = useState(false);

  // 개발 환경이 아니면 아무것도 렌더링하지 않음
  // 이 체크는 런타임에 일어나므로 컴포넌트가 번들에는 포함되지만 DOM에 마운트되지 않음
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      {/* 토글 버튼 — 패널이 닫혀있어도 항상 화면 왼쪽에 표시 */}
      <button
        onClick={() => setOpen((v) => !v)} // 현재 상태의 반대값으로 토글
        style={{
          position: "fixed",
          // 패널이 열리면 버튼을 패널 너비(144px)만큼 오른쪽으로 밀어냄
          left: open ? "144px" : "0px",
          top: "50%",
          transform: "translateY(-50%)", // 세로 중앙 정렬
          zIndex: 9999,                  // 모든 UI 요소 위에 표시
          backgroundColor: "#18181b",
          color: "#a1a1aa",
          border: "none",
          borderRadius: "0 6px 6px 0",  // 오른쪽만 둥글게 — 패널에서 튀어나온 탭처럼 보임
          padding: "8px 4px",
          cursor: "pointer",
          fontSize: "10px",
          transition: "left 200ms ease", // 패널 슬라이드와 동일한 속도로 버튼도 이동
          lineHeight: 1,
        }}
        title={open ? "DevNav 닫기" : "DevNav 열기"} // 호버 툴팁
      >
        {open ? "◀" : "▶"} {/* 방향 화살표로 열림/닫힘 직관적으로 표시 */}
      </button>

      {/* 패널 — 닫힌 상태에서는 left: -144px 으로 화면 밖에 숨겨짐 */}
      <nav
        style={{
          position: "fixed",
          left: open ? "0px" : "-144px", // 슬라이드 애니메이션의 시작/끝 위치
          top: 0,
          height: "100%",
          width: "144px",
          transition: "left 200ms ease", // 부드러운 슬라이드 인/아웃
          zIndex: 9998,                   // 토글 버튼(9999)보다 한 단계 아래
        }}
        className="bg-zinc-900 text-zinc-100 text-xs flex flex-col gap-1 p-2 pt-4 overflow-y-auto"
        // overflow-y-auto: 페이지 목록이 화면 높이를 초과할 경우 내부 스크롤
      >
        <p className="text-zinc-500 font-semibold mb-2 px-1">DEV NAV</p>

        {/* PAGES 배열을 순회해 각 페이지로 이동하는 링크 렌더링 */}
        {PAGES.map((page) => (
          <Link
            key={page.href} // href를 key로 사용 — 경로는 고유값이므로 안전
            href={page.href}
            className={`px-2 py-1.5 rounded transition-colors hover:bg-zinc-700 ${
              pathname === page.href
                ? "bg-zinc-700 text-white"  // 현재 경로와 일치하면 밝게 강조
                : "text-zinc-400"           // 비활성 링크는 흐리게
            }`}
          >
            {page.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
