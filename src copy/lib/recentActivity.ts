/**
 * @file src/lib/recentActivity.ts
 * @description 최근 방문/활동 기록을 localStorage에 저장·조회하는 유틸리티
 *
 * 역할:
 *  - 사용자가 선배 프로필, 로드맵, 커리큘럼 등을 방문할 때 해당 기록을 저장한다.
 *  - 홈 화면 등에서 "최근 활동" 목록을 표시할 때 이 기록을 꺼내 사용한다.
 *  - 최대 MAX_ITEMS(6)개까지만 보관하며, 같은 href는 중복 저장하지 않는다.
 *
 * Export:
 *  - RecentActivity  — 활동 기록 타입
 *  - addRecentActivity   — 활동 기록 추가
 *  - getRecentActivities — 활동 기록 전체 조회
 *  - formatTimeAgo       — 타임스탬프를 "N분 전" 형식 문자열로 변환
 *
 * 사용처:
 *  - src/app/(main)/page.tsx (홈 화면 최근 활동 섹션)
 *  - 각 페이지에서 방문 시 addRecentActivity() 호출
 */

/**
 * 최근 활동 기록 한 건의 타입 정의.
 *
 * @property {string}   id        활동 고유 식별자 (선배 ID, 페이지 경로 등)
 * @property {string}   label     목록에 표시할 주 텍스트
 * @property {string}   sub       목록에 표시할 보조 텍스트 (학과, 직무 등)
 * @property {string}   href      해당 활동으로 이동할 URL
 * @property {string}   type      활동 카테고리 ("senior" | "roadmap" | ... )
 * @property {number}   timestamp 기록 생성 시각 (Date.now() 값)
 */
export type RecentActivity = {
  id: string;
  label: string;
  sub: string;
  href: string;
  type: "senior" | "roadmap" | "curriculum" | "messages" | "mypage" | "calendar";
  timestamp: number;
};

// localStorage에 저장할 때 사용하는 키 이름
const STORAGE_KEY = "semotone_recent_activities";
// 보관할 최대 기록 수 — 오래된 항목은 자동으로 잘린다.
const MAX_ITEMS = 6;

/**
 * 새로운 활동 기록을 localStorage에 추가한다.
 *
 * - 서버 사이드 렌더링(SSR) 환경에서는 window가 없으므로 조기 반환한다.
 * - 같은 href가 이미 존재하면 기존 항목을 제거하고 최신으로 갱신한다 (중복 방지).
 * - 최신 항목이 맨 앞에 오도록 배열 앞쪽에 추가한다.
 * - MAX_ITEMS를 초과하면 오래된 항목을 잘라낸다.
 *
 * @param {Omit<RecentActivity, "timestamp">} activity timestamp를 제외한 활동 정보
 */
export function addRecentActivity(activity: Omit<RecentActivity, "timestamp">) {
  // SSR에서는 localStorage에 접근할 수 없으므로 클라이언트에서만 실행한다.
  if (typeof window === "undefined") return;
  const existing = getRecentActivities();
  // 같은 href는 제거 후 최신으로 추가
  // → 동일 페이지를 재방문해도 목록에 중복으로 쌓이지 않도록 먼저 필터링한다.
  const filtered = existing.filter((a) => a.href !== activity.href);
  const updated = [
    { ...activity, timestamp: Date.now() }, // 현재 시각을 타임스탬프로 부여
    ...filtered,
  ].slice(0, MAX_ITEMS); // 최대 6개로 제한
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * localStorage에서 최근 활동 기록 목록을 읽어온다.
 *
 * - SSR 환경이거나 파싱 오류가 발생하면 빈 배열을 반환한다.
 *
 * @returns {RecentActivity[]} 최근 활동 기록 배열 (최신 순)
 */
export function getRecentActivities(): RecentActivity[] {
  // SSR에서는 localStorage 접근 불가 → 빈 배열 반환
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // 저장된 값이 없으면 빈 배열, 있으면 JSON 파싱 후 반환
    return raw ? JSON.parse(raw) : [];
  } catch {
    // JSON이 손상된 경우 등 파싱 오류 시 조용히 빈 배열 반환
    return [];
  }
}

/**
 * 타임스탬프(ms)를 사람이 읽기 좋은 상대 시간 문자열로 변환한다.
 *
 * 변환 기준:
 *  - 1분 미만  → "방금 전"
 *  - 1~59분    → "N분 전"
 *  - 1~23시간  → "N시간 전"
 *  - 1일 이상  → "N일 전"
 *
 * @param {number} timestamp 비교할 과거 시각 (Date.now() 형식의 ms 값)
 * @returns {string} 상대 시간 문자열 (예: "3분 전", "2시간 전")
 */
export function formatTimeAgo(timestamp: number): string {
  // 현재 시각과의 차이를 ms 단위로 구한다.
  const diff = Date.now() - timestamp;
  // ms → 분/시간/일 단위로 변환
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
}
