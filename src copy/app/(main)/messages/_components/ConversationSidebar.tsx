/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/messages/_components/ConversationSidebar.tsx         ║
║  역할: 메시지 페이지의 좌측 대화 목록 사이드바                              ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(messages/page.tsx)로부터 props로 모든 데이터 수신                    ║
║    → filteredConns: 검색 필터링된 연결 요청 목록                             ║
║    → seniorMap: 선배 ID → 선배 정보 룩업 맵                                  ║
║    → lastMessageMap: 연결 ID → 마지막 메시지 룩업 맵                         ║
║    → readSet: 이미 읽은 대화 ID 집합                                         ║
║    검색어 변경/항목 선택은 콜백으로 부모에 위임 (상태 리프팅 패턴)           ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types               : ConnectionRequest, Message, Senior 타입         ║
║    - @/lib/avatarVariants  : 아바타 색상/아이콘 생성 유틸리티                ║
║    - ../_lib/constants     : CURRENT_USER_ID (본인 메시지 판별용)            ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// 타입 임포트: 연결 요청, 메시지, 선배 프로필 타입
import type { ConnectionRequest, Message, Senior } from "@/types";
// 선배 ID를 기반으로 결정론적 아바타 색상/경로를 반환하는 유틸리티
// 같은 ID에 대해 항상 동일한 아바타 스타일 보장
import { getAvatarVariantForId, AvatarIcon } from "@/lib/avatarVariants";
// 현재 로그인 유저 ID (메시지 발신자가 본인인지 선배인지 구분하는 데 사용)
import { CURRENT_USER_ID } from "../_lib/constants";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 사이드바 전체 컨테이너: 고정 너비 280px, 우측 구분선
const asideStyle: React.CSSProperties = {
  width: "280px",
  flexShrink: 0,
  backgroundColor: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #F0EDED",
};

// 헤더 영역 패딩 (제목 + 검색창 포함 영역)
const headerStyle: React.CSSProperties = {
  padding: "28px 20px 14px",
};

// "메시지" 제목 텍스트 스타일
const headingStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 500,
  color: "#1F1A1A",
  marginBottom: "14px",
};

// 검색창 래퍼: 아이콘 + 인풋을 가로 배치
const searchWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1.5px solid #EBE0E0",
  borderRadius: "10px",
  padding: "10px 14px",
  backgroundColor: "#FCF1F1",
};

// 검색 인풋 필드: 배경/테두리 초기화, 전체 너비
const searchInputStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  outline: "none",
  fontSize: "13px",
  color: "#1F1A1A",
  width: "100%",
};

// 대화 목록 스크롤 영역: 남은 공간 모두 차지
const listWrapStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
};

// 대화 없을 때 표시되는 안내 텍스트
const emptyTextStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: "13px",
  color: "#9CA3AF",
};

/**
 * connBtnStyle
 * 각 대화 항목 버튼 스타일 (선택 여부에 따라 배경색 변경)
 *
 * @param isSelected - 현재 선택된 대화인지 여부
 */
const connBtnStyle = (isSelected: boolean): React.CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  backgroundColor: isSelected ? "#FFF5F5" : "transparent",
  border: "none",
  borderLeft: isSelected ? "3px solid #9A001F" : "3px solid transparent",
  borderBottom: "1px solid #F5EFEF",
  borderRadius: "0",
  cursor: "pointer",
  transition: "background-color 150ms ease",
});

/**
 * avatarWrapStyle
 * 아바타 원형 컨테이너 스타일 (배경색은 선배별로 다름)
 *
 * @param bg - 아바타 배경색 (avatarVariant.bg 또는 이미지 오버레이용 반투명 검정)
 */
const avatarWrapStyle = (bg: string): React.CSSProperties => ({
  width: "46px",
  height: "46px",
  borderRadius: "14px",
  backgroundColor: bg,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
});

// 이름 + 미리보기 텍스트를 감싸는 영역: 최소 너비 0으로 말줄임 허용
const connInfoStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,  // flex 자식에서 overflow hidden/ellipsis가 동작하려면 필수
};

