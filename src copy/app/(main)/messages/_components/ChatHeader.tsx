/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/messages/_components/ChatHeader.tsx                  ║
║  역할: 채팅 영역 상단 헤더 (선배 프로필 + 온라인 상태 + 액션 버튼)          ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(messages/page.tsx)로부터 선택된 Senior 객체를 props로 수신          ║
║    → 선배의 이름, 학과, isAvailable 상태, 프로필 이미지를 표시              ║
║    → 아바타: 프로필 이미지 우선, 없으면 ID 기반 결정론적 SVG 아이콘         ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types              : Senior 타입                                      ║
║    - @/lib/avatarVariants : 아바타 색상/아이콘 생성 유틸리티                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// 선배 프로필 타입
import type { Senior } from "@/types";
// 아바타 변형(색상, SVG 경로) 및 아이콘 컴포넌트
import { getAvatarVariantForId, AvatarIcon } from "@/lib/avatarVariants";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 헤더 컨테이너: 흰 배경, 하단 구분선, 아이템 가로 정렬
const headerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #EFEFEF",
  padding: "24px 24px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

/**
 * avatarWrapStyle
 * 원형 아바타 래퍼 (배경색은 선배별 고유 색상 또는 이미지 오버레이용)
 *
 * @param bg - 배경색 문자열
 */
const avatarWrapStyle = (bg: string): React.CSSProperties => ({
  position: "relative",  // 온라인 상태 점을 절대 위치로 오버레이하기 위해
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: bg,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
});

// 프로필 이미지 스타일: 원형 컨테이너를 꽉 채움
const avatarImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * onlineDotStyle
 * 온라인/오프라인 상태 표시 점 스타일
 * isAvailable에 따라 초록(온라인) / 빨강(오프라인) 색상 분기
 *
 * @param isAvailable - 선배의 멘토링 가능 여부
 */
const onlineDotStyle = (isAvailable?: boolean): React.CSSProperties => ({
  position: "absolute",
  bottom: "2px",
  right: "2px",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  // 온라인(가능): 초록색 / 오프라인(불가): 빨간색
  backgroundColor: isAvailable ? "#22C55E" : "#FF5464",
  border: "2px solid white",   // 흰 테두리로 아바타와 시각적으로 분리
  zIndex: 1,
});

// 선배 이름 텍스트 스타일
const nameStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#1F1A1A",
};

// 온라인 상태 레이블과 학과명을 나란히 표시하는 행
const statusRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  marginTop: "2px",
};

/**
 * onlineLabelStyle
 * "온라인" / "오프라인" 텍스트 색상 (상태에 따라 분기)
 *
 * @param isAvailable - 선배의 멘토링 가능 여부
 */
const onlineLabelStyle = (isAvailable?: boolean): React.CSSProperties => ({
  fontSize: "12px",
  color: isAvailable ? "#22C55E" : "#FF5464",
  fontWeight: 500,
});

// 학과명 텍스트 스타일 (회색, "· 학과명" 형태로 표시)
const deptLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",
};

