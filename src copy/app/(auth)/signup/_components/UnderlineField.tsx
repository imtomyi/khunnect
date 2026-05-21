/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/signup/_components/UnderlineField.tsx                  ║
║  역할: 회원가입 폼에서 사용되는 하단 밑줄 스타일의 입력 필드 컴포넌트         ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - props 기반의 순수 프레젠테이션 컴포넌트 (자체 상태 없음)                 ║
║    - value / onChange는 부모(signup/page.tsx)에서 제어                        ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - src/app/(auth)/signup/page.tsx                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 타입 임포트 ─────────────────────────────────────────────────────────
import React, { CSSProperties } from "react";

/** UnderlineField 컴포넌트가 부모로부터 받는 props 타입 */
type UnderlineFieldProps = {
  /** 입력 필드 위에 표시할 레이블 텍스트 */
  label: string;

  /** input 요소의 name 속성 (form 데이터 식별자) */
  name: string;

  /** input 타입 (text, email, password 등), 기본값: "text" */
  type?: string;

  /** placeholder 텍스트 */
  placeholder?: string;

  /** 현재 입력값 (부모에서 제어) */
  value: string;

  /** 입력값 변경 핸들러 (부모에서 상태 업데이트) */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** 입력 필드 오른쪽에 렌더링할 아이콘 (예: EyeButton) */
  rightIcon?: React.ReactNode;
};

// ── 스타일 상수: 컴포넌트 바깥에서 정의하여 렌더링 시 불필요한 재생성 방지 ────

/** 레이블 텍스트 스타일 */
const labelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#5C3F3F",      // 브랜드 다크 로즈 색상
  marginBottom: "6px",
};

/** 입력 필드와 오른쪽 아이콘을 감싸는 상대 위치 컨테이너 */
const inputWrapperStyle: CSSProperties = {
  position: "relative",  // 오른쪽 아이콘(rightIcon)을 absolute로 배치하기 위한 기준
};

/** input 기본 스타일: 테두리 없음, 하단 밑줄만 있는 디자인 */
const inputStyle: CSSProperties = {
  width: "100%",
  background: "transparent",        // 부모 배경을 그대로 보여줌
  border: "none",                    // 상/좌/우 테두리 제거
  borderBottom: "1.5px solid #E6BDBB99",  // 하단 밑줄만 표시 (연한 핑크, 반투명)
  padding: "6px 32px 6px 0",        // 오른쪽에 아이콘 공간(32px) 확보
  fontSize: "14px",
  color: "#1F1A1A",
  outline: "none",                   // 브라우저 기본 포커스 링 제거
  boxSizing: "border-box",
  transition: "border-bottom-color 200ms ease",  // 밑줄 색상 변경 시 부드러운 전환
};

/** 오른쪽 아이콘을 입력 필드 세로 중앙에 고정하는 wrapper */
const rightIconWrapperStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: "50%",
  transform: "translateY(-50%)",    // 세로 방향 정확히 중앙 정렬
};

/**
 * input 포커스 이벤트 핸들러.
 * 사용자가 필드를 클릭하면 밑줄 색상을 브랜드 빨강(#9A001F)으로 변경하여
 * 현재 활성화된 필드임을 시각적으로 표시한다.
 */
function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderBottomColor = "#9A001F";
}

/**
 * input 포커스 해제 이벤트 핸들러.
 * 필드에서 포커스가 벗어나고 값이 비어있으면 밑줄을 기본 연한 핑크로 복원한다.
 * 값이 입력된 상태에서 벗어나면 브랜드 색상을 유지해도 되나, 여기서는 빈 필드만 복원.
 */
function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  if (!e.currentTarget.value) {
    // 값이 없으면 기본 밑줄 색으로 복원
    e.currentTarget.style.borderBottomColor = "#E6BDBB99";
  }
}

/**
 * UnderlineField
 *
 * 하단 밑줄만 있는 미니멀한 스타일의 입력 필드.
 * - 포커스 시 밑줄이 브랜드 빨강으로 변경된다.
 * - `rightIcon` prop을 통해 비밀번호 토글 버튼 등을 오른쪽에 삽입할 수 있다.
 */
export default function UnderlineField({
  label,
  name,
  type = "text",       // 기본 타입은 텍스트
  placeholder,
  value,
  onChange,
  rightIcon,
}: UnderlineFieldProps) {
  return (
    <div>
      {/* 레이블 텍스트 */}
      <p style={labelStyle}>{label}</p>

      {/* input + 오른쪽 아이콘 컨테이너 */}
      <div style={inputWrapperStyle}>
        <input
          className="auth-input"    // globals.css에 정의된 전역 스타일 클래스 (autofill 스타일 등)
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        {/* rightIcon이 전달된 경우에만 렌더링 (예: EyeButton) */}
        {rightIcon && (
          <div style={rightIconWrapperStyle}>{rightIcon}</div>
        )}
      </div>
    </div>
  );
}
