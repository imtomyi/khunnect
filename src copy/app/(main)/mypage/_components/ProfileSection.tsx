// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ProfileSection.tsx — 마이페이지 프로필 카드 컴포넌트                       ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    마이페이지 상단 좌측에 위치하는 프로필 카드.                              ║
// ║    아바타, 이름, 소속 학과/학년, 관심 분야 태그, 프로필 수정 링크를 표시.    ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    mypage/page.tsx                                                        ║
// ║      → ProfileSection(user, interestedFieldNames, deptName)               ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/link          : 프로필 수정 페이지(/mypage/settings)로 이동       ║
// ║    - @/types            : User 타입                                        ║
// ║    - @/lib/avatarVariants : 고정 아바타 변형 상수 (AVATAR_VARIANTS[3])      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// Next.js Link: 클라이언트 사이드 네비게이션으로 /mypage/settings 이동
import Link from "next/link";
import type { CSSProperties } from "react";
// User 타입: 사용자 데이터 구조 명세
import type { User } from "@/types";
// AvatarIcon: SVG 기반 아바타 컴포넌트
// AVATAR_VARIANTS: 미리 정의된 아바타 변형 배열 (색상 + SVG 경로)
import { AvatarIcon, AVATAR_VARIANTS } from "@/lib/avatarVariants";

/** 컴포넌트 Props 타입 */
type ProfileSectionProps = {
  /** 현재 로그인한 사용자 데이터 */
  user: User;
  /** 관심 분야 이름 배열 — mypage/page.tsx에서 ID→이름 변환 완료된 값 */
  interestedFieldNames: string[];
  /** 학과 이름 — mypage/page.tsx에서 departmentId→name 변환 완료된 값 */
  deptName: string;
};

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/** 카드 전체 컨테이너 — 너비 400px 고정, 세로 flex */
const cardStyle: CSSProperties = {
  width: "400px",
  flexShrink: 0,
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

/**
 * 아바타 래퍼 스타일
 * AVATAR_VARIANTS[3].bg: 4번째 아바타 변형의 배경색 (고정값 — 사용자 아바타 커스터마이징 미구현)
 */
const avatarWrapStyle: CSSProperties = {
  width: "72px",
  height: "72px",
  borderRadius: "20px",
  backgroundColor: AVATAR_VARIANTS[3].bg,  // 4번째 아바타 변형 배경색 사용
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** 사용자 이름 텍스트 스타일 */
const nameStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 400,
  color: "#1F1A1A",
  marginBottom: "4px",
};

/** 소속 학교/학과/학년 부제 스타일 — 연한 회색 */
const subTextStyle: CSSProperties = {
  fontSize: "13px",
  color: "#9CA3AF",
};

/** "프로필 수정" 버튼 스타일 — 브랜드 레드, 50% 너비 */
const editButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "50%",
  padding: "8px",
  backgroundColor: "#9A001F",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

/** "관심 분야" 레이블 */
const fieldLabelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#5C3F3F",
  fontWeight: 500,
  marginBottom: "8px",
};

/** 관심 분야 태그들을 wrap 허용하여 가로 배치 */
const tagsWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

/** 개별 관심 분야 태그 스타일 — pill 형태, 연한 핑크 배경 */
const tagStyle: CSSProperties = {
  padding: "6px 14px",
  backgroundColor: "#FCF1F1",
  color: "#9A001F",
  borderRadius: "9999px",
  fontSize: "12px",
  fontWeight: 500,
  border: "1px solid rgba(230, 189, 187, 0.30)",
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * ProfileSection
 *
 * 마이페이지 좌측 프로필 카드.
 * 아바타(고정 변형) + 이름 + 학과 + 프로필 수정 링크 + 관심 분야 태그를 표시.
 *
 * @param user                 - 현재 사용자 데이터
 * @param interestedFieldNames - 관심 분야 이름 배열 (부모에서 변환 완료)
 * @param deptName             - 학과 이름 (부모에서 변환 완료)
 */
export default function ProfileSection({ user, interestedFieldNames, deptName }: ProfileSectionProps) {
  return (
    <div style={cardStyle}>
      {/* ── 아바타 + 이름/학과 행 ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", paddingTop: "4px" }}>
        {/* 아바타 — 현재 AVATAR_VARIANTS[3] 고정 (추후 사용자별 선택 기능 추가 예정) */}
        <div style={avatarWrapStyle}>
          <AvatarIcon fill={AVATAR_VARIANTS[3].fill} bodyPath={AVATAR_VARIANTS[3].bodyPath} size={60} />
        </div>
        <div>
          {/* 사용자 실명 */}
          <p style={nameStyle}>{user.name}</p>
          {/* 소속 학교 + 학과 + 학년 (학년은 하드코딩 "3학년", 추후 user.grade로 교체 예정) */}
          <p style={subTextStyle}>경희대학교 {deptName} 3학년</p>
        </div>
      </div>

      {/* ── 프로필 수정 버튼 ── */}
      {/* Link로 감싸 <a> 태그 역할 — textDecoration: none으로 밑줄 제거 */}
      <Link href="/mypage/settings" style={{ ...editButtonStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        {/* 연필(편집) 아이콘 SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16" fill="none">
          <path d="M1.5 15.0188C1.0875 15.0188 0.734375 14.8719 0.440625 14.5781C0.146875 14.2844 0 13.9313 0 13.5188V3.01875C0 2.60625 0.146875 2.25312 0.440625 1.95938C0.734375 1.66563 1.0875 1.51875 1.5 1.51875H8.19375L6.69375 3.01875H1.5V13.5188H12V8.30625L13.5 6.80625V13.5188C13.5 13.9313 13.3531 14.2844 13.0594 14.5781C12.7656 14.8719 12.4125 15.0188 12 15.0188H1.5ZM4.5 10.5188V7.33125L11.3813 0.45C11.5312 0.3 11.7 0.1875 11.8875 0.1125C12.075 0.0375 12.2625 0 12.45 0C12.65 0 12.8406 0.0375 13.0219 0.1125C13.2031 0.1875 13.3688 0.3 13.5188 0.45L14.5688 1.51875C14.7063 1.66875 14.8125 1.83438 14.8875 2.01562C14.9625 2.19688 15 2.38125 15 2.56875C15 2.75625 14.9656 2.94062 14.8969 3.12188C14.8281 3.30313 14.7188 3.46875 14.5688 3.61875L7.6875 10.5188H4.5ZM13.5188 2.56875L12.4688 1.51875L13.5188 2.56875ZM6 9.01875H7.05L11.4 4.66875L10.875 4.14375L10.3313 3.61875L6 7.95V9.01875ZM10.875 4.14375L10.3313 3.61875L10.875 4.14375L11.4 4.66875L10.875 4.14375Z" fill="white"/>
        </svg>
        프로필 수정
      </Link>

      {/* ── 관심 분야 태그 목록 ── */}
      <div>
        <p style={fieldLabelStyle}>관심 분야</p>
        <div style={tagsWrapStyle}>
          {/* 관심 분야가 있으면 태그 렌더, 없으면 안내 문구 표시 */}
          {interestedFieldNames.map((name) => (
            <span key={name} style={tagStyle}>{name}</span>
          ))}
          {interestedFieldNames.length === 0 && (
            <span style={subTextStyle}>관심 분야를 선택해보세요.</span>
          )}
        </div>
      </div>
    </div>
  );
}
