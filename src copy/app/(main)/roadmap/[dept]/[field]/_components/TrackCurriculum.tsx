/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: roadmap/[dept]/[field]/_components/TrackCurriculum.tsx              ║
║  역할: 커리어 로드맵의 연도별 커리큘럼 타임라인 컴포넌트                     ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(page.tsx)에서 years, selectedYear, selectedCourses, ref들을 수신    ║
║    → 연도 탭 + 가로 스크롤 커리큘럼 그리드 렌더링                           ║
║    → 과목 카드 클릭 → onToggleCourse 콜백으로 부모에 토글 위임              ║
║    → 탭/이전/다음 버튼 클릭 → onScrollToYear 콜백으로 부모에 이동 위임     ║
║                                                                              ║
║  레이아웃 구조:                                                              ║
║    [헤더: 제목 + 범례]                                                       ║
║    [탭 바: 1학년 | 2학년 | 3학년 | 4학년] (가로 스크롤, overflow:hidden)    ║
║    [이전 버튼] [커리큘럼 그리드 (가로 스크롤)] [다음 버튼]                   ║
║      ↳ 각 연도: 1학기 컬럼 + 2학기 컬럼                                     ║
║                                                                              ║
║  스크롤 동기화:                                                              ║
║    scrollRef(콘텐츠)와 tabScrollRef(탭)는 부모가 관리                       ║
║    부모의 scroll 이벤트 리스너가 두 ref를 동기화                             ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/lib/roadmapColors : COURSE_TYPE_COLORS (과목 유형별 색상 매핑)       ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// useRef는 이 컴포넌트에서 직접 ref를 생성하지 않으나, props 타입에서 사용
import { useRef } from "react";
// 인라인 스타일 타입
import type { CSSProperties } from "react";
// 과목 유형(기초/필수/선택)별 색상 및 레이블 매핑
import { COURSE_TYPE_COLORS } from "@/lib/roadmapColors";

// ── 로컬 타입 정의 ────────────────────────────────────────────────────────────
// @/types의 구조와 유사하지만, 이 컴포넌트에서만 사용하는 경량 타입

/** 개별 과목 (UI 표시용) */
type Course = {
  name: string;  // 한국어 과목명
  sub: string;   // 영어 부제 (nameEn)
  type: string;  // 과목 유형 (기초/필수/선택) - COURSE_TYPE_COLORS 키
};

/** 학기 데이터 */
type Semester = {
  sem: string;         // 학기 레이블 (예: "1학기")
  courses: Course[];
};

/** 학년 데이터 */
type Year = {
  year: string;          // 학년 레이블 (예: "1학년")
  semesters: Semester[];
};

/**
 * TrackCurriculumProps
 * 부모(page.tsx)에서 모든 상태와 ref를 전달받는 순수 표현 컴포넌트.
 */
type TrackCurriculumProps = {
  years: Year[];                                    // 연도/학기/과목 계층 구조
  selectedYear: number;                             // 현재 선택된 연도 탭 인덱스
  selectedCourses: Set<string>;                     // 선택(토글)된 과목 키 집합
  scrollRef: React.RefObject<HTMLDivElement | null>; // 커리큘럼 콘텐츠 스크롤 컨테이너 ref
  tabScrollRef: React.RefObject<HTMLDivElement | null>; // 연도 탭 스크롤 컨테이너 ref
  onScrollToYear: (idx: number) => void;            // 탭/버튼 클릭 시 해당 연도로 이동
  onToggleCourse: (key: string) => void;            // 과목 카드 클릭 시 선택 토글
};

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 전체 컴포넌트 래퍼: 분홍빛 배경, 둥근 모서리
const wrapperStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,               // flex 자식에서 overflow 동작을 위해 필수
  overflow: "hidden",
  backgroundColor: "#FFF8F7",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

// 헤더: 제목(좌) + 범례(우) 양끝 정렬
const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

// "Timeline Curriculum" 제목 스타일
const headingStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1F1A1A",
};

// 범례 컨테이너 (기초/필수/선택 색상 도트 + 레이블 목록)
const legendStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

// 범례 아이템 하나 (도트 + 레이블)
const legendItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

/**
 * legendDotStyle
 * 범례의 색상 도트 스타일
 *
 * @param color - 해당 과목 유형의 색상 (COURSE_TYPE_COLORS에서 가져옴)
 */
const legendDotStyle = (color: string): CSSProperties => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: color,
});

// 범례 레이블 텍스트 스타일
const legendLabelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#5C3F3F",
};

