/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/login/_components/LoginForm.tsx                        ║
║  역할: 로그인 페이지의 폼 UI 컴포넌트 (순수 프레젠테이션)                     ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - 모든 상태와 핸들러는 부모(login/page.tsx)에서 props로 전달받는다         ║
║    - 자체 상태 없음 (완전히 제어되는 컴포넌트)                                ║
║                                                                              ║
║  사용하는 컴포넌트:                                                           ║
║    - Logo       → @/components/Logo  로고 아이콘                             ║
║    - Link       → next/link          회원가입/비밀번호 찾기/고객센터 링크     ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - src/app/(auth)/login/page.tsx                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 훅 (현재 미사용, 향후 확장 대비) ────────────────────────────────────
import { useState } from "react";

// ── Next.js Link: 회원가입, 비밀번호 찾기, 고객센터 페이지 이동에 사용 ──────────
import Link from "next/link";

// ── 로고 컴포넌트: 폼 상단 중앙에 표시 ───────────────────────────────────────
import Logo from "@/components/Logo";

/** LoginForm 컴포넌트가 부모로부터 받는 props 타입 정의 */
type LoginFormProps = {
  /** 현재 입력된 이메일과 비밀번호 값 */
  form: { email: string; password: string };

  /** 각 필드의 유효성 검사 또는 서버 오류 메시지 */
  errors: { email?: string; password?: string };

  /** 비밀번호 표시 여부 (true면 텍스트로 보임) */
  showPw: boolean;

  /** API 호출 중 로딩 상태 (버튼 비활성화 및 텍스트 변경에 사용) */
  isLoading: boolean;

  /** 이메일/비밀번호 input의 onChange 핸들러 */
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** 비밀번호 표시/숨김 토글 핸들러 */
  onToggleShowPw: () => void;

  /** 폼 submit 핸들러 */
  onSubmit: (e: React.FormEvent) => void;
};

/**
 * LoginForm
 *
 * 로그인 폼의 UI를 렌더링하는 순수 프레젠테이션 컴포넌트.
 * - 로고
 * - 구글 소셜 로그인 버튼
 * - 이메일 / 비밀번호 입력 필드
 * - 로그인 버튼
 * - 하단 링크 (회원가입, 비밀번호 찾기, 고객센터)
 */
