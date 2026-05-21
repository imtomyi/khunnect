// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/middleware.ts                                             ║
// ║  역할: Next.js 미들웨어 — 모든 요청 전에 실행되는 라우트 보호 레이어      ║
// ║                                                                      ║
// ║  현재 상태: mock 모드 (모든 경로 통과)                                  ║
// ║  추후 계획: Supabase 세션 검사 활성화 — 미인증 사용자를 /login으로 리디렉션 ║
// ║                                                                      ║
// ║  가져오기:                                                            ║
// ║    - NextResponse : 요청을 통과/리디렉션시키는 Next.js 응답 유틸         ║
// ║    - NextRequest  : 미들웨어에서 요청 정보를 읽는 타입                   ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - middleware (named) : Next.js가 자동으로 호출하는 미들웨어 함수      ║
// ║    - config    (named) : 미들웨어가 실행될 경로 패턴 설정               ║
// ║                                                                      ║
// ║  적용 범위 (config.matcher):                                          ║
// ║    - _next/static, _next/image, favicon.ico, .png 파일 제외           ║
// ║    - 나머지 모든 경로에서 실행                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝

// ============================================================
// Next.js Middleware — 라우트 보호
// 현재: mock 모드라 통과 처리
// Supabase 연동 시: 세션 검사 활성화
// ============================================================

import { NextResponse } from "next/server"; // 요청을 그대로 통과(next())시키거나 리디렉션할 때 사용
import type { NextRequest } from "next/server"; // 미들웨어 함수의 매개변수 타입

/**
 * 로그인 없이도 접근 가능한 공개 경로 목록
 * - pathname.startsWith()로 매칭하므로 하위 경로도 자동 허용
 * - /auth/callback: Supabase OAuth 인증 후 리디렉션되는 콜백 경로
 */
const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

/**
 * middleware
 *
 * @description
 * Next.js 서버에서 요청이 페이지/API에 도달하기 전에 실행되는 함수.
 * config.matcher에 매칭되는 모든 경로에서 호출됨.
 *
 * 현재 동작:
 * - 공개 경로(/login, /signup, /auth/callback)는 즉시 통과
 * - 나머지 경로도 현재는 mock 모드이므로 통과 (인증 검사 없음)
 *
 * Supabase 연동 후 변경 계획:
 * - createMiddlewareClient로 서버사이드 Supabase 클라이언트 생성
 * - getSession()으로 세션 존재 여부 확인
 * - 세션 없으면 /login으로 리디렉션
 *
 * @param request - Next.js가 전달하는 현재 HTTP 요청 객체
 * @returns NextResponse.next() (통과) 또는 NextResponse.redirect() (리디렉션)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; // 현재 요청의 경로 부분만 추출 (쿼리 제외)

  // 공개 경로는 인증 확인 없이 통과
  // startsWith 사용으로 /login?redirect=... 같은 쿼리 파라미터가 붙은 경우도 처리
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── Supabase 연동 시 아래 코드로 교체 ──────────────────────
  // import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
  //
  // export async function middleware(request: NextRequest) {
  //   const response = NextResponse.next();
  //   const supabase = createMiddlewareClient({ req: request, res: response });
  //   const { data: { session } } = await supabase.auth.getSession();
  //
  //   if (!session && !PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  //   return response;
  // }
  // ────────────────────────────────────────────────────────────

  // 현재: mock 모드 — 인증 없이 모든 보호 경로도 통과
  // TODO: Supabase 연동 시 위 주석 코드로 교체
  return NextResponse.next();
}

/**
 * config.matcher
 * 미들웨어가 실행될 경로 패턴을 정규식으로 지정.
 * 정적 파일(_next/static, _next/image)과 이미지(favicon, .png)는 제외해
 * 불필요한 미들웨어 실행을 방지하고 성능을 최적화.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
  // ↑ 네거티브 룩어헤드: 아래 경로들은 미들웨어 적용 제외
  //   - _next/static  : JS/CSS 번들 등 빌드 산출물
  //   - _next/image   : Next.js 이미지 최적화 엔드포인트
  //   - favicon.ico   : 파비콘
  //   - *.png         : 이미지 파일 (public/ 디렉토리의 PNG 포함)
};