// 탭 바 스크롤 컨테이너: 가로 overflow 숨김 (JS로 스크롤 조작)
const tabScrollStyle: CSSProperties = {
  display: "flex",
  overflowX: "hidden",  // 탭은 가로 스크롤을 숨기고 JS로만 이동
  marginBottom: "24px",
};

/**
 * tabButtonStyle
 * 연도 탭 버튼 스타일 (선택/미선택 상태에 따라 분기)
 *
 * @param isSelected - 현재 선택된 탭인지 여부
 */
const tabButtonStyle = (isSelected: boolean): CSSProperties => ({
  flex: "0 0 50%",           // 두 탭이 나란히 보이도록 각각 50% 너비
  padding: "12px 0",
  backgroundColor: "transparent",
  border: "none",
  // 선택 시: 레드 하단 테두리 / 미선택 시: 회색 하단 테두리
  borderBottom: isSelected ? "2px solid #9A001F" : "2px solid #E5E7EB",
  fontSize: "14px",
  fontWeight: isSelected ? 700 : 400,
  color: isSelected ? "#9A001F" : "#9CA3AF",
  cursor: "pointer",
  transition: "color 200ms ease, border-color 200ms ease, font-weight 200ms ease",
});

// 이전/다음 버튼을 절대 위치로 배치하기 위한 상대 위치 래퍼
const scrollWrapperStyle: CSSProperties = {
  position: "relative",
};

// "이전" (←) 화살표 버튼: 콘텐츠 좌측 바깥에 절대 위치
const prevButtonStyle: CSSProperties = {
  position: "absolute",
  left: "-16px",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E9DEDE",
  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

// "다음" (→) 화살표 버튼: 콘텐츠 우측 바깥에 절대 위치
const nextButtonStyle: CSSProperties = {
  position: "absolute",
  right: "-16px",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E9DEDE",
  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

// 커리큘럼 콘텐츠 가로 스크롤 컨테이너
const contentScrollStyle: CSSProperties = {
  width: "100%",
  overflowX: "scroll",
  scrollSnapType: "x mandatory", // 연도 단위로 스냅 스크롤
  display: "flex",
  flexWrap: "nowrap",
  scrollbarWidth: "none",        // Firefox: 스크롤바 숨김
  msOverflowStyle: "none",       // IE/Edge: 스크롤바 숨김
};

/**
 * yearColumnStyle
 * 각 연도 컬럼 스타일 (첫 번째 컬럼은 왼쪽 패딩/테두리 없음)
 *
 * @param idx - 연도 인덱스 (0-based)
 */
const yearColumnStyle = (idx: number): CSSProperties => ({
  flex: "0 0 50%",             // 두 연도가 나란히 보이도록 각각 50% 너비
  scrollSnapAlign: "start",    // 스크롤 스냅 기준점
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  paddingRight: "8px",
  paddingLeft: idx > 0 ? "8px" : "0",
  // 두 번째 연도부터 좌측 구분선 표시
  borderLeft: idx > 0 ? "1px solid #E9DEDE" : "none",
});

// 한 연도 내 1학기/2학기 컬럼을 가로로 배치하는 행
const semestersRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flex: 1,
};

// 개별 학기 컬럼 (1학기 또는 2학기)
const semesterColStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,  // overflow 처리를 위해 필수
};

// 학기 레이블 ("1학기", "2학기") 텍스트 스타일
const semLabelStyle: CSSProperties = {
  fontSize: "11px",
  color: "#9CA3AF",
  marginBottom: "10px",
  letterSpacing: "0.4px",
};

// 과목 카드 목록 세로 배치
const coursesColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

/**
 * courseCardStyle
 * 과목 카드 스타일 (선택 상태에 따라 배경/테두리 분기)
 *
 * @param isSelected - 이 과목이 선택(토글)된 상태인지 여부
 * @param dotColor   - 과목 유형에 해당하는 색상 (좌측 4px 테두리에 사용)
 */
