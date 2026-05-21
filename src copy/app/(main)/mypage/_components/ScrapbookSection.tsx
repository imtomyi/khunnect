// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ScrapbookSection.tsx — 마이페이지 스크랩북 섹션                           ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    마이페이지 하단에 위치하는 스크랩북 카드.                                ║
// ║    좌측: 즐겨찾기(스크랩)한 선배 목록                                       ║
// ║    우측: 저장한 로드맵 카드 목록                                             ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    mypage/page.tsx → ScrapbookSection(scrapedSeniors: Senior[])           ║
// ║    MOCK_ROADMAPS: 하드코딩된 로드맵 목록 (추후 API 연동 예정)               ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/link          : 선배 상세 페이지 이동                             ║
// ║    - @/types            : Senior 타입                                     ║
// ║    - @/lib/avatarVariants : 아바타 변형 유틸 (현재 미사용, import만 유지)    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// Link: 선배 카드 클릭 시 /seniors/[id]로 이동
import Link from "next/link";
import type { CSSProperties } from "react";
// Senior 타입: 스크랩된 선배 데이터 구조
import type { Senior } from "@/types";
// getAvatarVariantForId: 선배 ID 기반 아바타 변형 결정 (현재 미사용)
// AvatarIcon: SVG 아바타 아이콘 (현재 미사용 — 향후 아바타 표시 시 활용 예정)
import { getAvatarVariantForId, AvatarIcon } from "@/lib/avatarVariants";

/** 컴포넌트 Props 타입 */
type ScrapbookSectionProps = {
  /** 사용자가 스크랩한 선배 데이터 배열 */
  scrapedSeniors: Senior[];
};

// ── 목 데이터 ─────────────────────────────────────────────────────────────

/** 하드코딩된 로드맵 목록 — 추후 API 연동으로 교체 예정 */
const MOCK_ROADMAPS = [
  { id: "ux-ui",    title: "UX 리서처가 되는 길",       bgColor: "#C8A882" },
  { id: "mobility", title: "모빌리티 디자이너가 되는 길", bgColor: "#4A5568" },
];

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/** 스크랩북 전체 카드 컨테이너 */
const cardStyle: CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "32px",
};

/** "스크랩북" 섹션 제목 */
const titleStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1F1A1A",
  marginBottom: "24px",
};

/** 친한 선배(좌) / 저장한 로드맵(우) 2열 배치 */
const twoColStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
};

/** 컬럼 레이블 행 (아이콘 + 텍스트) */
const colLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#5C3F3F",
  marginBottom: "12px",
};

/** 선배 아이템 카드 스타일 */
const seniorItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#FCF1F1",
  borderRadius: "12px",
  padding: "12px 16px",
  marginBottom: "8px",
};

/** 선배 아이템 내 아바타 + 이름/학과 좌측 영역 */
const seniorInfoStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

/** 선배 이름 텍스트 */
const seniorNameStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 400,
  color: "#1F1A1A",
};

/** 학과·졸업연도 부제 텍스트 */
const seniorSubStyle: CSSProperties = {
  fontSize: "12px",
  color: "#5C3F3F",
  marginTop: "2px",
};

/** 즐겨찾기(별) 버튼 스타일 — 배경 없는 아이콘 버튼 */
const starBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  display: "flex",
  alignItems: "center",
};

/** 로드맵 카드 스타일 — 배경색 + 배경 그라디언트 이미지 위에 제목 오버레이 */
const roadmapCardStyle: CSSProperties = {
  borderRadius: "12px",
  overflow: "hidden",
  height: "80px",
  position: "relative",   // 절대 위치 자식(제목 텍스트)의 기준점
  marginBottom: "8px",
  cursor: "pointer",
};

