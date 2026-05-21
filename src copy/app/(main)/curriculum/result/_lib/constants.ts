export const CATEGORY_ORDER = ["전공기초", "전공필수", "전공선택"] as const;
export type CategoryType = (typeof CATEGORY_ORDER)[number];

export const PROGRESS_COLORS: Record<CategoryType, string> = {
  "전공기초": "#D4FF00",
  "전공필수": "#00E0FF",
  "전공선택": "#FFC700",
};

// 레이아웃 상수
export const LAYOUT = {
  courseBoxWidth: "700px",
  simulatorWidth: "300px",
  heroCardWidth: "1016px", // courseBoxWidth + gap(16) + simulatorWidth
  simulatorStickyTop: "400px",
} as const;
