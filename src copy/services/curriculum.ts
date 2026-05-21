/**
 * @file src/services/curriculum.ts
 * @description 커리큘럼 계산기 서비스 — 이수 과목 관리, 졸업 요건 조회
 *
 * 역할:
 *  - 사용자가 이수한/계획 중인 과목 목록을 백엔드와 동기화한다.
 *  - 졸업 요건(전공필수/전공선택/전공기초 이수 학점)과 현재 이수 현황을 계산한다.
 *  - 학과 과목 카탈로그(전체 개설 과목)를 가져온다.
 *  - API 호출 실패 시 localStorage 또는 MOCK 데이터로 폴백한다.
 *
 * Export:
 *  - getUserCourses          — 사용자 이수 과목 목록 조회
 *  - getCurriculumStatus     — 졸업 요건 대비 이수 현황 계산
 *  - getCatalogCourses       — 학과 과목 카탈로그 조회
 *  - getCurriculumRequirement — 학과 졸업 요건 조회
 *  - getCheckedCourses       — 이수 체크된 과목 ID Set 조회
 *  - saveCheckedCourses      — 이수 체크 과목 ID 목록 저장
 *  - getPlannedCourses       — 홈화면 우선순위 과목 표시용 조회
 *  - addCourse               — 수강 과목 추가
 *
 * 사용처:
 *  - src/app/(main)/curriculum/result/page.tsx
 *  - src/app/(main)/curriculum/result/summary/page.tsx
 *  - src/app/(main)/page.tsx (홈 화면 학업 현황)
 */

// ╔══════════════════════════════════════════════════════════════╗
// ║  서비스: 커리큘럼 계산기 (curriculum)                         ║
// ║  현재 모드 : MOCK                                             ║
// ║  연동 대상 : Supabase — catalog_courses, curriculum_requirements, ║
// ║             user_courses 테이블                              ║
// ║  교체 방법 : 각 함수 안의 SUPABASE 블록 주석 해제 후           ║
// ║             MOCK 블록 삭제                                    ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  Supabase 테이블 구조                                         ║
// ║                                                              ║
// ║  [catalog_courses]  ← 학과별 제공 과목 (관리자 등록)           ║
// ║    id            uuid PK                                     ║
// ║    department_id uuid → departments(id)                      ║
// ║    name          text                                        ║
// ║    credits       int                                         ║
// ║    code          text                                        ║
// ║    type          text  '전공기초'|'전공필수'|'전공선택'|'교양' ║
// ║                                                              ║
// ║  [curriculum_requirements]  ← 학과별 졸업 요건               ║
// ║    department_id uuid PK → departments(id)                   ║
// ║    required      int   (전공필수 이수 학점)                   ║
// ║    elective      int   (전공선택 이수 학점)                   ║
// ║    basic         int   (전공기초 이수 학점)                   ║
// ║    liberal       int   (교양 이수 학점)                       ║
// ║                                                              ║
// ║  [user_courses]  ← 사용자 이수 체크 과목                      ║
// ║    id                uuid PK                                 ║
// ║    user_id           uuid → profiles(id) ON DELETE CASCADE   ║
// ║    catalog_course_id uuid → catalog_courses(id)              ║
// ║    created_at        timestamp default now()                 ║
// ║    UNIQUE(user_id, catalog_course_id)                        ║
// ╚══════════════════════════════════════════════════════════════╝

// 프로젝트 공통 타입들 — 커리큘럼 관련 타입 정의
import type { CatalogCourse, Course, CurriculumRequirement, CurriculumStatus } from "@/types";
// apiRequest — 인증 헤더가 자동으로 붙는 공통 fetch 래퍼 (src/lib/api.ts)
import { apiRequest } from "@/lib/api";
// 목업 데이터 — API 미연결 시 폴백으로 사용
import { MOCK_CATALOG_COURSES, MOCK_CURRICULUM_REQUIREMENTS_BY_DEPT } from "@/mock";

