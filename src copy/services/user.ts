/**
 * @file src/services/user.ts
 * @description 사용자 프로필 서비스 — 현재 사용자 조회, 관심 분야 업데이트, 선배 스크랩
 *
 * 역할:
 *  - 로그인한 사용자의 프로필 정보를 백엔드에서 가져온다.
 *  - 관심 분야 목록과 스크랩한 선배 목록을 업데이트한다.
 *  - 현재 REST API(getCurrentUser)와 MOCK(updateUserFields, toggleScrapSenior)이 혼재한다.
 *
 * ★ 중요:
 *  getCurrentUser()가 반환하는 User.departmentId 값이
 *  getCatalogCourses()의 학과 필터 키로 사용된다.
 *  이 값이 잘못되면 다른 학과 과목이 노출되므로 반드시 정확히 매핑해야 한다.
 *
 * Export:
 *  - getCurrentUser      — 현재 로그인 사용자 정보 반환
 *  - updateUserFields    — 관심 분야 목록 업데이트
 *  - toggleScrapSenior   — 선배 스크랩 추가/해제
 *
 * 사용처:
 *  - src/app/(main)/page.tsx (홈 화면 사용자 정보 표시)
 *  - src/app/(main)/curriculum/ (커리큘럼 계산기)
 *  - src/app/(main)/messages/ (채팅)
 *  - 마이페이지, 온보딩 등
 */

// @/types — 프로젝트 공통 타입 정의 파일에서 User 타입을 가져온다.
import type { User } from "@/types"; // 사용자 프로필 타입
// @/mock — 백엔드 미연결 시 사용할 목업 사용자 데이터
import { MOCK_USER } from "@/mock"; // 개발/디자인 리뷰용 목업 사용자

// ╔══════════════════════════════════════════════════════════════╗
// ║  서비스: 유저 (user)                                          ║
// ║  현재 모드 : MOCK                                             ║
// ║  연동 대상 : Supabase — profiles 테이블                       ║
// ║  교체 방법 : 각 함수 안의 SUPABASE 블록 주석 해제 후           ║
// ║             MOCK 블록 삭제                                    ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  ★ 핵심 주의사항                                              ║
// ║  getCurrentUser()가 반환하는 User.departmentId 가             ║
// ║  getCatalogCourses() 의 필터 키로 사용됨.                     ║
// ║  이 값이 없거나 잘못되면 다른 학과 과목이 노출되므로            ║
// ║  회원가입 시 저장된 department_id 를 반드시 그대로 읽어야 함.  ║
// ╚══════════════════════════════════════════════════════════════╝

// 백엔드 API 서버 주소. .env.local의 값이 없으면 로컬 개발 서버를 사용한다.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// import { supabase } from "@/lib/supabase";

// ──────────────────────────────────────────────────────────────
// getCurrentUser  — 현재 로그인한 사용자 정보 반환
// DB 테이블 : profiles  (+ auth.users for email)
// ★ 반환값의 departmentId → getCatalogCourses() 에 전달
// ──────────────────────────────────────────────────────────────
/**
 * 현재 로그인한 사용자의 프로필 정보를 반환한다.
 *
 * - localStorage에 access_token이 없으면 MOCK_USER를 반환한다 (비로그인 개발 모드).
 * - token이 있으면 GET /auth/me를 호출해 실제 사용자 정보를 가져온다.
 * - 백엔드 응답의 user_metadata를 FE User 타입으로 매핑한다.
 *
 * ★ 반환값의 departmentId가 curriculum.ts의 getCatalogCourses()에 전달되므로
 *    이 값이 반드시 올바르게 채워져야 한다.
 *
 * @returns {Promise<User>} 현재 사용자 프로필 (비로그인 시 MOCK_USER)
 * @throws {Error} API 호출 실패 시
 */
export async function getCurrentUser(): Promise<User> {
  // localStorage에서 로그인 시 저장된 JWT 토큰을 확인한다.
  const token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");
  if (!token) throw new Error("로그인이 필요합니다.");

  try {
    const response = await fetch(`${API_URL}/profile/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // JWT 토큰으로 사용자 식별
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "사용자 정보를 가져오는데 실패했습니다.");
    }

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      department: result.department,
      student_id: result.student_id,
      created_at: result.created_at,
      is_graduated: result.is_graduated,
      grade: result.grade,
      interestedFields: MOCK_USER.interestedFields,
      profileImage: MOCK_USER.profileImage,
      courses: MOCK_USER.courses,
      scrapedSeniorIds: MOCK_USER.scrapedSeniorIds,
      scrapedCourseIds: MOCK_USER.scrapedCourseIds,
    };
  } catch (error) {
    console.error("getCurrentUser Error:", error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────
// updateUserFields  — 관심 분야 목록 업데이트
// DB 테이블 : profiles.interested_fields (text[])
// ──────────────────────────────────────────────────────────────
/**
 * 사용자의 관심 분야 목록을 업데이트한다.
 *
 * 현재 MOCK 상태 (no-op).
 * Supabase 연동 시 profiles.interested_fields 컬럼을 업데이트한다.
 *
 * @param {string}   userId          업데이트할 사용자 ID
 * @param {string[]} interestedFields 새로운 관심 분야 목록
 * @returns {Promise<void>}
 */
export async function updateUserFields(
  userId: string,
  interestedFields: string[]
): Promise<void> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // const { error } = await supabase
  //   .from("profiles")
  //   .update({ interested_fields: interestedFields })
  //   .eq("id", userId);
  // if (error) throw error;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중 — no-op) ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // void를 사용해 미사용 변수 TypeScript 경고를 억제한다.
  void userId;
  void interestedFields;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// toggleScrapSenior  — 선배 스크랩 추가/해제
// DB 테이블 : profiles.scraped_senior_ids (text[])
// ──────────────────────────────────────────────────────────────
/**
 * 선배를 스크랩 목록에 추가하거나 해제한다 (토글).
 *
 * 현재 MOCK 상태 (no-op).
 * Supabase 연동 시:
 *  1. profiles.scraped_senior_ids 현재 값을 조회한다.
 *  2. seniorId가 이미 있으면 제거, 없으면 추가한다.
 *  3. 업데이트된 배열을 저장한다.
 *
 * @param {string} userId   스크랩을 변경할 사용자 ID
 * @param {string} seniorId 스크랩 추가/해제할 선배 ID
 * @returns {Promise<void>}
 */
export async function toggleScrapSenior(
  userId: string,
  seniorId: string
): Promise<void> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // const { data: profile, error: fetchError } = await supabase
  //   .from("profiles")
  //   .select("scraped_senior_ids")
  //   .eq("id", userId)
  //   .single();
  // if (fetchError) throw fetchError;
  //
  // const current: string[] = profile?.scraped_senior_ids ?? [];
  // const next = current.includes(seniorId)
  //   ? current.filter((id) => id !== seniorId)
  //   : [...current, seniorId];
  //
  // const { error: updateError } = await supabase
  //   .from("profiles")
  //   .update({ scraped_senior_ids: next })
  //   .eq("id", userId);
  // if (updateError) throw updateError;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중 — no-op) ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // void를 사용해 미사용 변수 TypeScript 경고를 억제한다.
  void userId;
  void seniorId;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}
