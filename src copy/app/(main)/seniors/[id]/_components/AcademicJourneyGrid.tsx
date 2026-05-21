// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  AcademicJourneyGrid.tsx — 선배의 학년별 수강 과목 그리드                   ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    선배의 시간표(timetable) 데이터를 학년/학기별 컬럼 그리드로 시각화한다.    ║
// ║    각 학년이 하나의 컬럼, 각 학기가 그 안의 카드로 구성된다.                 ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    senior.timetable                                                       ║
// ║      → buildYearColumns() (exported helper)                              ║
// ║      → yearColumns prop                                                   ║
// ║      → AcademicJourneyGrid → YearColumnBlock → 학기 카드 → 과목 목록       ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/types : Senior 타입 (buildYearColumns의 인자 타입 추론용)            ║
// ║                                                                          ║
// ║  export:                                                                  ║
// ║    - default AcademicJourneyGrid — 렌더 컴포넌트                           ║
// ║    - buildYearColumns           — 데이터 변환 헬퍼 (page.tsx에서 호출)      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

import type { CSSProperties } from "react";
// Senior 타입 — buildYearColumns의 timetable 인자 타입 추론에 사용
import type { Senior } from "@/types";

// ── 타입 정의 ─────────────────────────────────────────────────────────────

/** 학기 단위 데이터 구조 */
type YearColumn = {
  yearLabel: string;  // 예: "1학년"
  semesters: {
    label: string;    // 예: "1학년 1학기"
    courses: { id: string; name: string; credits?: number }[];
  }[];
};

/** AcademicJourneyGrid Props */
type AcademicJourneyGridProps = {
  /** buildYearColumns()로 변환된 학년별 컬럼 배열 */
  yearColumns: YearColumn[];
};

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/** 섹션 헤더 (아이콘 + 제목) */
const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "20px",
};

/** 섹션 제목 */
const sectionTitleStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1F1A1A",
};

/**
 * 가로 스크롤 컨테이너
 * 학년이 많아져 컨텐츠가 화면 너비를 초과할 때 가로 스크롤로 대응
 */
const scrollContainerStyle: CSSProperties = {
  overflowX: "auto",
  paddingBottom: "8px",  // 스크롤바가 콘텐츠와 겹치지 않도록 여백
};

/**
 * 학년 컬럼들을 가로로 나열하는 내부 행
 * minWidth: max-content → 자식 컬럼이 압축되지 않도록 최소 너비 보장
 */
const innerRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  minWidth: "max-content",
};

/** 개별 학년 컬럼 — 고정 너비 180px, 내부 학기 카드를 세로 배치 */
const yearColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "180px",
  flexShrink: 0,  // 가로 스크롤 시 컬럼이 좁아지지 않도록
};

/** 학년 통합 카드 — 1학기 + 2학기를 하나의 카드에 표시 */
const yearCardStyle: CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "25px",
  overflow: "hidden",
  height: "300px",
  display: "flex",
  flexDirection: "column",
  position: "relative",
};

/** 학기 섹션 — 카드 내 각 학기 영역 (레이아웃용, 패딩 없음) */
const semesterSectionStyle: CSSProperties = {
  flex: 1,
};

/** 학기 구분선 — 카드 세로 중앙 고정 */
const semesterDividerStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "20%",
  width: "60%",
  borderTop: "1px solid #F0EDED",
  transform: "translateY(-50%)",
};

/** 학기 레이블 — 1학기 (카드 상단 고정) */
const semesterLabelTopStyle: CSSProperties = {
  position: "absolute",
  top: "20px",
  left: "22px",
  fontSize: "13px",
  color: "#916F6E",
};

/** 학기 레이블 — 2학기 (중앙선 바로 아래 고정) */
const semesterLabelBottomStyle: CSSProperties = {
  position: "absolute",
  top: "calc(50% + 16px)",
  left: "22px",
  fontSize: "13px",
  color: "#916F6E",
};

