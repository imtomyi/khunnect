/**
 * @file src/services/roadmap.ts
 * @description 커리어 로드맵 서비스 — 단과대/학과/분야/직무/과목 조회 및 트랙 구조 생성
 *
 * 역할:
 *  - 로드맵 선택 화면에서 단계별로 필요한 데이터를 제공한다.
 *    1단계: 단과대(colleges) 목록
 *    2단계: 학과(departments) 목록 (단과대로 필터)
 *    3단계: 분야(fields) 목록 (학과로 필터)
 *    4단계: 직무(jobs) 목록 (분야로 필터)
 *    5단계: 로드맵 과목(roadmap_courses) 목록 (학과 + 분야로 필터)
 *  - flat 과목 배열을 UI용 학년/학기 중첩 구조(TrackYear[])로 변환한다.
 *  - 현재 모두 MOCK 모드이며, Supabase 연동 코드가 주석으로 준비되어 있다.
 *
 * Export:
 *  - getColleges          — 단과대 목록 전체 조회
 *  - getDepartments       — 학과 목록 조회 (단과대 필터 옵션)
 *  - getFields            — 분야(진로) 목록 조회 (학과 필터 옵션)
 *  - getJobs              — 직무 목록 조회 (분야 필터 옵션)
 *  - getTrackCourses      — 학과 + 분야로 로드맵 과목 조회
 *  - buildTrackFromCourses — flat 과목 배열 → UI 학년/학기 구조 변환
 *
 * 사용처:
 *  - src/app/(main)/curriculum/result/page.tsx (로드맵 선택 UI)
 *  - src/app/(main)/curriculum/result/summary/page.tsx (로드맵 결과 표시)
 */

// ╔══════════════════════════════════════════════════════════════╗
// ║  서비스: 커리어 로드맵 (roadmap)                              ║
// ║  현재 모드 : MOCK                                             ║
// ║  연동 대상 : Supabase — colleges, departments, fields,        ║
// ║             jobs, roadmap_courses 테이블                     ║
// ║  교체 방법 : 각 함수 안의 SUPABASE 블록 주석 해제 후           ║
// ║             MOCK 블록 삭제                                    ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  Supabase 테이블 구조                                         ║
// ║                                                              ║
// ║  [colleges]                                                  ║
// ║    id   uuid PK · name text                                  ║
// ║                                                              ║
// ║  [departments]                                               ║
// ║    id uuid PK · college_id uuid · name text                  ║
// ║                                                              ║
// ║  [fields]                                                    ║
// ║    id uuid PK · name text · department_ids text[]            ║
// ║                                                              ║
// ║  [jobs]                                                      ║
// ║    id uuid PK · field_id uuid · name text                    ║
// ║                                                              ║
// ║  [roadmap_courses]                                           ║
// ║    id       uuid PK                                          ║
// ║    dept     text  (학과 식별자)                               ║
// ║    field    text  (분야 식별자)                               ║
// ║    name     text                                             ║
// ║    name_en  text                                             ║
// ║    type     text  '전공필수'|'전공선택'|'전공기초'|'교양'      ║
// ║    year     int   (1~4)                                      ║
// ║    semester int   (1|2)                                      ║
// ╚══════════════════════════════════════════════════════════════╝

// 프로젝트 공통 타입 — 로드맵 관련 타입들
import type { College, Department, Field, Job, RoadmapCourse, TrackYear } from "@/types";
// 목업 데이터 — Supabase 연동 전까지 사용하는 하드코딩 데이터
import {
  MOCK_COLLEGES,
  MOCK_DEPARTMENTS,
  MOCK_FIELDS,
  MOCK_JOBS,
  MOCK_ROADMAP_COURSES,
} from "@/mock";
// import { supabase } from "@/lib/supabase"; // Supabase 연동 시 주석 해제

// ──────────────────────────────────────────────────────────────
// getColleges  — 대학(단과대) 목록 전체 조회
// DB 테이블 : colleges
// ──────────────────────────────────────────────────────────────
/**
 * 단과대(대학) 목록 전체를 반환한다.
 *
 * 로드맵 선택 1단계에서 사용된다.
 * 현재 MOCK_COLLEGES 반환. Supabase 연동 시 colleges 테이블 전체 조회로 교체한다.
 *
 * @returns {Promise<College[]>} 단과대 목록
 */
export async function getColleges(): Promise<College[]> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // const { data, error } = await supabase.from("colleges").select("*");
  // if (error) throw error;
  // return data ?? [];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return MOCK_COLLEGES;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// getDepartments  — 학과 목록 조회 (단과대 필터 옵션)
// DB 테이블 : departments WHERE college_id = ?
// ──────────────────────────────────────────────────────────────
/**
 * 학과 목록을 반환한다.
 *
 * 로드맵 선택 2단계에서 사용된다.
 * collegeId를 전달하면 해당 단과대의 학과만 필터링해 반환한다.
 * Supabase 연동 시 departments 테이블에서 college_id 조건으로 조회한다.
 *
 * @param {string} [collegeId] 필터링할 단과대 ID (미전달 시 전체 반환)
 * @returns {Promise<Department[]>} 학과 목록
 */
