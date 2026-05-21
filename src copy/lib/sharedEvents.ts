/**
 * sharedEvents.ts — 앱 전체에서 공유하는 예정 이벤트(세션) 목록
 *
 * CalendarSection(마이페이지)과 RecommendedSeniorCard(홈)가 동일한 데이터를 참조.
 * 추후 API 연동 시 이 파일의 MOCK_EVENTS를 서버 데이터로 교체하면 됨.
 */

export type ScheduledEvent = {
  date: string;        // "YYYY-MM-DD"
  time: string;        // 표시용 시간 문자열 (예: "오전 10:00")
  title: string;       // 이벤트 제목
  description?: string; // 부가 설명 (선택)
};

/** 예정된 이벤트 목록 — CalendarSection + 홈 세션 카드 공통 사용 */
export const MOCK_EVENTS: ScheduledEvent[] = [
  {
    date: "2026-04-05",
    time: "오전 10:00",
    title: "내일 - 4월 5일",
    description: "오전 10:00 대균 선배와 함께 하는 포폴 리뷰, 1층 예디대 건물",
  },
  {
    date: "2026-04-15",
    time: "오후 2:00",
    title: "4월 15일",
    description: "오후 2:00 김성백 선배 커피챗",
  },
  {
    date: "2026-04-20",
    time: "오전 11:00",
    title: "4월 20일",
    description: "오전 11:00 포트폴리오 피드백 미팅",
  },
];

/**
 * getNearestEvent
 * 오늘 이후 가장 가까운 이벤트를 반환. 없으면 null.
 */
export function getNearestEvent(): ScheduledEvent | null {
  const todayStr = new Date().toISOString().slice(0, 10);
  return MOCK_EVENTS.find((e) => e.date >= todayStr) ?? null;
}
