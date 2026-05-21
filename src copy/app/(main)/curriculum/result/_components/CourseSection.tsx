import type { CatalogCourse } from "@/types";
import type { CategoryType } from "../_lib/constants";
import { getCourseStatus } from "../_lib/utils";
import { CourseCard } from "./CourseCard";

interface CourseSectionProps {
  type: CategoryType;
  courses: CatalogCourse[];
  completed: number;
  total: number;
  checked: Set<string>;
  planned: Set<string>;
  onTogglePlanned: (id: string) => void;
  isLast: boolean;
}

export function CourseSection({
  type, courses, completed, total,
  checked, planned, onTogglePlanned, isLast,
}: CourseSectionProps) {
  return (
    <div style={{ marginBottom: isLast ? 0 : "36px" }}>

      {/* 카테고리 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #E6BDBB" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#9A001F" }}>{type}</h2>
        <span style={{ fontSize: "13px", color: "#5C3F3F" }}>{completed} / {total}학점</span>
      </div>

      {/* 과목 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {courses
          .filter((course) => !checked.has(course.id))
          .map((course) => {
            const status = getCourseStatus(course, checked);
            return (
              <CourseCard
                key={course.id}
                course={course}
                status={status}
                isPlanned={planned.has(course.id)}
                onToggle={() => status === "available" && onTogglePlanned(course.id)}
              />
            );
          })}
      </div>

    </div>
  );
}