export async function getDepartments(collegeId?: string): Promise<Department[]> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // let query = supabase.from("departments").select("*");
  // if (collegeId) query = query.eq("college_id", collegeId);
  // const { data, error } = await query;
  // if (error) throw error;
  // return data ?? [];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // collegeId가 있으면 해당 단과대 소속 학과만 필터링한다.
  if (collegeId) return MOCK_DEPARTMENTS.filter((d) => d.collegeId === collegeId);
  return MOCK_DEPARTMENTS;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// getFields  — 분야(진로) 목록 조회 (학과 필터 옵션)
// DB 테이블 : fields (WHERE department_id IN department_ids)
// ──────────────────────────────────────────────────────────────
/**
 * 진로 분야 목록을 반환한다.
 *
 * 로드맵 선택 3단계에서 사용된다.
 * departmentId를 전달하면 해당 학과와 연관된 분야만 필터링해 반환한다.
 * Supabase에서는 fields.department_ids(text[]) 배열 컬럼에 contains 쿼리를 사용한다.
 *
 * @param {string} [departmentId] 필터링할 학과 ID (미전달 시 전체 반환)
 * @returns {Promise<Field[]>} 진로 분야 목록
 */
export async function getFields(departmentId?: string): Promise<Field[]> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // let query = supabase.from("fields").select("*");
  // if (departmentId) query = query.contains("department_ids", [departmentId]);
  // const { data, error } = await query;
  // if (error) throw error;
  // return data ?? [];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // departmentId가 있으면 해당 학과가 department_ids 배열에 포함된 분야만 반환한다.
  if (departmentId) return MOCK_FIELDS.filter((f) => f.departmentIds.includes(departmentId));
  return MOCK_FIELDS;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// getJobs  — 직무 목록 조회 (분야 필터 옵션)
// DB 테이블 : jobs WHERE field_id = ?
// ──────────────────────────────────────────────────────────────
/**
 * 직무 목록을 반환한다.
 *
 * 로드맵 선택 4단계에서 사용된다.
 * fieldId를 전달하면 해당 분야의 직무만 필터링해 반환한다.
 *
 * @param {string} [fieldId] 필터링할 분야 ID (미전달 시 전체 반환)
 * @returns {Promise<Job[]>} 직무 목록
 */
export async function getJobs(fieldId?: string): Promise<Job[]> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // let query = supabase.from("jobs").select("*");
  // if (fieldId) query = query.eq("field_id", fieldId);
  // const { data, error } = await query;
  // if (error) throw error;
  // return data ?? [];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (fieldId) return MOCK_JOBS.filter((j) => j.fieldId === fieldId);
  return MOCK_JOBS;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// getTrackCourses  — 학과 + 분야로 로드맵 과목 조회
// DB 테이블 : roadmap_courses WHERE dept = ? AND field = ?
// ──────────────────────────────────────────────────────────────
/**
 * 특정 학과 + 분야 조합의 로드맵 과목 목록을 반환한다.
 *
 * 반환된 과목은 buildTrackFromCourses()로 UI 구조로 변환해 사용한다.
 * Supabase 연동 시 roadmap_courses 테이블에서 dept, field 조건으로 조회한다.
 *
 * @param {string} dept  학과 식별자 (roadmap_courses.dept 컬럼값)
 * @param {string} field 분야 식별자 (roadmap_courses.field 컬럼값)
 * @returns {Promise<RoadmapCourse[]>} 해당 학과+분야의 로드맵 과목 목록
 */
export async function getTrackCourses(dept: string, field: string): Promise<RoadmapCourse[]> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━
  // const { data, error } = await supabase
  //   .from("roadmap_courses")
  //   .select("*")
  //   .eq("dept", dept)
  //   .eq("field", field);
  // if (error) throw error;
  // return data ?? [];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // dept AND field 두 조건으로 동시에 필터링한다.
  return MOCK_ROADMAP_COURSES.filter((c) => c.dept === dept && c.field === field);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ──────────────────────────────────────────────────────────────
// buildTrackFromCourses  — flat 과목 배열 → UI 학년/학기 중첩 구조 변환
// ★ 순수 변환 함수 (mock/Supabase 무관 — 교체 불필요)
// ──────────────────────────────────────────────────────────────
/**
 * flat한 로드맵 과목 배열을 UI 렌더링용 학년/학기 중첩 구조로 변환한다.
 *
 * 반환 구조: TrackYear[] = [ { year: "YEAR 1", semesters: [ { sem: "SEM 01", courses: [...] }, ... ] }, ... ]
 *
 * 이 함수는 순수 변환 함수이므로 MOCK/Supabase 교체 여부와 관계없이 그대로 사용한다.
 *
 * @param {RoadmapCourse[]} courses getTrackCourses()로 조회한 flat 과목 배열
 * @returns {TrackYear[]} 학년(1~4) × 학기(1~2) 구조의 중첩 배열
 */
export function buildTrackFromCourses(courses: RoadmapCourse[]): TrackYear[] {
  // 1~4학년을 순회하며 각 학년 구조를 만든다.
  return ([1, 2, 3, 4] as const).map((y) => ({
    year: `YEAR ${y}`,
    // 각 학년 내 1~2학기를 순회하며 해당 학기의 과목 목록을 필터링한다.
    semesters: ([1, 2] as const).map((s) => ({
      sem: `SEM 0${s}`,
      // year와 semester가 모두 일치하는 과목만 포함한다.
      courses: courses
        .filter((c) => c.year === y && c.semester === s)
        .map((c) => ({ name: c.name, sub: c.nameEn, type: c.type })), // UI에 필요한 필드만 추출
    })),
  }));
}
