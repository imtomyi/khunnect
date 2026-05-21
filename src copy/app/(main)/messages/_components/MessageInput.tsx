"use client";

// ╔══════════════════════════════════════════════════════════════╗
// ║  컴포넌트: MessageInput + CoffeeChatModal                    ║
// ║  위치: messages/page.tsx 하단에 렌더링                        ║
// ║  타입                                                        ║
// ║    ConnectionRequest, Senior ← src/types/index.ts           ║
// ║  외부 노출                                                    ║
// ║    default export  : MessageInput  (하단 입력 UI)            ║
// ║    named  export   : CoffeeChatModal (일정 예약 모달)         ║
// ║      → messages/page.tsx 에서 import해 채팅 패널 안에 렌더링  ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState } from "react";
// 전역 타입 (src/types/index.ts)
import type { ConnectionRequest, Senior } from "@/types";

// ── Props 타입 ───────────────────────────────────────────────────

type MessageInputProps = {
  selectedConn: ConnectionRequest; // 현재 선택된 연결 (현재 미사용, 추후 파일 전송 등에 활용)
  selectedSenior: Senior | null;   // 현재 선택된 선배 (현재 미사용, 추후 프로필 등에 활용)
  input: string;                   // 입력창 텍스트 (messages/page.tsx state에서 관리)
  isSending: boolean;              // 전송 중 여부 (전송 버튼 비활성화 제어)
  onInputChange: (value: string) => void; // 입력 변경 시 messages/page.tsx의 setInput 호출
  onSubmit: (e: React.FormEvent) => void; // 폼 제출 시 messages/page.tsx의 handleSend 호출
  onCoffeeChatOpen: () => void;    // + 패널의 커피챗 버튼 클릭 시 messages/page.tsx의 setShowCoffeeChat(true) 호출
};

// ── 스타일 상수 ──────────────────────────────────────────────────

/** 입력 영역 전체 감싸는 흰 배경 박스 */
const wrapperStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderTop: "1px solid #EFEFEF",
  padding: "12px 20px",
};

/** + 버튼 / 입력창 / 전송 버튼을 가로 배치 */
const formStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

/** + (첨부 패널 토글) 버튼 */
const plusButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
  padding: "0 2px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** 메시지 텍스트 입력 필드 */
const textInputStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#FCF1F1",
  border: "1px solid #FCF1F1",
  borderRadius: "12px",
  padding: "10px 16px",
  fontSize: "14px",
  color: "#1F1A1A",
  outline: "none",
};

/**
 * 전송 버튼 스타일 함수
 * @param hasInput - 입력값 존재 여부에 따라 cursor 변경
 */
const sendButtonStyle = (hasInput: boolean): React.CSSProperties => ({
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  backgroundColor: "#9A001F",
  cursor: hasInput ? "pointer" : "not-allowed",
  transition: "background-color 150ms ease",
  boxShadow: "0 4px 12px 0 rgba(199, 0, 43, 0.20)",
});

/**
 * 첨부 패널 (파일·커피챗 버튼 목록)
 * paddingLeft: 65px → 파일 버튼 오른쪽 오프셋 조정
 * gap: 70px        → 파일 ↔ 커피챗 버튼 간격
 */
const attachPanelStyle: React.CSSProperties = {
  display: "flex",
  gap: "70px",
  padding: "16px 4px 4px",
  paddingLeft: "65px",
};

/** 첨부 패널 각 버튼 (아이콘 + 라벨 세로 배치) */
const attachItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  cursor: "pointer",
};

/** 첨부 버튼 아이콘 원형 배경 */
const attachIconWrapStyle: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  backgroundColor: "#F4F4F4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** 첨부 버튼 라벨 텍스트 */
const attachLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#5C3F3F",
  fontWeight: 400,
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  CoffeeChatModal — 커피챗 일정 예약 모달                      ║
// ║  messages/page.tsx의 chatPanel(position:relative) 안에서     ║
// ║  position:absolute로 렌더링 → 채팅 패널 가운데 정렬           ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * generateDates — 오늘부터 14일간의 날짜 문자열 배열 생성
 * 예) ["4월 3일 목요일", "4월 4일 금요일", ...]
 */