const courseCardStyle = (isSelected: boolean, dotColor: string): CSSProperties => ({
  backgroundColor: isSelected ? "#9A001F" : "#FFFFFF",
  borderRadius: "8px",
  padding: "14px 10px",
  // 선택 시: 레드 배경으로 좌측 테두리가 배경색과 동화
  // 미선택 시: 유형별 색상 좌측 테두리
  borderLeft: `4px solid ${isSelected ? "#9A001F" : dotColor}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  cursor: "pointer",
  transition: "background-color 150ms ease, border-color 150ms ease",
});

/**
 * courseNameStyle
 * 과목명 텍스트 스타일 (선택 시 흰색)
 *
 * @param isSelected - 과목 선택 여부
 */
const courseNameStyle = (isSelected: boolean): CSSProperties => ({
  fontSize: "11px",
  fontWeight: 600,
  color: isSelected ? "#FFFFFF" : "#1F1A1A",
  marginBottom: "2px",
  lineHeight: "1.4",
});

/**
 * courseSubStyle
 * 과목 영어 부제 스타일 (선택 시 흰색)
 *
 * @param isSelected - 과목 선택 여부
 */
const courseSubStyle = (isSelected: boolean): CSSProperties => ({
  fontSize: "10px",
  color: isSelected ? "#FFFFFF" : "#9CA3AF",
  lineHeight: "1.3",
});

/**
 * TrackCurriculum
 *
 * 커리어 로드맵의 핵심 UI 컴포넌트.
 * 연도별 학기/과목을 타임라인 형식으로 표시하며,
 * 탭 클릭 또는 이전/다음 버튼으로 연도 간 이동 가능.
 * 과목 카드를 클릭하면 선택(토글)되어 강조 표시됨.
 *
 * 스크롤 동기화는 부모(page.tsx)의 useEffect에서 처리됨.
 */
export default function TrackCurriculum({
  years,
  selectedYear,
  selectedCourses,
  scrollRef,
  tabScrollRef,
  onScrollToYear,
  onToggleCourse,
}: TrackCurriculumProps) {
  return (
    <div style={wrapperStyle}>
      {/* 헤더: 제목 + 과목 유형 범례 */}
      <div style={headerStyle}>
        <h3 style={headingStyle}>
          Timeline Curriculum
        </h3>
        {/* 범례: COURSE_TYPE_COLORS의 모든 항목을 순회하여 도트 + 레이블 표시 */}
        <div style={legendStyle}>
          {Object.values(COURSE_TYPE_COLORS).map((item) => (
            <div key={item.label} style={legendItemStyle}>
              <div style={legendDotStyle(item.dot)} />
              <span style={legendLabelStyle}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 연도 탭 바: tabScrollRef로 JS 제어, overflow:hidden으로 스크롤바 숨김 */}
      <div ref={tabScrollRef} style={tabScrollStyle}>
        {years.map((y, idx) => (
          <button
            key={y.year}
            onClick={() => onScrollToYear(idx)}
            style={tabButtonStyle(selectedYear === idx)}
          >
            {y.year}
          </button>
        ))}
      </div>

      {/* 이전/다음 버튼 + 커리큘럼 콘텐츠 영역 */}
      <div style={scrollWrapperStyle}>
        {/* 이전 버튼: 첫 번째 연도에서는 숨김 */}
        {selectedYear > 0 && (
          <button onClick={() => onScrollToYear(selectedYear - 1)} style={prevButtonStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C3F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}

        {/* 다음 버튼: 마지막 연도에서는 숨김 */}
        {selectedYear < years.length - 1 && (
          <button onClick={() => onScrollToYear(selectedYear + 1)} style={nextButtonStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C3F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        {/* 커리큘럼 콘텐츠: scrollRef로 스크롤 이벤트 감지 및 JS 제어 */}
        <div ref={scrollRef} style={contentScrollStyle}>
          {years.map((year, idx) => (
            <div key={year.year} style={yearColumnStyle(idx)}>
              <div style={semestersRowStyle}>
                {year.semesters.map((sem) => (
                  <div key={sem.sem} style={semesterColStyle}>
                    {/* 학기 레이블 */}
                    <p style={semLabelStyle}>{sem.sem}</p>
                    {/* 과목 카드 목록 */}
                    <div style={coursesColStyle}>
                      {sem.courses.map((course) => {
                        // 고유 과목 키: "학년-학기-과목명" 형태의 복합키
                        const courseKey = `${year.year}-${sem.sem}-${course.name}`;
                        // selectedCourses Set에서 O(1) 조회
                        const isSelected = selectedCourses.has(courseKey);
                        // 과목 유형 색상 조회 (없으면 회색 폴백)
                        const dotColor = (COURSE_TYPE_COLORS as Record<string, { dot: string; label: string }>)[course.type]?.dot ?? "#9CA3AF";
                        return (
                          <div
                            key={course.name}
                            onClick={() => onToggleCourse(courseKey)}
                            style={courseCardStyle(isSelected, dotColor)}
                          >
                            {/* 한국어 과목명 */}
                            <p style={courseNameStyle(isSelected)}>{course.name}</p>
                            {/* 영어 부제 */}
                            <p style={courseSubStyle(isSelected)}>{course.sub}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
