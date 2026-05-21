/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/calendar/page.tsx                                      ║
║  역할: 멘토링 일정 관리 캘린더 페이지                                         ║
║        선배와의 약속 날짜를 선택하고 메모를 작성/저장할 수 있다               ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - addRecentActivity() → @/lib/recentActivity                              ║
║        마운트 시 최근 활동 목록에 "멘토링 캘린더" 항목을 기록                 ║
║    - 메모 저장 기능은 현재 UI만 구현됨 (실제 저장 로직 미구현 — 버튼만 존재)  ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - Next.js App Router: (main) 그룹의 "/calendar" 경로에 자동 매핑          ║
║    - src/app/(main)/layout.tsx 가 이 페이지를 감싼다                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 훅 ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

// ── 유틸리티: 최근 활동 기록 (로컬스토리지 기반) ─────────────────────────────
import { addRecentActivity } from "@/lib/recentActivity";

// ── React CSS 타입 ────────────────────────────────────────────────────────────
import type { CSSProperties } from "react";

/** 월 이름 배열: Date.getMonth()의 반환값(0-11)을 한국어 월명으로 변환 */
const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

/** 요일 레이블 배열: 일요일부터 시작하는 영문 약어 */
const DAY_LABELS  = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/**
 * CalendarPage
 *
 * 멘토링 일정 및 메모 페이지.
 * - 좌측: 월별 캘린더 (이전/다음 달 이동, 날짜 선택)
 * - 우측: 선택된 날짜의 메모 입력 패널
 *
 * 마운트 시 최근 활동 목록에 이 페이지 방문을 자동 기록한다.
 */
