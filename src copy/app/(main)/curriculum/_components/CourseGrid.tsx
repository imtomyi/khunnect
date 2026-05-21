import type { CatalogCourse, CourseType } from "@/types";
import { CheckIcon, UncheckIcon } from "./Icons";

interface CourseGridProps {
  categoryLabel: string;
  courses: CatalogCourse[];
  checked: Set<string>;
  completedCredits: number;
  reqTotal: number;
  onToggle: (id: string) => void;
}

export function CourseGrid({
  categoryLabel, courses, checked,
  completedCredits, reqTotal, onToggle,
}: CourseGridProps) {
  return (
    <div style={{ flex: 1, minWidth: 0, backgroundColor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", padding: "32px 36px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1F1A1A", marginBottom: "4px" }}>
            {categoryLabel} 강의 리스트
          </h2>
          <p style={{ fontSize: "13px", color: "#5C3F3F" }}>이수한 강의의 체크박스를 활성화하세요.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: "#5C3F3F", textTransform: "uppercase", marginBottom: "4px" }}>
            CURRENT STATUS
          </p>
          <p style={{ fontSize: "28px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1 }}>
            {completedCredits}
            <span style={{ fontSize: "28px", color: "#78716C" }}> /{reqTotal}학점</span>
          </p>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "#F5F5F4", margin: "20px 0 24px" }} />

      {/* 과목 목록 */}
      {courses.length === 0 ? (
        <p style={{ color: "#A8A29E", fontSize: "14px" }}>해당 카테고리에 과목이 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isChecked={checked.has(course.id)}
              onToggle={() => onToggle(course.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}

// ── 개별 과목 카드 ─────────────────────────────────────────

interface CourseCardProps {
  course: CatalogCourse;
  isChecked: boolean;
  onToggle: () => void;
}

function CourseCard({ course, isChecked, onToggle }: CourseCardProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "18px 20px", borderRadius: "12px",
        border: isChecked ? "1px solid rgba(154, 0, 31, 0.20)" : "1px solid rgba(230, 189, 187, 0.30)",
        backgroundColor: isChecked ? "#FCF1F1" : "#FFF",
        cursor: "pointer", textAlign: "left",
        transition: "background-color 150ms ease",
      }}
    >
      {isChecked ? <CheckIcon /> : <UncheckIcon />}
      <div>
        <p style={{ fontFamily: "Roboto, sans-serif", fontSize: "15px", fontWeight: isChecked ? 600 : 400, color: "#1F1A1A", lineHeight: "28px", marginBottom: "3px" }}>
          {course.name}
        </p>
        <p style={{ fontSize: "12px", color: isChecked ? "#5C3F3F" : "#A8A29E" }}>
          {course.credits}학점 · {course.code}
        </p>
      </div>
    </button>
  );
}
