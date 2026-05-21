// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/Navbar.tsx                                     ║
// ║  역할: 메인 서비스의 상단 스티키 네비게이션 바                            ║
// ║        로고, 메뉴(드롭다운 포함), 로그아웃/메시지함/아바타 액션 제공       ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - MegaDropdown         : 선배와의 연결 / 커리어 로드맵 드롭다운 UI    ║
// ║    - SENIORS_MEGA_MENU    : 선배 메뉴 데이터 (학과 목록)                ║
// ║    - ROADMAP_MEGA_MENU    : 로드맵 메뉴 데이터 (학과 목록)              ║
// ║    - loadAvatarVariant    : localStorage에서 아바타 설정을 불러오는 함수 ║
// ║    - AvatarIcon           : 아바타 SVG 아이콘 컴포넌트                  ║
// ║    - AVATAR_VARIANTS      : 사용 가능한 아바타 디자인 목록               ║
// ║    - Logo                 : khunnect. 워드마크 로고                    ║
// ║    - signOut              : Supabase 로그아웃 서비스 함수               ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - Navbar (default)                                                ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/app/(main)/layout.tsx                                       ║
// ╚══════════════════════════════════════════════════════════════════════╝

"use client"; // 인터랙션(hover, 상태 관리)이 필요하므로 클라이언트 컴포넌트로 선언

import { useState, useEffect } from "react"; // 메뉴 열림 상태 및 아바타 초기화에 필요한 React 훅
import Link from "next/link";                // 클라이언트 사이드 라우팅을 위한 Next.js Link
import { usePathname, useRouter } from "next/navigation"; // 현재 경로 감지 및 프로그래매틱 이동
import MegaDropdown from "./_components/MegaDropdown"; // 대학/학과 목록을 보여주는 메가 드롭다운
import { SENIORS_MEGA_MENU, ROADMAP_MEGA_MENU } from "./_lib/constants"; // 메가 메뉴에 표시할 학과 데이터
import { loadAvatarVariant, AvatarIcon, AVATAR_VARIANTS, type AvatarVariant } from "@/lib/avatarVariants"; // 사용자 아바타 관련 유틸
import Logo from "@/components/Logo"; // khunnect. 워드마크 로고 컴포넌트
import { signOut } from "@/services/auth"; // Supabase 세션 종료 서비스 함수

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 반복 렌더링마다 객체가 재생성되지 않도록 컴포넌트 외부에서 상수로 선언

/** 네비게이션 바 컨테이너 — 하단 경계선과 미세한 그림자로 콘텐츠와 시각적 분리 */
const navStyle: React.CSSProperties = {
  borderBottom: "1.5px solid rgba(241,245,249,0.5)",
  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
};

/**
 * chevronStyle
 * 드롭다운 열림 여부에 따라 화살표 방향을 180도 회전시키는 동적 스타일 반환
 * @param isOpen - true이면 화살표가 위를 향함(드롭다운 열림)
 */
const chevronStyle = (isOpen: boolean): React.CSSProperties => ({
  transition: "transform 280ms ease",                          // 부드러운 회전 애니메이션
  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",       // 열림: 위쪽 ▲ / 닫힘: 아래쪽 ▼
});

/** 로그아웃 버튼 스타일 — 배경 없는 텍스트 버튼, 회색 글씨 */
const logoutBtnStyle: React.CSSProperties = {
  display: "flex",
  width: "78px",
  height: "34.5px",
  flexDirection: "column",
  justifyContent: "center",
  color: "#64748B",
  textAlign: "center",
  fontFamily: "var(--font-roboto), sans-serif", // RootLayout에서 주입한 Roboto 폰트 변수 참조
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "normal",
  background: "none", // 버튼 기본 배경 제거
  border: "none",     // 버튼 기본 테두리 제거
  cursor: "pointer",
};

/** 메시지함 버튼 스타일 — 브랜드 레드 배경의 pill 모양 CTA 버튼 */
const messagesBtnStyle: React.CSSProperties = {
  display: "flex",
  padding: "8px 20px",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "14998.5px",   // 완전한 pill 형태를 위해 매우 큰 값 사용
  background: "#9A001F",       // 경희대 브랜드 레드
  color: "#FFFFFF",
  fontFamily: "var(--font-roboto), sans-serif",
  fontSize: "14px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 14px 0 rgba(154,0,31,0.35)", // 레드 컬러 글로우 효과로 버튼 강조
  transition: "opacity 180ms ease",
};

