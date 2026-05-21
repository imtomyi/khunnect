import type { CourseType } from "@/types";

export type CategoryConfig = {
  type: CourseType;
  label: string;
  categoryNo: string;
  tip: string;
};

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    type: "전공기초",
    label: "전공기초",
    categoryNo: "CATEGORY 01",
    tip: "전공기초 강의는 웬만하면 1학년 때 끝내는 것이 나중에 편할거에요!",
  },
  {
    type: "전공필수",
    label: "전공필수",
    categoryNo: "CATEGORY 02",
    tip: "전공필수 과목들은 졸업 요건에서 빠질 수 없어요. 매 학기 균형 있게 들어두세요!",
  },
  {
    type: "전공선택",
    label: "전공선택",
    categoryNo: "CATEGORY 03",
    tip: "전공선택은 자신의 커리어 방향에 맞는 과목 위주로 전략적으로 골라보세요.",
  },
];
