// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SeniorCard.tsx — 선배 정보를 요약하는 카드 컴포넌트                        ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    선배 디렉토리 목록에서 각 선배의 프로필을 카드 형태로 표시한다.            ║
// ║    아바타, 상담 가능 여부 뱃지, 이름, 학과/졸업연도, 전문 분야 태그,          ║
// ║    상세 페이지 이동 링크를 포함한다.                                         ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    seniors/page.tsx → SeniorCard(props: Senior)                          ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/link          : 선배 상세 페이지(/seniors/[id])로 이동            ║
// ║    - @/types            : Senior 타입                                     ║
// ║    - @/lib/avatarVariants : 선배 ID 기반 아바타 색상/이미지 결정 유틸        ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// Next.js Link: <a> 태그 대신 클라이언트 사이드 네비게이션 제공
import Link from "next/link";
// Senior 타입: API 응답 데이터 구조 보장
import type { Senior } from "@/types";
// getAvatarVariantForId: senior.id를 해시하여 일관된 아바타 색상/아이콘 반환
// AvatarIcon: SVG 기반 아바타 아이콘 컴포넌트
import { getAvatarVariantForId, AvatarIcon } from "@/lib/avatarVariants";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 모든 스타일을 컴포넌트 외부에서 선언하여 리렌더 시 불필요한 객체 재생성 방지

/** 카드 외형 — 흰 배경, 둥근 모서리, 그림자, 고정 크기(340×450px) */
const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "32px 36px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  width: "340px",
  height: "450px",
  // hover 시 translateY/shadow 변화를 위한 transition
  transition: "transform 200ms ease, box-shadow 200ms ease",
  cursor: "pointer",
};

/** 카드 1행: 아바타(좌) + 상담 가능 뱃지(우) 배치 */
const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

/**
 * 아바타 래퍼 스타일 팩토리
 * @param bg - 아바타 배경색 (선배 ID 기반으로 결정)
 * profileImage가 있으면 반투명 검정, 없으면 아바타 변형 고유 색상 사용
 */
const avatarWrapStyle = (bg: string): React.CSSProperties => ({
  width: "76px",
  height: "76px",
  borderRadius: "14px",
  backgroundColor: bg,
  overflow: "hidden",        // 이미지/아이콘이 경계 밖으로 넘치지 않도록
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

/** 아바타 이미지 — 컨테이너를 꽉 채우되 비율 유지(cover) */
const avatarImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * 상담 가능 여부 뱃지 스타일 팩토리
 * @param isAvailable - true면 파란 계열("상담 가능"), false면 분홍 계열("상담 중")
 */
const badgeStyle = (isAvailable: boolean): React.CSSProperties => ({
  display: "flex",
  padding: "6px 16px",
  flexDirection: "column",
  alignItems: "flex-start",
  borderRadius: "9999px",            // 완전한 pill 형태
  fontSize: "12px",
  fontWeight: 400,
  // isAvailable에 따라 색상 분기
  backgroundColor: isAvailable ? "#2E67934D" : "#FCF1F1",
  color: isAvailable ? "#094F7A" : "#5C3F3F",
});

/** 이름 텍스트 — 30px 큰 폰트로 임팩트 부여 */
const nameStyle: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "#1F1A1A",
  lineHeight: "36px",
  fontFamily: "var(--font-roboto), sans-serif",
};

/** 학과·졸업연도 부제 — 브랜드 레드 계열 */
const deptStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "#9A001F",
  lineHeight: "24px",
  fontFamily: "var(--font-roboto), sans-serif",
  marginTop: "-8px",   // 이름과의 간격을 살짝 좁혀 시각적 밀착감 부여
};

/** 전문 분야 섹션 래퍼 */
const skillSectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginTop: "12px",
};

/** "전문 분야" 레이블 — 작은 대문자 + 자간 넓게 (서브 헤딩 스타일) */
const skillLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "#916F6E",
  lineHeight: "16px",
  fontFamily: "var(--font-roboto), sans-serif",
  letterSpacing: "1.2px",
  textTransform: "uppercase",
};

