"use client";

// ╔══════════════════════════════════════════════════════════════╗
// ║  페이지: 메시지함 (/messages)                                 ║
// ║  데이터 흐름                                                  ║
// ║    connections 목록  ← src/services/connections.ts           ║
// ║    선배 정보         ← src/services/seniors.ts               ║
// ║    메시지 목록       ← src/services/connections.ts           ║
// ║    Realtime 구독     ← src/services/connections.ts           ║
// ║  타입                                                        ║
// ║    ConnectionRequest, Message, Senior ← src/types/index.ts  ║
// ║  상수                                                        ║
// ║    CURRENT_USER_ID  ← ./_lib/constants.ts (로그인 유저 ID)   ║
// ║  최근 활동 기록      ← src/lib/recentActivity.ts             ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 서비스 레이어: Supabase / REST API 호출 함수들
import { getConnections, getMessages, sendMessage, subscribeToMessages } from "@/services/connections";
// 서비스 레이어: 선배 단건 조회
import { getSeniorById } from "@/services/seniors";
// 전역 타입 정의 (src/types/index.ts)
import type { ConnectionRequest, Message, Senior } from "@/types";
// 현재 로그인한 유저 ID 상수 (임시 고정값, 인증 연동 후 대체)
import { CURRENT_USER_ID } from "./_lib/constants";
// 최근 방문 활동 기록 유틸 (홈화면 '최근 활동' 섹션에 표시)
import { addRecentActivity } from "@/lib/recentActivity";
// 하위 컴포넌트들
import ConversationSidebar from "./_components/ConversationSidebar"; // 왼쪽 대화 목록 사이드바
import ChatHeader from "./_components/ChatHeader";                   // 채팅창 상단 선배 정보 헤더
import MessageArea from "./_components/MessageArea";                 // 메시지 버블 스크롤 영역
import MessageInput, { CoffeeChatModal } from "./_components/MessageInput"; // 하단 입력창 + 커피챗 모달

// ── 스타일 상수 ──────────────────────────────────────────────────

/** 페이지 전체 레이아웃: 사이드바 + 채팅 패널 좌우 배치 */
const pageLayoutStyle: React.CSSProperties = {
  display: "flex",
  height: "calc(100vh - 64px)",
  marginTop: "-49.54px",
  marginBottom: "-49.54px",
  fontFamily: "var(--font-roboto), sans-serif",
  backgroundColor: "#F6F6F6",
  overflow: "hidden",
};

/**
 * 오른쪽 채팅 패널 컨테이너
 * position: relative → CoffeeChatModal(position: absolute)의 기준 박스
 */
const chatPanelStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
};

/** 대화 미선택 시 빈 상태 안내 */
const emptyStateStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9CA3AF",
  fontSize: "14px",
};

/** 채팅창 하단 학교명 푸터 */
const footerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "6px",
  textAlign: "center",
  fontSize: "10px",
  color: "#D1D5DB",
  letterSpacing: "0.05em",
};

// ── 서브 컴포넌트 ────────────────────────────────────────────────

/** 대화가 선택되지 않았을 때 보여주는 안내 문구 */
function EmptyState() {
  return <div style={emptyStateStyle}>대화를 선택하세요</div>;
}

/** 채팅 패널 맨 하단 고정 푸터 */
function ChatFooter() {
  return <div style={footerStyle}>KYUNGHEE UNIVERSITY 2026</div>;
}

// ── 메인 컴포넌트 (useSearchParams 사용으로 Suspense 필요) ────────

