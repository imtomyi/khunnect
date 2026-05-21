/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/signup/page.tsx                                        ║
║  역할: 회원가입 페이지. 입력 폼 렌더링 및 회원가입 API 호출 처리              ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - signUp({email, password, name, studentId, department, isGraduated})     ║
║        → @/services/auth  회원가입 API 호출                                   ║
║    - getRandomAvatarIdx() / saveAvatarIdx() → @/lib/avatarVariants           ║
║        회원가입 성공 시 랜덤 아바타 인덱스를 로컬스토리지에 저장              ║
║    - 성공 시 router.push("/login") 으로 로그인 화면으로 이동                  ║
║                                                                              ║
║  하위 컴포넌트:                                                               ║
║    - UnderlineField      (./_components/UnderlineField)  하단 밑줄 입력 필드 ║
║    - EyeButton           (./_components/EyeButton)       비밀번호 표시 버튼  ║
║    - StatusToggle        (./_components/StatusToggle)    재학/졸업 토글       ║
║    - SignupCampusImage   (./_components/SignupCampusImage) 우측 캠퍼스 이미지 ║
║    - Logo                → @/components/Logo             로고 아이콘         ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - Next.js App Router: (auth) 그룹의 "/signup" 경로에 자동 매핑            ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 타입 및 훅 ──────────────────────────────────────────────────────────
import { CSSProperties, useState } from "react";

// ── Next.js Link: 하단 "로그인" 링크에 사용 ──────────────────────────────────
import Link from "next/link";

// ── Next.js 라우터: 회원가입 성공 후 로그인 페이지로 이동 ─────────────────────
import { useRouter } from "next/navigation";

// ── 서비스: 회원가입 API 호출 ─────────────────────────────────────────────────
import { signUp } from "@/services/auth";

// ── 유틸리티: 아바타 인덱스 랜덤 생성 및 로컬스토리지 저장 ──────────────────
import { getRandomAvatarIdx, saveAvatarIdx } from "@/lib/avatarVariants";

// ── 하위 컴포넌트들 ────────────────────────────────────────────────────────────
import UnderlineField from "./_components/UnderlineField";      // 밑줄 스타일 입력 필드
import EyeButton from "./_components/EyeButton";                // 비밀번호 표시 토글 버튼
import StatusToggle from "./_components/StatusToggle";          // 재학/졸업 토글 버튼
import SignupCampusImage from "./_components/SignupCampusImage"; // 오른쪽 캠퍼스 이미지
import Logo from "@/components/Logo";                           // 로고 아이콘

// ── 스타일 상수: 컴포넌트 외부에서 정의하여 렌더링 시 재생성 방지 ─────────────

/** 페이지 루트: 좌우 분할 레이아웃 */
const rootStyle: CSSProperties = {
  display: "flex",
  height: "100vh",
  fontFamily: "var(--font-roboto), sans-serif",
};

/** 왼쪽 패널: 회색 배경, 세로 중앙 정렬, 스크롤 가능 */
const leftPanelStyle: CSSProperties = {
  width: "50%",
  backgroundColor: "#F6F6F6",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 40px",
  overflowY: "auto",   // 폼이 화면보다 길 때 스크롤 허용
};

/** 폼 컨테이너: 최대 450px 폭, 세로 방향으로 정렬 */
const formContainerStyle: CSSProperties = {
  display: "flex",
  width: "450px",
  flexDirection: "column",
  alignItems: "center",
  gap: "32px",
};

/** 헤더 섹션 (로고 + 타이틀): 중앙 정렬 */
const headerSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  width: "100%",
};

/** 로고 자리표시자 스타일 (실제 Logo 컴포넌트로 교체됨) */
const logoStyle: CSSProperties = {
  width: "48px",
  height: "32px",
  backgroundColor: "#D1D5DB",
  borderRadius: "6px",
};

/** 타이틀 텍스트: 브랜드 빨강색 */
const titleStyle: CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#9A001F",
  lineHeight: 1.4,
  marginBottom: "8px",
};

/** 서브타이틀 텍스트 */
const subtitleStyle: CSSProperties = {
  fontSize: "13px",
  color: "#5C3F3F",
  fontWeight: 700,
};

/** 폼 요소들을 세로로 나열하는 컨테이너 */
const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
};

/** 학번 + 학과 필드를 가로로 나란히 배치하는 행 */
const idDeptRowStyle: CSSProperties = {
  display: "flex",
  gap: "16px",
};

