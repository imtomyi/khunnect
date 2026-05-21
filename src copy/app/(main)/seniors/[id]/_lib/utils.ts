// ── 주간 날짜 생성 (weekOffset: 0=이번주, 1=다음주, -1=지난주) ──
export function getWeekDates(weekOffset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
