/**
 * @file src/services/seniors.ts
 * @description 선배 프로필 서비스 — 선배 목록 조회 및 단건 조회
 *
 * 역할:
 *  - 선배 프로필 목록을 학과/분야 조건으로 필터링해 반환한다.
 *  - 특정 선배의 상세 프로필을 ID로 조회한다.
 *  - 현재 MOCK 모드이며, Supabase 연동 코드가 주석으로 준비되어 있다.
 *
 * MOCK 동작 주의사항:
 *  - getSeniors()에 departmentId 필터를 전달하지 않으면 빈 배열을 반환한다.
 *    이는 의도된 동작으로, 학과를 선택하지 않은 상태에서 선배가 표시되지 않도록 한다.
 *
 * Export:
 *  - getSeniors     — 선배 목록 조회 (학과/분야 필터 옵션)
 *  - getSeniorById  — 선배 단건 조회 (ID로 조회)
 *
 * 사용처:
 *  - src/app/(main)/seniors/ (선배 목록 페이지)
 *  - src/app/(main)/seniors/[id]/ (선배 상세 페이지)
 *  - 홈 화면 선배 추천 섹션
 */

// ╔══════════════════════════════════════════════════════════════╗
// ║  서비스: 선배 프로필 (seniors)                                ║
// ║  현재 모드 : MOCK                                             ║
// ║  연동 대상 : Supabase — seniors 테이블                        ║
// ║  교체 방법 : 각 함수 안의 SUPABASE 블록 주석 해제 후           ║
// ║             MOCK 블록 삭제                                    ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  Supabase 테이블 구조                                         ║
// ║                                                              ║
// ║  [seniors]                                                   ║
// ║    id              uuid PK                                   ║
// ║    name            text                                      ║
// ║    department_id   uuid → departments(id)                    ║
// ║    department      text  (표시용 문자열, 복수학과 가능)        ║
// ║    graduation_year int                                       ║
// ║    company         text                                      ║
// ║    job_title       text                                      ║
// ║    skills          text[]                                    ║
// ║    profile_image   text  nullable                            ║
// ║    bio             text                                      ║
// ║    tips            text                                      ║
// ║    is_available    boolean                                   ║
// ║    timetable       jsonb  (SemesterTimetable[] 구조)          ║
// ╚══════════════════════════════════════════════════════════════╝

import type { Senior } from "@/types";
import { apiRequest } from "@/lib/api";
import { MOCK_SENIORS } from "@/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// 공통 헤더 (토큰 포함)
const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};


// getSeniors  — 선배 목록 조회 (필터 옵션)
// DB 테이블 : seniors
// GET /seniors?department={dept_name}
export async function getSeniors(filters?: {
  departmentId?: string;
}): Promise<Senior[]> {
  const params = new URLSearchParams();
  if (filters?.departmentId) {
    params.set("department", filters.departmentId);
  }

  const res = await fetch(`${API_URL}/seniors?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message ?? "선배 목록 조회 실패");

  return result.data.map((s: any) => ({
    id: s.id,
    name: s.name,
    departmentId: s.department,
    department: s.department,
    graduationYear: s.graduated_year,
    company: s.company ?? "",
    jobTitle: s.job_title ?? "",
    skills: s.skills ?? [],
    profileImage: s.profile_image ?? null,
    bio: s.bio ?? "",
    tips: s.tips ?? "",
    timetable: [],
    isAvailable: s.is_available ?? false,
  }));
}


// GET /seniors/{senior_id}
export async function getSeniorById(id: string): Promise<Senior | null> {
  try {
    const res = await fetch(`${API_URL}/seniors/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error("not found");

    const result = await res.json();
    const s = result.data;
    return {
      id: s.id,
      name: s.name,
      departmentId: s.department,
      department: s.department,
      graduationYear: s.graduated_year,
      company: s.company ?? "",
      jobTitle: s.job_title ?? "",
      skills: s.skills ?? [],
      profileImage: s.profile_image ?? null,
      bio: s.bio ?? "",
      tips: s.tips ?? "",
      timetable: [],
      isAvailable: s.is_available ?? false,
    };
  } catch {
    // API 실패 시 mock fallback
    return MOCK_SENIORS.find((s) => s.id === id) ?? null;
  }
}
