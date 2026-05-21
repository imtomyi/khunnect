// ── 멘토링 가능 시간 (mock — Supabase 연동 시 교체) ──
export const MOCK_SLOTS = [
  "오전 10:00 — 오전 11:00",
  "오후 02:00 — 오후 03:00",
];

// ── 가능한 요일 인덱스 (0=월 … 6=일, mock — Supabase 연동 시 교체) ──
export const MOCK_AVAILABLE_DAY_INDICES = new Set([0, 1, 3, 4]); // 월·화·목·금

export const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