/** 학번/학과 각 열이 동일한 너비를 가지도록 flex: 1 */
const idDeptColStyle: CSSProperties = {
  flex: 1,
};

/** 폼 하단 에러 메시지 스타일 */
const errorStyle: CSSProperties = {
  fontSize: "13px",
  color: "#9A001F",
  textAlign: "center",
};

/** 회원가입 버튼 기본 스타일 (투명 배경 + 빨강 테두리) */
const submitButtonBaseStyle: CSSProperties = {
  width: "100%",
  padding: "10px 0",
  border: "1.5px solid #9A001F",
  boxShadow: "0 6px 8px -2px rgba(154,0,31,0.25)",
  borderRadius: "8px",
  backgroundColor: "transparent",
  color: "#9A001F",
  fontSize: "15px",
  fontWeight: 600,
  transition: "background-color 150ms ease, color 150ms ease",
  marginTop: "4px",
};

/** "이미 계정이 있으신가요?" 텍스트 행 */
const loginLinkRowStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "13px",
  color: "#6B7280",
};

/** 로그인 링크 텍스트 강조 스타일 */
const loginLinkStyle: CSSProperties = {
  color: "#9A001F",
  fontWeight: 500,
};

/**
 * 로딩 상태에 따라 회원가입 버튼 스타일을 반환한다.
 * 로딩 중에는 커서를 not-allowed로, 투명도를 낮춰 비활성 상태를 나타낸다.
 * @param isLoading - API 호출 중 여부
 */
function getSubmitButtonStyle(isLoading: boolean): CSSProperties {
  return {
    ...submitButtonBaseStyle,
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.6 : 1,
  };
}

/**
 * 회원가입 버튼 호버 진입 핸들러.
 * 로딩 중이 아닐 때만 채워진 빨강 배경으로 변경한다.
 */
function handleSubmitMouseEnter(
  e: React.MouseEvent<HTMLButtonElement>,
  isLoading: boolean
) {
  if (!isLoading) {
    e.currentTarget.style.backgroundColor = "#9A001F";
    e.currentTarget.style.color = "#FFFFFF";
  }
}

/**
 * 회원가입 버튼 호버 해제 핸들러.
 * 투명 배경 + 빨강 텍스트로 원래 스타일로 복원한다.
 */
function handleSubmitMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.backgroundColor = "transparent";
  e.currentTarget.style.color = "#9A001F";
}

/**
 * SignupHeader
 *
 * 회원가입 폼 상단의 로고 + 환영 문구 섹션.
 * SignupPage 내부에서만 사용되는 작은 헬퍼 컴포넌트.
 */
function SignupHeader() {
  return (
    <div style={headerSectionStyle}>
      {/* 로고 아이콘 (size=28px) */}
      <Logo size={28} />
      <div style={{ textAlign: "center" }}>
        <h1 style={titleStyle}>Khunnect에 오신 것을 환영합니다</h1>
        <p style={subtitleStyle}>당신의 학업 여정을 스마트하게 설계하세요</p>
      </div>
    </div>
  );
}

/**
 * SignupPage
 *
 * 신규 회원 등록 화면.
 * - 이메일, 이름, 비밀번호(확인 포함), 학번, 학과, 재학/졸업 상태를 입력받는다.
 * - 비밀번호 불일치 및 학과 미입력에 대한 클라이언트 측 검사를 수행한다.
 * - 회원가입 성공 시 랜덤 아바타를 배정하고 로그인 페이지로 이동한다.
 */