/** 과목 목록 — 1학기 (레이블 아래 고정) */
const courseListTopStyle: CSSProperties = {
  position: "absolute",
  top: "44px",
  left: "22px",
  right: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

/** 과목 목록 — 2학기 (중앙선 아래 레이블 기준 고정) */
const courseListBottomStyle: CSSProperties = {
  position: "absolute",
  top: "calc(50% + 40px)",
  left: "22px",
  right: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

/** 개별 과목 항목 래퍼 */
const courseItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

/** 개별 과목 이름 텍스트 */
const courseNameStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#1F1A1A",
  lineHeight: "1.3",
};

/** 과목 학점 텍스트 — 이름 아래 보조 정보 */
const courseCreditsStyle: CSSProperties = {
  fontSize: "10px",
  fontWeight: 400,
  color: "#1F1A1A",
};

/** 과목이 없는 빈 학기 안내 텍스트 */
const emptySemesterStyle: CSSProperties = {
  fontSize: "12px",
  color: "#C4B5B5",
  textAlign: "center",
  padding: "8px 0",
};

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────────

/**
 * SectionHeader
 *
 * "학업 여정 그리드" 섹션 헤더 — 상승 트렌드 아이콘 + 제목.
 * 별도 컴포넌트로 분리하여 AcademicJourneyGrid 가독성 향상.
 */
function SectionHeader() {
  return (
    <div style={sectionHeaderStyle}>
      {/* 상승 꺾은선 SVG 아이콘 — 학업 여정(성장) 이미지 표현 */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1A1A" strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
      <h2 style={sectionTitleStyle}>학업 여정 그리드</h2>
    </div>
  );
}

/**
 * YearColumnBlock
 *
 * 하나의 학년을 세로 컬럼으로 렌더링.
 * 해당 학년의 모든 학기 카드를 순서대로 표시한다.
 *
 * @param col - 학년 데이터 (yearLabel + semesters 배열)
 */
function YearColumnBlock({ col }: { col: YearColumn }) {
  return (
    <div style={yearColumnStyle}>
      {/* 학년당 카드 1개 — 1학기/2학기를 구분선으로 나눠 표시 */}
      <div style={yearCardStyle}>
        {col.semesters.map((sem, idx) => (
          <div key={sem.label}>
            {/* 학기 사이 구분선 (첫 학기 앞에는 표시 안 함) */}
            {idx > 0 && <div style={semesterDividerStyle} />}
            <div style={semesterSectionStyle}>
              <p style={idx === 0 ? semesterLabelTopStyle : semesterLabelBottomStyle}>{sem.label}</p>
              <div style={idx === 0 ? courseListTopStyle : courseListBottomStyle}>
                {sem.courses.length > 0 ? (
                  sem.courses.map((course) => (
                    <div key={course.id} style={courseItemStyle}>
                      <p style={courseNameStyle}>{course.name}</p>
                    </div>
                  ))
                ) : (
                  <p style={emptySemesterStyle}>—</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

/**
 * AcademicJourneyGrid
 *
 * 선배의 전체 학업 여정을 학년별 컬럼 그리드로 시각화.
 * 학년 수가 많아질 경우 가로 스크롤로 자연스럽게 확장된다.
 *
 * @param yearColumns - buildYearColumns()로 변환된 학년별 데이터 배열
 */
export default function AcademicJourneyGrid({ yearColumns }: AcademicJourneyGridProps) {
  return (
    <section>
      <SectionHeader />

      {/* 학년 컬럼이 많아져 넘칠 경우 가로 스크롤 처리 */}
      <div style={scrollContainerStyle}>
        <div style={innerRowStyle}>
          {yearColumns.map((col) => (
            <YearColumnBlock key={col.yearLabel} col={col} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 데이터 변환 헬퍼 (page.tsx에서 호출) ─────────────────────────────────

/**
 * buildYearColumns
 *
 * senior.timetable 배열을 AcademicJourneyGrid가 소비하는 YearColumn[] 형태로 변환.
 * semester 문자열("1-1", "1-2", "2-1" 등)을 파싱하여
 * 학년 단위로 그룹화하고 "N학년 M학기" 레이블을 생성한다.
 *
 * 예시 입력:
 *   [{ semester: "1-1", courses: [...] }, { semester: "2-1", courses: [...] }]
 * 예시 출력:
 *   [{ yearLabel: "1학년", semesters: [{ label: "1학년 1학기", courses: [...] }] }]
 *
 * @param timetable - Senior 타입의 timetable 배열
 * @returns YearColumn 배열 (학년 순 정렬)
 */
export function buildYearColumns(timetable: Senior["timetable"]) {
  // timetable을 semester 키("1-1", "2-2" 등)로 빠르게 조회하기 위한 맵 생성
  const timetableMap = new Map(timetable.map((e) => [e.semester, e.courses]));

  // 졸업생 기준: 1학년 1학기 ~ 4학년 2학기 고정 8컬럼
  // 데이터가 없는 학기는 빈 배열로 채워 항상 전체 학업 여정을 표시
  return [1, 2, 3, 4].map((year) => ({
    yearLabel: `${year}학년`,
    semesters: [1, 2].map((sem) => ({
      label: `${year}학년 ${sem}학기`,
      // timetableMap에 해당 키가 있으면 과목 목록 사용, 없으면 빈 배열
      courses: timetableMap.get(`${year}-${sem}`) ?? [],
    })),
  }));
}