/** 로드맵 카드 위에 오버레이된 제목 텍스트 */
const roadmapLabelStyle: CSSProperties = {
  position: "absolute",
  bottom: "12px",
  left: "14px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#FFFFFF",
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * ScrapbookSection
 *
 * 마이페이지 하단 스크랩북 섹션.
 * 좌측에 스크랩한 선배 목록, 우측에 저장한 로드맵을 표시한다.
 *
 * @param scrapedSeniors - 사용자가 스크랩한 선배 데이터 배열
 */
export default function ScrapbookSection({ scrapedSeniors }: ScrapbookSectionProps) {
  return (
    <div style={cardStyle}>
      <p style={titleStyle}>스크랩북</p>

      <div style={twoColStyle}>
        {/* ── 좌측: 친한 선배 목록 ── */}
        <div>
          {/* 컬럼 레이블: 별 아이콘 + "친한 선배" */}
          <div style={colLabelStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
              <path d="M5.8225 12.4842L8.5 10.8842L11.1775 12.5053L10.4762 9.47369L12.835 7.45263L9.7325 7.17895L8.5 4.31579L7.2675 7.1579L4.165 7.43158L6.52375 9.47369L5.8225 12.4842ZM3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#9A001F"/>
            </svg>
            친한 선배
          </div>
          {/* 스크랩된 선배가 없으면 안내 문구, 있으면 목록 렌더 */}
          {scrapedSeniors.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>저장한 선배가 없습니다.</p>
          ) : (
            scrapedSeniors.map((senior) => {
              // 선배 ID 기반 아바타 변형 (현재 아이템에서는 미사용, 향후 아바타 표시 예정)
              const variant = getAvatarVariantForId(senior.id);
              return (
                // Link: 선배 카드 전체를 클릭 가능 링크로 감쌈
                <Link key={senior.id} href={`/seniors/${senior.id}`} style={{ textDecoration: "none" }}>
                  <div style={seniorItemStyle}>
                    <div style={seniorInfoStyle}>
                      <div>
                        <p style={seniorNameStyle}>{senior.name} 선배님</p>
                        <p style={seniorSubStyle}>{senior.department} · {senior.graduationYear}년 졸업</p>
                      </div>
                    </div>
                    {/* 즐겨찾기 버튼 — e.preventDefault()로 Link 이동을 막고 아이콘만 반응 */}
                    <button style={starBtnStyle} onClick={(e) => e.preventDefault()}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10319.28px",  // 완전한 원형
                        backgroundColor: "#C7002B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {/* 채워진 별 아이콘 — 스크랩 완료 상태 표시 */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M5.8225 12.4842L8.5 10.8842L11.1775 12.5053L10.4762 9.47369L12.835 7.45263L9.7325 7.17895L8.5 4.31579L7.2675 7.1579L4.165 7.43158L6.52375 9.47369L5.8225 12.4842ZM3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#FFD5D4"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* ── 우측: 저장한 로드맵 목록 ── */}
        <div>
          {/* 컬럼 레이블: 경로(branch) 아이콘 + "저장한 로드맵" */}
          <div style={colLabelStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4.5 13.5C3.675 13.5 2.96875 13.2062 2.38125 12.6187C1.79375 12.0312 1.5 11.325 1.5 10.5V4.36875C1.0625 4.20625 0.703125 3.93437 0.421875 3.55312C0.140625 3.17188 0 2.7375 0 2.25C0 1.625 0.21875 1.09375 0.65625 0.65625C1.09375 0.21875 1.625 0 2.25 0C2.875 0 3.40625 0.21875 3.84375 0.65625C4.28125 1.09375 4.5 1.625 4.5 2.25C4.5 2.7375 4.35938 3.17188 4.07812 3.55312C3.79688 3.93437 3.4375 4.20625 3 4.36875V10.5C3 10.9125 3.14687 11.2656 3.44062 11.5594C3.73438 11.8531 4.0875 12 4.5 12C4.9125 12 5.26562 11.8531 5.55937 11.5594C5.85312 11.2656 6 10.9125 6 10.5V3C6 2.175 6.29375 1.46875 6.88125 0.88125C7.46875 0.29375 8.175 0 9 0C9.825 0 10.5312 0.29375 11.1187 0.88125C11.7062 1.46875 12 2.175 12 3V9.13125C12.4375 9.29375 12.7969 9.56562 13.0781 9.94687C13.3594 10.3281 13.5 10.7625 13.5 11.25C13.5 11.875 13.2812 12.4062 12.8438 12.8438C12.4062 13.2812 11.875 13.5 11.25 13.5C10.625 13.5 10.0938 13.2812 9.65625 12.8438C9.21875 12.4062 9 11.875 9 11.25C9 10.7625 9.14062 10.325 9.42188 9.9375C9.70312 9.55 10.0625 9.28125 10.5 9.13125V3C10.5 2.5875 10.3531 2.23438 10.0594 1.94062C9.76562 1.64687 9.4125 1.5 9 1.5C8.5875 1.5 8.23438 1.64687 7.94063 1.94062C7.64688 2.23438 7.5 2.5875 7.5 3V10.5C7.5 11.325 7.20625 12.0312 6.61875 12.6187C6.03125 13.2062 5.325 13.5 4.5 13.5ZM2.25 3C2.4625 3 2.64062 2.92812 2.78437 2.78437C2.92812 2.64062 3 2.4625 3 2.25C3 2.0375 2.92812 1.85938 2.78437 1.71563C2.64062 1.57188 2.4625 1.5 2.25 1.5C2.0375 1.5 1.85938 1.57188 1.71563 1.71563C1.57188 1.85938 1.5 2.0375 1.5 2.25C1.5 2.4625 1.57188 2.64062 1.71563 2.78437C1.85938 2.92812 2.0375 3 2.25 3ZM11.25 12C11.4625 12 11.6406 11.9281 11.7844 11.7844C11.9281 11.6406 12 11.4625 12 11.25C12 11.0375 11.9281 10.8594 11.7844 10.7156C11.6406 10.5719 11.4625 10.5 11.25 10.5C11.0375 10.5 10.8594 10.5719 10.7156 10.7156C10.5719 10.8594 10.5 11.0375 10.5 11.25C10.5 11.4625 10.5719 11.6406 10.7156 11.7844C10.8594 11.9281 11.0375 12 11.25 12Z" fill="#5C3F3F"/>
            </svg>
            저장한 로드맵
          </div>
          {/* MOCK_ROADMAPS: 배경색 + 그라디언트 SVG 이미지 + 제목 텍스트 오버레이 */}
          {MOCK_ROADMAPS.map((roadmap) => (
            <div key={roadmap.id} style={{ ...roadmapCardStyle, backgroundColor: roadmap.bgColor }}>
              {/* 그라디언트 오버레이 이미지 — 제목 텍스트 가독성 향상 */}
              <img src="/Gradient1.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              {/* 로드맵 제목 — 카드 좌하단에 절대 위치 */}
              <p style={roadmapLabelStyle}>{roadmap.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
