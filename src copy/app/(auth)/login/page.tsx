/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/login/page.tsx                                         ║
║  역할: 로그인 페이지. 이메일/비밀번호 입력 및 서버 인증 처리                  ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - signIn(email, password) → @/services/auth  로그인 API 호출              ║
║    - 성공 시 router.push("/") 로 홈 화면으로 이동                             ║
║    - 실패 시 에러 메시지 상태에 저장하여 폼에 표시                            ║
║                                                                              ║
║  하위 컴포넌트:                                                               ║
║    - LoginForm        (./_components/LoginForm)   이메일/비밀번호 폼 UI       ║
║    - CampusImage      (./_components/CampusImage) 오른쪽 캠퍼스 이미지 패널  ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - Next.js App Router: (auth) 그룹의 "/login" 경로에 자동 매핑             ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 훅 ──────────────────────────────────────────────────────────────────
import { useState } from "react";

// ── Next.js 라우터: 로그인 성공 후 페이지 이동에 사용 ─────────────────────────
import { useRouter } from "next/navigation";

// ── 서비스: 로그인 API 호출 ───────────────────────────────────────────────────
import { signIn } from "@/services/auth";

// ── 하위 컴포넌트: 이메일/비밀번호 입력 폼 ───────────────────────────────────
import LoginForm from "./_components/LoginForm";

// ── 하위 컴포넌트: 오른쪽 절반 캠퍼스 이미지 패널 ────────────────────────────
import CampusImage from "./_components/CampusImage";

/**
 * LoginPage
 *
 * 화면을 좌/우로 반반 나눈 레이아웃:
 *  - 왼쪽(50%): 로그인 폼 (LoginForm 컴포넌트)
 *  - 오른쪽(50%): 캠퍼스 배경 이미지 (CampusImage 컴포넌트)
 *
 * 상태 관리 및 제출 로직을 이 페이지에서 담당하고,
 * 실제 UI는 LoginForm에 props로 내려준다.
 */
export default function LoginPage() {
  // ── Next.js 페이지 이동 훅 ────────────────────────────────────────────────
  const router = useRouter();

  // ── 상태 변수 ─────────────────────────────────────────────────────────────

  /** 폼 입력값: 이메일과 비밀번호 */
  const [form, setForm] = useState({ email: "", password: "" });

  /** 비밀번호 표시 여부 (true: 텍스트, false: 마스킹) */
  const [showPw, setShowPw] = useState(false);

  /** API 호출 중 로딩 상태 (중복 제출 방지 및 버튼 비활성화에 사용) */
  const [isLoading, setIsLoading] = useState(false);

  /** 각 필드별 유효성 검사 및 서버 오류 메시지 */
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  /**
   * 입력 필드 변경 핸들러.
   * 입력값을 form 상태에 반영하고, 해당 필드의 에러 메시지를 초기화한다.
   * @param e - input change 이벤트
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 초기화 (사용자가 수정 중임을 인지했으므로)
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  /**
   * 이메일 형식 유효성 검사.
   * 정규식으로 "@"와 도메인이 포함된 최소 형식을 확인한다.
   * @param email - 검사할 이메일 문자열
   * @returns 유효하면 true, 그렇지 않으면 false
   */
  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * 폼 제출 핸들러.
   * 클라이언트 측 유효성 검사 후 signIn API를 호출한다.
   * 성공 시 홈("/")으로 이동, 실패 시 에러 메시지 표시.
   * @param e - form submit 이벤트
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 브라우저 기본 페이지 새로고침 방지

    const newErrors: { email?: string; password?: string } = {};

    // 이메일 형식 검사
    if (!validateEmail(form.email)) {
      newErrors.email = "유효한 이메일 주소를 입력하세요";
    }
    // 비밀번호 최소 길이 검사 (6자 미만이면 오류)
    if (form.password.length < 6) {
      newErrors.password = "비밀번호를 잘못 입력하셨습니다";
    }
    // 클라이언트 오류가 있으면 API 호출 없이 조기 반환
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Supabase auth 연동
      // const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      // if (error) {
      //   setErrors({ password: "비밀번호를 잘못 입력하셨습니다" });
      //   return;
      // }

      // 서비스 계층을 통해 로그인 API 호출
      const result = await signIn(form.email, form.password);

      if (result.success) {
        // 로그인 성공 → 홈 화면으로 이동
        router.push("/");
      } else {
        // 로그인 실패 → 서버 오류 메시지 표시
        // email에 공백(" ")을 넣어 이메일 필드도 에러 스타일로 표시
        setErrors({
          email: " ",
          password: result.error || "이메일 또는 비밀번호를 확인하세요"
        });
      }
      // console.log("login", form);
    } catch (e) {
      // 네트워크 오류 등 예외 발생 시 서버 오류 메시지 표시
      setErrors({ password: "로그인 중 서버 오류가 발생했습니다." });
    } finally {
      // 성공/실패 여부와 상관없이 로딩 상태 해제
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "var(--font-roboto), sans-serif" }}>

      {/* ── 왼쪽 폼 영역 ── */}
      <div
        style={{
          width: "50%",
          backgroundColor: "#F6F6F6",  // 연한 회색 배경
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
        }}
      >
        {/*
          LoginForm에 상태와 핸들러를 props로 전달.
          UI 렌더링 책임은 LoginForm이, 로직 책임은 이 페이지가 담당.
        */}
        <LoginForm
          form={form}
          errors={errors}
          showPw={showPw}
          isLoading={isLoading}
          onFormChange={handleChange}
          onToggleShowPw={() => setShowPw((v) => !v)}
          onSubmit={handleSubmit}
        />
      </div>

      {/* 오른쪽 캠퍼스 이미지 패널 */}
      <CampusImage />

    </div>
  );
}
