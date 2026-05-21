// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ProfileCard.tsx — 선배 상세 페이지의 좌측 프로필 카드                      ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    선배의 프로필 사진, 이름, 현직 정보, 한줄 소개, "선배와 연결하기" 버튼을   ║
// ║    세로로 나열한 고정 너비(368px) 카드를 렌더링한다.                         ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    seniors/[id]/page.tsx → ProfileCard(props: senior, isSending, onConnect)║
// ║    onConnect 콜백 → 부모에서 sendConnectionRequest() 호출                  ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/types : Senior 타입                                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

import { useState } from "react";
// Senior 타입 — 컴포넌트가 받는 데이터 구조 명세
import type { Senior } from "@/types";

const STARRED_KEY = "starred_senior_ids";

function getStarredIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STARRED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function setStarredIds(ids: string[]) {
  localStorage.setItem(STARRED_KEY, JSON.stringify(ids));
}

/** 컴포넌트 Props 타입 */
type ProfileCardProps = {
  senior: Senior;
  isSending: boolean;
  onConnect: () => void;
  /** 이미 연결된 경우 true — 버튼 텍스트를 "메시지 보내기"로 변경 */
  isConnected?: boolean;
};

/**
 * ProfileCard
 *
 * 선배 상세 페이지 좌측에 고정 배치되는 프로필 카드.
 * 사진 → 이름 → 직장/직함 → 한줄소개 → 연결하기 버튼 순으로 세로 배치.
 *
 * @param senior    - 렌더할 선배 데이터
 * @param isSending - 연결 요청 진행 중 여부 (버튼 비활성화 제어)
 * @param onConnect - 연결 버튼 클릭 핸들러 (부모가 실제 API 호출 담당)
 */
export default function ProfileCard({ senior, isSending, onConnect, isConnected }: ProfileCardProps) {
  const imageSrc = senior.profileImage ?? "/profile-default-blue.svg";
  const [isStarred, setIsStarred] = useState(() => getStarredIds().includes(senior.id));

  function toggleStar() {
    const ids = getStarredIds();
    const next = ids.includes(senior.id)
      ? ids.filter((id) => id !== senior.id)
      : [...ids, senior.id];
    setStarredIds(next);
    setIsStarred(!ids.includes(senior.id));
  }

  return (
    // 카드 전체 컨테이너 — 너비 368px 고정, 세로 방향 flex
    <div style={{ width: "368px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── 프로필 사진 영역 ── */}
      {/* 높이 371px, 둥근 모서리(35px)로 부드러운 인상 */}
      <div style={{ width: "368px", height: "371px", borderRadius: "35px", overflow: "hidden" }}>
        <img
          src={imageSrc}
          alt={senior.name}
          // 이미지가 컨테이너를 꽉 채우되 비율 유지(cover)
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", border: "none", outline: "none" }}
        />
      </div>

      {/* ── 이름 + 즐겨찾기 버튼 행 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1F1A1A" }}>{senior.name}</h1>
        {/* 별표 아이콘 버튼 — 즐겨찾기 토글 */}
        <button
          onClick={toggleStar}
          style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: isStarred ? "#9A001F" : "#F5D0D0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 150ms ease" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isStarred ? "white" : "none"} stroke={isStarred ? "white" : "#9A001F"} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* ── 회사 · 직함 ── */}
      {/* marginTop 음수로 이름과의 간격을 좁혀 시각적 밀착감 부여 */}
      <p style={{ fontSize: "14px", color: "#9A001F", fontWeight: 400, marginTop: "-12px" }}>
        {senior.company} · {senior.jobTitle}
      </p>

      {/* ── 한줄 소개 (bio) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* 인용 부호 SVG 아이콘 — 소개 텍스트의 시작을 시각적으로 표현 */}
        <svg width="56" height="40" viewBox="0 0 30 22" fill="#D1D5DB">
          <path d="M0 22V13.2C0 9.73333 0.733333 6.8 2.2 4.4C3.66667 2 6 0.266667 9.2 0L10.4 2C8.13333 2.4 6.4 3.46667 5.2 5.2C4.13333 6.93333 3.6 8.86667 3.6 11H7.6V22H0ZM17.6 22V13.2C17.6 9.73333 18.3333 6.8 19.8 4.4C21.2667 2 23.6 0.266667 26.8 0L28 2C25.7333 2.4 24 3.46667 22.8 5.2C21.7333 6.93333 21.2 8.86667 21.2 11H25.2V22H17.6Z" />
        </svg>
        <p style={{ fontSize: "14px", color: "#5C3F3F", lineHeight: 1.7 }}>{senior.bio}</p>
      </div>

      {/* ── "선배와 연결하기" 버튼 ── */}
      {/*
        상태별 동작:
        - isAvailable=false → 버튼 비활성화(회색), cursor: not-allowed
        - isSending=true    → "연결 중..." 텍스트로 진행 중 표시
        - 기본 상태          → "#9A001F" 레드 배경, 클릭 가능
      */}
      <button
        onClick={onConnect}
        // API 호출 중이거나 선배가 상담 불가 상태면 버튼 비활성화
        disabled={isSending || !senior.isAvailable}
        style={{
          width: "100%",
          padding: "16px 0",
          // isAvailable에 따라 활성/비활성 색상 분기
          backgroundColor: senior.isAvailable ? "#9A001F" : "#E5E7EB",
          color: senior.isAvailable ? "#FFFFFF" : "#9CA3AF",
          border: "none",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: senior.isAvailable ? "pointer" : "not-allowed",
          marginTop: "8px",
        }}
      >
        {/* isSending 중이면 피드백 텍스트, 아니면 기본 문구 */}
        {isSending ? "연결 중..." : isConnected ? "메시지 보내기" : "선배와 연결하기"}
      </button>

    </div>
  );
}