export default function SignupPage() {
  // ── Next.js 페이지 이동 훅 ────────────────────────────────────────────────
  const router = useRouter();

  // ── 상태 변수 ─────────────────────────────────────────────────────────────

  /** 폼의 모든 입력값을 하나의 객체로 관리 */
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",   // 비밀번호 재입력 (서버로 전송하지 않고 클라이언트에서만 검사)
    studentId: "",
    department: "",
    /** 재학/졸업 상태 ("current" | "graduate"), signUp 시 isGraduated 로 변환됨 */
    status: "current" as "current" | "graduate",
  });

  /** 비밀번호 필드 표시 여부 */
  const [showPw, setShowPw] = useState(false);

  /** 비밀번호 확인 필드 표시 여부 */
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  /** API 호출 중 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false);

  /** 폼 전체에 적용되는 단일 에러 메시지 */
  const [error, setError] = useState<string | null>(null);

  /**
   * 모든 텍스트 입력 필드의 공통 변경 핸들러.
   * input의 name 속성을 키로 사용하여 form 상태를 업데이트한다.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  /**
   * 폼 제출 핸들러.
   * 클라이언트 유효성 검사 후 signUp API를 호출한다.
   * 성공 시 랜덤 아바타를 저장하고 /login으로 이동.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 브라우저 기본 페이지 새로고침 방지

    // 비밀번호 일치 여부 검사 (서버 전송 전 클라이언트에서 사전 차단)
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    // 학과 필드 필수 입력 검사
    if (!form.department.trim()) {
      setError("학과를 입력해주세요.");
      return;
    }

    setError(null);       // 이전 에러 초기화
    setIsLoading(true);
    try {
      const result = await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        studentId: form.studentId,
        department: form.department,
        // status "graduate"이면 isGraduated: true, "current"이면 false
        isGraduated: form.status === "graduate",
      });

      if (!result.success) {
        // 서버에서 반환한 에러 메시지 표시 (없으면 기본 메시지)
        setError(result.error ?? "회원가입 중 오류가 발생했습니다.");
        return;
      }

      // 회원가입 성공: 랜덤 아바타 인덱스를 로컬스토리지에 저장
      saveAvatarIdx(getRandomAvatarIdx());

      // 로그인 페이지로 이동
      router.push("/login");
    } finally {
      // 성공/실패 여부와 상관없이 로딩 상태 해제
      setIsLoading(false);
    }
  }

  return (
    <div style={rootStyle}>
      {/* ── 왼쪽 폼 패널 ── */}
      <div style={leftPanelStyle}>
        <div style={formContainerStyle}>
          {/* 로고 + 환영 문구 */}
          <SignupHeader />

          <form onSubmit={handleSubmit} style={formStyle}>
            {/* 이메일 입력 */}
            <UnderlineField
              label="이메일 (Email)"
              name="email"
              type="email"
              placeholder="example@university.ac.kr"
              value={form.email}
              onChange={handleChange}
            />

            {/* 이름 입력 */}
            <UnderlineField
              label="이름 (Name)"
              name="name"
              placeholder="홍길동"
              value={form.name}
              onChange={handleChange}
            />

            {/* 비밀번호 입력: 오른쪽에 EyeButton으로 표시 토글 */}
            <UnderlineField
              label="비밀번호 (Password)"
              name="password"
              type={showPw ? "text" : "password"}  // showPw 상태에 따라 타입 전환
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              rightIcon={
                <EyeButton show={showPw} onToggle={() => setShowPw((v) => !v)} />
              }
            />

            {/* 비밀번호 확인 입력: 별도의 표시 상태(showPwConfirm) 사용 */}
            <UnderlineField
              label="비밀번호 확인 (Verify Password)"
              name="passwordConfirm"
              type={showPwConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={form.passwordConfirm}
              onChange={handleChange}
              rightIcon={
                <EyeButton show={showPwConfirm} onToggle={() => setShowPwConfirm((v) => !v)} />
              }
            />

            {/* 학번 + 학과: 가로로 나란히 배치 */}
            <div style={idDeptRowStyle}>
              <div style={idDeptColStyle}>
                <UnderlineField
                  label="학번 (Student ID)"
                  name="studentId"
                  placeholder="20240001"
                  value={form.studentId}
                  onChange={handleChange}
                />
              </div>
              <div style={idDeptColStyle}>
                <UnderlineField
                  label="학과 (Department)"
                  name="department"
                  placeholder="경영학과"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 재학/졸업 상태 토글: 선택값을 form.status에 저장 */}
            <StatusToggle
              status={form.status}
              onStatusChange={(status) => setForm((p) => ({ ...p, status }))}
            />

            {/* 전체 폼 에러 메시지 (비밀번호 불일치, 학과 미입력, 서버 오류 등) */}
            {error && <p style={errorStyle}>{error}</p>}

            {/* 회원가입 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              style={getSubmitButtonStyle(isLoading)}
              onMouseEnter={(e) => handleSubmitMouseEnter(e, isLoading)}
              onMouseLeave={handleSubmitMouseLeave}
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </button>

            {/* 기존 계정 로그인 링크 */}
            <p style={loginLinkRowStyle}>
              이미 계정이 있으신가요?{" "}
              <Link href="/login" style={loginLinkStyle}>
                로그인
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* 오른쪽 캠퍼스 이미지 패널 */}
      <SignupCampusImage />
    </div>
  );
}