// ── 백엔드 응답 타입 정의 ────────────────────────────────────────
// 아래 타입들은 백엔드 API 응답 구조에 맞춰 정의된 내부 타입이다.
// FE의 공개 타입(Course, CatalogCourse 등)과는 다른 형태를 갖는다.

/**
 * 과목 상세 정보 (courses_master 테이블 필드에 대응).
 */
interface CourseInfo {
  course_name: string;
  course_type: string;
  credits: number;
  college_name: string;
  dept_name: string;
}

/**
 * 사용자의 이수/계획 과목 한 건 (user_courses + courses_master 조인 결과).
 */
interface CurriculumItem {
  id: string;          // user_courses.id — DELETE 시 이 값이 경로에 사용됨
  course_id: string;   // catalog_courses.id
  semester: string;    // 수강 학기 (예: "2024-1")
  grade: string | null;
  completed: boolean;  // 이수 완료 여부
  courses_master: CourseInfo; // 과목 상세 정보 (JOIN 결과)
}

/**
 * GET /courses/departments/{dept_name} 응답의 과목 한 건.
 */
interface CoursesResponse {
  course_id: string;
  college_name: string;
  dept_name: string | null;
  course_name: string;
  course_type: string;
  credits: number | null;
}

/**
 * 졸업 요건 응답의 카테고리별 학점 현황.
 */
interface CategoryCredit {
  category: string;   // 과목 유형 이름 (예: "전공필수")
  completed: number;  // 이수한 학점
  required: number;   // 필요한 학점
  remaining: number;  // 남은 학점
}

/**
 * GET /curriculum/{user_id}/graduation 전체 응답 구조.
 */
interface GraduationResponse {
  categories: CategoryCredit[];
  total_completed: number;
  total_required: number;
  total_remaining: number;
}

// 백엔드 API 서버 주소. .env.local의 값이 없으면 로컬 개발 서버를 사용한다.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Authorization 헤더를 포함한 공통 HTTP 헤더를 생성한다.
 *
 * apiRequest를 쓰지 않고 직접 fetch를 쓰는 함수(getCurriculumRequirement 등)에서 사용한다.
 *
 * @returns {{ Authorization: string; "Content-Type": string }} 헤더 객체
 */
