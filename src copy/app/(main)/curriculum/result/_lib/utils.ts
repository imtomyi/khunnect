import type { CatalogCourse } from "@/types";

export function getCourseYear(code: string): number {
  const num = parseInt(code.replace(/[^0-9]/g, ""));
  if (num >= 4000) return 4;
  if (num >= 3000) return 3;
  return 2;
}

export function getCourseSubtitle(course: CatalogCourse): string {
  const year = getCourseYear(course.code);
  return year === 4
    ? `${course.credits}학점 · 4학년 완료`
    : `${course.credits}학점 · ${year}학년 권장`;
}

export function getCourseStatus(
  course: CatalogCourse,
  checked: Set<string>
): "completed" | "available" | "locked" {
  if (checked.has(course.id)) return "completed";
  if (getCourseYear(course.code) >= 4) return "locked";
  return "available";
}