function MessagesPageInner() {
  // URL 쿼리 파라미터: ?connId=xxx → 특정 대화 바로 열기
  const searchParams = useSearchParams();
  const connIdParam = searchParams.get("connId");

  // 페이지 진입 시 최근 활동에 '메시지함' 기록 (홈화면 표시용)
  useEffect(() => {
    addRecentActivity({
      id: "messages",
      label: "메시지함",
      sub: "대화 목록",
      href: "/messages",
      type: "messages",
    });
  }, []);

  // ── 상태 ──────────────────────────────────────────────────────
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  /** connectionId → Senior 매핑 (사이드바·헤더 렌더링용) */
  const [seniorMap, setSeniorMap] = useState<Record<string, Senior>>({});
  /** 현재 선택된 대화 */
  const [selectedConn, setSelectedConn] = useState<ConnectionRequest | null>(null);
  /** 선택된 대화의 메시지 배열 */
  const [messages, setMessages] = useState<Message[]>([]);
  /** connectionId → 마지막 메시지 (사이드바 미리보기용) */
  const [lastMessageMap, setLastMessageMap] = useState<Record<string, Message>>({});
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  /** 메시지 로딩 중 여부 (스켈레톤 표시 제어) */
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  /** 커피챗 일정 예약 모달 표시 여부 */
  const [showCoffeeChat, setShowCoffeeChat] = useState(false);
  /** 사이드바 이름 검색어 */
  const [search, setSearch] = useState("");
  /** 이미 읽은 대화 ID 집합 (읽음 표시 제어) */
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  /** 스크롤 컨테이너 ref — scrollTop으로 최하단 이동 (scrollIntoView 대신 사용) */
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── 초기 데이터 로드 ──────────────────────────────────────────
  /**
   * 1) getConnections: 유저의 연결 목록 조회 (src/services/connections.ts)
   * 2) getSeniorById:  각 연결의 선배 정보 병렬 조회 (src/services/seniors.ts)
   * 3) getMessages:    각 연결의 마지막 메시지 병렬 조회 (src/services/connections.ts)
   * → URL에 connId 파라미터가 있으면 해당 대화 자동 선택
   */
  useEffect(() => {
    getConnections(CURRENT_USER_ID).then(async (conns) => {
      setConnections(conns);
      const [seniors, allMessages] = await Promise.all([
        Promise.all(conns.map((c) => getSeniorById(c.toSeniorId))),
        Promise.all(conns.map((c) => getMessages(c.id))),
      ]);

      // Senior 배열 → { seniorId: Senior } 딕셔너리로 변환
      const seniorMapResult: Record<string, Senior> = {};
      seniors.forEach((s) => { if (s) seniorMapResult[s.id] = s; });
      setSeniorMap(seniorMapResult);

      // 각 연결의 마지막 메시지 추출
      const lastMsgMap: Record<string, Message> = {};
      conns.forEach((c, i) => {
        const msgs = allMessages[i];
        if (msgs.length > 0) lastMsgMap[c.id] = msgs[msgs.length - 1];
      });
      setLastMessageMap(lastMsgMap);

      // connId 파라미터가 있으면 해당 연결 선택, 없으면 첫 번째 선택
      if (connIdParam) {
        const target = conns.find((c) => c.id === connIdParam);
        if (target) setSelectedConn(target);
      } else {
        const firstWithMsg = conns.find((c) => lastMsgMap[c.id]);
        if (firstWithMsg) setSelectedConn(firstWithMsg);
      }
    });
  }, [connIdParam]);

  // ── 대화 선택 시 메시지 로드 + Realtime 구독 ─────────────────
  /**
   * getMessages:           선택된 연결의 전체 메시지 목록 조회
   * subscribeToMessages:   Supabase Realtime 구독 (src/services/connections.ts)
   *                        → 다른 사람이 보낸 새 메시지를 실시간으로 수신
   * cleanup:               대화 전환 시 이전 채널 구독 해제
   */
  useEffect(() => {
    if (!selectedConn) return;

    setIsLoadingMessages(true);
    getMessages(selectedConn.id).then((msgs) => {
      setMessages(msgs);
      setIsLoadingMessages(false);
    });

    const unsubscribe = subscribeToMessages(selectedConn.id, (newMsg) => {
      // 내가 보낸 메시지는 handleSend에서 이미 추가하므로 중복 방지
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setLastMessageMap((prev) => ({ ...prev, [selectedConn.id]: newMsg }));
    });

    return () => unsubscribe();
  }, [selectedConn]);

  // ── 스크롤 최하단 유지 ────────────────────────────────────────
  /**
   * 초기 로드(0→n)에는 스크롤하지 않고,
   * 새 메시지 추가(n→n+1)일 때만 스크롤 컨테이너 최하단으로 이동
   * → 메시지함 진입 시 화면이 아래로 내려가는 현상 방지
   */
  const prevMessagesLenRef = useRef(0);
  useEffect(() => {
    const prev = prevMessagesLenRef.current;
    const curr = messages.length;
    if (prev > 0 && curr > prev) {
      const el = scrollContainerRef.current; if (el) el.scrollTop = el.scrollHeight;
    }
    prevMessagesLenRef.current = curr;
  }, [messages]);

  // ── 메시지 전송 ───────────────────────────────────────────────
  /**
   * sendMessage: REST API POST /messages/{connectionId} 호출
   *              (src/services/connections.ts → src/lib/api.ts)
   * 전송 후 messages 배열 및 lastMessageMap 즉시 업데이트 (낙관적 UI)
   */
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConn || !input.trim()) return;
    setIsSending(true);
    const newMsg = await sendMessage({
      connectionId: selectedConn.id,
      senderId: CURRENT_USER_ID,
      content: input.trim(),
    });
    setMessages((prev) => [...prev, newMsg]);
    setLastMessageMap((prev) => ({ ...prev, [selectedConn.id]: newMsg }));
    setInput("");
    setIsSending(false);
  }

  // ── 사이드바 필터링 ───────────────────────────────────────────
  /** 메시지가 최소 1개 있는 연결만 + 검색어 필터 적용 */
  const sidebarConns = connections.filter((conn) => {
    const hasMsg = Boolean(lastMessageMap[conn.id]);
    const senior = seniorMap[conn.toSeniorId];
    const matchSearch = !search.trim() || (senior?.name.includes(search) ?? false);
    return hasMsg && matchSearch;
  });

  /** 현재 선택된 연결에 해당하는 Senior 객체 (seniorMap에서 조회) */
  const selectedSenior = selectedConn ? seniorMap[selectedConn.toSeniorId] : null;

  return (
    <div style={pageLayoutStyle}>
      {/* 왼쪽: 대화 목록 사이드바
          props: filteredConns(필터된 연결 목록), seniorMap, lastMessageMap, readSet, search */}
      {/* 검색 중이 아닐 때: 일반 대화 목록 사이드바 */}
      {!search.trim() && (
        <ConversationSidebar
          filteredConns={sidebarConns}
          seniorMap={seniorMap}
          selectedConn={selectedConn}
          lastMessageMap={lastMessageMap}
          readSet={readSet}
          search={search}
          onSearchChange={setSearch}
          onSelectConn={(conn) => {
            setSelectedConn(conn);
            setReadSet((prev) => new Set([...prev, conn.id]));
          }}
        />
      )}

      {/* 검색 중일 때: 검색창 + 결과 패널 */}
      {search.trim() && (
        <div style={{ width: "280px", flexShrink: 0, backgroundColor: "#FFFFFF", borderRight: "1px solid #F0EDED", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "28px 20px 8px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 500, color: "#1F1A1A", marginBottom: "14px" }}>메시지</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1.5px solid #EBE0E0", borderRadius: "10px", padding: "10px 14px", backgroundColor: "#FCF1F1" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.1333 24L13.7333 15.6C13.0667 16.1333 12.3 16.5556 11.4333 16.8667C10.5667 17.1778 9.64444 17.3333 8.66667 17.3333C6.24444 17.3333 4.19444 16.4944 2.51667 14.8167C0.838889 13.1389 0 11.0889 0 8.66667C0 6.24444 0.838889 4.19444 2.51667 2.51667C4.19444 0.838889 6.24444 0 8.66667 0C11.0889 0 13.1389 0.838889 14.8167 2.51667C16.4944 4.19444 17.3333 6.24444 17.3333 8.66667C17.3333 9.64444 17.1778 10.5667 16.8667 11.4333C16.5556 12.3 16.1333 13.0667 15.6 13.7333L24 22.1333L22.1333 24ZM8.66667 14.6667C10.3333 14.6667 11.75 14.0833 12.9167 12.9167C14.0833 11.75 14.6667 10.3333 14.6667 8.66667C14.6667 7 14.0833 5.58333 12.9167 4.41667C11.75 3.25 10.3333 2.66667 8.66667 2.66667C7 2.66667 5.58333 3.25 4.41667 4.41667C3.25 5.58333 2.66667 7 2.66667 8.66667C2.66667 10.3333 3.25 11.75 4.41667 12.9167C5.58333 14.0833 7 14.6667 8.66667 14.6667Z" fill="#5C3F3F" fillOpacity="0.5"/>
              </svg>
              <input
                className="msg-search-input"
                placeholder="대화 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", fontSize: "13px", color: "#5C3F3F", width: "100%" }}
              />
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF", fontSize: "16px", lineHeight: 1 }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
            {search.trim().length < 2 ? null : sidebarConns.length === 0 ? (
              <p style={{ padding: "0 20px", fontSize: "11px", color: "#9A001F" }}>일치하는 대화가 없습니다</p>
            ) : sidebarConns.map((conn) => {
              const senior = seniorMap[conn.toSeniorId];
              return (
                <button
                  key={conn.id}
                  onClick={() => { setSelectedConn(conn); setReadSet((prev) => new Set([...prev, conn.id])); setSearch(""); }}
                  style={{ width: "100%", textAlign: "left", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #F0EDED", borderRadius: "0", cursor: "pointer" }}
                >
                  <div style={{ width: "46px", height: "46px", borderRadius: "14px", backgroundColor: "#F5D0D0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {senior?.profileImage
                      ? <img src={senior.profileImage} alt={senior.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "16px", fontWeight: 700, color: "#9A001F" }}>{senior?.name?.[0] ?? ""}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#1F1A1A" }}>{senior?.name ?? ""} 선배님</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{senior?.jobTitle ?? ""}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <style>{`.msg-search-input::placeholder { color: #5C3F3F80; }`}</style>
        </div>
      )}

      {/* 오른쪽: 채팅 패널 (position: relative → 모달 기준점) */}
      <div style={chatPanelStyle}>
        {!selectedConn ? (
          <EmptyState />
        ) : (
          <>
            {/* 선배 이름·학과·상태 표시 헤더 */}
            <ChatHeader senior={selectedSenior} />

            {/* 메시지 버블 스크롤 영역
                isLoading=true 이면 MessageSkeleton 표시 */}
            <MessageArea
              messages={messages}
              selectedConn={selectedConn}
              selectedSenior={selectedSenior}
              scrollContainerRef={scrollContainerRef}
              isLoading={isLoadingMessages}
            />

            {/* 하단 입력창
                onCoffeeChatOpen → showCoffeeChat=true → CoffeeChatModal 표시 */}
            <MessageInput
              selectedConn={selectedConn}
              selectedSenior={selectedSenior}
              input={input}
              isSending={isSending}
              onInputChange={setInput}
              onSubmit={handleSend}
              onCoffeeChatOpen={() => setShowCoffeeChat(true)}
            />

            {/* 커피챗 일정 예약 모달
                position: absolute → 채팅 패널(position: relative) 안에서 가운데 정렬
                seniorName: selectedSenior.name → "[이름] 선배님과 커피챗" 제목에 사용 */}
            {showCoffeeChat && (
              <CoffeeChatModal
                seniorName={selectedSenior?.name ?? "선배"}
                onClose={() => setShowCoffeeChat(false)}
              />
            )}

            {/* 채팅창 하단 학교명 푸터 */}
            <ChatFooter />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * MessagesPage
 * useSearchParams()는 클라이언트 전용이므로 Suspense로 감싸서 SSR 에러 방지
 */
export default function MessagesPage() {
  return (
    <Suspense fallback={<div />}>
      <MessagesPageInner />
    </Suspense>
  );
}
