// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  curriculum/page.tsx — 커리큘럼 입력 페이지                                ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    사용자가 지금까지 수강한 강의를 카테고리별로 체크하는 페이지.              ║
// ║    체크된 과목을 저장하고, "계산하기" 클릭 시 결과 페이지로 이동한다.         ║
// ║                                                                          ║
// ║  상태 변수:                                                                ║
// ║    userId        — 현재 사용자 ID (저장/로드 API 호출에 사용)               ║
// ║    catalog       — 전체 강의 목록 (CatalogCourse[])                        ║
// ║    requirement   — 졸업 요건 학점 정보 (CurriculumRequirement)              ║
// ║    selectedType  — 현재 선택된 카테고리 탭 ("전공기초"|"전공필수"|"전공선택") ║
// ║    checked       — 수강 완료로 체크된 과목 ID Set                           ║
// ║    saveStatus    — "idle"|"saved": 저장 버튼 피드백 상태                   ║
// ║    isCalculating — 계산 중 로딩 오버레이 표시 여부                           ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    getCurrentUser() → getCatalogCourses(), getCurriculumRequirement(),    ║
// ║                       getCheckedCourses()                                 ║
// ║    → selectedType 변경 → currentCourses 필터링 → CourseGrid 업데이트       ║
// ║    저장: saveCheckedCourses()                                              ║
// ║    계산: saveCheckedCourses() → router.push("/curriculum/result")          ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/services/curriculum : 과목/요건/체크 데이터 CRUD                    ║
// ║    - @/services/user       : getCurrentUser                               ║
// ║    - ./_lib/constants      : CATEGORY_CONFIG (카테고리 메타 정보)           ║
// ║    - LoadingOverlay        : 계산 중 전체 화면 로딩 오버레이                 ║
// ║    - CategoryPanel         : 좌측 카테고리 탭 패널                          ║
// ║    - CourseGrid            : 우측 과목 체크 그리드                          ║
// ║    - ActionButtons         : 하단 저장/계산하기 버튼 그룹                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// React 훅
import { useState, useEffect } from "react";
// Next.js 라우터 — 계산 완료 후 결과 페이지로 이동
import { useRouter } from "next/navigation";
// 커리큘럼 관련 API 서비스
import { getCatalogCourses, getCurriculumRequirement, getCheckedCourses, saveCheckedCourses } from "@/services/curriculum";
// 현재 사용자 조회
import { getCurrentUser } from "@/services/user";
// 타입 정의
import type { CatalogCourse, CurriculumRequirement, CourseType } from "@/types";

// 카테고리 메타 정보 (표시 레이블 등)
import { CATEGORY_CONFIG } from "./_lib/constants";
// 하위 컴포넌트들
import { LoadingOverlay } from "./_components/LoadingOverlay";
import { CategoryPanel } from "./_components/CategoryPanel";
import { CourseGrid } from "./_components/CourseGrid";
import { ActionButtons } from "./_components/ActionButtons";

/**
 * CurriculumPage
 *
 * 수강 완료 강의를 체크하는 커리큘럼 입력 페이지.
 * 히어로 섹션(제목/설명) + 카테고리 패널 + 과목 그리드 + 저장/계산 버튼으로 구성.
 */