export default function CalendarPage() {
  // ── 마운트 시 최근 활동 등록 ──────────────────────────────────────────────
  useEffect(() => {
    // 홈 화면의 "최근 활동" 카드에 이 페이지가 표시되도록 로컬스토리지에 기록
    addRecentActivity({
      id: "calendar",
      label: "멘토링 캘린더",
      sub: "일정 및 메모",
      href: "/calendar",
      type: "calendar",
    });
  }, []); // 마운트 시 1회만 실행

  // ── 오늘 날짜 (시간 제외, 날짜 비교용) ────────────────────────────────────
  const todayReal = new Date();
  todayReal.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 초기화하여 날짜만 비교

  // ── 상태 변수 ─────────────────────────────────────────────────────────────

  /**
   * 현재 달력에 보여지는 연/월.
   * 이전/다음 달 버튼 클릭 시 업데이트된다.
   * 초기값: 오늘 날짜가 속한 달의 1일
   */
  const [viewDate, setViewDate] = useState(new Date(todayReal.getFullYear(), todayReal.getMonth(), 1));

  /** 사용자가 클릭하여 선택한 날짜 (null이면 미선택) */
  const [selectedDate, setSelected] = useState<Date | null>(null);

  /** 선택된 날짜에 작성할 메모 텍스트 */
  const [memo, setMemo] = useState("");

  // ── 달력 계산 ─────────────────────────────────────────────────────────────

  /** 현재 보여지는 달의 연도 */
  const year  = viewDate.getFullYear();

  /** 현재 보여지는 달 (0-11) */
  const month = viewDate.getMonth();

  /** 이달 1일이 무슨 요일인지 (0=일, 6=토) → 달력 앞에 빈 셀 수를 결정 */
  const firstDay    = new Date(year, month, 1).getDay();

  /** 이달의 총 일수 (28~31) */
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /**
   * 달력 그리드를 구성하는 셀 배열.
   * - 이달 1일 전 빈 칸(null)을 firstDay개 추가
   * - 이후 1~daysInMonth까지 날짜 숫자 추가
   * 예) 1일이 수요일이면 앞에 null 3개 + 날짜 순서
   */
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),                             // 빈 칸 (첫 주의 앞 부분)
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),  // 1일~말일
  ];

  /**
   * 주어진 날짜가 오늘인지 확인한다.
   * @param day - 확인할 날짜 숫자
   */
  const isToday = (day: number) => {
    const d = new Date(year, month, day);
    return d.getTime() === todayReal.getTime();  // 밀리초 단위로 동일한 날짜인지 비교
  };

  /**
   * 주어진 날짜가 현재 선택된 날짜인지 확인한다.
   * @param day - 확인할 날짜 숫자
   */
  const isSelected = (day: number) =>
    selectedDate
      ? selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day
      : false;

  /**
   * 선택된 날짜를 "YYYY년 M월 D일" 형식으로 포맷하여 반환한다.
   * 선택된 날짜가 없으면 null을 반환한다.
   */
  const formatSelectedDate = () => {
    if (!selectedDate) return null;
    return `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  };

  /* ── 인라인 스타일 상수들 ─────────────────────────────────────────────── */

  /** 페이지 루트: 세로 방향 레이아웃 */
  const pageStyle: CSSProperties = {
    fontFamily: "var(--font-roboto), sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  /** 달력 + 메모 패널을 가로로 배치하는 래퍼 */
  const wrapStyle: CSSProperties = {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
  };

  /** 달력 카드 스타일 (흰 배경, 둥근 모서리, 그림자) */
  const calCardStyle: CSSProperties = {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "28px 24px 150px 24px",  // 하단 여유 공간 확보
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  /** 달력 상단 헤더 (이전 버튼 / 연월 제목 / 다음 버튼) */
  const calHeaderStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "48px",
  };

  /** 연월 제목 텍스트 스타일 */
  const calTitleStyle: CSSProperties = {
    fontSize: "30px",
    fontWeight: 700,
    color: "#1F1A1A",
  };

  /** 이전/다음 달 이동 버튼 기본 스타일 */
  const navBtnStyle: CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    alignItems: "center",
  };

  /** 7열 그리드 (요일 헤더 + 날짜 셀 공통 사용) */
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "12px 0",
  };

  /** 요일 레이블 (SUN ~ SAT) 스타일 */
  const dayLabelStyle: CSSProperties = {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 600,
    color: "#9CA3AF",
    paddingBottom: "20px",
  };

  /** 오른쪽 메모 패널 영역 */
  const rightPanelStyle: CSSProperties = {
    width: "280px",
    flexShrink: 0,          // 달력이 늘어날 때 메모 패널 너비 유지
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  /** 선택된 날짜 표시 레이블 (왼쪽 빨강 보더 포함) */
  const dateLabelStyle: CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1F1A1A",
    borderLeft: "3px solid #9A001F",  // 브랜드 빨강 왼쪽 강조선
    paddingLeft: "12px",
  };

  /** 메모 입력 카드 */
  const memoCardStyle: CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  /** 메모 textarea 기본 스타일 (테두리 없음) */
  const textareaStyle: CSSProperties = {
    width: "100%",
    minHeight: "140px",
    border: "none",
    outline: "none",
    resize: "none",           // 사용자가 크기를 바꾸지 못하도록
    fontSize: "14px",
    color: "#1F1A1A",
    fontFamily: "inherit",
    backgroundColor: "transparent",
    boxSizing: "border-box",
  };

  /** 저장하기 버튼 스타일 */
  const saveBtnStyle: CSSProperties = {
    alignSelf: "flex-end",         // 카드 오른쪽 끝에 정렬
    backgroundColor: "#C7002B",    // 브랜드 빨강
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <div style={pageStyle}>
      {/* placeholder 색상을 연한 브랜드 컬러로 설정하는 전역 스타일 */}
      <style>{`.cal-memo::placeholder { color: #5C3F3F80; }`}</style>

      {/* 페이지 타이틀 섹션 */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: "6px" }}>
          CALENDAR
        </p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1F1A1A" }}>
          멘토링 일정 및 메모
        </h1>
      </div>

      <div style={wrapStyle}>
        {/* ── 달력 카드 ── */}
        <div style={calCardStyle}>
          {/* 달력 상단: 이전 달 / 연월 / 다음 달 버튼 */}
          <div style={calHeaderStyle}>
            {/* 이전 달 버튼: month - 1로 viewDate 업데이트 */}
            <button style={navBtnStyle} onClick={() => setViewDate(new Date(year, month - 1, 1))}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="15" viewBox="0 0 10 15" fill="none">
                <path d="M7.5 15L0 7.5L7.5 0L9.25 1.75L3.5 7.5L9.25 13.25L7.5 15Z" fill="#5C3F3F"/>
              </svg>
            </button>
            {/* 현재 연도와 월 표시 */}
            <span style={calTitleStyle}>{year}년 {MONTH_NAMES[month]}</span>
            {/* 다음 달 버튼: month + 1로 viewDate 업데이트 (화살표를 180도 회전하여 오른쪽 방향으로 표시) */}
            <button style={navBtnStyle} onClick={() => setViewDate(new Date(year, month + 1, 1))}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="15" viewBox="0 0 10 15" fill="none" style={{ transform: "rotate(180deg)" }}>
                <path d="M7.5 15L0 7.5L7.5 0L9.25 1.75L3.5 7.5L9.25 13.25L7.5 15Z" fill="#5C3F3F"/>
              </svg>
            </button>
          </div>

          {/* 요일 헤더: SUN ~ SAT */}
          <div style={gridStyle}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={dayLabelStyle}>{d}</div>
            ))}
          </div>

          {/* 날짜 그리드: null이면 빈 셀, 숫자면 날짜 버튼 */}
          <div style={gridStyle}>
            {cells.map((day, i) => {
              const today = day !== null && isToday(day);    // 오늘 날짜인지
              const sel   = day !== null && isSelected(day); // 선택된 날짜인지

              return (
                <div key={i} style={{ display: "flex", justifyContent: "center", paddingBottom: "4px" }}>
                  <button
                    onClick={() => day !== null && setSelected(new Date(year, month, day))}
                    disabled={day === null}  // 빈 셀은 클릭 불가
                    style={{
                      width: "75px",
                      height: "75px",
                      borderRadius: "12px",
                      // 오늘 날짜이고 선택되지 않은 경우: 빨강 테두리로 표시
                      border: today && !sel ? "1.5px solid #9A001F" : "none",
                      cursor: day !== null ? "pointer" : "default",
                      fontSize: "16px",
                      fontWeight: 600,
                      // 선택된 날짜: 빨강 배경 + 흰 글씨 / 나머지: 투명 배경
                      backgroundColor: sel ? "#9A001F" : "transparent",
                      color: sel ? "#FFFFFF" : day ? "#1F1A1A" : "transparent",
                      transition: "background-color 150ms ease",
                      display: "flex",
                      alignItems: "flex-start",   // 날짜 숫자를 셀 상단에 배치
                      justifyContent: "center",
                      paddingTop: "18px",
                    }}
                  >
                    {/* null이면 빈 문자열, 숫자면 날짜 표시 */}
                    {day ?? ""}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 메모 패널 ── */}
        <div style={rightPanelStyle}>
          {/* 선택된 날짜 표시: 날짜 선택 전이면 현재 연월을 표시 */}
          <p style={dateLabelStyle}>
            {formatSelectedDate() ?? `${year}년 ${MONTH_NAMES[month]}`}
          </p>

          <div style={memoCardStyle}>
            {/* 메모 입력 텍스트에어리어 */}
            <textarea
              className="cal-memo"    // placeholder 색상 커스텀용 클래스
              style={textareaStyle}
              placeholder="새로운 메모를 작성하세요..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
            {/* 저장하기 버튼: 현재 실제 저장 로직 미구현 (UI만 존재) */}
            <button style={saveBtnStyle}>저장하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
