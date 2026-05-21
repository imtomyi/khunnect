// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  mypage/settings/page.tsx — 프로필 설정 페이지                             ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    사용자가 이름 변경, 계정 유형 전환, 비밀번호 변경을 할 수 있는 설정 페이지. ║
// ║    현재는 UI만 구현되어 있고 실제 저장 로직은 미연결 상태이다.               ║
// ║                                                                          ║
// ║  상태 변수:                                                                ║
// ║    newName   — 새 이름 입력 필드 값 추적                                   ║
// ║    nameSaved — 이름 저장 버튼 클릭 후 3초간 "저장됨" 피드백 표시 여부        ║
// ║    currentPw — 현재 비밀번호 입력 값                                        ║
// ║    newPw     — 새 비밀번호 입력 값                                          ║
// ║    confirmPw — 새 비밀번호 확인 입력 값                                     ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/navigation : useRouter (뒤로 가기 버튼)                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// useState/useEffect: 폼 입력 상태 관리 및 유저 데이터 로드
import { useState, useEffect } from "react";
// useRouter: "뒤로 가기" 버튼에서 이전 페이지로 이동
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
// getCurrentUser: 현재 이름 표시용
import { getCurrentUser } from "@/services/user";

/**
 * ProfileSettingsPage
 *
 * 프로필 설정 페이지 컴포넌트.
 * 이름 변경 / 계정 유형 / 비밀번호 변경 세 카드로 구성된다.
 */
