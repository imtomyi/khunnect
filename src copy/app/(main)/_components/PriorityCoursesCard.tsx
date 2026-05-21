"use client";

import Link from "next/link";
import type { CatalogCourse } from "@/types";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
const cardStyle = (isZeroState?: boolean): React.CSSProperties => ({
  height: isZeroState ? "450px" : "646.052px",
  borderRadius: "32px",
  padding: "41.281px",
});

const titleTextStyle: React.CSSProperties = {
  color: "#5C3F3F",
  fontFamily: "Roboto",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "100%",
};

const zeroStateIconWrapStyle: React.CSSProperties = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#FCF1F1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const zeroStateTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1F1A1A",
  marginBottom: "8px",
};

const zeroStateDescStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#916F6E",
  lineHeight: 1.6,
};

const courseRowStyle: React.CSSProperties = {
  paddingTop: "20px",
  paddingBottom: "20px",
};

const courseIconWrapStyle: React.CSSProperties = {
  backgroundColor: "#FCF1F1",
};

const courseIconTextStyle: React.CSSProperties = {
  color: "#9A001F",
};

const actionBtnBaseStyle: React.CSSProperties = {
  width: "100%",
  border: "2.064px solid rgba(154, 0, 31, 0.10)",
  borderRadius: "16px",
  height: "56px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#9A001F",
  backgroundColor: "transparent",
  cursor: "pointer",
  transition: "background-color 150ms ease",
};

// ── 이벤트 핸들러 ────────────────────────────────────────────────────────────
function handleActionBtnMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.backgroundColor = "#9A001F";
  e.currentTarget.style.color = "#FFFFFF";
}

function handleActionBtnMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.backgroundColor = "transparent";
  e.currentTarget.style.color = "#9A001F";
}

// ── 서브컴포넌트 ─────────────────────────────────────────────────────────────
const GraduationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21L5 17.2V11.2L1 9L12 3L23 9V17H21V10.1L19 11.2V17.2L12 21ZM12 12.7L18.85 9L12 5.3L5.15 9L12 12.7ZM12 18.725L17 16.025V12.25L12 15L7 12.25V16.025L12 18.725Z" fill="#9A001F"/>
  </svg>
);

function CourseTypeLabel({ type }: { type: CatalogCourse["type"] }) {
  const label = type === "전공필수" ? "필" : type === "전공기초" ? "기" : "선";
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={courseIconWrapStyle}>
      <span className="text-xs font-bold" style={courseIconTextStyle}>{label}</span>
    </div>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function PriorityCoursesCard({ isZeroState, checkedCourses = [] }: { isZeroState?: boolean; checkedCourses?: CatalogCourse[] }) {
  return (
    <div
      className="flex-1 border border-border bg-white flex flex-col gap-4"
      style={cardStyle(isZeroState)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationIcon />
          <span style={titleTextStyle}>커리큘럼 계획</span>
        </div>
        {!isZeroState && (
          <Link href="/curriculum/result/summary" className="text-xs text-muted-foreground hover:text-foreground">
            전체 보기
          </Link>
        )}
      </div>

      {isZeroState ? (
        /* ── Zero state ── */
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
          <div style={zeroStateIconWrapStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.33333 18.6667H8V12H5.33333V18.6667ZM16 18.6667H18.6667V5.33333H16V18.6667ZM10.6667 18.6667H13.3333V14.6667H10.6667V18.6667ZM10.6667 12H13.3333V9.33333H10.6667V12ZM2.66667 24C1.93333 24 1.30556 23.7389 0.783333 23.2167C0.261111 22.6944 0 22.0667 0 21.3333V2.66667C0 1.93333 0.261111 1.30556 0.783333 0.783333C1.30556 0.261111 1.93333 0 2.66667 0H21.3333C22.0667 0 22.6944 0.261111 23.2167 0.783333C23.7389 1.30556 24 1.93333 24 2.66667V21.3333C24 22.0667 23.7389 22.6944 23.2167 23.2167C22.6944 23.7389 22.0667 24 21.3333 24H2.66667ZM2.66667 21.3333H21.3333V2.66667H2.66667V21.3333Z" fill="#C7002B"/>
            </svg>
          </div>
          <div>
            <p style={zeroStateTitleStyle}>학점 데이터가 비어있습니다</p>
            <p style={zeroStateDescStyle}>
              직접 수강한 강의를 입력하여 나의<br />학업 진행도와 계획을 한눈에 파악해보세요
            </p>
          </div>
        </div>
      ) : (
        /* ── 과목 목록 ── */
        <div className="flex flex-col flex-1 overflow-y-auto">
          {checkedCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">계획된 과목이 없습니다.</p>
          ) : (
            checkedCourses.map((course) => (
              <div key={course.id} className="flex items-center gap-3" style={courseRowStyle}>
                <CourseTypeLabel type={course.type} />
                <div>
                  <p className="text-sm font-semibold">{course.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.code} · {course.credits}학점</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Link href="/curriculum">
        <button
          style={actionBtnBaseStyle}
          onMouseEnter={handleActionBtnMouseEnter}
          onMouseLeave={handleActionBtnMouseLeave}
        >
          {isZeroState ? "커리큘럼 계산 시작하기" : "과목 추가하기"}
        </button>
      </Link>
    </div>
  );
}
