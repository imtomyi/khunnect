// ════════════════════════════════════════════════════════════════
// user_majors 조인 결과 → 화면용 전공 정보 변환
//
// 한 사람은 전공을 여러 개 가질 수 있다(주전공 + 복수전공 + 부전공).
// Supabase 조인은 순서를 보장하지 않으므로 반드시 type 기준으로 정렬해야
// "주전공이 먼저" 표시된다.
// ════════════════════════════════════════════════════════════════

/** 표시 우선순위: 주전공 → 복수전공 → 부전공 */
const TYPE_ORDER: Record<string, number> = { major: 0, double_major: 1, minor: 2 }

export type MajorInfo = {
  /** 학과명 목록 (주전공 우선). 예: ['산업디자인학과', '경제학과'] */
  departments: string[]
  graduationYear?: number
}

/**
 * profiles 조회 시 `user_majors(type, graduation_year, departments(name))`로
 * 가져온 값을 받아 정규화한다. type을 select하지 않으면 정렬이 무의미하므로
 * 호출부의 select에 반드시 type을 포함할 것.
 */
export function mapMajors(userMajors: unknown): MajorInfo {
  const rows: any[] = Array.isArray(userMajors)
    ? userMajors
    : userMajors
      ? [userMajors]
      : []

  const sorted = [...rows].sort(
    (a, b) => (TYPE_ORDER[a?.type] ?? 99) - (TYPE_ORDER[b?.type] ?? 99),
  )

  return {
    departments: sorted
      .map((r) => r?.departments?.name as string | undefined)
      .filter((n): n is string => !!n),
    // 졸업연도는 주전공 기준 — 부전공에만 값이 있는 경우도 대비해 첫 유효값 사용
    graduationYear: sorted.find((r) => r?.graduation_year != null)?.graduation_year,
  }
}

/** 카드·프로필에 표시할 학과 문자열. 예: '산업디자인학과, 경제학과' */
export function formatDepartments(departments: string[]): string | undefined {
  return departments.length > 0 ? departments.join(', ') : undefined
}