export default function LoginForm({
  form,
  errors,
  showPw,
  isLoading,
  onFormChange,
  onToggleShowPw,
  onSubmit,
}: LoginFormProps) {
  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "0px" }}>

      {/* 로고: 폼 최상단 중앙 */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
        <Logo size={28} />
      </div>

      {/* 타이틀 */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#1F1A1A",
          textAlign: "center",
          marginBottom: "28px",
        }}
      >
        Welcome back
      </h1>

      {/* 구글 로그인 버튼: 호버 시 브랜드 컬러(#9A001F)로 변경 */}
      <button
        type="button"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "12px 0",
          border: "1.5px solid #E6BDBB",
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          fontSize: "14px",
          fontWeight: 500,
          color: "#1F1A1A",
          cursor: "pointer",
          marginBottom: "20px",
          transition: "background-color 150ms ease, color 150ms ease",
        }}
        onMouseEnter={(e) => {
          // 호버 진입: 브랜드 빨강 배경 + 흰 글씨
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#9A001F";
          (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          // 호버 해제: 흰 배경 + 기본 글씨 복원
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF";
          (e.currentTarget as HTMLButtonElement).style.color = "#1F1A1A";
        }}
      >
        {/* 구글 아이콘 (공식 4색 SVG) */}
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        구글로 계속하기
      </button>

      {/* "또는" 구분선: 소셜 로그인과 이메일 로그인 구역을 시각적으로 분리 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ flex: 1, height: "1px", backgroundColor: "#EBE0E0" }} />
        <span style={{ fontSize: "12px", color: "#916F6E" }}>또는</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#EBE0E0" }} />
      </div>

      {/* 이메일 / 비밀번호 폼 */}
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* 이메일 입력 필드 */}
        <div>
          <p style={{ fontSize: "12px", color: "#5C3F3F", marginBottom: "6px" }}>이메일 주소</p>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="example@university.ac.kr"
            value={form.email}
            onChange={onFormChange}
            style={{
              width: "100%",
              background: "transparent",
              // 에러가 있을 때: 전체 테두리를 빨강으로 표시 (밑줄만 있던 것이 박스 형태로 변경)
              border: errors.email?.trim() ? "1.5px solid #9A001F" : "none",
              borderBottom: errors.email?.trim() ? "1.5px solid #9A001F" : "1.5px solid #E6BDBB99",
              borderRadius: "0",
              // 에러 시 패딩을 늘려 박스 테두리 안에 텍스트가 잘 보이도록 함
              padding: errors.email ? "6px 10px" : "6px 0",
              fontSize: "14px",
              color: "#1F1A1A",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 200ms ease",
            }}
            onFocus={(e) => {
              // 포커스 시 밑줄을 브랜드 빨강으로 강조 (에러 없을 때만)
              if (!errors.email) e.currentTarget.style.borderBottomColor = "#9A001F";
            }}
            onBlur={(e) => {
              // 포커스 해제 + 값이 비어있으면 밑줄을 기본 연한 핑크로 복원
              if (!errors.email && !e.currentTarget.value) {
                e.currentTarget.style.borderBottomColor = "#E6BDBB99";
              }
            }}
          />
          {/* 이메일 필드 에러 메시지 (빈 공백 " "은 표시하지 않음) */}
          {errors.email && (
            <p style={{ fontSize: "12px", color: "#9A001F", marginTop: "6px" }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* 비밀번호 입력 필드 */}
        <div>
          <p style={{ fontSize: "12px", color: "#5C3F3F", marginBottom: "6px" }}>비밀번호 (Password)</p>
          <div style={{ position: "relative" }}>
            {/* showPw에 따라 type을 "text" 또는 "password"로 전환 */}
            <input
              className="auth-input"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={onFormChange}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                // 에러 시 빨강 밑줄, 정상 시 연한 핑크 밑줄
                borderBottom: errors.password ? "1.5px solid #9A001F" : "1.5px solid #E6BDBB99",
                // 오른쪽에 눈 아이콘 버튼 공간 확보
                padding: "6px 32px 6px 0",
                fontSize: "14px",
                color: "#1F1A1A",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-bottom-color 200ms ease",
              }}
              onFocus={(e) => {
                if (!errors.password) e.currentTarget.style.borderBottomColor = "#9A001F";
              }}
              onBlur={(e) => {
                if (!errors.password && !e.currentTarget.value) {
                  e.currentTarget.style.borderBottomColor = "#E6BDBB99";
                }
              }}
            />
            {/* 비밀번호 표시/숨김 토글 버튼 (눈 모양 아이콘) */}
            <button
              type="button"
              onClick={onToggleShowPw}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "#9CA3AF",
              }}
            >
              {showPw ? (
                // 비밀번호가 보이는 상태: 눈에 사선이 그어진 아이콘
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                // 비밀번호가 숨겨진 상태: 눈 모양 아이콘
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {/* 비밀번호 에러 메시지 */}
          {errors.password && (
            <p style={{ fontSize: "12px", color: "#9A001F", marginTop: "6px" }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* 로그인 제출 버튼: 로딩 중에는 비활성화 */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "14px 0",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#9A001F",          // 브랜드 빨강 배경
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",  // 로딩 중 커서 변경
            opacity: isLoading ? 0.7 : 1,                   // 로딩 중 반투명
            transition: "opacity 150ms ease",
            marginTop: "4px",
            boxShadow: "0 6px 8px -2px rgba(154,0,31,0.25)",  // 빨강 그림자
          }}
        >
          {/* 로딩 중이면 "로그인 중..."으로 텍스트 변경 */}
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* 하단 링크 3개: 회원가입, 비밀번호 찾기, 고객센터 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "24px",
        }}
      >
        {/* 왼쪽: 회원가입 + 비밀번호 찾기 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/signup" style={{ fontSize: "13px", color: "#5C3F3F", textDecoration: "none" }}>
            회원가입
          </Link>
          <Link href="/forgot-password" style={{ fontSize: "13px", color: "#5C3F3F", textDecoration: "none" }}>
            비밀번호 찾기
          </Link>
        </div>
        {/* 오른쪽: 고객센터 */}
        <Link href="/support" style={{ fontSize: "13px", color: "#5C3F3F", textDecoration: "none" }}>
          고객 센터
        </Link>
      </div>

    </div>
  );
}