// 이름(왼쪽) + 시간(오른쪽)을 양끝 정렬하는 행
const connNameRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const connNameStyle = (isSelected: boolean): React.CSSProperties => ({
  fontSize: "14px",
  fontWeight: isSelected ? 700 : 400,
  color: "#1F1A1A",
});

const connTimeStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#5C3F3F",
  flexShrink: 0,
};

const MOCK_TIMESTAMPS: Record<string, string> = {
  "conn-2": "10:30 AM",
  "conn-3": "어제",
};

/**
 * connPreviewStyle
 * 마지막 메시지 미리보기 텍스트 스타일 (읽지 않은 경우 더 진한 색상)
 *
 * @param hasUnread - 읽지 않은 메시지 존재 여부
 */
const connPreviewStyle = (hasUnread: boolean, isSelected: boolean): React.CSSProperties => ({
  fontSize: "12px",
  color: isSelected ? "#5C3F3F" : hasUnread ? "#5C3F3F" : "#9CA3AF",
  fontWeight: isSelected ? 600 : 400,
  marginTop: "3px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// ── 타입 ─────────────────────────────────────────────────────────────────────
/**
 * ConversationSidebarProps
 * 부모 컴포넌트(messages/page.tsx)에서 전달받는 props 타입.
 * 이 컴포넌트는 순수한 UI 렌더링만 담당하며 상태를 직접 소유하지 않음 (표현 컴포넌트 패턴).
 */
type ConversationSidebarProps = {
  filteredConns: ConnectionRequest[];             // 검색어로 필터링된 연결 요청 목록
  seniorMap: Record<string, Senior>;             // ID → 선배 정보 O(1) 룩업 맵
  selectedConn: ConnectionRequest | null;        // 현재 선택(열린) 대화
  lastMessageMap: Record<string, Message>;       // 연결 ID → 마지막 메시지
  readSet: Set<string>;                          // 읽음 처리된 연결 ID 집합
  search: string;                                // 현재 검색 입력값
  onSearchChange: (value: string) => void;       // 검색어 변경 시 부모에 알림
  onSelectConn: (conn: ConnectionRequest) => void; // 대화 선택 시 부모에 알림
};

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────
/**
 * ConversationSidebar
 *
 * 메시지 페이지 좌측에 위치하는 대화 목록 사이드바.
 * - 상단: 제목 "메시지" + 검색창
 * - 하단: 연결된 선배별 대화 항목 목록 (아바타, 이름, 마지막 메시지 미리보기)
 * - 읽지 않은 메시지가 있으면 아바타 우하단에 빨간 점 표시
 */
export default function ConversationSidebar({
  filteredConns,
  seniorMap,
  selectedConn,
  lastMessageMap,
  readSet,
  search,
  onSearchChange,
  onSelectConn,
}: ConversationSidebarProps) {
  return (
    <aside style={asideStyle}>
      {/* 전역 CSS: placeholder 텍스트 색상을 반투명 포도주색으로 지정 */}
      <style>{`
        .msg-search-input::placeholder { color: #5C3F3F80; }
      `}</style>
      {/* 사이드바 헤더 */}
      <div style={headerStyle}>
        <h2 style={headingStyle}>메시지</h2>

        {/* 검색창 */}
        <div style={searchWrapStyle}>
          {/* 돋보기 아이콘 (SVG 인라인) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.1333 24L13.7333 15.6C13.0667 16.1333 12.3 16.5556 11.4333 16.8667C10.5667 17.1778 9.64444 17.3333 8.66667 17.3333C6.24444 17.3333 4.19444 16.4944 2.51667 14.8167C0.838889 13.1389 0 11.0889 0 8.66667C0 6.24444 0.838889 4.19444 2.51667 2.51667C4.19444 0.838889 6.24444 0 8.66667 0C11.0889 0 13.1389 0.838889 14.8167 2.51667C16.4944 4.19444 17.3333 6.24444 17.3333 8.66667C17.3333 9.64444 17.1778 10.5667 16.8667 11.4333C16.5556 12.3 16.1333 13.0667 15.6 13.7333L24 22.1333L22.1333 24ZM8.66667 14.6667C10.3333 14.6667 11.75 14.0833 12.9167 12.9167C14.0833 11.75 14.6667 10.3333 14.6667 8.66667C14.6667 7 14.0833 5.58333 12.9167 4.41667C11.75 3.25 10.3333 2.66667 8.66667 2.66667C7 2.66667 5.58333 3.25 4.41667 4.41667C3.25 5.58333 2.66667 7 2.66667 8.66667C2.66667 10.3333 3.25 11.75 4.41667 12.9167C5.58333 14.0833 7 14.6667 8.66667 14.6667Z" fill="#5C3F3F" fillOpacity="0.5"/>
          </svg>
          <input
            className="msg-search-input"
            placeholder="대화 검색..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </div>

      {/* 대화 목록 */}
      <div style={listWrapStyle}>
        {filteredConns.length === 0 ? (
          // 검색 결과 없거나 연결된 선배 없을 때 안내 문구
          <p style={emptyTextStyle}>대화가 없습니다.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredConns.map((conn) => {
            // O(1) 룩업으로 연결 요청의 선배 정보 조회
            const senior = seniorMap[conn.toSeniorId];
            // 현재 선택된 대화인지 확인 (강조 스타일 적용 여부 결정)
            const isSelected = selectedConn?.id === conn.id;
            // 선배 ID 기반으로 결정론적 아바타 색상/아이콘 생성
            const avatarVariant = getAvatarVariantForId(conn.toSeniorId);
            // 프로필 이미지가 있으면 반투명 오버레이용 색상, 없으면 아바타 색상
            const avatarBg = senior?.profileImage ? "#00000033" : avatarVariant.bg;

            // 이 대화의 마지막 메시지 (미리보기 텍스트에 사용)
            const lastMsg = lastMessageMap[conn.id];
            // 마지막 메시지가 상대방이 보낸 것이고 아직 읽지 않은 경우 = 읽지 않은 상태
            const hasUnread = lastMsg && lastMsg.senderId !== CURRENT_USER_ID && !readSet.has(conn.id);

            return (
              <button key={conn.id} onClick={() => onSelectConn(conn)} style={connBtnStyle(isSelected)}>
                {/* 아바타: 프로필 이미지 또는 색상 아이콘 + 읽지 않음 표시 점 */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={avatarWrapStyle(avatarBg)}>
                    {senior?.profileImage ? (
                      // 프로필 이미지가 있는 경우 이미지 표시
                      <img src={senior.profileImage} alt={senior.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      // 이미지 없는 경우 SVG 아이콘 아바타 표시
                      <AvatarIcon fill={avatarVariant.fill} bodyPath={avatarVariant.bodyPath} size={44} />
                    )}
                  </div>
                  {/* 읽지 않은 메시지 알림 점: 아바타 우하단에 절대 위치 */}
                  {hasUnread && (
                    <div style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#5C3F3F",
                      border: "2px solid #FFFFFF",  // 흰 테두리로 아바타와 구분
                    }} />
                  )}
                </div>

                {/* 이름 + 미리보기 */}
                <div style={connInfoStyle}>
                  <div style={connNameRowStyle}>
                    {/* 이름 없으면 폴백 "선배님" 표시 */}
                    <p style={connNameStyle(isSelected)}>{senior?.name ?? ""} 선배님</p>
                    {/* TODO: 실제 타임스탬프 포맷팅으로 교체 */}
                    <span style={connTimeStyle}>{MOCK_TIMESTAMPS[conn.id] ?? "어제"}</span>
                  </div>
                  {/* 마지막 메시지 미리보기:
                      - 메시지 있음 + 본인 발신: "회원님: [내용]"
                      - 메시지 있음 + 상대 발신: "[내용]"
                      - 메시지 없음: 최초 연결 요청 메시지 표시 */}
                  <p style={connPreviewStyle(hasUnread, isSelected)}>
                    {lastMsg
                      ? lastMsg.senderId === CURRENT_USER_ID
                        ? `회원님: ${lastMsg.content}`
                        : lastMsg.content
                      : conn.message}
                  </p>
                </div>
              </button>
            );
          })}
          </div>
        )}
      </div>
    </aside>
  );
}
