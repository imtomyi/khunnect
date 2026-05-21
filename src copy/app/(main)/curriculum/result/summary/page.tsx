// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  curriculum/result/summary/page.tsx — 커리큘럼 계획 요약 페이지            ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    이전 결과 페이지에서 선택한 수강 계획(planned)을 최종 요약하여 표시.      ║
// ║    담은 강의 목록과 카테고리별 학점 변화(이전→현재)를 나란히 보여준다.       ║
// ║                                                                          ║
// ║  상태 변수:                                                                ║
// ║    catalog        — 전체 과목 목록 (학점 계산에 필요)                       ║
// ║    requirement    — 졸업 요건 학점                                          ║
// ║    plannedCourses — 이번에 계획으로 추가한 과목 CatalogCourse 배열          ║
// ║    prevCheckedIds — 이전(planned 이전)의 체크 완료 과목 ID Set              ║
// ║    userId         — 사용자 ID (localStorage 키 구성용)                     ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    localStorage `last_planned_${userId}`  → plannedCourses               ║
// ║    localStorage `checked_courses_${userId}` → prevCheckedIds             ║
// ║    getCatalogCourses(), getCurriculumRequirement() → 학점 계산             ║
// ║    → prevByType(이전 학점), currByType(현재=이전+planned 학점) 계산         ║
// ║    "돌아가기" → /curriculum/result                                         ║
// ║    "확인하기" → /                                                           ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/services/curriculum : getCatalogCourses, getCurriculumRequirement  ║
// ║    - @/services/user       : getCurrentUser                               ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// React 훅
import { useState, useEffect } from "react";
// Next.js 라우터 — 돌아가기/확인하기 버튼에서 사용
import { useRouter } from "next/navigation";
// 커리큘럼 API
import { getCatalogCourses, getCurriculumRequirement } from "@/services/curriculum";
// 현재 사용자 조회
import { getCurrentUser } from "@/services/user";
// 타입 정의
import type { CatalogCourse, CurriculumRequirement } from "@/types";

/** 카테고리 순서 상수 — 전공기초 → 전공필수 → 전공선택 순 고정 */
const CATEGORY_ORDER = ["전공기초", "전공필수", "전공선택"] as const;
/** CATEGORY_ORDER 값의 유니온 타입 */
type CategoryType = (typeof CATEGORY_ORDER)[number];

/**
 * CurriculumSummaryPage
 *
 * 커리큘럼 계획 요약 페이지.
 * localStorage에서 이전 단계의 planned 데이터를 읽어 최종 계획을 요약 표시한다.
 */