function generateDates(): string[] {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}요일`;
  });
}

/** 커피챗 시간 선택지 (오전 8시 ~ 오후 7시) */
const TIMES = [
  "오전 8:00", "오전 9:00", "오전 10:00", "오전 11:00",
  "오후 12:00", "오후 1:00", "오후 2:00", "오후 3:00",
  "오후 4:00", "오후 5:00", "오후 6:00", "오후 7:00",
];

/** 약속 전 알림 시간 선택지 */
const REMINDERS = ["5분 전", "10분 전", "30분 전", "1시간 전", "없음"];

// ── DropdownRow ─────────────────────────────────────────────────

type DropdownRowProps = {
  label: string;          // 행 왼쪽 레이블 (예: "날짜")
  value: string;          // 현재 선택된 값
  options: string[];      // 드롭다운 옵션 목록
  isOpen: boolean;        // 드롭다운 열림 여부 (부모에서 관리)
  onToggle: () => void;   // 행 클릭 시 열기/닫기 토글
  onSelect: (val: string) => void; // 옵션 선택 시 값 업데이트
};

/**
 * DropdownRow — 라벨 + 선택값 + 화살표 아이콘 + 드롭다운 목록
 * isOpen=true 이면 옵션 목록이 absolute로 아래에 표시됨
 */
function DropdownRow({ label, value, options, isOpen, onToggle, onSelect }: DropdownRowProps) {
  return (
    <div style={{ position: "relative" }}>
      {/* 클릭하면 onToggle 호출 → 부모(CoffeeChatModal)의 openDropdown 상태 변경 */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
          cursor: "pointer",
          borderBottom: "2px solid #F3B8B8",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "20px", fontWeight: 800, color: "#1F1A1A" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px", color: "#1F1A1A", fontWeight: 400 }}>{value}</span>
          {/* 열림 상태에 따라 화살표 방향 전환 */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 200ms" }}
          >
            <path d="M6 9L12 15L18 9" stroke="#9A001F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 옵션 목록: 현재 선택값은 강조 표시 */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          border: "1px solid #F3B8B8",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          zIndex: 10,
          maxHeight: "200px",
          overflowY: "auto",
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onSelect(opt); }}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                color: opt === value ? "#9A001F" : "#1F1A1A",
                fontWeight: opt === value ? 600 : 400,
                cursor: "pointer",
                backgroundColor: opt === value ? "#FCF1F1" : "transparent",
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CoffeeChatModal ─────────────────────────────────────────────

type CoffeeChatModalProps = {
  seniorName: string; // messages/page.tsx의 selectedSenior.name → 제목에 "[이름] 선배님과 커피챗"
  onClose: () => void; // 닫기 시 messages/page.tsx의 setShowCoffeeChat(false) 호출
};

/**
 * CoffeeChatModal — 커피챗 날짜·시간·알림 설정 모달
 * - position: absolute → 부모(chatPanel, position:relative) 기준 가운데 정렬
 * - 배경 클릭 또는 X/완료 버튼으로 닫힘
 * - openDropdown: 동시에 하나의 드롭다운만 열리도록 단일 상태로 관리
 */
export function CoffeeChatModal({ seniorName, onClose }: CoffeeChatModalProps) {
  const dates = generateDates();
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState("오전 10:00");
  const [selectedReminder, setSelectedReminder] = useState("30분 전");
  /** 현재 열린 드롭다운 이름: "date" | "time" | "reminder" | null */
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  /**
   * toggleDropdown — 같은 드롭다운 재클릭 시 닫고, 다른 드롭다운 클릭 시 전환
   */
  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "70px",
        zIndex: 100,
        animation: "coffeeChatOverlay 0.2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setOpenDropdown(null);
        }
      }}
    >
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        padding: "32px 40px 45px",
        width: "800px",
        height: "700px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        position: "relative",
        animation: "coffeeChatModal 0.2s ease",
      }}>
        <style>{`
          @keyframes coffeeChatOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes coffeeChatModal {
            from { opacity: 0; transform: translateY(-12px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* 닫기(X) 버튼 */}
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "20px", display: "block" }}
        >
          <svg width="45" height="45" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#9A001F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* 모달 제목: seniorName prop → "[이름] 선배님과 커피챗" */}
        <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#1F1A1A", marginBottom: "8px" }}>
          {seniorName} 선배님과 커피챗
        </h2>

        {/* 세 개의 DropdownRow: 날짜 / 시간 / 알림 */}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "80px" }}>
          <DropdownRow
            label="날짜"
            value={selectedDate}
            options={dates}
            isOpen={openDropdown === "date"}
            onToggle={() => toggleDropdown("date")}
            onSelect={(v) => { setSelectedDate(v); setOpenDropdown(null); }}
          />
          <DropdownRow
            label="시간"
            value={selectedTime}
            options={TIMES}
            isOpen={openDropdown === "time"}
            onToggle={() => toggleDropdown("time")}
            onSelect={(v) => { setSelectedTime(v); setOpenDropdown(null); }}
          />
          <DropdownRow
            label="약속 전 나에게 알림"
            value={selectedReminder}
            options={REMINDERS}
            isOpen={openDropdown === "reminder"}
            onToggle={() => toggleDropdown("reminder")}
            onSelect={(v) => { setSelectedReminder(v); setOpenDropdown(null); }}
          />
        </div>

        {/* 완료 버튼: 현재는 onClose 호출 (추후 API 연동 예정) */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "40px" }}>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 32px",
              borderRadius: "10px",
              backgroundColor: "#9A001F",
              color: "#FFFFFF",
              border: "none",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(154,0,31,0.35)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="white"/>
            </svg>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  AcceptedForm — 실제 메시지 입력 UI (+ 버튼, 입력창, 전송)    ║
