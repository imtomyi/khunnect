"use client";

// ╔══════════════════════════════════════════════════════════════╗
// ║  컴포넌트: MessageArea — 메시지 스크롤 영역                    ║
// ║  위치: messages/page.tsx 채팅 패널 중앙에 렌더링              ║
// ║  타입                                                        ║
// ║    Message, Senior, ConnectionRequest ← src/types/index.ts  ║
// ║  유틸                                                        ║
// ║    getAvatarVariantForId, AvatarIcon ← src/lib/avatarVariants║
// ║      → 선배 아바타 색상/아이콘 결정                            ║
// ║  상수                                                        ║
// ║    CURRENT_USER_ID ← ./_lib/constants.ts                    ║
// ║      → 내 메시지 여부 판단 (senderId === CURRENT_USER_ID)     ║
// ╚══════════════════════════════════════════════════════════════╝

import React from "react";
import Link from "next/link";
import type { Message, Senior, ConnectionRequest } from "@/types";
// 선배 ID 기반 아바타 변형(색상·아이콘) 생성 유틸 (src/lib/avatarVariants.ts)
import { getAvatarVariantForId, AvatarIcon } from "@/lib/avatarVariants";
// 현재 로그인 유저 ID (임시 고정값, 인증 연동 후 대체)
import { CURRENT_USER_ID } from "../_lib/constants";

// ── Props 타입 ───────────────────────────────────────────────────

type MessageAreaProps = {
  messages: Message[];                         // messages/page.tsx의 messages state
  selectedConn: ConnectionRequest;             // 현재 선택된 연결 (toSeniorId로 선배 조회)
  selectedSenior: Senior | null;               // seniorMap[selectedConn.toSeniorId]로 조회한 선배 정보
  scrollContainerRef: React.RefObject<HTMLDivElement | null>; // 스크롤 컨테이너 ref — page.tsx에서 scrollTop 직접 조작
  isLoading?: boolean;                         // 메시지 로딩 중 여부 → true이면 스켈레톤 표시
};

// ── 스타일 상수 ──────────────────────────────────────────────────

/** 메시지 스크롤 영역 전체 컨테이너 */
const scrollAreaStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  backgroundColor: "#FFF8F7",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

/** 메시지가 없을 때 선배 프로필 카드를 위쪽에 표시 */
const emptyProfileCenterStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "32px",
};

/** 선배 프로필 카드 내부 세로 배치 */
const emptyProfileCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
};

/** 선배 이름 텍스트 */
const profileNameStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1F1A1A",
  marginTop: "8px",
};

/** 선배 학과 텍스트 */
const profileDeptStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#5C3F3F",
  marginTop: "-4px",
};

/** 프로필 보기 링크 버튼 → /seniors/{seniorId} 로 이동 */
const profileLinkStyle: React.CSSProperties = {
  display: "flex",
  padding: "10px 36px",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "14px",
  backgroundColor: "#9A001F1A",
  color: "#9A001F",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: 500,
  textDecoration: "none",
};

// ── 헬퍼 함수 ───────────────────────────────────────────────────

/**
 * getBubbleRowStyle — 내 메시지는 오른쪽, 상대방 메시지는 왼쪽 정렬
 * @param isMine - senderId === CURRENT_USER_ID 여부
 */
function getBubbleRowStyle(isMine: boolean): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: isMine ? "flex-end" : "flex-start",
  };
}

/**
 * getBubbleStyle — 내 메시지(진한 빨강 배경)와 상대 메시지(흰색 배경) 스타일 구분
 * borderRadius로 말풍선 꼬리 방향 표현 (내: 우하, 상대: 좌하)
 */
function getBubbleStyle(isMine: boolean): React.CSSProperties {
  return {
    maxWidth: "320px",
    padding: "10px 16px",
    borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    fontSize: "14px",
    backgroundColor: isMine ? "#FFFFFF" : "#FCF1F1",
    color: "#1F1A1A",
    border: "1.5px solid #EBE0E0",
    boxShadow: "none",
  };
}

// ── 서브 컴포넌트 ────────────────────────────────────────────────

type EmptyProfileProps = {
  selectedSenior: Senior | null; // messages/page.tsx의 seniorMap에서 가져온 선배 정보
  seniorId: string;              // selectedConn.toSeniorId → 아바타 변형 결정 + 프로필 링크에 사용
};

/**
 * EmptyProfile — 대화 기록 없을 때 선배 아바타·이름·학과·프로필 링크 표시
 * - getAvatarVariantForId(seniorId): seniorId 해시 기반으로 아바타 색상·아이콘 결정
 * - selectedSenior.profileImage 있으면 실제 이미지, 없으면 AvatarIcon 컴포넌트 표시
 */
