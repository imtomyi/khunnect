// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/app/layout.tsx                                            ║
// ║  역할: Next.js 전체 앱의 루트 레이아웃 (최상위 레이아웃)               ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - RootLayout (default)  : 모든 페이지를 감싸는 HTML 뼈대            ║
// ║    - metadata              : 전역 SEO 메타데이터                      ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - Next.js App Router가 자동으로 최상위에 적용                       ║
// ║    - src/app/(main)/layout.tsx, src/app/(auth)/* 등 모든 페이지가      ║
// ║      이 레이아웃 안에서 렌더링됨                                        ║
// ╚══════════════════════════════════════════════════════════════════════╝

import type { Metadata } from "next"; // Next.js가 제공하는 메타데이터 타입 — SEO/OG 태그 정의에 필요
import { Geist, Geist_Mono, Roboto } from "next/font/google"; // Google Fonts를 Next.js 방식으로 최적화 로딩
import DevNav from "@/components/DevNav"; // 개발 환경 전용 페이지 이동 패널 — 프로덕션에서는 렌더링 안 됨
import "./globals.css"; // Tailwind 기본값과 전역 CSS 변수(색상, 폰트 등)를 적용

// ── 폰트 정의 ──────────────────────────────────────────────────────────────
// Next.js next/font를 사용하면 폰트를 빌드 타임에 최적화하고 CSS 변수로 주입할 수 있음
// variable 옵션으로 CSS 커스텀 프로퍼티 이름을 지정하면 Tailwind에서 font-* 유틸리티로 참조 가능

const geistSans = Geist({
  variable: "--font-geist-sans", // globals.css 및 Tailwind 설정에서 참조하는 CSS 변수
  subsets: ["latin"],            // 라틴 문자 서브셋만 로드해 번들 크기 최소화
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // 코드 블록 등 모노스페이스가 필요한 곳에 사용
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",     // Navbar 버튼/레이블 등 특정 UI 요소에 사용
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // 필요한 굵기만 명시해 불필요한 폰트 파일 로드 방지
});

// ── 전역 메타데이터 ─────────────────────────────────────────────────────────
// Next.js App Router는 layout.tsx에서 export된 metadata 객체를 자동으로
// <head> 태그에 삽입함. 하위 페이지에서 재정의 가능.
export const metadata: Metadata = {
  title: "세모톤",                                         // 브라우저 탭 제목
  description: "커리큘럼 계산기, 커리어 로드맵, 선배와의 연결", // 검색 엔진 결과 설명문
};

/**
 * RootLayout
 *
 * @description
 * 앱 전체를 감싸는 최상위 HTML 구조.
 * - <html> 태그에 lang="ko"를 지정해 스크린리더·SEO에 언어 정보를 제공
 * - 폰트 CSS 변수를 className으로 주입해 하위 컴포넌트가 var(--font-*)로 참조 가능
 * - DevNav는 개발 환경에서만 표시되는 내비게이션 패널
 *
 * @param children - Next.js App Router가 주입하는 현재 페이지 트리
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko" // 한국어 사이트임을 명시 — 접근성·SEO 필수
      className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} h-full antialiased`}
      // h-full: <html>이 뷰포트 전체 높이를 차지해 footer가 항상 하단에 위치
      // antialiased: 폰트 렌더링 부드럽게 처리
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* min-h-full + flex-col: 콘텐츠가 적어도 전체 높이를 채우는 sticky footer 패턴 */}
        {/* bg-background / text-foreground: globals.css의 CSS 변수 기반 테마 색상 */}
        <DevNav /> {/* 개발 전용 페이지 이동 패널 — DevNav 내부에서 NODE_ENV 체크 후 null 반환 */}
        {children}  {/* 실제 페이지 콘텐츠가 이곳에 렌더링됨 */}
      </body>
    </html>
  );
}
