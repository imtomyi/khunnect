/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/signup/_components/EyeButton.tsx                       ║
║  역할: 비밀번호 입력 필드의 표시/숨김을 토글하는 눈 모양 아이콘 버튼          ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - props 기반 순수 프레젠테이션 컴포넌트 (자체 상태 없음)                   ║
║    - show / onToggle은 부모(signup/page.tsx)에서 제어                         ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - src/app/(auth)/signup/page.tsx (UnderlineField의 rightIcon prop으로 전달)║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

/** EyeButton 컴포넌트가 부모로부터 받는 props 타입 */
type EyeButtonProps = {
  /** true이면 비밀번호가 보이는 상태 (눈에 사선 아이콘), false이면 숨겨진 상태 (눈 아이콘) */
  show: boolean;

  /** 버튼 클릭 시 호출되는 토글 핸들러 */
  onToggle: () => void;
};

/**
 * EyeButton
 *
 * 비밀번호 입력 필드 오른쪽에 배치되는 토글 버튼.
 * - `show`가 true이면: 현재 비밀번호가 보이는 상태 → 사선이 그어진 눈 아이콘 표시
 *   (아이콘 클릭 시 다시 숨김으로 전환 유도)
 * - `show`가 false이면: 현재 비밀번호가 숨겨진 상태 → 일반 눈 아이콘 표시
 *   (아이콘 클릭 시 보기로 전환 유도)
 *
 * 아이콘은 인라인 SVG로 렌더링되며, 별도의 아이콘 라이브러리를 사용하지 않는다.
 */
export default function EyeButton({ show, onToggle }: EyeButtonProps) {
  return (
    <button
      type="button"       // form submit 방지 (type 기본값은 "submit"이므로 명시 필요)
      onClick={onToggle}  // 부모에서 전달받은 토글 핸들러 호출
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        color: "#9CA3AF",   // 회색 아이콘 색상
      }}
    >
      {show ? (
        // 비밀번호가 현재 보이는 상태: 눈에 사선이 그어진 아이콘 (숨기기 암시)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* 눈 윤곽 — 왼쪽과 오른쪽 반쪽을 별도 path로 표현 */}
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          {/* 대각선 사선: 눈을 가로지르는 "/" 표시 */}
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        // 비밀번호가 현재 숨겨진 상태: 일반 눈 아이콘 (보기 암시)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* 눈 윤곽: 위/아래 곡선 */}
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          {/* 동공: 중심 원 */}
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}