// 우측 액션 버튼 그룹 (전화, 비디오, 정보): 헤더 우측 끝에 배치
const actionGroupStyle: React.CSSProperties = {
  marginLeft: "auto",  // 좌측 내용을 밀어내고 오른쪽으로 이동
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

// 아이콘 버튼 공통 스타일 (배경/테두리 없음)
const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ── 타입 ─────────────────────────────────────────────────────────────────────
/**
 * ChatHeaderProps
 * 현재 선택된 선배 객체. 대화를 선택하지 않았거나 데이터 로딩 중이면 null.
 */
type ChatHeaderProps = {
  senior: Senior | null;
};

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────
/**
 * ChatHeader
 *
 * 채팅 영역 상단에 고정되는 헤더 컴포넌트.
 * - 선택된 선배의 아바타, 이름, 온라인 상태, 학과를 표시
 * - 우측에 전화/비디오/정보 아이콘 버튼 배치 (현재 UI 목업 상태)
 * - senior가 null이면 이름/상태 자리에 폴백 텍스트 표시
 */
export default function ChatHeader({ senior }: ChatHeaderProps) {
  // 선배 ID 기반으로 결정론적 아바타 스타일 조회 (senior 없으면 빈 문자열로 처리)
  const avatarVariant = getAvatarVariantForId(senior?.id ?? "");
  // 프로필 이미지가 있으면 반투명 검정 배경(이미지 오버레이용), 없으면 아바타 고유 색상
  const avatarBg = senior?.profileImage ? "#00000033" : avatarVariant.bg;

  return (
    <div style={headerStyle}>
      {/* 아바타 + 온라인 상태 표시점 */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={avatarWrapStyle(avatarBg)}>
          {senior?.profileImage ? (
            // 프로필 이미지가 있으면 img 태그로 표시
            <img src={senior.profileImage} alt={senior.name} style={avatarImgStyle} />
          ) : (
            // 없으면 결정론적 SVG 아이콘 아바타
            <AvatarIcon fill={avatarVariant.fill} bodyPath={avatarVariant.bodyPath} size={44} />
          )}
        </div>
        {/* 온라인/오프라인 상태 점: isAvailable 값에 따라 색상 자동 분기 */}
        <div style={onlineDotStyle(senior?.isAvailable)} />
      </div>

      {/* 이름 + 온라인 상태 레이블 + 학과명 */}
      <div>
        {/* 이름 없으면 폴백 "선배님" */}
        <p style={nameStyle}>{senior?.name ?? "선배님"} 선배님</p>
        <div style={statusRowStyle}>
          {/* isAvailable 값에 따라 "온라인" / "오프라인" 텍스트와 색상 분기 */}
          <span style={onlineLabelStyle(senior?.isAvailable)}>
            {senior?.isAvailable ? "온라인" : "오프라인"}
          </span>
          {/* 구분 기호 뒤에 학과명 표시 */}
          <span style={deptLabelStyle}>· {senior?.department ?? ""}</span>
        </div>
      </div>

      {/* 우측 액션 버튼 그룹 (전화 / 비디오 / 정보) */}
      <div style={actionGroupStyle}>
        {/* 전화 아이콘 버튼 */}
        <button style={iconBtnStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.9994 16.9201V19.9201C22.0006 20.1986 21.9435 20.4743 21.832 20.7294C21.7204 20.9846 21.5567 21.2137 21.3515 21.402C21.1463 21.5902 20.904 21.7336 20.6402 21.8228C20.3764 21.912 20.0968 21.9452 19.8194 21.9201C16.7423 21.5857 13.7864 20.5342 11.1894 18.8501C8.77327 17.3148 6.72478 15.2663 5.18945 12.8501C3.49942 10.2413 2.44769 7.27109 2.11944 4.1801C2.09446 3.90356 2.12732 3.62486 2.21595 3.36172C2.30457 3.09859 2.44702 2.85679 2.63421 2.65172C2.82141 2.44665 3.04925 2.28281 3.30324 2.17062C3.55722 2.05843 3.83179 2.00036 4.10945 2.0001H7.10945C7.59475 1.99532 8.06524 2.16718 8.43321 2.48363C8.80118 2.80008 9.04152 3.23954 9.10944 3.7201C9.23607 4.68016 9.47089 5.62282 9.80945 6.5301C9.94399 6.88802 9.97311 7.27701 9.89335 7.65098C9.8136 8.02494 9.62831 8.36821 9.35944 8.6401L8.08945 9.9101C9.513 12.4136 11.5859 14.4865 14.0894 15.9101L15.3594 14.6401C15.6313 14.3712 15.9746 14.1859 16.3486 14.1062C16.7225 14.0264 17.1115 14.0556 17.4694 14.1901C18.3767 14.5286 19.3194 14.7635 20.2794 14.8901C20.7652 14.9586 21.2088 15.2033 21.526 15.5776C21.8431 15.9519 22.0116 16.4297 21.9994 16.9201Z" stroke="#5C3F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* 비디오 통화 아이콘 버튼 */}
        <button style={iconBtnStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M23 7L16 12L23 17V7Z" stroke="#5C3F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V7C16 5.89543 15.1046 5 14 5Z" stroke="#5C3F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* 정보(i) 아이콘 버튼 */}
        <button style={iconBtnStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#5C3F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" stroke="#5C3F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="#5C3F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
