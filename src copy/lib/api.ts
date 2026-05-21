/**
 * @file src/lib/api.ts
 * @description 백엔드 REST API 공통 요청 유틸리티
 *
 * 역할:
 *  - 인증 헤더(Authorization: Bearer 토큰)를 자동으로 붙여 fetch 요청을 보낸다.
 *  - 모든 서비스 레이어(curriculum.ts, connections.ts 등)에서
 *    fetch를 직접 쓰는 대신 이 함수를 사용한다.
 *
 * Export:
 *  - apiRequest<T> — 인증 헤더 포함 범용 fetch 래퍼
 *
 * 사용처:
 *  - src/services/connections.ts → sendMessage() (POST /messages/{connection_id})
 *  - src/services/curriculum.ts  → getUserCourses, getCheckedCourses 등
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ★ 실시간 채팅 연동을 위한 백엔드 API 설정
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  [ 환경변수 설정 (.env.local) ]
 *
 *    NEXT_PUBLIC_API_BASE_URL=https://<백엔드 서버 주소>
 *    예) NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000  (로컬 개발)
 *        NEXT_PUBLIC_API_BASE_URL=https://api.khunnect.com  (프로덕션)
 *
 *  [ access_token 저장 위치 ]
 *
 *    getAuthHeaders()는 localStorage의 "access_token" 키에서 JWT를 읽는다.
 *    이 값은 src/services/auth.ts의 signIn() 함수가 로그인 성공 후 저장한다:
 *      localStorage.setItem("access_token", session.access_token)
 *
 *    → 로그인 전에 apiRequest()를 호출하면 "로그인이 필요합니다." 에러가 throw된다.
 *    → 로그인 상태가 아닐 때 채팅 페이지에 접근하지 못하도록
 *      middleware.ts 또는 페이지 레벨 가드가 필요하다.
 *
 *  [ 백엔드 메시지 전송 엔드포인트 스펙 ]
 *
 *    POST /messages/{connection_id}
 *    Headers:
 *      Authorization: Bearer <JWT access_token>
 *      Content-Type: application/json
 *    Body:
 *      { "content": "메시지 내용" }
 *    Response (성공):
 *      HTTP 200 또는 201
 *      {
 *        "data": {
 *          "id": "uuid",
 *          "connection_id": "uuid",
 *          "sender_id": "uuid",
 *          "content": "메시지 내용",
 *          "created_at": "2026-04-03T10:00:00Z"
 *        }
 *      }
 *    Response (실패):
 *      HTTP 4xx/5xx
 *      { "message": "에러 설명" }  ← apiRequest가 이 메시지를 Error로 throw
 *
 *  [ 백엔드 없이 Supabase만 사용할 경우 ]
 *
 *    apiRequest()를 사용하지 않고 connections.ts의 sendMessage()를
 *    아래 코드로 교체하면 된다 (STEP 6 주석 참고):
 *
 *      const { data, error } = await supabase
 *        .from("messages")
 *        .insert({ connection_id, sender_id, content })
 *        .select().single();
 *      if (error) throw error;
 *      return toMessage(data);
 *
 *    이 경우 api.ts와 access_token 저장은 불필요하다.
 *    Supabase 클라이언트가 auth.signIn() 세션을 자동으로 관리한다.
 */

// 환경변수에서 API 베이스 URL을 읽는다.
// .env.local에 NEXT_PUBLIC_API_BASE_URL이 없으면 로컬 개발 서버 주소를 기본값으로 사용한다.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

/**
 * getAuthHeaders — localStorage에서 JWT 토큰을 꺼내 인증 헤더를 생성한다.
 *
 * ★ 토큰이 없으면 에러를 throw한다.
 *   → src/services/auth.ts의 signIn() 호출 후 localStorage에
 *     "access_token" 키로 JWT가 저장되어 있어야 한다.
 *   → 토큰 만료 시 자동 갱신 로직이 없으므로,
 *     만료 에러 발생 시 재로그인 유도 처리가 필요하다.
 *
 * @returns {Promise<HeadersInit>} Content-Type + Authorization 헤더 객체
 * @throws {Error} localStorage에 access_token이 없을 경우
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  // localStorage에서 로그인 시 저장된 JWT 토큰을 꺼낸다.
  // (src/services/auth.ts signIn() → localStorage.setItem("access_token", ...))
  const token = localStorage.getItem("access_token");
  // 토큰이 없으면 인증되지 않은 상태이므로 즉시 에러를 발생시킨다.
  if (!token) throw new Error("로그인이 필요합니다.");
  return {
    "Content-Type": "application/json", // 요청/응답 모두 JSON 형식임을 명시
    Authorization: `Bearer ${token}`,   // JWT Bearer 토큰 — 백엔드에서 사용자 식별에 사용
  };
}

/**
 * apiRequest — 인증 헤더가 포함된 범용 API 요청 함수
 *
 * 모든 서비스 파일에서 fetch를 직접 쓰는 대신 이 함수를 사용한다.
 * 응답이 실패(res.ok === false)면 에러를 throw하고,
 * 성공이면 응답 JSON의 data 필드를 제네릭 타입 T로 반환한다.
 *
 * ★ 백엔드 응답 형식 주의:
 *   반드시 { "data": <결과값> } 형태로 응답해야 한다.
 *   이 형식이 아니면 undefined가 반환된다.
 *
 * @template T 반환받을 데이터 타입 (호출 측에서 명시)
 * @param {string} path 베이스 URL 이후의 경로 (예: "/messages/conn-123")
 * @param {RequestInit} [options] fetch에 전달할 추가 옵션 (method, body 등)
 * @returns {Promise<T>} 백엔드 응답 JSON의 data 필드
 * @throws {Error} 네트워크 오류, 토큰 없음, 또는 HTTP 에러 응답 시
 */
export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  // getAuthHeaders()가 토큰 없음 에러를 throw할 수 있으므로 항상 await 필요
  const headers = await getAuthHeaders();
  // BASE_URL과 path를 합쳐 최종 URL을 구성하고, 인증 헤더를 options에 병합한다.
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    // 응답 본문에서 에러 메시지를 꺼내되, 파싱 실패 시 빈 객체로 폴백한다.
    const err = await res.json().catch(() => ({}));
    // 백엔드가 message 필드를 제공하면 그것을, 없으면 HTTP 상태 코드를 에러 메시지로 사용한다.
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }

  const json = await res.json();
  // 백엔드 응답 구조가 { data: T } 형태이므로 .data를 꺼내 반환한다.
  // ★ 백엔드가 다른 구조로 응답하면 이 부분을 수정해야 한다.
  return json.data as T;
}