function EmptyProfile({ selectedSenior, seniorId }: EmptyProfileProps) {
  // src/lib/avatarVariants.ts: seniorId → { bg, fill, bodyPath } 반환
  const avatarVariant = getAvatarVariantForId(seniorId);
  const avatarBg = selectedSenior?.profileImage ? "#00000033" : avatarVariant.bg;

  return (
    <div style={emptyProfileCenterStyle}>
      <div style={emptyProfileCardStyle}>
        {/* 아바타: profileImage 있으면 이미지, 없으면 AvatarIcon */}
        <div style={{
          width: "96px",
          height: "96px",
          borderRadius: "50%",
          backgroundColor: avatarBg,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {selectedSenior?.profileImage ? (
            <img
              src={selectedSenior.profileImage}
              alt={selectedSenior.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            // src/lib/avatarVariants.ts의 AvatarIcon: fill·bodyPath로 SVG 아바타 렌더링
            <AvatarIcon fill={avatarVariant.fill} bodyPath={avatarVariant.bodyPath} size={88} />
          )}
        </div>

        {/* 선배 이름 (Senior.name) */}
        <p style={profileNameStyle}>{selectedSenior?.name ?? "선배님"} 선배님</p>
        {/* 선배 학과 (Senior.department) */}
        <p style={profileDeptStyle}>{selectedSenior?.department ?? ""}</p>
        {/* 선배 프로필 페이지 링크: /seniors/{seniorId} */}
        <Link href={`/seniors/${seniorId}`} style={profileLinkStyle}>
          프로필 보기
        </Link>
      </div>
    </div>
  );
}

type MessageListProps = {
  messages: Message[]; // messages/page.tsx의 messages state (getMessages + Realtime으로 채워짐)
};

/**
 * MessageList — 메시지 배열을 버블 형태로 렌더링
 * - senderId === CURRENT_USER_ID → isMine=true → 오른쪽 빨간 버블
 * - senderId !== CURRENT_USER_ID → isMine=false → 왼쪽 흰 버블
 */
function MessageList({ messages }: MessageListProps) {
  return (
    <>
      {messages.map((msg) => {
        // CURRENT_USER_ID(_lib/constants.ts)와 비교해 내 메시지 여부 판단
        const isMine = msg.senderId === CURRENT_USER_ID;
        return (
          <div key={msg.id} style={getBubbleRowStyle(isMine)}>
            <div style={getBubbleStyle(isMine)}>
              {msg.content}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * MessageSkeleton — 메시지 로딩 중(isLoading=true) 표시되는 shimmer 스켈레톤
 * - 좌우 배치를 실제 대화처럼 배열해 자연스러운 로딩 UX 제공
 * - skeleton-shimmer 애니메이션: background-position 이동으로 빛 반사 효과
 */
function MessageSkeleton() {
  const rows = [
    { isMine: false, width: "180px" },
    { isMine: true,  width: "120px" },
    { isMine: false, width: "240px" },
    { isMine: true,  width: "160px" },
    { isMine: false, width: "200px" },
  ];
  return (
    <>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: row.isMine ? "flex-end" : "flex-start" }}>
          <div style={{
            width: row.width,
            height: "38px",
            borderRadius: "18px",
            background: "linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.4s infinite",
          }} />
        </div>
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

// ── MessageArea (default export) ─────────────────────────────────

/**
 * MessageArea — 메시지 영역 최상위 컴포넌트
 * 세 가지 상태를 조건 렌더링:
 *  1) isLoading=true    → MessageSkeleton (로딩 중)
 *  2) messages 비어있음 → EmptyProfile (첫 대화 안내)
 *  3) 메시지 있음       → MessageList (버블 목록)
 *
 * bottomRef: messages/page.tsx에서 생성한 ref
 *   → 새 메시지 추가 시 scrollIntoView로 최하단 이동
 */
export default function MessageArea({ messages, selectedConn, selectedSenior, scrollContainerRef, isLoading }: MessageAreaProps) {
  const hasMessages = messages.length > 0;

  return (
    <div ref={scrollContainerRef} style={scrollAreaStyle}>
      {isLoading ? (
        <MessageSkeleton />
      ) : !hasMessages ? (
        <EmptyProfile selectedSenior={selectedSenior} seniorId={selectedConn.toSeniorId} />
      ) : (
        <MessageList messages={messages} />
      )}
    </div>
  );
}
