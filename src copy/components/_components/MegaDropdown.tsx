// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/_components/MegaDropdown.tsx                  ║
// ║  역할: Navbar의 "선배와의 연결" / "커리어 로드맵" 메뉴를 위한           ║
// ║        대학-학과 2단계 메가 드롭다운 UI 컴포넌트                        ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - Link          : 학과 링크 클릭 시 페이지 이동                     ║
// ║    - MegaMenuGroup : 대학 그룹 타입 (타이틀 + 항목 배열)               ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - MegaDropdown (default)                                          ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/components/Navbar.tsx  (선배/로드맵 드롭다운으로 2회 사용)     ║
// ╚══════════════════════════════════════════════════════════════════════╝

"use client"; // Link와 이벤트 핸들러를 사용하므로 클라이언트 컴포넌트

import Link from "next/link"; // 클라이언트 사이드 라우팅 — 클릭 시 전체 페이지 리로드 없이 이동
import type { MegaMenuGroup } from "../_lib/constants"; // 메뉴 데이터 구조 타입

/**
 * MegaDropdown 컴포넌트의 props 타입
 */
type MegaDropdownProps = {
  /** 드롭다운 열림 여부 — true이면 보임, false이면 투명+클릭불가 상태 */
  isOpen: boolean;
  /** 표시할 대학-학과 메뉴 데이터 배열 (SENIORS_MEGA_MENU 또는 ROADMAP_MEGA_MENU) */
  menu: MegaMenuGroup[];
  /** 학과 링크 클릭 시 드롭다운을 닫기 위해 부모(Navbar)에서 전달하는 콜백 */
  onLinkClick: () => void;
};

/**
 * MegaDropdown
 *
 * @description
 * Navbar에서 메뉴 항목에 hover/클릭 시 펼쳐지는 전폭 드롭다운.
 * 대학(열 제목) → 학과(링크) 2단계 구조를 3열 그리드로 표시.
 *
 * 애니메이션 전략:
 * - display none/block 대신 opacity + transform + pointerEvents 조합 사용
 * - DOM에 항상 존재하되 isOpen=false일 때 투명하고 클릭 불가 상태로 숨김
 * - 이렇게 하면 CSS transition이 양방향(열기/닫기) 모두 부드럽게 동작
 *
 * 열 진입 애니메이션:
 * - 각 열(colIdx)과 항목(itemIdx)에 delay를 달리 적용해 순차적 페이드-인 효과
 *
 * @param isOpen     - 드롭다운 표시 여부
 * @param menu       - 렌더링할 대학-학과 데이터
 * @param onLinkClick - 링크 클릭 시 부모의 openMenu 상태를 null로 초기화하는 함수
 */
export default function MegaDropdown({ isOpen, menu, onLinkClick }: MegaDropdownProps) {
  return (
    <div
      style={{
        position: "absolute", // Navbar(position: relative인 부모)를 기준으로 절대 배치
        top: "100%",           // Navbar 바로 아래에 붙어서 펼쳐짐
        left: 0,
        right: 0,              // left:0 + right:0 = 뷰포트 전폭으로 확장
        backgroundColor: "white",
        borderBottom: "1.5px solid rgba(241,245,249,0.8)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.10)", // 아래쪽으로 긴 그림자 — 콘텐츠 위에 떠있는 느낌
        transformOrigin: "top center", // 위쪽 중앙을 기준으로 scaleY 변환
        // 열림 상태: 완전히 표시, 닫힘 상태: 약간 위로 올라가며 축소
        transform: isOpen
          ? "translateY(0) scaleY(1)"
          : "translateY(-12px) scaleY(0.96)",
        opacity: isOpen ? 1 : 0,                  // 투명도로 페이드 효과
        pointerEvents: isOpen ? "auto" : "none",  // 닫힌 상태에서 링크 클릭 방지
        // cubic-bezier(0.16,1,0.3,1): 빠르게 펼쳐지고 천천히 멈추는 스프링 느낌의 이징
        transition: "opacity 320ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)",
        zIndex: 40, // Navbar(z-50)보다 낮고 일반 콘텐츠보다 높게
      }}
    >
      {/* 본문 컨텐츠와 동일한 최대 너비로 정렬 */}
      <div
        className="max-w-[1280px] mx-auto"
        style={{ paddingTop: "36px", paddingBottom: "36px", paddingLeft: "16px", paddingRight: "24px" }}
      >
        {/* 3열 그리드 — 대학 그룹(공과대학/예술디자인대학/소프트웨어융합대학)을 나란히 표시 */}
        <div className="grid grid-cols-3 gap-16 w-fit">
          {menu.map((group, colIdx) => (
            // colIdx별 왼쪽 여백으로 열간 시각적 리듬 조정
            <div key={group.title} className={`flex flex-col gap-4 ${colIdx === 1 ? "ml-[20px]" : colIdx === 2 ? "ml-[40px]" : ""}`}>

              {/* 대학명 — 열 머리글, 드롭다운 열릴 때 순차적으로 페이드인 */}
              <p
                className="text-xs font-semibold text-[#9CA3AF] tracking-widest uppercase"
                style={{
                  // colIdx * 60ms: 왼쪽 열부터 순서대로 나타나는 stagger 애니메이션
                  transition: `opacity 300ms ease ${colIdx * 60}ms, transform 300ms ease ${colIdx * 60}ms`,
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateY(0)" : "translateY(-10px)", // 위에서 아래로 슬라이드인
                }}
              >
                {group.title}
              </p>

              {/* 학과 링크 목록 */}
              <div className="flex flex-col gap-2">
                {group.items.map((item, itemIdx) => (
                  <Link
                    key={item.href} // href가 고유값이므로 key로 사용
                    href={item.href}
                    className="text-sm text-[#64748B] hover:underline decoration-current underline-offset-2 transition-colors"
                    style={{
                      // 대학명 delay + 항목 순번 * 25ms: 각 학과가 위에서부터 차례로 나타남
                      // +80ms: 대학명이 먼저 나타난 후 학과 목록이 이어서 등장
                      transition: `opacity 280ms ease ${colIdx * 60 + itemIdx * 25 + 80}ms, transform 280ms ease ${colIdx * 60 + itemIdx * 25 + 80}ms`,
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateY(0)" : "translateY(-8px)",
                    }}
                    onClick={onLinkClick} // 링크 클릭 시 부모의 openMenu를 null로 초기화해 드롭다운 닫기
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
