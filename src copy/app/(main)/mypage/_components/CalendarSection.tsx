// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  CalendarSection.tsx — 마이페이지 달력 + 이벤트 섹션                        ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    마이페이지 상단 우측에 위치하는 월간 달력 컴포넌트.                       ║
// ║    현재 달의 날짜 그리드, 이벤트 도트 마커, 다음 이벤트 카드를 표시한다.     ║
// ║    좌우 화살표로 월 이동이 가능하다.                                         ║
// ║                                                                          ║
// ║  상태 변수:                                                                ║
// ║    viewDate — 현재 달력에 표시 중인 연월 (Date 객체)                        ║
// ║               좌우 화살표 클릭 시 전/다음 달로 변경됨                        ║
// ║                                                                          ║
// ║  목 데이터:                                                                ║
// ║    MOCK_EVENTS — 하드코딩된 이벤트 배열 (추후 API 연동 예정)                ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/link : 달력 아이콘 클릭 시 /calendar 페이지 이동                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// useState: viewDate(현재 보여주는 달) 상태 관리
import { useState } from "react";
// Link: 달력 아이콘을 /calendar 페이지로 연결
import Link from "next/link";
import type { CSSProperties } from "react";

// 공유 이벤트 소스 — 홈화면 세션 카드와 동일한 데이터 사용
import { MOCK_EVENTS } from "@/lib/sharedEvents";

/** 달력 헤더의 요일 레이블 (일요일 시작) */
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** 월 이름 배열 — 인덱스와 getMonth() 결과값 일치 */
const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

// ── 헬퍼 함수 ─────────────────────────────────────────────────────────────

/**
 * formatEventDate
 * "YYYY-MM-DD" 형식의 날짜를 "M월 D일" 형태로 변환
 * @param dateStr - "YYYY-MM-DD" 형식 날짜 문자열
 */
function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * getRelativeLabel
 * 이벤트 날짜와 오늘을 비교해 "오늘", "내일", "N일 후" 레이블 반환
 * @param dateStr - 이벤트 날짜 "YYYY-MM-DD"
 * @param today   - 현재 Date 객체 (렌더 시점)
 */
