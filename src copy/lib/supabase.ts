/**
 * @file src/lib/supabase.ts
 * @description Supabase 클라이언트 싱글턴 초기화 파일
 *
 * 역할:
 *  - 앱 전체에서 단 하나의 Supabase 클라이언트 인스턴스를 생성하고 export한다.
 *  - 서비스 파일(auth.ts, user.ts, curriculum.ts, connections.ts 등)에서
 *    `import { supabase } from "@/lib/supabase"`로 가져다 사용한다.
 *
 * Export:
 *  - supabase — Supabase 클라이언트 인스턴스
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ★ 실시간 채팅 연동을 위한 환경변수 설정
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  프로젝트 루트의 .env.local 파일에 아래 두 줄을 추가해야 한다:
 *
 *    NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트ID>.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon 공개 키>
 *
 *  확인 위치:
 *    Supabase 대시보드 → 해당 프로젝트 선택
 *    → Project Settings (톱니바퀴 아이콘) → API 탭
 *    → "Project URL" 과 "anon public" 키 복사
 *
 *  주의사항:
 *    - NEXT_PUBLIC_ 접두사가 있어야 브라우저에서 접근 가능하다.
 *    - anon key는 RLS(Row Level Security)로 보호되므로 공개되어도 무방하다.
 *    - service_role key는 절대 프론트엔드에 넣지 말 것 (모든 RLS 우회 가능).
 *    - .env.local은 .gitignore에 포함되어 있어야 한다.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ★ Realtime 기능 관련 클라이언트 설정 (선택사항)
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  기본 createClient()로도 Realtime이 동작하지만,
 *  더 세밀한 제어가 필요하면 아래처럼 옵션을 추가할 수 있다:
 *
 *    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
 *      realtime: {
 *        params: {
 *          eventsPerSecond: 10,  // 초당 최대 이벤트 수 (기본값: 10)
 *        },
 *      },
 *      auth: {
 *        persistSession: true,     // 세션을 localStorage에 유지 (기본값: true)
 *        autoRefreshToken: true,   // JWT 만료 전 자동 갱신 (기본값: true)
 *      },
 *    });
 *
 *  → 현재는 기본값으로 충분하므로 별도 옵션 없이 사용 중이다.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ★ 연동 후 Realtime 동작 확인 방법
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  1) 브라우저 콘솔에서 직접 테스트:
 *       import { supabase } from "@/lib/supabase";
 *       const ch = supabase.channel("test")
 *         .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" },
 *           (p) => console.log("새 메시지:", p.new))
 *         .subscribe();
 *       // → 다른 탭에서 메시지 전송 시 콘솔에 출력되면 정상
 *
 *  2) Supabase 대시보드 → Realtime → Inspector 탭
 *       실시간으로 이벤트 발생 여부 모니터링 가능
 *
 *  3) Network 탭에서 "wss://" 로 시작하는 WebSocket 연결 확인
 *       연결 성공 시 상태가 "101 Switching Protocols" 로 표시됨
 */

// @supabase/supabase-js — Supabase 공식 JS 클라이언트 라이브러리
import { createClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────────────────────
// 환경변수에서 Supabase 접속 정보 로드
// 값이 없으면 빈 문자열 사용 → createClient가 더미 클라이언트를 생성
// (런타임 에러 없이 Mock fallback이 동작하도록 허용)
// ────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// anon key는 공개되어도 무방한 키다 (RLS로 보안 제어).
// service_role key와 혼동하지 말 것 — service_role은 절대 클라이언트에 넣지 않는다.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// 앱 어디서나 동일한 클라이언트 인스턴스를 참조하도록 모듈 수준에서 생성한다.
// 모듈 캐싱 덕분에 여러 파일에서 import해도 인스턴스는 하나만 생성된다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
