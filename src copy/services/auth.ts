/**
 * @file src/services/auth.ts
 * @description 인증 서비스 — 회원가입, 로그인, 로그아웃, Google OAuth
 *
 * 역할:
 *  - 사용자 인증과 관련된 모든 API 호출을 담당한다.
 *  - 현재는 실제 백엔드 REST API(signUp, signIn)와 연결되어 있으며,
 *    일부 기능(signOut, signInWithGoogle)은 아직 MOCK 상태이다.
 *  - Supabase Auth 연동 코드가 주석 블록으로 준비되어 있어
 *    필요 시 쉽게 전환할 수 있다.
 *
 * Export:
 *  - SignupData         — 회원가입 입력 데이터 타입
 *  - signUp             — 회원가입 처리
 *  - signIn             — 이메일/비밀번호 로그인
 *  - signOut            — 로그아웃
 *  - signInWithGoogle   — Google OAuth 로그인
 *
 * 사용처:
 *  - src/app/(auth)/login/_components/LoginForm.tsx
 *  - src/app/(auth)/signup/page.tsx
 *
 * Supabase 연동 DB 구조:
 *  - auth.users         — Supabase 자동 관리 인증 테이블
 *  - profiles           — 회원가입 시 직접 insert하는 사용자 프로필 테이블
 *  - departments        — 학과 정보 테이블 (회원가입 시 department_id 조회에 사용)
 */

// 백엔드 API 서버 주소. .env.local의 NEXT_PUBLIC_API_URL이 없으면 로컬 개발 서버를 사용한다.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ╔══════════════════════════════════════════════════════════════╗
// ║  서비스: 인증 (auth)                                          ║
// ║  현재 모드 : MOCK (console.log 처리)                          ║
// ║  연동 대상 : Supabase Auth + profiles 테이블                  ║
// ║  교체 방법 : 각 함수 안의 SUPABASE 블록 주석 해제 후           ║
// ║             MOCK 블록 삭제                                    ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  Supabase 테이블 구조                                         ║
// ║                                                              ║
// ║  [auth.users]  ← Supabase 자동 관리                          ║
// ║    id (uuid PK) · email · created_at                         ║
// ║                                                              ║
// ║  [profiles]  ← 회원가입 시 직접 insert                        ║
// ║    id               uuid PK  → auth.users(id) ON DELETE CASCADE ║
// ║    name             text                                     ║
// ║    student_id       text                                     ║
// ║    department_id    uuid → departments(id)  ★ 커리큘럼 핵심  ║
// ║    is_graduated     boolean  default false                   ║
// ║    profile_image    text  nullable                           ║
// ║    interested_fields   text[]  default '{}'                  ║
// ║    scraped_senior_ids  text[]  default '{}'                  ║
// ║    scraped_course_ids  text[]  default '{}'                  ║
// ║    created_at       timestamp  default now()                 ║
// ║                                                              ║
// ║  [departments]                                               ║
// ║    id uuid PK · college_id uuid · name text                  ║
// ║                                                              ║
// ║  RLS 권장 설정                                                ║
// ║    profiles      : SELECT/UPDATE where id = auth.uid()       ║
// ║    user_courses  : SELECT/INSERT/DELETE where user_id = auth.uid() ║
// ║    catalog_courses, curriculum_requirements : SELECT public  ║
// ║    departments, colleges : SELECT public                     ║
// ╚══════════════════════════════════════════════════════════════╝

// import { supabase } from "@/lib/supabase";

// ── 타입 ──────────────────────────────────────────────────────

/**
 * 회원가입 시 필요한 입력 데이터 타입.
 *
 * @property {string}  email       사용자 이메일 (로그인 ID로 사용)
 * @property {string}  password    비밀번호
 * @property {string}  name        사용자 이름
 * @property {string}  studentId   학번
 * @property {string}  department  학과 이름 (예: "산업디자인학과")
 * @property {boolean} isGraduated 졸업 여부
 */
export type SignupData = {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;   // 학과 이름 (ex: "산업디자인학과")
  isGraduated: boolean;
};

// ──────────────────────────────────────────────────────────────
// signUp  — 회원가입
// 1. Supabase Auth 계정 생성
// 2. departments 테이블에서 학과명으로 department_id 조회
// 3. profiles 테이블에 사용자 정보 저장
// ★ department_id 가 커리큘럼 과목 조회의 핵심 키
// ──────────────────────────────────────────────────────────────
/**
 * 새 사용자 계정을 생성한다.
 *
 * 백엔드 POST /auth/signup 엔드포인트를 호출한다.
 * Supabase 연동 시에는 Auth 계정 생성 → department_id 조회 → profiles insert 순으로 진행된다.
 *
 * @param {SignupData} data 회원가입 폼 입력값
 * @returns {Promise<{ success: boolean; error?: string }>}
 *   성공 시 { success: true }, 실패 시 { success: false, error: 에러 메시지 }
 */