// ║  MessageInput 내부에서만 사용되는 private 컴포넌트            ║
// ╚══════════════════════════════════════════════════════════════╝

function AcceptedForm({ input, isSending, onInputChange, onSubmit, onCoffeeChatOpen }: {
  input: string;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** 커피챗 버튼 클릭 시 부모(MessageInput → messages/page.tsx)로 이벤트 전달 */
  onCoffeeChatOpen: () => void;
}) {
  /** + 버튼 클릭 시 첨부 패널(파일·커피챗) 토글 */
  const [showAttach, setShowAttach] = useState(false);
  /** 공백 제거 후 텍스트가 있는지 여부 → 전송 버튼 활성화 제어 */
  const hasInput = Boolean(input.trim());

  return (
    <div>
      <form onSubmit={onSubmit} style={formStyle}>
        {/* + 버튼: 첨부 패널 열기/닫기 */}
        <button
          type="button"
          style={plusButtonStyle}
          onClick={() => setShowAttach((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            style={{ transition: "transform 200ms ease", transform: showAttach ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            <path d="M12 5V19" stroke="#9A001F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="#9A001F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 메시지 입력 필드: 값은 messages/page.tsx의 input state와 양방향 연결 */}
        <style>{`.msg-input::placeholder { color: #5C3F3F80; }`}</style>
        <input
          className="msg-input"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          style={textInputStyle}
        />

        {/* 전송 버튼: 입력값 없거나 전송 중이면 비활성화 */}
        <button
          type="submit"
          disabled={!hasInput || isSending}
          style={sendButtonStyle(hasInput)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {/* 첨부 패널: + 버튼 클릭 시 슬라이드 업 */}
      <div style={{
        ...attachPanelStyle,
        maxHeight: showAttach ? "120px" : "0",
        opacity: showAttach ? 1 : 0,
        overflow: "hidden",
        paddingTop: showAttach ? "16px" : "0",
        paddingBottom: showAttach ? "4px" : "0",
        transition: "max-height 250ms ease, opacity 200ms ease, padding 250ms ease",
      }}>
          {/* 파일 버튼: 현재 UI만 구현, 실제 업로드 기능은 미연동 */}
          <button type="button" style={attachItemStyle}>
            <div style={attachIconWrapStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="20" viewBox="0 0 13 20" fill="none">
                <path d="M12.5 13.75C12.5 15.4833 11.8917 16.9583 10.675 18.175C9.45833 19.3917 7.98333 20 6.25 20C4.51667 20 3.04167 19.3917 1.825 18.175C0.608333 16.9583 0 15.4833 0 13.75V4.5C0 3.25 0.4375 2.1875 1.3125 1.3125C2.1875 0.4375 3.25 0 4.5 0C5.75 0 6.8125 0.4375 7.6875 1.3125C8.5625 2.1875 9 3.25 9 4.5V13.25C9 14.0167 8.73333 14.6667 8.2 15.2C7.66667 15.7333 7.01667 16 6.25 16C5.48333 16 4.83333 15.7333 4.3 15.2C3.76667 14.6667 3.5 14.0167 3.5 13.25V4H5.5V13.25C5.5 13.4667 5.57083 13.6458 5.7125 13.7875C5.85417 13.9292 6.03333 14 6.25 14C6.46667 14 6.64583 13.9292 6.7875 13.7875C6.92917 13.6458 7 13.4667 7 13.25V4.5C6.98333 3.8 6.7375 3.20833 6.2625 2.725C5.7875 2.24167 5.2 2 4.5 2C3.8 2 3.20833 2.24167 2.725 2.725C2.24167 3.20833 2 3.8 2 4.5V13.75C1.98333 14.9333 2.39167 15.9375 3.225 16.7625C4.05833 17.5875 5.06667 18 6.25 18C7.41667 18 8.40833 17.5875 9.225 16.7625C10.0417 15.9375 10.4667 14.9333 10.5 13.75V4H12.5V13.75Z" fill="#5C3F3F"/>
              </svg>
            </div>
            <span style={attachLabelStyle}>파일</span>
          </button>

          {/* 커피챗 버튼: 클릭 시 onCoffeeChatOpen 호출 → messages/page.tsx의 showCoffeeChat=true */}
          <button
            type="button"
            style={attachItemStyle}
            onClick={() => { onCoffeeChatOpen(); }}
          >
            <div style={attachIconWrapStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.5 4.5C3.67157 4.5 3 5.17157 3 6V19.5C3 20.3284 3.67157 21 4.5 21H19.5C20.3284 21 21 20.3284 21 19.5V6C21 5.17157 20.3284 4.5 19.5 4.5H4.5ZM1.5 6C1.5 4.34315 2.84315 3 4.5 3H19.5C21.1569 3 22.5 4.34315 22.5 6V19.5C22.5 21.1569 21.1569 22.5 19.5 22.5H4.5C2.84315 22.5 1.5 21.1569 1.5 19.5V6Z" fill="#C7002B"/>
                <path d="M13.875 12C14.4963 12 15 11.4963 15 10.875C15 10.2537 14.4963 9.75 13.875 9.75C13.2537 9.75 12.75 10.2537 12.75 10.875C12.75 11.4963 13.2537 12 13.875 12Z" fill="#C7002B"/>
                <path d="M17.625 12C18.2463 12 18.75 11.4963 18.75 10.875C18.75 10.2537 18.2463 9.75 17.625 9.75C17.0037 9.75 16.5 10.2537 16.5 10.875C16.5 11.4963 17.0037 12 17.625 12Z" fill="#C7002B"/>
                <path d="M13.875 15.75C14.4963 15.75 15 15.2463 15 14.625C15 14.0037 14.4963 13.5 13.875 13.5C13.2537 13.5 12.75 14.0037 12.75 14.625C12.75 15.2463 13.2537 15.75 13.875 15.75Z" fill="#C7002B"/>
                <path d="M17.625 15.75C18.2463 15.75 18.75 15.2463 18.75 14.625C18.75 14.0037 18.2463 13.5 17.625 13.5C17.0037 13.5 16.5 14.0037 16.5 14.625C16.5 15.2463 17.0037 15.75 17.625 15.75Z" fill="#C7002B"/>
                <path d="M6.375 15.75C6.99632 15.75 7.5 15.2463 7.5 14.625C7.5 14.0037 6.99632 13.5 6.375 13.5C5.75368 13.5 5.25 14.0037 5.25 14.625C5.25 15.2463 5.75368 15.75 6.375 15.75Z" fill="#C7002B"/>
                <path d="M10.125 15.75C10.7463 15.75 11.25 15.2463 11.25 14.625C11.25 14.0037 10.7463 13.5 10.125 13.5C9.50368 13.5 9 14.0037 9 14.625C9 15.2463 9.50368 15.75 10.125 15.75Z" fill="#C7002B"/>
                <path d="M6.375 19.5C6.99632 19.5 7.5 18.9963 7.5 18.375C7.5 17.7537 6.99632 17.25 6.375 17.25C5.75368 17.25 5.25 17.7537 5.25 18.375C5.25 18.9963 5.75368 19.5 6.375 19.5Z" fill="#C7002B"/>
                <path d="M10.125 19.5C10.7463 19.5 11.25 18.9963 11.25 18.375C11.25 17.7537 10.7463 17.25 10.125 17.25C9.50368 17.25 9 17.7537 9 18.375C9 18.9963 9.50368 19.5 10.125 19.5Z" fill="#C7002B"/>
                <path d="M13.875 19.5C14.4963 19.5 15 18.9963 15 18.375C15 17.7537 14.4963 17.25 13.875 17.25C13.2537 17.25 12.75 17.7537 12.75 18.375C12.75 18.9963 13.2537 19.5 13.875 19.5Z" fill="#C7002B"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M6 1.5C6.41421 1.5 6.75 1.83579 6.75 2.25V3.75C6.75 4.16421 6.41421 4.5 6 4.5C5.58579 4.5 5.25 4.16421 5.25 3.75V2.25C5.25 1.83579 5.58579 1.5 6 1.5Z" fill="#C7002B"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M18 1.5C18.4142 1.5 18.75 1.83579 18.75 2.25V3.75C18.75 4.16421 18.4142 4.5 18 4.5C17.5858 4.5 17.25 4.16421 17.25 3.75V2.25C17.25 1.83579 17.5858 1.5 18 1.5Z" fill="#C7002B"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M2.25 6.75H21.75V8.25H2.25V6.75Z" fill="#C7002B"/>
              </svg>
            </div>
            <span style={attachLabelStyle}>커피챗</span>
          </button>
      </div>
    </div>
  );
}

// ── MessageInput (default export) ────────────────────────────────

/**
 * MessageInput — 채팅창 하단 입력 영역 컴포넌트
 * - AcceptedForm 렌더링 (+ 버튼, 입력창, 전송 버튼, 첨부 패널)
 * - CoffeeChatModal은 여기서 렌더링하지 않고,
 *   onCoffeeChatOpen 콜백을 통해 messages/page.tsx에서 렌더링
 *   (채팅 패널 position:relative 기준 가운데 정렬을 위해)
 */
export default function MessageInput({ selectedConn, selectedSenior, input, isSending, onInputChange, onSubmit, onCoffeeChatOpen }: MessageInputProps) {
  void selectedConn;    // 현재 미사용 (추후 파일 첨부 기능에 활용 예정)
  void selectedSenior;  // 현재 미사용 (추후 프로필 표시 등에 활용 예정)
  return (
    <div style={wrapperStyle}>
      <AcceptedForm
        input={input}
        isSending={isSending}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onCoffeeChatOpen={onCoffeeChatOpen}
      />
    </div>
  );
}