export default function CurriculumPage() {
  // 페이지 이동을 위한 router
  const router = useRouter();

  // userId: 체크 저장/로드 시 사용자 식별자 — null이면 로그인 안 됨
  const [userId, setUserId] = useState<string | null>(null);
  // catalog: Supabase에서 로드한 전체 과목 목록 — type으로 필터링하여 CourseGrid에 전달
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  // requirement: 졸업 요건 학점 {basic, required, elective} — 진도 바에 표시
  const [requirement, setRequirement] = useState<CurriculumRequirement | null>(null);
  // selectedType: 현재 활성화된 카테고리 탭 — CategoryPanel 클릭으로 변경됨
  const [selectedType, setSelectedType] = useState<CourseType>("전공기초");
  // checked: 수강 완료로 체크된 과목 ID Set — Set으로 O(1) 조회 최적화
  const [checked, setChecked] = useState<Set<string>>(new Set());
  // saveStatus: "saved" 상태 3초 후 자동 "idle" 복귀 — 저장 피드백 UI
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  // isCalculating: true이면 LoadingOverlay 표시 (2초 딜레이 시뮬레이션)
  const [isCalculating, setIsCalculating] = useState(false);

  // ── 데이터 로드 ──────────────────────────────────────────────
  // 컴포넌트 마운트 시 1회 실행
  useEffect(() => {
    getCurrentUser().then(async (user) => {
      if (!user) return;
      setUserId(user.id);

      try {
        // 세 API를 병렬 호출하여 로딩 시간 단축
        const [courses, req, savedChecked] = await Promise.all([
          getCatalogCourses(),                  // 전체 과목 카탈로그
          getCurriculumRequirement(),            // 졸업 요건 학점
          getCheckedCourses(user.id),            // 이전에 저장된 체크 상태
        ]);

        // API 응답 필드명 불일치 대응 (course_id, course_name 등 → 통일)
        const mappedCourses = courses.map((c: any) => ({
          id: c.id || c.course_id,
          name: c.name || c.course_name,
          type: c.type || c.course_type,
          credits: c.credits, 
          department: c.dept_name || "",
          code: c.code || c.course_id
        }));

        setCatalog(mappedCourses);
        setRequirement(req);
        // savedChecked가 이미 Set이면 그대로, 배열이면 Set으로 변환
        setChecked(savedChecked instanceof Set ? savedChecked : new Set(savedChecked));
      } catch (err) {
        console.error("데이터 로딩 에러:", err);
        setCatalog([]);  // 에러 시 빈 배열로 fallback
      }
    });
  }, []);

  // ── 핸들러 ───────────────────────────────────────────────────

  /**
   * toggleCourse
   *
   * 과목 체크/언체크 토글.
   * Set의 불변성 유지를 위해 새 Set을 생성하여 반환.
   * @param id - 토글할 과목 ID
   */
  function toggleCourse(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      // 이미 체크되어 있으면 제거, 없으면 추가
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /**
   * handleSave
   *
   * "저장" 버튼 핸들러.
   * 현재 체크 상태를 서버에 저장하고 3초간 "저장됨" 피드백 표시.
   */
  async function handleSave() {
    if (!userId) return;
    // Set을 배열로 변환하여 API에 전달
    await saveCheckedCourses(userId, [...checked]);
    setSaveStatus("saved");
    // 3초 후 버튼 상태를 idle로 복귀
    setTimeout(() => setSaveStatus("idle"), 3000);
  }

  /**
   * handleCalculate
   *
   * "계산하기" 버튼 핸들러.
   * 현재 체크 상태를 저장한 후 2초 로딩 후 결과 페이지로 이동.
   * (2초 딜레이는 계산 처리 중임을 사용자에게 알리는 UX 목적)
   */
  async function handleCalculate() {
    if (!userId) return;
    setIsCalculating(true);  // 로딩 오버레이 표시
    await saveCheckedCourses(userId, [...checked]);
    setTimeout(() => {
      setIsCalculating(false);
      // 결과 페이지로 이동
      router.push("/curriculum/result");
    }, 2000);  // 2초 딜레이 — 계산 중 인상을 주는 UX 처리
  }

  // ── 파생 데이터 ──────────────────────────────────────────────

  // 현재 선택된 카테고리의 메타 정보 (레이블 등)
  // ! 단언: CATEGORY_CONFIG는 모든 CourseType을 포함하므로 항상 존재
  const category = CATEGORY_CONFIG.find(c => c.type === selectedType)!;

  // 현재 카테고리에 해당하는 과목만 필터링
  // 주의: API 응답 필드가 'type' 또는 'course_type'일 수 있어 양쪽 모두 확인
  const currentCourses = catalog.filter(c => {
    const cType = (c as any).course_type || (c as any).type;
    return cType === selectedType;
  });

  // 현재 카테고리의 졸업 요건 학점 (requirement가 없으면 0)
  const reqTotal = requirement
    ? ({
        전공기초: (requirement as any).basic,
        전공필수: (requirement as any).required,
        전공선택: (requirement as any).elective
      } as Record<string, number>)[selectedType] ?? 0
    : 0;

  // 현재 카테고리에서 체크된 과목들의 총 학점 합산
  const completedCredits = currentCourses
    .filter(c => checked.has(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "var(--font-roboto), sans-serif", minHeight: "100vh" }}>

      {/* 계산 중 전체 화면 로딩 오버레이 — isCalculating=true 일 때만 표시 */}
      {isCalculating && <LoadingOverlay />}

      {/* ── 히어로 섹션 ── */}
      {/* 전폭(100vw) 배경으로 페이지 상단 강조 */}
      <div style={{
        backgroundColor: "#FFF8F7",
        padding: "72px 0 80px",
        marginLeft: "calc(-50vw + 50%)",    // 부모 max-width 무시하고 뷰포트 좌끝까지 확장
        marginTop: "calc(-49.54px)",         // Navbar 높이만큼 위로 올려 배너 밀착
        width: "100vw",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}>
          {/* 메인 제목 — 강조 텍스트에 브랜드 레드 적용 */}
          <h1 style={{ fontSize: "48px", fontWeight: 700, lineHeight: "1.15", color: "#1F1A1A", marginBottom: "20px" }}>
            지금까지의 여정을<br />
            <span style={{ color: "#9A001F" }}>기록해주세요</span>
          </h1>
          {/* 부제 설명 — 사용자에게 페이지 사용 안내 */}
          <p style={{ fontSize: "15px", color: "#78716C", lineHeight: "1.7", maxWidth: "440px" }}>
            정확한 졸업 사정을 위해 수강하신 강의들을 각 카테고리에 맞춰 입력해<br />
            주세요. khunnect가 당신의 남은 학기를 설계해 드립니다.
          </p>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 48px 120px" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", minHeight: "560px" }}>

          {/* 왼쪽: 카테고리 탭 패널 (전공기초/필수/선택) */}
          <CategoryPanel selectedType={selectedType} onSelect={setSelectedType} />

          {/* 오른쪽: 과목 체크 그리드 */}
          {/* catalog가 비어 있으면 로딩 안내 표시 */}
          {catalog.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#A8A29E", fontSize: "14px" }}>과목을 불러오는 중...</p>
            </div>
          ) : (
            <CourseGrid
              categoryLabel={category.label}   // 카테고리 표시 이름
              courses={currentCourses}           // 현재 카테고리 과목 목록
              checked={checked}                  // 체크 상태 Set
              completedCredits={completedCredits} // 현재 카테고리 완료 학점
              reqTotal={reqTotal}                // 현재 카테고리 졸업 요건 학점
              onToggle={toggleCourse}            // 과목 체크 토글 핸들러
            />
          )}

        </div>

        {/* ── 하단 액션 버튼: 저장 / 계산하기 ── */}
        <ActionButtons
          saveStatus={saveStatus}
          onSave={handleSave}
          onCalculate={handleCalculate}
        />
      </div>

    </div>
  );
}