/** 메시지함 버튼과 아바타 사이의 세로 구분선 */
const dividerStyle: React.CSSProperties = {
  width: "1.5px",
  height: "36px",
  flexShrink: 0,       // flex 컨테이너에서 줄어들지 않도록 고정
  background: "#E2E8F0",
};

/**
 * avatarWrapStyle
 * 아바타 아이콘을 감싸는 원형 컨테이너. 배경색은 아바타 변형별로 다름.
 * @param bg - 아바타의 배경 색상 문자열 (예: "#FFD6A5")
 */
const avatarWrapStyle = (bg: string): React.CSSProperties => ({
  width: "32px",
  height: "32px",
  borderRadius: "50%", // 원형 아바타
  backgroundColor: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────

/**
 * Navbar
 *
 * @description
 * 서비스 최상단에 sticky로 고정되는 네비게이션 바.
 * - 왼쪽: khunnect. 로고 (홈으로 링크)
 * - 중앙: 커리큘럼 계산기 링크, 선배와의 연결 드롭다운, 커리어 로드맵 드롭다운
 * - 오른쪽: 로그아웃 버튼, 메시지함 버튼, 구분선, 아바타(마이페이지 링크)
 *
 * 드롭다운은 openMenu 상태로 어떤 메뉴가 열려있는지 추적하며,
 * 마우스가 nav 영역을 벗어나면 자동으로 닫힘.
 */
export default function Navbar() {
  const pathname = usePathname(); // 현재 URL 경로 — 활성 메뉴 하이라이트에 사용
  const router = useRouter();     // 로그아웃 후 /login 으로 프로그래매틱 이동에 사용

  /**
   * openMenu
   * 현재 열려있는 메가 드롭다운의 키를 추적
   * - "seniors" : 선배와의 연결 드롭다운 열림
   * - "roadmap" : 커리어 로드맵 드롭다운 열림
   * - null      : 모든 드롭다운 닫힘
   */
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /**
   * avatar
   * 현재 사용자의 아바타 변형(색상 + 아이콘 조합)
   * localStorage에서 초기값을 불러오므로 SSR과의 hydration 불일치를 막기 위해
   * 초기값을 AVATAR_VARIANTS[0]으로 설정하고 useEffect에서 실제 값으로 교체
   */
  const [avatar, setAvatar] = useState<AvatarVariant>(AVATAR_VARIANTS[0]);

  // 컴포넌트 마운트 시 localStorage에서 사용자가 선택한 아바타를 불러와 상태에 반영
  // SSR 단계에서는 localStorage에 접근할 수 없으므로 useEffect 안에서만 실행
  useEffect(() => {
    setAvatar(loadAvatarVariant());
  }, []); // 빈 의존성 배열 — 최초 마운트 시 1회만 실행

  return (
    <nav
      className="sticky top-0 z-50 bg-white"
      // sticky top-0: 스크롤해도 화면 상단에 고정
      // z-50: 메가 드롭다운(z-40)보다 위, 일반 콘텐츠보다 위에 렌더링
      style={navStyle}
      onMouseLeave={() => setOpenMenu(null)} // 마우스가 nav 밖으로 나가면 드롭다운 닫기
    >
      {/* ── 네비게이션 바 본체 ── */}
      <div className="relative w-full h-[64px] flex items-center">

        {/* ── 로고 (화면 제일 왼쪽) ── */}
        {/* absolute left-6: 본문 영역 중앙 정렬과 무관하게 항상 왼쪽 끝에 위치 */}
        <div className="absolute left-6">
          <Link href="/">
            <Logo size={22} /> {/* 네비게이션 바 높이(64px)에 맞는 22px 크기 */}
          </Link>
        </div>

        {/* ── 메뉴 + 우측 액션 (본문 영역에 맞춤) ── */}
        {/* max-w-[1280px]: 본문 콘텐츠와 동일한 최대 너비로 정렬 일관성 유지 */}
        <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between">

          {/* ── 메뉴 ── */}
          {/* ml-[100px]: 로고 너비를 고려해 메뉴를 오른쪽으로 밀어 시각적 균형 맞춤 */}
          <div className="flex items-center gap-[50px] ml-[100px]">

            {/* 커리큘럼 계산기 — 드롭다운 없는 단순 링크 */}
            <Link
              href="/curriculum"
              className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors ${
                pathname.startsWith("/curriculum")
                  ? "text-[var(--color-brand)]"    // 현재 경로가 /curriculum이면 브랜드 색상 강조
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              커리큘럼 계산기
            </Link>

            {/* 선배와의 연결 — 드롭다운 트리거 */}
            {/* ml-[30px]: 커리큘럼 메뉴와의 시각적 간격 추가 조정 */}
            <div className="ml-[30px]" onMouseEnter={() => setOpenMenu("seniors")}>
              <button
                // 클릭으로도 토글 가능하게 — 이미 열려있으면 닫고, 닫혀있으면 열기
                onClick={() => setOpenMenu(openMenu === "seniors" ? null : "seniors")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-base font-medium transition-colors ${
                  pathname.startsWith("/seniors") || openMenu === "seniors"
                    ? "text-[#094F7A]"  // 선배 섹션 활성 색상(파란 계열, 로드맵과 구분)
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                선배와의 연결
                {/* 드롭다운 열림 여부에 따라 회전하는 화살표 아이콘 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={chevronStyle(openMenu === "seniors")}>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* 커리어 로드맵 — 드롭다운 트리거 */}
            <div className="ml-[30px]" onMouseEnter={() => setOpenMenu("roadmap")}>
              <button
                onClick={() => setOpenMenu(openMenu === "roadmap" ? null : "roadmap")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-base font-medium transition-colors ${
                  pathname.startsWith("/roadmap") || openMenu === "roadmap"
                    ? "text-[var(--color-brand)]" // 로드맵 활성 시 브랜드 레드
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                커리어 로드맵
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={chevronStyle(openMenu === "roadmap")}>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* ── 우측 액션 ── */}
        {/* mr-6: 화면 오른쪽 끝에서 24px 안쪽에 배치 */}
        <div className="flex items-center gap-3 mr-6">

          {/* 로그아웃 버튼 — signOut() 호출 후 /login 으로 리디렉션 */}
          <button
            onClick={async () => {
              await signOut();         // Supabase 세션 무효화
              router.push("/login");   // 로그인 페이지로 강제 이동
            }}
            style={logoutBtnStyle}
          >
            로그아웃
          </button>

          {/* 메시지함 버튼 — /messages 페이지로 이동 */}
          <Link href="/messages">
            <button style={messagesBtnStyle}>메시지함</button>
          </Link>

          {/* 메시지함 버튼과 아바타 사이 세로 구분선 */}
          <div className="mx-3" style={dividerStyle} />

          {/* 아바타 — 클릭 시 마이페이지로 이동 */}
          <Link href="/mypage">
            <div style={avatarWrapStyle(avatar.bg)}>
              {/* AvatarIcon: localStorage에서 불러온 사용자 아바타 SVG 렌더링 */}
              <AvatarIcon fill={avatar.fill} bodyPath={avatar.bodyPath} size={28} />
            </div>
          </Link>

        </div>
      </div>

      {/* ── 선배와의 연결 메가 드롭다운 ── */}
      {/* isOpen이 false이면 opacity:0 + pointerEvents:none 상태로 숨겨짐 (DOM에는 존재) */}
      <MegaDropdown
        isOpen={openMenu === "seniors"}
        menu={SENIORS_MEGA_MENU}
        onLinkClick={() => setOpenMenu(null)} // 링크 클릭 시 드롭다운 닫기
      />

      {/* ── 커리어 로드맵 메가 드롭다운 ── */}
      <MegaDropdown
        isOpen={openMenu === "roadmap"}
        menu={ROADMAP_MEGA_MENU}
        onLinkClick={() => setOpenMenu(null)}
      />

    </nav>
  );
}
