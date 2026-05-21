// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/app/(main)/layout.tsx                                     ║
// ║  역할: 메인 서비스 영역(로그인 후 화면)의 공통 레이아웃                  ║
// ║        Navbar + 본문 컨테이너 + Footer를 제공                          ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - Navbar          : 상단 네비게이션 바                              ║
// ║    - PageTransition  : 페이지 전환 시 스크롤 초기화 + 애니메이션 래퍼    ║
// ║    - Footer          : 하단 푸터                                      ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - MainLayout (default)                                            ║
// ║                                                                      ║
// ║  적용 범위:                                                           ║
// ║    - (main) 라우트 그룹 하위의 모든 페이지                              ║
// ║      예) /  /curriculum  /seniors  /roadmap  /mypage  /messages 등   ║
// ╚══════════════════════════════════════════════════════════════════════╝

import Navbar from "@/components/Navbar";           // 상단 스티키 네비게이션 바
import PageTransition from "@/components/PageTransition"; // 라우트 변경 시 스크롤 최상단 이동 + CSS 전환
import Footer from "@/components/Footer";           // 서비스 하단 푸터

/**
 * MainLayout
 *
 * @description
 * (main) 라우트 그룹의 모든 페이지에 공통으로 적용되는 레이아웃.
 * - Navbar: sticky top-0 으로 스크롤 시에도 상단 고정
 * - main: flex-1 로 남은 세로 공간을 모두 채워 Footer가 항상 하단에 위치
 * - PageTransition: 페이지 이동 시 스크롤을 맨 위로 올리고 CSS 페이드 애니메이션 적용
 * - 본문 최대 너비 1280px, 상하 패딩 49.54px — 디자인 가이드 기준 여백
 *
 * @param children - Next.js가 주입하는 현재 페이지 컴포넌트 트리
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 상단 네비게이션 바 — sticky 처리는 Navbar 컴포넌트 내부에서 담당 */}
      <Navbar />

      {/* flex-1: RootLayout body(flex-col)에서 남은 공간을 채워 Footer를 하단에 고정 */}
      <main className="flex-1">
        {/* PageTransition: key={pathname}으로 리마운트되어 라우트 변경 시 스크롤 초기화 */}
        <PageTransition>
          {/* 본문 콘텐츠 최대 너비 제한 및 중앙 정렬 */}
          <div
            className="max-w-[1280px] mx-auto w-full px-6"
            style={{ paddingTop: "49.54px", paddingBottom: "49.54px" }}
            // paddingTop/Bottom: 디자인 시안의 상하 여백값(49.54px)을 인라인으로 직접 지정
            // Tailwind의 기본 간격 단위가 4px 배수이므로 비표준값은 인라인 스타일 사용
          >
            {children} {/* 각 페이지 컴포넌트가 이 자리에 렌더링됨 */}
          </div>

          {/* 하단 푸터 — PageTransition 안에 포함해 페이지 전환 페이드 효과 적용 */}
          <Footer />
        </PageTransition>
      </main>
    </>
  );
}