export async function signUp(data: SignupData): Promise<{ success: boolean; error?: string }> {
  try {
    // POST 요청으로 회원가입 데이터를 백엔드에 전송한다.
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // 백엔드에서 반환한 에러 메시지 또는 기본 메시지를 사용한다.
      throw new Error(result.message || "회원가입에 실패했습니다.");
    }

    return { success: true };
  } catch (err: any) {
    // 네트워크 오류나 백엔드 에러 모두 동일한 형태로 반환한다.
    return { success: false, error: err.message };
  }
  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // try {
  //   const { data: authData, error: authError } = await supabase.auth.signUp({
  //     email: data.email,
  //     password: data.password,
  //   });
  //   if (authError) throw authError;
  //   const userId = authData.user!.id;
  //
  //   const { data: dept, error: deptError } = await supabase
  //     .from("departments")
  //     .select("id")
  //     .eq("name", data.department)
  //     .single();
  //   if (deptError) throw new Error(`학과를 찾을 수 없습니다: ${data.department}`);
  //
  //   const { error: profileError } = await supabase.from("profiles").insert({
  //     id: userId,
  //     name: data.name,
  //     student_id: data.studentId,
  //     department_id: dept.id,   // ← getCatalogCourses() 에 전달되는 핵심 값
  //     is_graduated: data.isGraduated,
  //   });
  //   if (profileError) throw profileError;
  //
  //   return { success: true };
  // } catch (err: unknown) {
  //   return { success: false, error: err instanceof Error ? err.message : "알 수 없는 오류" };
  // }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // console.log("[mock] signUp:", data);
  // return { success: true };
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// signIn  — 이메일/비밀번호 로그인
// ──────────────────────────────────────────────────────────────
/**
 * 이메일과 비밀번호로 로그인한다.
 *
 * 로그인 성공 시 백엔드로부터 받은 access_token, user_id, name을
 * localStorage에 저장한다. 이후 모든 API 요청에 이 토큰이 사용된다.
 *
 * @param {string} email    사용자 이메일
 * @param {string} password 비밀번호
 * @returns {Promise<{ success: boolean; error?: string }>}
 *   성공 시 { success: true }, 실패 시 { success: false, error: 에러 메시지 }
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "로그인에 실패했습니다.");
    }

    const loginData = result.data;

    // 토큰 저장 (나중에 세션 관리 시 중요함)
    if (loginData && loginData.access_token) {
      // access_token은 이후 모든 API 요청의 Authorization 헤더에 사용된다.
      localStorage.setItem("access_token", loginData.access_token);
      // user_id와 user_name은 화면 표시 및 API 경로 구성에 사용된다.
      localStorage.setItem("user_id", loginData.user_id);
      localStorage.setItem("user_name", loginData.name);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // const { error } = await supabase.auth.signInWithPassword({ email, password });
  // if (error) return { success: false, error: error.message };
  // return { success: true };
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // console.log("[mock] signIn:", email);
  // void password;
  // return { success: true };
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// signOut  — 로그아웃
// ──────────────────────────────────────────────────────────────
/**
 * 현재 사용자를 로그아웃 처리한다.
 *
 * 현재는 MOCK 상태(console.log만 출력).
 * Supabase 연동 시 supabase.auth.signOut()을 호출하면
 * 세션 쿠키와 토큰이 자동으로 제거된다.
 *
 * @returns {Promise<void>}
 */
export async function signOut(): Promise<void> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // await supabase.auth.signOut();
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("[mock] signOut");
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// signInWithGoogle  — Google OAuth 로그인
// ──────────────────────────────────────────────────────────────
/**
 * Google OAuth를 통해 로그인한다.
 *
 * 현재는 MOCK 상태(console.log만 출력).
 * Supabase 연동 시 supabase.auth.signInWithOAuth()를 호출하면
 * Google 인증 페이지로 리다이렉트되고 완료 후 /auth/callback으로 돌아온다.
 *
 * @returns {Promise<{ success: boolean; error?: string }>}
 *   성공 시 { success: true }, 실패 시 { success: false, error: 에러 메시지 }
 */
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // const { error } = await supabase.auth.signInWithOAuth({
  //   provider: "google",
  //   options: { redirectTo: `${window.location.origin}/auth/callback` },
  // });
  // if (error) return { success: false, error: error.message };
  // return { success: true };
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("[mock] signInWithGoogle");
  return { success: true };
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}