export default function CurriculumSummaryPage() {
  const router = useRouter();

  // catalog: 전체 과목 목록 — 학점 계산에 사용
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  // requirement: 졸업 요건 학점
  const [requirement, setRequirement] = useState<CurriculumRequirement | null>(null);
  // plannedCourses: localStorage에서 읽은 이번 계획 과목 객체 배열
  const [plannedCourses, setPlannedCourses] = useState<CatalogCourse[]>([]);
  // prevCheckedIds: 이번 계획 이전에 체크된 과목 ID Set — "이전 학점" 계산용
  const [prevCheckedIds, setPrevCheckedIds] = useState<Set<string>>(new Set());
  // userId: localStorage 키 구성에 사용
  const [userId, setUserId] = useState("");

  // ── 데이터 로드 ──
  useEffect(() => {
    getCurrentUser().then(async (user) => {
      setUserId(user.id);
      // 과목 카탈로그와 졸업 요건을 병렬 로드
      const [courses, req] = await Promise.all([
        getCatalogCourses(),
        getCurriculumRequirement(),
      ]);
      setCatalog(courses);
      setRequirement(req);

      // ── localStorage에서 이전 단계 데이터 복원 ──

      // 이번에 추가한 계획 과목 ID 배열 (결과 페이지에서 저장)
      const plannedRaw = localStorage.getItem(`last_planned_${user.id}`);
      const plannedIds: string[] = plannedRaw ? JSON.parse(plannedRaw) : [];
      // ID 배열을 과목 객체 배열로 변환 (이름/학점 표시에 필요)
      setPlannedCourses(courses.filter(c => plannedIds.includes(c.id)));

      // 현재 저장된 전체 체크 목록에서 이번 planned 항목을 제외 = 이전 체크 목록
      // (학점 변화를 "이전 → 현재" 형태로 보여주기 위함)
      const checkedRaw = localStorage.getItem(`checked_courses_${user.id}`);
      const checkedIds: string[] = checkedRaw ? JSON.parse(checkedRaw) : [];
      const prevIds = checkedIds.filter(id => !plannedIds.includes(id));
      setPrevCheckedIds(new Set(prevIds));
    });
  }, []);

  // requirement가 로드되기 전에는 렌더하지 않음
  if (!requirement) return null;

  /** 카테고리별 졸업 요건 학점 맵 */
  const reqByType: Record<CategoryType, number> = {
    "전공기초": requirement.basic,
    "전공필수": requirement.required,
    "전공선택": requirement.elective,
  };

  /**
   * prevByType: planned 추가 이전의 카테고리별 학점
   * 학점 요약 카드에서 "이전 값(취소선)"으로 표시됨
   */
  const prevByType = CATEGORY_ORDER.reduce((acc, type) => {
    acc[type] = catalog
      .filter(c => c.type === type && prevCheckedIds.has(c.id))
      .reduce((s, c) => s + c.credits, 0);
    return acc;
  }, {} as Record<CategoryType, number>);

  /**
   * allCheckedIds: 이전 체크 + 이번 planned 과목을 합산한 전체 Set
   * plannedCourses를 추가한 후의 현재 상태를 나타냄
   */
  const allCheckedIds = new Set([
    ...prevCheckedIds,
    ...plannedCourses.map(c => c.id),
  ]);

  /**
   * currByType: planned 추가 후의 카테고리별 현재 학점
   * 학점 요약 카드에서 굵은 레드 숫자로 표시됨
   */
  const currByType = CATEGORY_ORDER.reduce((acc, type) => {
    acc[type] = catalog
      .filter(c => c.type === type && allCheckedIds.has(c.id))
      .reduce((s, c) => s + c.credits, 0);
    return acc;
  }, {} as Record<CategoryType, number>);

  return (
    <div style={{ fontFamily: "var(--font-roboto), sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 100px" }}>

        {/* ── 헤더 ── */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "48px" }}>
          {/* 좌측 레드 세로 강조선 */}
          <div style={{ width: "6px", backgroundColor: "#9A001F", flexShrink: 0 }} />
          <div>
            {/* 현재 학기 배지 — 하드코딩 "3학년 1학기" (추후 user.grade + semester로 동적화 예정) */}
            <span style={{
              display: "inline-block", padding: "4px 14px", borderRadius: "999px",
              backgroundColor: "#FCF1F1", border: "1px solid rgba(154,0,31,0.15)",
              fontSize: "12px", fontWeight: 600, color: "#5C3F3F", marginBottom: "16px",
            }}>
              3학년 1학기
            </span>
            <h1 style={{ fontSize: "40px", fontWeight: 700, color: "#1F1A1A", marginBottom: "12px", lineHeight: 1.2 }}>
              커리큘럼 계획 요약
            </h1>
            {/* 격려 메시지 — 브랜드 네임(khunnect) 포함 */}
            <p style={{ fontSize: "14px", color: "#5C3F3F", lineHeight: 1.8, fontWeight: 600 }}>
              머리 아픈 학점 계산은 khunnect한테 맡겨요.<br />
              khunnect가 그려준 지도와 함께 이번 학기도 잘 해낼 수 있을 거예요!
            </p>
          </div>
        </div>

        {/* ── 메인 콘텐츠: 담은 강의 내역(좌) + 학점 요약(우) ── */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── 좌측: 담은 강의 내역 카드 ── */}
          <div style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "32px 36px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            {/* 카드 헤더: 목록 아이콘 + 제목 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.6 14.4H14.4V12H9.6V14.4ZM9.6 10.8H19.2V8.4H9.6V10.8ZM9.6 7.2H19.2V4.8H9.6V7.2ZM7.2 19.2C6.54 19.2 5.975 18.965 5.505 18.495C5.035 18.025 4.8 17.46 4.8 16.8V2.4C4.8 1.74 5.035 1.175 5.505 0.705C5.975 0.235 6.54 0 7.2 0H21.6C22.26 0 22.825 0.235 23.295 0.705C23.765 1.175 24 1.74 24 2.4V16.8C24 17.46 23.765 18.025 23.295 18.495C22.825 18.965 22.26 19.2 21.6 19.2H7.2ZM7.2 16.8H21.6V2.4H7.2V16.8ZM2.4 24C1.74 24 1.175 23.765 0.705 23.295C0.235 22.825 0 22.26 0 21.6V4.8H2.4V21.6H19.2V24H2.4Z" fill="#5C3F3F"/>
              </svg>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1F1A1A" }}>담은 강의 내역</h2>
            </div>

            {/* 강의 목록 컨테이너 — 고정 높이(282px) 초과 시 스크롤 */}
            <div style={{ borderTop: "1px solid #E6BDBB", paddingTop: "16px" }}>
              <div style={{ backgroundColor: "#FCF1F1", borderRadius: "12px", padding: "20px 20px" }}>
                <div style={{
                  height: "282px",
                  overflowY: "auto",      // 과목이 많으면 세로 스크롤
                  paddingRight: "4px",    // 스크롤바와 내용 사이 여백
                }}>
                  {plannedCourses.length === 0 ? (
                    // 계획 과목이 없을 때 안내 문구
                    <p style={{ padding: "16px 0", fontSize: "14px", color: "#A8A29E", textAlign: "center" }}>추가한 과목이 없습니다.</p>
                  ) : (
                    plannedCourses.map((course, idx) => (
                      <div key={course.id} style={{
                        display: "flex", alignItems: "center",
                        padding: "14px 16px",
                        // 마지막 항목 아래 여백 없음, 나머지는 8px
                        marginBottom: idx < plannedCourses.length - 1 ? "8px" : 0,
                        backgroundColor: "#FFFFFF", borderRadius: "10px",
                      }}>
                        {/* 과목명 — flex: 2로 넓은 공간 차지 */}
                        <span style={{ flex: 2, fontSize: "15px", fontWeight: 600, color: "#1F1A1A" }}>{course.name}</span>
                        {/* 카테고리(전공기초/필수/선택) */}
                        <span style={{ flex: 1, fontSize: "13px", color: "#5C3F3F" }}>{course.type}</span>
                        {/* 학점 수 — 레드 강조, 우측 정렬 */}
                        <span style={{ flex: 0, fontSize: "15px", fontWeight: 700, color: "#9A001F", width: "40px", textAlign: "center" }}>{course.credits}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── 우측: 학점 요약 카드 ── */}
          <div style={{ width: "280px", flexShrink: 0, backgroundColor: "#FCF1F1", borderRadius: "20px", padding: "32px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            {/* 카드 헤더: 제목 + 건물 아이콘 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1F1A1A" }}>학점 요약</h2>
              {/* 건물(캠퍼스) 아이콘 — 브랜드 레드 15% 불투명도로 장식적 배치 */}
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 100 100" fill="none">
                <path d="M15 80V45H25V80H15ZM45 80V45H55V80H45ZM0 100V90H100V100H0ZM75 80V45H85V80H75ZM0 35V25L50 0L100 25V35H0ZM22.25 25H50H77.75H22.25ZM22.25 25H77.75L50 11.25L22.25 25Z" fill="#9A001F" opacity="0.15"/>
              </svg>
            </div>
            {/* 구분선 — 헤더와 학점 항목 사이 */}
            <div style={{ borderBottom: "1px solid #E6BDBB", margin: "-24px 0 20px" }} />

            {/* 카테고리별 학점 변화 표시 */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {CATEGORY_ORDER.map((type, idx) => {
                const prev = prevByType[type];   // planned 추가 이전 학점
                const curr = currByType[type];   // planned 추가 후 현재 학점
                const total = reqByType[type];   // 졸업 요건 학점
                // 이전과 현재가 다를 때만 "이전 값(취소선)" 표시
                const changed = curr !== prev;
                return (
                  <div key={type} style={{
                    paddingTop: idx === 0 ? 0 : "14px",
                    paddingBottom: idx === CATEGORY_ORDER.length - 1 ? 0 : "14px",
                    // 마지막 항목 아래 구분선 제거
                    borderBottom: idx === CATEGORY_ORDER.length - 1 ? "none" : "1px solid rgba(154,0,31,0.12)",
                  }}>
                    {/* 카테고리 이름 레이블 */}
                    <p style={{ fontSize: "12px", color: "#5C3F3F", marginBottom: "6px" }}>{type}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      {/* 학점이 변경된 경우에만 이전 값을 취소선으로 표시 */}
                      {changed && (
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#C4B5B5", textDecoration: "line-through" }}>
                          {String(prev).padStart(2, "0")}  {/* 한 자리 숫자도 "06" 형태로 표시 */}
                        </span>
                      )}
                      {/* 현재 학점 — 큰 레드 숫자로 강조 */}
                      <span style={{ fontSize: "28px", fontWeight: 700, color: "#9A001F" }}>
                        {String(curr).padStart(2, "0")}
                      </span>
                      {/* 요건 학점 — 연한 색으로 목표 표시 */}
                      <span style={{ fontSize: "14px", color: "#C4B5B5" }}>/ {total}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── 하단 버튼 행 ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "40px", marginTop: "48px" }}>
          {/* 돌아가기 — 결과 페이지로 복귀 */}
          <button
            onClick={() => router.push("/curriculum/result")}
            style={{ background: "none", border: "none", fontSize: "15px", color: "#5C3F3F", fontWeight: 500, cursor: "pointer" }}
          >
            돌아가기
          </button>
          {/* 확인하기 — 홈으로 이동 (계획 완료 플로우 종료) */}
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "14px 32px", borderRadius: "999px",
              backgroundColor: "#9A001F", color: "#FFFFFF",
              border: "none", fontSize: "15px", fontWeight: 600, cursor: "pointer",
              // 레드 드롭 섀도우로 버튼 돋보이게
              boxShadow: "0 4px 14px rgba(154,0,31,0.35)",
            }}
          >
            {/* 체크 원형 아이콘 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="white"/>
            </svg>
            확인하기
          </button>
        </div>

      </div>
    </div>
  );
}