export default function ProfileSettingsPage() {
  // 이전 페이지로 이동하기 위한 router 인스턴스
  const router = useRouter();

  // currentName: getCurrentUser()에서 로드한 현재 이름
  const [currentName, setCurrentName] = useState("...");
  // newName: "새 이름" 입력 필드와 동기화된 값
  const [newName, setNewName] = useState("");

  // 컴포넌트 마운트 시 현재 유저 이름 로드
  useEffect(() => {
    getCurrentUser().then(user => setCurrentName(user.name)).catch(() => {});
  }, []);
  // nameSaved: true이면 저장 버튼이 "저장됨(체크 아이콘)" 상태로 변경됨
  //            setTimeout으로 3초 후 자동 false 복귀
  const [nameSaved, setNameSaved] = useState(false);
  // currentPw: 비밀번호 변경 섹션의 현재 비밀번호 입력 값
  const [currentPw, setCurrentPw] = useState("");
  // newPw: 새 비밀번호 입력 값 (유효성 검사 예정)
  const [newPw, setNewPw] = useState("");
  // confirmPw: 새 비밀번호 확인 입력 값 (newPw와 일치 여부 검사 예정)
  const [confirmPw, setConfirmPw] = useState("");

  /* ── 스타일 정의 ── */
  // 컴포넌트 내부에 정의된 이유: 컴포넌트 외부 데이터에 의존하지 않고
  // 한 파일에서 스타일을 관리하기 위해서 (소규모 페이지 관례)

  /** 페이지 전체 래퍼 */
  const pageStyle: CSSProperties = {
    fontFamily: "var(--font-roboto), sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    paddingTop: "8px",
  };

  /** 제목 행 — 뒤로가기 버튼 + 페이지 제목 */
  const titleRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  /** 뒤로가기 버튼 스타일 — 배경 없는 아이콘 버튼 */
  const backBtnStyle: CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    color: "#1F1A1A",
  };

  /** 페이지 제목 "프로필 설정" */
  const titleStyle: CSSProperties = {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1F1A1A",
  };

  /** 상단 두 카드(이름 변경 / 계정 유형)를 가로로 배치 */
  const topRowStyle: CSSProperties = {
    display: "flex",
    gap: "24px",
  };

  /** 각 설정 카드 기본 스타일 */
  const cardStyle: CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "28px 32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  /** 카드 섹션 제목 행 (아이콘 + 텍스트) */
  const cardTitleStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#1F1A1A",
    marginBottom: "24px",
  };

  /** 폼 필드 레이블 텍스트 */
  const labelStyle: CSSProperties = {
    fontSize: "13px",
    color: "#5C3F3F",
    fontWeight: 500,
    marginBottom: "8px",
  };

  /** 입력 필드 기본 스타일 */
  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #EBE0E0",
    fontSize: "14px",
    color: "#1F1A1A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  /** "현재 이름" 읽기 전용 필드 — 연한 핑크 배경으로 수정 불가 표시 */
  const currentNameInputStyle: CSSProperties = {
    ...inputStyle,
    backgroundColor: "#FCF1F1",
    border: "1px solid #EBE0E0",
    color: "#5C3F3F",
  };

  /**
   * 저장 버튼 스타일
   * nameSaved 상태에 따라 색상과 테두리가 달라짐 (동적으로 적용됨)
   */
  const saveBtnStyle: CSSProperties = {
    backgroundColor: "#9A001F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "10px 28px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "20px",
    float: "right",    // 카드 오른쪽 끝에 정렬
    display: "flex",
    alignItems: "center",
  };

  /** "현재 상태" 노란 배지 — 현재 계정 유형 강조 표시 */
  const statusBadgeStyle: CSSProperties = {
    display: "inline-block",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: "6px",
    marginBottom: "12px",
  };

  /** "인증됨" 배지 — 계정 유형 옆에 표시 */
  const verifiedBadgeStyle: CSSProperties = {
    display: "inline-block",
    backgroundColor: "#9A001F1A",  // 브랜드 레드 10% 불투명도
    color: "#9A001F",
    fontSize: "11px",
    fontWeight: 400,
    padding: "3px 8px",
    borderRadius: "6px",
    marginLeft: "8px",
  };

  /** 계정 유형 텍스트 — "재학생 (Student)" */
  const accountTypeStyle: CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1F1A1A",
    marginBottom: "12px",
  };

  /** 계정 유형 전환 안내 문구 */
  const accountDescStyle: CSSProperties = {
    fontSize: "13px",
    color: "#5C3F3F",
    marginBottom: "20px",
    lineHeight: 1.6,
  };

  /** "졸업생으로 전환" 버튼 — 노란색, 가득 찬 너비 */
  const switchBtnStyle: CSSProperties = {
    width: "100%",
    backgroundColor: "#FDDC98",
    color: "#92400E",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  /** 비밀번호 변경 섹션 — 현재/새 비밀번호를 좌우 2열로 배치 */
  const pwGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  };

  /** 비밀번호 변경 버튼 */
  const pwChangeBtnStyle: CSSProperties = {
    backgroundColor: "#9A001F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "12px 32px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "24px",
    float: "right",
  };

  /** 비밀번호 힌트 텍스트 — 요구 조건 안내 */
  const hintStyle: CSSProperties = {
    fontSize: "12px",
    color: "#5C3F3F",
    marginTop: "6px",
    marginBottom: "16px",
  };

  return (
    <div style={pageStyle}>
      {/* 전역 input placeholder / focus 스타일 오버라이드 */}
      {/* 인라인 스타일로는 :placeholder/:focus 등 가상 선택자 적용 불가 → <style> 태그 사용 */}
      <style>{`
        input::placeholder { color: #916F6E; }
        input:focus { border-color: #9A001F !important; }
      `}</style>

      {/* ── 타이틀 행: 뒤로가기 + "프로필 설정" ── */}
      <div style={titleRowStyle}>
        {/* 뒤로가기 버튼 — router.back()으로 이전 페이지(마이페이지) 이동 */}
        <button style={backBtnStyle} onClick={() => router.back()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1F1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 style={titleStyle}>프로필 설정</h1>
      </div>

      {/* ── 상단 두 카드: 이름 변경 / 계정 유형 ── */}
      <div style={topRowStyle}>
        {/* ── 이름 변경 카드 ── */}
        <div style={{ ...cardStyle, flex: 1 }}>
          <div style={cardTitleStyle}>
            {/* 신분증 아이콘 SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2.33333 23.3333C1.69167 23.3333 1.14236 23.1049 0.685417 22.6479C0.228472 22.191 0 21.6417 0 21V8.16667C0 7.525 0.228472 6.97569 0.685417 6.51875C1.14236 6.06181 1.69167 5.83333 2.33333 5.83333H8.16667V2.33333C8.16667 1.69167 8.39514 1.14236 8.85208 0.685417C9.30903 0.228472 9.85833 0 10.5 0H12.8333C13.475 0 14.0243 0.228472 14.4812 0.685417C14.9382 1.14236 15.1667 1.69167 15.1667 2.33333V5.83333H21C21.6417 5.83333 22.191 6.06181 22.6479 6.51875C23.1049 6.97569 23.3333 7.525 23.3333 8.16667V21C23.3333 21.6417 23.1049 22.191 22.6479 22.6479C22.191 23.1049 21.6417 23.3333 21 23.3333H2.33333ZM2.33333 21H21V8.16667H15.1667C15.1667 8.80833 14.9382 9.35764 14.4812 9.81458C14.0243 10.2715 13.475 10.5 12.8333 10.5H10.5C9.85833 10.5 9.30903 10.2715 8.85208 9.81458C8.39514 9.35764 8.16667 8.80833 8.16667 8.16667H2.33333V21ZM4.66667 18.6667H11.6667V18.1417C11.6667 17.8111 11.5743 17.5049 11.3896 17.2229C11.2049 16.941 10.9472 16.7222 10.6167 16.5667C10.2278 16.3917 9.83403 16.2604 9.43542 16.1729C9.03681 16.0854 8.61389 16.0417 8.16667 16.0417C7.71944 16.0417 7.29653 16.0854 6.89792 16.1729C6.49931 16.2604 6.10556 16.3917 5.71667 16.5667C5.38611 16.7222 5.12847 16.941 4.94375 17.2229C4.75903 17.5049 4.66667 17.8111 4.66667 18.1417V18.6667ZM14 16.9167H18.6667V15.1667H14V16.9167ZM8.16667 15.1667C8.65278 15.1667 9.06597 14.9965 9.40625 14.6562C9.74653 14.316 9.91667 13.9028 9.91667 13.4167C9.91667 12.9306 9.74653 12.5174 9.40625 12.1771C9.06597 11.8368 8.65278 11.6667 8.16667 11.6667C7.68056 11.6667 7.26736 11.8368 6.92708 12.1771C6.58681 12.5174 6.41667 12.9306 6.41667 13.4167C6.41667 13.9028 6.58681 14.316 6.92708 14.6562C7.26736 14.9965 7.68056 15.1667 8.16667 15.1667ZM14 13.4167H18.6667V11.6667H14V13.4167ZM10.5 8.16667H12.8333V2.33333H10.5V8.16667Z" fill="#9A001F"/>
            </svg>
            이름 변경
          </div>

          {/* 현재 이름 필드 — getCurrentUser()에서 로드한 값 표시 */}
          <div style={{ marginBottom: "16px" }}>
            <p style={labelStyle}>현재 이름</p>
            <input style={currentNameInputStyle} value={currentName} readOnly />
          </div>

          {/* 새 이름 입력 필드 */}
          <div>
            <p style={labelStyle}>새 이름</p>
            <input
              style={inputStyle}
              placeholder="새로운 이름을 입력하세요"
              value={newName}
              // onChange로 newName 상태를 실시간 동기화
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          {/* 저장 버튼 영역 — overflow: hidden으로 float 자식 포함 */}
          <div style={{ overflow: "hidden" }}>
            <button
              // nameSaved 상태에 따라 버튼 색상을 동적으로 결정
              style={{ ...saveBtnStyle, backgroundColor: nameSaved ? "#FFFFFF" : "#9A001F", color: nameSaved ? "#9A001F" : "#FFFFFF", border: nameSaved ? "1px solid #9A001F" : "none" }}
              onClick={() => {
                if (!newName.trim()) return;
                // localStorage에 저장 — getCurrentUser()가 다음 호출 시 이 값을 우선 사용
                localStorage.setItem("user_name_override", newName.trim());
                setCurrentName(newName.trim());
                setNewName("");
                setNameSaved(true);
                setTimeout(() => setNameSaved(false), 3000);
              }}
            >
              {/* nameSaved이면 체크 아이콘 + "저장됨", 아니면 "저장" */}
              {nameSaved ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12C2.25 6.61704 6.61704 2.25 12 2.25C17.383 2.25 21.75 6.61704 21.75 12C21.75 17.383 17.383 21.75 12 21.75C6.61704 21.75 2.25 17.383 2.25 12ZM12 3.75C7.44546 3.75 3.75 7.44546 3.75 12C3.75 16.5545 7.44546 20.25 12 20.25C16.5545 20.25 20.25 16.5545 20.25 12C20.25 7.44546 16.5545 3.75 12 3.75Z" fill="#9A001F"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.9824 7.67574C17.2996 7.94216 17.3407 8.41525 17.0743 8.73241L10.7743 16.2324C10.6347 16.3986 10.4299 16.4962 10.2128 16.4999C9.99576 16.5036 9.78776 16.4131 9.64254 16.2517L6.94254 13.2517C6.66544 12.9439 6.6904 12.4696 6.99828 12.1925C7.30617 11.9155 7.78038 11.9404 8.05748 12.2483L10.1805 14.6072L15.9257 7.76762C16.1921 7.45046 16.6652 7.40932 16.9824 7.67574Z" fill="#9A001F"/>
                  </svg>
                  저장됨
                </>
              ) : "저장"}
            </button>
          </div>
        </div>

        {/* ── 계정 유형 카드 ── */}
        <div style={{ ...cardStyle, flex: 1 }}>
          <div style={cardTitleStyle}>
            {/* 졸업모자 아이콘 SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="21" viewBox="0 0 26 21" fill="none">
              <path d="M12.8333 21L4.66667 16.5667V9.56667L0 7L12.8333 0L25.6667 7V16.3333H23.3333V8.28333L21 9.56667V16.5667L12.8333 21ZM12.8333 11.3167L20.825 7L12.8333 2.68333L4.84167 7L12.8333 11.3167ZM12.8333 18.3458L18.6667 15.1958V10.7917L12.8333 14L7 10.7917V15.1958L12.8333 18.3458Z" fill="#735B24"/>
            </svg>
            계정 유형
          </div>

          {/* 현재 상태 배지 */}
          <span style={statusBadgeStyle}>현재 상태</span>

          {/* 계정 유형 + 인증됨 배지 */}
          <div style={accountTypeStyle}>
            재학생 (Student)
            <span style={verifiedBadgeStyle}>인증됨</span>
          </div>

          {/* 구분선 */}
          <hr style={{ border: "none", borderTop: "1px solid #E6BDBB", marginBottom: "16px" }} />

          {/* 졸업생 전환 안내 문구 */}
          <p style={accountDescStyle}>
            졸업하셨나요? 졸업생 계정으로 전환하여 이제는 소중한 후배들을 챙겨줄 차례입니다!
          </p>

          {/* 졸업생 전환 버튼 — 현재는 UI만 구현 (실제 전환 로직 미연결) */}
          <button style={switchBtnStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M2.91667 9.33333L0 6.41667L2.91667 3.5L3.73333 4.33125L2.23125 5.83333H6.41667V7H2.23125L3.73333 8.50208L2.91667 9.33333ZM8.75 5.83333L7.93333 5.00208L9.43542 3.5H5.25V2.33333H9.43542L7.93333 0.83125L8.75 0L11.6667 2.91667L8.75 5.83333Z" fill="#735B24"/>
            </svg>
            졸업생으로 전환
          </button>
        </div>
      </div>

      {/* ── 비밀번호 변경 카드 ── */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          {/* 자물쇠 아이콘 SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
            <path d="M2.33333 24.5C1.69167 24.5 1.14236 24.2715 0.685417 23.8146C0.228472 23.3576 0 22.8083 0 22.1667V10.5C0 9.85833 0.228472 9.30903 0.685417 8.85208C1.14236 8.39514 1.69167 8.16667 2.33333 8.16667H3.5V5.83333C3.5 4.21944 4.06875 2.84375 5.20625 1.70625C6.34375 0.56875 7.71944 0 9.33333 0C10.9472 0 12.3229 0.56875 13.4604 1.70625C14.5979 2.84375 15.1667 4.21944 15.1667 5.83333V8.16667H16.3333C16.975 8.16667 17.5243 8.39514 17.9813 8.85208C18.4382 9.30903 18.6667 9.85833 18.6667 10.5V22.1667C18.6667 22.8083 18.4382 23.3576 17.9813 23.8146C17.5243 24.2715 16.975 24.5 16.3333 24.5H2.33333ZM2.33333 22.1667H16.3333V10.5H2.33333V22.1667ZM9.33333 18.6667C9.975 18.6667 10.5243 18.4382 10.9812 17.9813C11.4382 17.5243 11.6667 16.975 11.6667 16.3333C11.6667 15.6917 11.4382 15.1424 10.9812 14.6854C10.5243 14.2285 9.975 14 9.33333 14C8.69167 14 8.14236 14.2285 7.68542 14.6854C7.22847 15.1424 7 15.6917 7 16.3333C7 16.975 7.22847 17.5243 7.68542 17.9813C8.14236 18.4382 8.69167 18.6667 9.33333 18.6667ZM5.83333 8.16667H12.8333V5.83333C12.8333 4.86111 12.4931 4.03472 11.8125 3.35417C11.1319 2.67361 10.3056 2.33333 9.33333 2.33333C8.36111 2.33333 7.53472 2.67361 6.85417 3.35417C6.17361 4.03472 5.83333 4.86111 5.83333 5.83333V8.16667ZM2.33333 22.1667V10.5V22.1667Z" fill="#094F7A"/>
          </svg>
          <span style={{ marginLeft: "4px", fontWeight: 400 }}>비밀번호 변경</span>
        </div>

        {/* 2열 그리드: 현재 비밀번호(좌) / 새 비밀번호(우) */}
        <div style={pwGridStyle}>
          {/* 왼쪽: 현재 비밀번호 */}
          <div>
            <p style={labelStyle}>현재 비밀번호</p>
            <input
              style={inputStyle}
              type="password"           // 입력값을 마스킹 처리
              placeholder="현재 비밀번호 입력"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>

          {/* 오른쪽: 새 비밀번호 + 확인 */}
          <div>
            <p style={labelStyle}>새 비밀번호</p>
            <input
              style={inputStyle}
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            {/* 비밀번호 조건 힌트 — UX 개선을 위한 안내 문구 */}
            <p style={hintStyle}>영문, 숫자, 특수문자 조합 8자리 이상</p>

            <p style={labelStyle}>새 비밀번호 확인</p>
            <input
              style={inputStyle}
              type="password"
              placeholder="새 비밀번호 다시 입력"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
        </div>

        {/* overflow: hidden으로 float 자식 포함 */}
        <div style={{ overflow: "hidden" }}>
          {/* 비밀번호 변경 버튼 — 현재는 UI만 구현 (실제 변경 로직 미연결) */}
          <button style={pwChangeBtnStyle}>비밀번호 변경</button>
        </div>
      </div>
    </div>
  );
}