function getRelativeLabel(dateStr: string, today: Date) {
  const d = new Date(dateStr);
  // 밀리초 차이를 일 단위로 변환 (반올림)
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  return `${diff}일 후`;
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * CalendarSection
 *
 * 월간 달력과 다음 이벤트 카드를 표시하는 마이페이지 우측 섹션.
 * viewDate 상태로 표시 중인 달을 관리하며, 좌우 버튼으로 월을 이동한다.
 */
export default function CalendarSection() {
  // today: 렌더 시점 기준 현재 날짜 (변하지 않음)
  const today = new Date();
  // viewDate: 현재 달력이 보여주는 연/월 — 초기값은 오늘 날짜의 달
  const [viewDate, setViewDate] = useState(() => new Date());

  // viewDate에서 연도와 월을 추출
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();  // 0-indexed (0=1월, 11=12월)

  // 해당 달의 1일이 무슨 요일인지 (0=일, 6=토) — 달력 앞 빈칸 개수
  const firstDay     = new Date(year, month, 1).getDay();
  // 해당 달의 마지막 날짜 숫자 (28~31)
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  // 달력 그리드 셀 배열:
  // 앞에 firstDay개의 null(빈칸) + 1~daysInMonth 숫자
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 현재 보는 달에 이벤트가 있는 날짜 Set — 이벤트 도트 마커 표시용
  const eventDateSet = new Set(
    MOCK_EVENTS
      .filter(e => {
        const d = new Date(e.date);
        // 보여주는 달과 연도가 일치하는 이벤트만 필터링
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(e => new Date(e.date).getDate())  // 날짜 숫자만 추출
  );

  // 오늘 날짜를 "YYYY-MM-DD" 문자열로 변환 (이벤트 비교용)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  // 오늘 이후의 가장 가까운 이벤트 — "다음 이벤트 카드"에 표시
  const nextEvent = MOCK_EVENTS.find(e => e.date >= todayStr);

  // ── 인라인 스타일 (컴포넌트 내부 정의) ──
  // 동적으로 변하지 않으므로 컴포넌트 외부로 옮겨도 무방하나
  // CalendarSection 전용이므로 가독성을 위해 내부에 유지

  /** 달력 카드 전체 컨테이너 */
  const containerStyle: CSSProperties = {
    flex: 1,                  // ProfileSection 옆에서 남은 공간 모두 차지
    backgroundColor: "#FCF1F1",
    borderRadius: "20px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  /** 달력 헤더: 제목(좌) + 월 이동 버튼(우) */
  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  /** 달력 제목 스타일 (달력 아이콘 + "캘린더" 텍스트) */
  const titleStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#1F1A1A",
  };

  /** 월 이동 버튼 영역 (이전/현재달명/다음) */
  const navStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "#1F1A1A",
    fontWeight: 500,
  };

  /** 이전/다음 달 이동 화살표 버튼 */
  const navBtnStyle: CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#5C3F3F",
    fontSize: "14px",
    padding: "2px 6px",
    display: "flex",
    alignItems: "center",
  };

  /** 7열 그리드 — 요일 헤더 & 날짜 셀 공통 */
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px 0",
  };

  /** 요일 레이블(S, M, T...) 스타일 */
  const dayLabelStyle: CSSProperties = {
    textAlign: "center",
    fontSize: "11px",
    color: "#9CA3AF",
    fontWeight: 500,
    paddingBottom: "8px",
  };

  /** 이벤트 카드 스타일 — 다음 이벤트 정보 표시 */
  const eventCardStyle: CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    border: "1.5px solid rgba(0, 0, 0, 0.05)",
  };

  /** 이벤트 날짜 레이블 ("오늘 · 4월 5일") — 초록색 강조 */
  const eventDateLabelStyle: CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#4CAF50",
  };

  /** 이벤트 시간 텍스트 */
  const eventTimeStyle: CSSProperties = {
    fontSize: "13px",
    color: "#1F1A1A",
    fontWeight: 500,
  };

  /** 이벤트 제목 텍스트 */
  const eventTitleStyle: CSSProperties = {
    fontSize: "13px",
    color: "#1F1A1A",
  };

  return (
    <div style={containerStyle}>
      {/* ── 달력 헤더 ── */}
      <div style={headerStyle}>
        {/* 달력 아이콘 — 클릭 시 /calendar 페이지로 이동 */}
        <div style={titleStyle}>
          <Link href="/calendar" style={{ display: "flex", alignItems: "center", color: "inherit", textDecoration: "none" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
              <path d="M2.22222 22C1.61111 22 1.08796 21.7846 0.652778 21.3538C0.217593 20.9229 0 20.405 0 19.8V4.4C0 3.795 0.217593 3.27708 0.652778 2.84625C1.08796 2.41542 1.61111 2.2 2.22222 2.2H3.33333V0H5.55556V2.2H14.4444V0H16.6667V2.2H17.7778C18.3889 2.2 18.912 2.41542 19.3472 2.84625C19.7824 3.27708 20 3.795 20 4.4V19.8C20 20.405 19.7824 20.9229 19.3472 21.3538C18.912 21.7846 18.3889 22 17.7778 22H2.22222ZM2.22222 19.8H17.7778V8.8H2.22222V19.8ZM2.22222 6.6H17.7778V4.4H2.22222V6.6ZM10 13.2C9.68518 13.2 9.4213 13.0946 9.20833 12.8837C8.99537 12.6729 8.88889 12.4117 8.88889 12.1C8.88889 11.7883 8.99537 11.5271 9.20833 11.3162C9.4213 11.1054 9.68518 11 10 11C10.3148 11 10.5787 11.1054 10.7917 11.3162C11.0046 11.5271 11.1111 11.7883 11.1111 12.1C11.1111 12.4117 11.0046 12.6729 10.7917 12.8837C10.5787 13.0946 10.3148 13.2 10 13.2ZM5.55556 13.2C5.24074 13.2 4.97685 13.0946 4.76389 12.8837C4.55093 12.6729 4.44444 12.4117 4.44444 12.1C4.44444 11.7883 4.55093 11.5271 4.76389 11.3162C4.97685 11.1054 5.24074 11 5.55556 11C5.87037 11 6.13426 11.1054 6.34722 11.3162C6.56018 11.5271 6.66667 11.7883 6.66667 12.1C6.66667 12.4117 6.56018 12.6729 6.34722 12.8837C6.13426 13.0946 5.87037 13.2 5.55556 13.2ZM14.4444 13.2C14.1296 13.2 13.8657 13.0946 13.6528 12.8837C13.4398 12.6729 13.3333 12.4117 13.3333 12.1C13.3333 11.7883 13.4398 11.5271 13.6528 11.3162C13.8657 11.1054 14.1296 11 14.4444 11C14.7593 11 15.0231 11.1054 15.2361 11.3162C15.4491 11.5271 15.5556 11.7883 15.5556 12.1C15.5556 12.4117 15.4491 12.6729 15.2361 12.8837C15.0231 13.0946 14.7593 13.2 14.4444 13.2ZM10 17.6C9.68518 17.6 9.4213 17.4946 9.20833 17.2837C8.99537 17.0729 8.88889 16.8117 8.88889 16.5C8.88889 16.1883 8.99537 15.9271 9.20833 15.7163C9.4213 15.5054 9.68518 15.4 10 15.4C10.3148 15.4 10.5787 15.5054 10.7917 15.7163C11.0046 15.9271 11.1111 16.1883 11.1111 16.5C11.1111 16.8117 11.0046 17.0729 10.7917 17.2837C10.5787 17.4946 10.3148 17.6 10 17.6ZM5.55556 17.6C5.24074 17.6 4.97685 17.4946 4.76389 17.2837C4.55093 17.0729 4.44444 16.8117 4.44444 16.5C4.44444 16.1883 4.55093 15.9271 4.76389 15.7163C4.97685 15.5054 5.24074 15.4 5.55556 15.4C5.87037 15.4 6.13426 15.5054 6.34722 15.7163C6.56018 15.9271 6.66667 16.1883 6.66667 16.5C6.66667 16.8117 6.56018 17.0729 6.34722 17.2837C6.13426 13.0946 5.87037 17.6 5.55556 17.6ZM14.4444 17.6C14.1296 17.6 13.8657 17.4946 13.6528 17.2837C13.4398 17.0729 13.3333 16.8117 13.3333 16.5C13.3333 16.1883 13.4398 15.9271 13.6528 15.7163C13.8657 15.5054 14.1296 15.4 14.4444 15.4C14.7593 15.4 15.0231 15.5054 15.2361 15.7163C15.4491 15.9271 15.5556 16.1883 15.5556 16.5C15.5556 16.8117 15.4491 17.0729 15.2361 17.2837C15.0231 17.4946 14.7593 17.6 14.4444 17.6Z" fill="#9A001F"/>
            </svg>
          </Link>
          캘린더
        </div>

        {/* 이전/다음 달 이동 버튼 그룹 */}
        <div style={navStyle}>
          {/* 이전 달 이동: month - 1 (JS Date가 자동으로 연도 처리) */}
          <button style={navBtnStyle} onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path d="M6 12L0 6L6 0L7.4 1.4L2.8 6L7.4 10.6L6 12Z" fill="#5C3F3F"/>
            </svg>
          </button>
          {/* 현재 표시 중인 월/연도 */}
          <span>{MONTH_NAMES[month]} {year}</span>
          {/* 다음 달 이동: rotate(180deg)로 동일한 SVG 아이콘을 반전 사용 */}
          <button style={navBtnStyle} onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ transform: "rotate(180deg)" }}>
              <path d="M6 12L0 6L6 0L7.4 1.4L2.8 6L7.4 10.6L6 12Z" fill="#5C3F3F"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── 요일 헤더 (S M T W T F S) ── */}
      <div style={gridStyle}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={dayLabelStyle}>{d}</div>
        ))}
      </div>

      {/* ── 날짜 그리드 ── */}
      <div style={gridStyle}>
        {cells.map((day, i) => {
          // 오늘 날짜 여부 — 연/월/일 모두 일치해야 함
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          // 이벤트 도트 표시 여부 — null 셀(빈칸)은 제외
          const hasEvent = day !== null && eventDateSet.has(day);

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", paddingBottom: "4px" }}>
              {/* 날짜 원형 셀 */}
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                // 오늘: 초록 배경, 이벤트 있는 날: 연한 초록, 기본: 투명
                backgroundColor: isToday ? "#22C55E" : hasEvent ? "#4CAF501A" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                // 오늘: 흰 텍스트, 날짜 없는 빈칸: 투명(렌더 제외)
                color: isToday ? "#FFFFFF" : day ? "#1F1A1A" : "transparent",
                fontWeight: isToday ? 700 : 400,
              }}>
                {/* null이면 빈 문자열 — 그리드 칸 유지용 */}
                {day ?? ""}
              </div>
              {/* 이벤트 도트 마커 — 날짜 아래에 작은 초록 점으로 이벤트 유무 표시 */}
              {hasEvent && (
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4CAF50", marginTop: "-5px" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── 다음 이벤트 카드 ── */}
      {/* nextEvent가 없으면(오늘 이후 이벤트 없음) 카드를 표시하지 않음 */}
      {nextEvent && (
        <div style={eventCardStyle}>
          {/* "오늘 · 4월 5일" 형태의 상대적 날짜 레이블 */}
          <p style={eventDateLabelStyle}>
            {getRelativeLabel(nextEvent.date, today)} · {formatEventDate(nextEvent.date)}
          </p>
          {/* 이벤트 시작 시간 */}
          <p style={eventTimeStyle}>{nextEvent.time}</p>
          {/* 이벤트 설명 (description 우선, 없으면 title) */}
          <p style={eventTitleStyle}>{nextEvent.description ?? nextEvent.title}</p>
        </div>
      )}
    </div>
  );
}
