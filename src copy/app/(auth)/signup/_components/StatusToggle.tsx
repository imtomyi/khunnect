/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/signup/_components/StatusToggle.tsx                    ║
║  역할: 회원가입 시 재학/졸업 상태를 선택하는 토글 버튼 그룹 컴포넌트          ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - props 기반 순수 프레젠테이션 컴포넌트 (자체 상태 없음)                   ║
║    - status / onStatusChange는 부모(signup/page.tsx)에서 제어                ║
║    - 선택된 값은 form.status에 저장되고, signUp 호출 시 isGraduated 로 변환  ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - src/app/(auth)/signup/page.tsx                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 타입 임포트 ─────────────────────────────────────────────────────────
import { CSSProperties } from "react";

/** StatusToggle 컴포넌트가 부모로부터 받는 props 타입 */
type StatusToggleProps = {
  /** 현재 선택된 상태: "current" (재학) 또는 "graduate" (졸업) */
  status: "current" | "graduate";

  /** 버튼 클릭 시 호출되는 상태 변경 핸들러 */
  onStatusChange: (status: "current" | "graduate") => void;
};

// ── 스타일 상수 ────────────────────────────────────────────────────────────────

/** 레이블 텍스트 스타일 */
const labelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#5C3F3F",
  marginBottom: "8px",
};

/** 토글 버튼들을 감싸는 컨테이너: 연한 핑크 배경의 pill 형태 */
const containerStyle: CSSProperties = {
  display: "flex",
  backgroundColor: "#F6EBEB",  // 연한 핑크 배경
  borderRadius: "10px",
  padding: "4px",              // 버튼과 컨테이너 사이 여백
  gap: "4px",
};

/** 개별 버튼의 기본 스타일 */
const buttonBaseStyle: CSSProperties = {
  flex: 1,              // 두 버튼이 컨테이너를 균등하게 나눔
  padding: "5px 0",
  fontSize: "13px",
  fontWeight: 500,
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  transition: "all 200ms ease",  // 배경색 / 그림자 전환 효과
};

/**
 * 활성화 여부에 따라 버튼 스타일을 반환한다.
 * - 활성 상태: 흰 배경 + 브랜드 빨강 텍스트 + 그림자 (선택된 탭처럼 보임)
 * - 비활성 상태: 투명 배경 + 다크 로즈 텍스트
 * @param active - 해당 버튼이 현재 선택된 상태인지 여부
 */
function getButtonStyle(active: boolean): CSSProperties {
  return {
    ...buttonBaseStyle,
    backgroundColor: active ? "#FFFFFF" : "transparent",
    color: active ? "#9A001F" : "#5C3F3F",
    // 활성 상태에서 미세한 그림자로 "떠 있는" 느낌을 줌
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
  };
}

/**
 * StatusToggle
 *
 * 재학/졸업 상태를 선택하는 세그먼트 컨트롤 스타일의 버튼 그룹.
 * - 선택된 버튼은 흰 배경 + 그림자로 활성화 상태를 표시한다.
 * - 두 버튼 중 하나를 클릭하면 onStatusChange 핸들러가 호출된다.
 */
export default function StatusToggle({ status, onStatusChange }: StatusToggleProps) {
  return (
    <div>
      {/* 레이블 */}
      <p style={labelStyle}>재학/졸업 여부 (Status)</p>

      {/* 버튼 그룹 컨테이너 */}
      <div style={containerStyle}>
        {/* 재학(Current) 버튼: status가 "current"일 때 활성화 */}
        <button
          type="button"
          onClick={() => onStatusChange("current")}
          style={getButtonStyle(status === "current")}
        >
          재학 (Current)
        </button>

        {/* 졸업(Graduate) 버튼: status가 "graduate"일 때 활성화 */}
        <button
          type="button"
          onClick={() => onStatusChange("graduate")}
          style={getButtonStyle(status === "graduate")}
        >
          졸업 (Graduate)
        </button>
      </div>
    </div>
  );
}