/** 스킬 태그 리스트 — 줄바꿈 허용(wrap) */
const skillListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
};

/** 개별 스킬 태그 스타일 — 연한 핑크 배경, 고정 높이 36px */
const skillTagStyle: React.CSSProperties = {
  display: "flex",
  height: "36px",
  padding: "8px 16px",
  flexDirection: "column",
  alignItems: "flex-start",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 500,
  backgroundColor: "#F6EBEB",
  color: "#5C3F3F",
  boxSizing: "border-box",
};

/** "프로필 보기" CTA 버튼/링크 — 카드 하단에 고정(marginTop: auto) */
const profileLinkStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  padding: "20px 0",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "auto",             // flex 컨테이너 내에서 남은 공간을 밀어 하단에 위치
  backgroundColor: "#9A001F",
  color: "#FFFFFF",
  borderRadius: "16px",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
};

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────

/**
 * SeniorCard
 *
 * 선배 한 명의 요약 정보를 카드 형태로 표시.
 * hover 시 scale/shadow 애니메이션을 onMouseEnter/Leave 이벤트로 처리한다
 * (CSS :hover 대신 JS로 처리하는 이유: 인라인 스타일은 :hover 지원 불가).
 *
 * @param senior - 표시할 선배 데이터 객체
 */
export default function SeniorCard({ senior }: { senior: Senior }) {
  // senior.id를 기반으로 고정된 아바타 변형(색상 + 아이콘 경로)을 결정
  const avatarVariant = getAvatarVariantForId(senior.id);
  // 실제 프로필 이미지가 있으면 반투명 검정 배경, 없으면 아바타 고유 색상 사용
  const avatarBg = senior.profileImage ? "#00000033" : avatarVariant.bg;

  return (
    <div
      style={cardStyle}
      // hover 진입 시 약간 확대 + 그림자 강화 — 클릭 유도
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }}
      // hover 이탈 시 원래 상태로 복원
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
      }}
    >

      {/* ── 1행: 아바타 + 상담 가능 뱃지 ── */}
      <div style={topRowStyle}>
        {/* 아바타 영역: 실제 이미지 있으면 <img>, 없으면 SVG 아이콘 */}
        <div style={avatarWrapStyle(avatarBg)}>
          {senior.profileImage ? (
            <img src={senior.profileImage} alt={senior.name} style={avatarImgStyle} />
          ) : (
            // AvatarIcon: fill 색상과 bodyPath(SVG 경로)로 커스터마이징된 아이콘
            <AvatarIcon fill={avatarVariant.fill} bodyPath={avatarVariant.bodyPath} size={70} />
          )}
        </div>
        {/* 상담 가능 여부 — isAvailable 값에 따라 색상과 문구 분기 */}
        <span style={badgeStyle(senior.isAvailable)}>
          {senior.isAvailable ? "상담 가능" : "상담 중"}
        </span>
      </div>

      {/* ── 2행: 이름 ── */}
      <p style={nameStyle}>{senior.name}</p>

      {/* ── 3행: 학과 · 졸업연도 ── */}
      <p style={deptStyle}>{senior.department} · {senior.graduationYear}년 졸업</p>

      {/* ── 4행: 전문 분야 + 스킬 태그 목록 ── */}
      <div style={skillSectionStyle}>
        <p style={skillLabelStyle}>전문 분야</p>
        <div style={skillListStyle}>
          {/* 각 스킬을 pill 태그로 렌더 */}
          {senior.skills.map((skill) => (
            <span key={skill} style={skillTagStyle}>{skill}</span>
          ))}
        </div>
      </div>

      {/* ── 5행: 프로필 보기 버튼 (CTA) ── */}
      {/* Link 사용: 클라이언트 사이드 라우팅으로 선배 상세 페이지 이동 */}
      <Link href={`/seniors/${senior.id}`} style={profileLinkStyle}>
        프로필 보기
      </Link>

    </div>
  );
}