// 공통 헤더 (토큰 포함)
const getHeaders = () => {
  const token = localStorage.getItem("access_token"); // 로그인 시 저장된 JWT 토큰
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ──────────────────────────────────────────────────────────────
// getUserCourses  — 사용자가 이수한 과목 목록 반환
// GET /curriculum/{user_id}
// DB 테이블 : user_courses JOIN catalog_courses
// ──────────────────────────────────────────────────────────────
/**
 * 특정 사용자가 이수한 과목 목록을 반환한다.
 *
 * 백엔드 GET /curriculum/{userId} 를 호출한 뒤
 * 응답의 CurriculumItem 배열을 FE Course 타입 배열로 변환한다.
 *
 * @param {string} userId 조회할 사용자 ID
 * @returns {Promise<Course[]>} 이수 과목 목록
 */
export async function getUserCourses(userId: string): Promise<Course[]> {
  const data = await apiRequest<CurriculumItem[]>(`/curriculum/${userId}`);
  // 백엔드 응답 구조(CurriculumItem)를 FE Course 타입으로 변환한다.
  return data.map((c) => ({
    id: c.course_id,
    name: c.courses_master.course_name,
    credits: c.courses_master.credits,
    type: c.courses_master.course_type as Course["type"], // 백엔드 문자열을 FE 유니온 타입으로 캐스팅
    semester: c.semester,
    grade: c.grade,
  }));
}

// ──────────────────────────────────────────────────────────────
// getCurriculumStatus  — 졸업 요건 대비 이수 현황 계산
// (getCheckedCourses + getCatalogCourses 기반 집계)
// ──────────────────────────────────────────────────────────────
/**
 * 졸업 요건 대비 현재 이수 현황을 반환한다.
 *
 * 백엔드 GET /curriculum/{userId}/graduation 를 호출한 뒤
 * 카테고리별 학점 정보를 FE CurriculumStatus 타입으로 변환한다.
 * API 호출 실패 또는 데이터 누락 시 모든 학점을 0으로 반환한다.
 *
 * @param {string} userId 조회할 사용자 ID
 * @returns {Promise<CurriculumStatus>} 전공필수/전공선택/전공기초 이수 현황
 */
export async function getCurriculumStatus(
  userId: string,
): Promise<CurriculumStatus> {
  const response = await apiRequest<GraduationResponse>(
    `/curriculum/${userId}/graduation`
  );

  // 일부 응답이 { data: GraduationResponse } 형태로 이중 래핑되어 올 수 있어 방어적으로 처리한다.
  const data = (response as any).data || response;

  if (!data || !data.categories) {
    console.error("졸업 요건 데이터를 불러오지 못했습니다.", data);
    // 데이터가 없으면 UI가 깨지지 않도록 모든 값을 0으로 반환한다.
    return {
      required: { total: 0, completed: 0 },
      elective: { total: 0, completed: 0 },
      basic: { total: 0, completed: 0 },
    };
  }

  // 카테고리 이름으로 해당 항목을 찾는 헬퍼 함수 (공백 trim으로 매칭 오류 방지)
  const findCat = (categoryName: string) =>
    data.categories.find((c: any) => c.category.trim() === categoryName);

  // 백엔드 카테고리 이름과 FE 필드명을 여기서 매핑한다.
  const majorRequired = findCat("전공필수");
  const majorElective = findCat("전공선택");
  const majorBasic = findCat("전공기초");

  return {
    required: {
      total: majorRequired?.required ?? 0,      // 전공필수 필요 학점
      completed: majorRequired?.completed ?? 0  // 전공필수 이수 학점
    },
    elective: {
      total: majorElective?.required ?? 0,      // 전공선택 필요 학점
      completed: majorElective?.completed ?? 0  // 전공선택 이수 학점
    },
    basic: {
      total: majorBasic?.required ?? 0,         // 전공기초 필요 학점
      completed: majorBasic?.completed ?? 0     // 전공기초 이수 학점
    },
  };
}



// ──────────────────────────────────────────────────────────────
// getCatalogCourses  — 학과별 과목 카탈로그 반환
// GET /courses/departments/{dept_name}
// DB 테이블 : catalog_courses WHERE department_id = ?
// ──────────────────────────────────────────────────────────────
/**
 * 학과 전체 개설 과목 카탈로그를 반환한다.
 *
 * 커리큘럼 체크리스트에서 모든 과목을 표시할 때 사용한다.
 * API 호출 실패 시 MOCK_CATALOG_COURSES로 폴백한다.
 *
 * @returns {Promise<CatalogCourse[]>} 학과 개설 과목 전체 목록
 */
export async function getCatalogCourses(): Promise<CatalogCourse[]> {
  const response = await apiRequest(`/curriculum/courses`); 
  
  const rawData = (response as any).data || response;

  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((course: any) => ({
    id: course.course_id,         // course_id -> id
    name: course.course_name,     // course_name -> name
    credits: course.credits,      // credits -> credits
    code: course.course_id,
    type: course.course_type,     // course_type -> type
    department: course.dept_name
  }));
}

// ──────────────────────────────────────────────────────────────
// getCurriculumRequirement  — 학과별 졸업 요건 반환
// GET /curriculum/{user_id}/graduation
// DB 테이블 : curriculum_requirements WHERE department_id = ?
// ──────────────────────────────────────────────────────────────
/**
 * 사용자 학과의 졸업 요건(카테고리별 필요 학점)을 반환한다.
 *
 * 백엔드 GET /curriculum/requirements 를 호출한 뒤
 * 응답 데이터를 FE CurriculumRequirement 타입으로 변환한다.
 * API 호출 실패 시 MOCK 데이터("dept-5")로 폴백한다.
 *
 * @returns {Promise<CurriculumRequirement>} 학과별 졸업 요건 학점 정보
 */
export async function getCurriculumRequirement(): Promise<CurriculumRequirement> {
  try {
    const response = await fetch(`${API_URL}/curriculum/requirements`, {
      method: "GET",
      headers: getHeaders(), // 인증이 필요한 엔드포인트이므로 토큰 헤더를 포함한다.
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "요건 정보를 가져오지 못했습니다.");
    }

    // 💡 백엔드 응답(result.data)을 FE 타입(CurriculumRequirement)으로 매핑
    const { dept_name, required, elective, basic, liberal, total } = result.data;

    return {
      departmentId: dept_name, // 학과 식별자로 dept_name 문자열을 사용한다.
      required: required,      // 전공필수 필요 학점
      elective: elective,      // 전공선택 필요 학점
      basic: basic,            // 전공기초 필요 학점
      liberal: liberal,        // 교양 필요 학점
    };
  } catch {
    // API 실패 시 산업디자인학과(dept-5)의 목업 요건으로 폴백한다.
    const fallback = MOCK_CURRICULUM_REQUIREMENTS_BY_DEPT["dept-5"]
      ?? { required: 36, elective: 21, basic: 12, liberal: 12 };
    return { departmentId: "dept-5", ...fallback };
  }
}


// ──────────────────────────────────────────────────────────────
// getCheckedCourses  — 이수 체크된 과목 ID 목록 조회
// GET /curriculum/{user_id}
// DB 테이블 : user_courses WHERE user_id = ?
// 현재     : localStorage  (키: checked_courses_{userId})
// ──────────────────────────────────────────────────────────────
/**
 * 사용자가 이수 완료로 체크한 과목 ID Set을 반환한다.
 *
 * API 성공 시 completed=true인 과목들의 course_id를 Set으로 반환한다.
 * API 실패 시 localStorage에 저장된 값을 폴백으로 사용한다 (디자인 리뷰 모드).
 *
 * @param {string} userId 조회할 사용자 ID
 * @returns {Promise<Set<string>>} 이수 체크된 과목 ID Set
 */
export async function getCheckedCourses(userId: string): Promise<Set<string>> {
  try {
    const data = await apiRequest<CurriculumItem[]>(`/curriculum/${userId}`);
    // completed=true인 항목만 필터링해 과목 ID Set을 만든다.
    return new Set(
      data.filter((item) => item.completed).map((item) => item.course_id)
    );
  } catch {
    // API 미연결 시 localStorage 저장값 사용 (디자인 리뷰 모드)
    if (typeof window === "undefined") return new Set();
    const raw = localStorage.getItem(`checked_courses_${userId}`);
    return new Set(raw ? JSON.parse(raw) : []);
  }
}

// ──────────────────────────────────────────────────────────────
// saveCheckedCourses  — 이수 체크 과목 ID 목록 저장
// DB 테이블 : user_courses (delete + bulk insert)
// ──────────────────────────────────────────────────────────────
/**
 * 이수 체크된 과목 ID 목록을 백엔드와 동기화한다.
 *
 * 변경분만 계산해 최소 API 호출로 동기화한다:
 *  1. 새로 체크된 과목 → POST /curriculum/{userId} (DB에 없는 것만 추가)
 *  2. 체크 해제된 과목 → DELETE /curriculum/{userId}/{id} (DB에서 제거)
 * API 실패 시 localStorage에 저장해 오프라인 상태에서도 체크 상태를 유지한다.
 *
 * @param {string}   userId     저장할 사용자 ID
 * @param {string[]} checkedIds 현재 이수 체크된 과목 ID 배열
 * @returns {Promise<void>}
 */
export async function saveCheckedCourses(
  userId: string,
  checkedIds: string[]
): Promise<void> {
  try {
    // 현재 DB의 이수 과목 목록을 먼저 조회한다 (변경분 계산을 위해 필요).
    const current = await apiRequest<CurriculumItem[]>(`/curriculum/${userId}`);
    const currentCourseIds = new Set(current.map((c) => c.course_id));
    const checkedSet = new Set(checkedIds);

    // 1. 새로 체크된 과목 → POST (DB에 없는 것만 추가)
    // DB에 없는 과목만 추가해 중복 INSERT를 방지한다.
    const toAdd = checkedIds.filter((id) => !currentCourseIds.has(id));

    // 2. 체크 해제된 과목 → DELETE (DB에는 있지만 체크 해제된 것)
    // DELETE API는 course_id가 아닌 user_courses.id(c.id)를 경로에 사용한다.
    const toDelete = current.filter((c) => !checkedSet.has(c.course_id));

    // 추가와 삭제를 병렬로 실행해 응답 시간을 줄인다.
    await Promise.all([
      ...toAdd.map((courseId) =>
        apiRequest(`/curriculum/${userId}`, {
          method: "POST",
          body: JSON.stringify({
            course_id: courseId,
            semester: "2024-1", // 기본 학기 설정
            grade: "P",        // 기본 성적 설정
            completed: true,
          }),
        })
      ),
      ...toDelete.map((c) =>
        apiRequest(`/curriculum/${userId}/${c.id}`, {
          method: "DELETE", // c.id는 user_courses 테이블의 PK (course_id 아님)
        })
      ),
    ]);
  } catch (error) {
    console.error("저장 중 에러 발생, 로컬 스토리지를 사용합니다.", error);
    // API 실패 시 localStorage에 저장해 페이지 새로고침 후에도 체크 상태를 유지한다.
    if (typeof window !== "undefined") {
      localStorage.setItem(`checked_courses_${userId}`, JSON.stringify(checkedIds));
    }
  }
}

// ──────────────────────────────────────────────────────────────
// getPlannedCourses  — 홈화면 우선순위 과목 표시용
// ──────────────────────────────────────────────────────────────
/**
 * 사용자가 계획 중인(우선순위) 과목 ID Set을 반환한다.
 *
 * 홈 화면의 "다음에 들을 과목" 등 우선순위 과목 표시에 사용된다.
 * 현재 localStorage에만 저장하며 API 연동은 없다.
 *
 * @param {string} userId 조회할 사용자 ID
 * @returns {Promise<Set<string>>} 계획 과목 ID Set
 */
export async function getPlannedCourses(userId: string): Promise<Set<string>> {
  // SSR에서는 localStorage 접근 불가 → 빈 Set 반환
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(`last_planned_${userId}`);
  return new Set(raw ? JSON.parse(raw) : []);
}

// ──────────────────────────────────────────────────────────────
// addCourse  — 수강 과목 추가 (임시 ID 부여)
// POST /curriculum/{user_id}
// DB 테이블 : user_courses
// ──────────────────────────────────────────────────────────────
/**
 * 사용자의 수강 과목을 추가하고 추가된 과목 정보를 반환한다.
 *
 * 백엔드 POST /curriculum/{userId} 를 호출해 DB에 과목을 추가한다.
 * 응답의 CurriculumItem을 FE Course 타입으로 변환해 반환한다.
 *
 * @param {string}              userId 과목을 추가할 사용자 ID
 * @param {Omit<Course, "id">}  course 추가할 과목 정보 (id 제외)
 * @returns {Promise<Course>} 추가된 과목 정보 (백엔드에서 받은 id 포함)
 */
export async function addCourse(
  userId: string,
  course: Omit<Course, "id">
): Promise<Course> {
  const data = await apiRequest<CurriculumItem>(`/curriculum/${userId}`, {
    method: "POST",
    body: JSON.stringify({
      course_id: (course as any).courseId, // FE courseId 필드 → 백엔드 course_id로 전송
      semester: course.semester ?? "",
      grade: course.grade,
      completed: course.grade !== null, // 성적이 있으면 이수 완료로 처리
    }),
  });
  // 백엔드 응답(CurriculumItem)을 FE Course 타입으로 변환해 반환한다.
  return {
    id: data.course_id,
    name: data.courses_master.course_name,
    credits: data.courses_master.credits,
    type: data.courses_master.course_type as Course["type"],
    semester: data.semester,
    grade: data.grade,
  };
}
