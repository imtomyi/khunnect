// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  MentoringSchedule.tsx — 멘토링 가능 시간 캘린더 컴포넌트                   ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    이번 주 7일을 달력 형태로 표시하고, 선배의 멘토링 가능 날짜와              ║
// ║    시간 슬롯을 보여준다. 사용자가 날짜를 선택하면 부모에게 전달한다.           ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    부모(seniors/[id]/page.tsx)                                             ║
// ║      ↓ selectedDate, onSelectDate                                         ║
// ║    MentoringSchedule                                                      ║
// ║      ↓ 내부: MOCK_SLOTS, MOCK_AVAILABLE_DAY_INDICES (목 데이터)            ║
// ║              getWeekDates() — 오늘 기준 이번 주 Date 배열 반환              ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - ../_lib/constants : MOCK_SLOTS, MOCK_AVAILABLE_DAY_INDICES, DAY_LABELS║
// ║    - ../_lib/utils     : getWeekDates                                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
// MOCK_SLOTS: 표시할 시간 슬롯 문자열 배열 (예: "오전 10:00 – 11:00")
// MOCK_AVAILABLE_DAY_INDICES: 멘토링 가능 요일 인덱스 Set (0=일, 6=토)
// DAY_LABELS: 요일 레이블 배열 ["일", "월", "화", "수", "목", "금", "토"]
import { MOCK_SLOTS, MOCK_AVAILABLE_DAY_INDICES, DAY_LABELS } from "../_lib/constants";
// getWeekDates: 오늘 기준으로 이번 주 일요일~토요일의 Date 객체 배열 반환
import { getWeekDates } from "../_lib/utils";

/** 컴포넌트 Props 타입 */
type MentoringScheduleProps = {
  /** 현재 선택된 날짜 (일 단위 숫자, 미선택 시 null) */
  selectedDate: number | null;
  /** 날짜 버튼 클릭 시 부모에게 선택된 날짜를 전달하는 콜백 */
  onSelectDate: (date: number) => void;
};

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/** 섹션 헤더 행 — 아이콘 + 제목 좌우 나열 */
const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "20px",
};

/** 섹션 제목 스타일 */
const sectionTitleStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1F1A1A",
};

/** 달력 + 시간 슬롯을 감싸는 카드 */
const cardStyle: CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

/** 7열 달력 그리드 */
const calendarGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "6px",
  marginBottom: "24px",
};

/** 요일 레이블 셀 */
const dayLabelCellStyle: CSSProperties = {
  textAlign: "center",
};

/** 요일 텍스트 (일, 월, 화...) */
const dayLabelTextStyle: CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",
  marginBottom: "8px",
};

/** 시간 슬롯 목록 래퍼 */
const slotListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

/** 개별 시간 슬롯 — 기본 */
const slotItemStyle: CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  backgroundColor: "#FFF8F7",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: 600,
  color: "#1F1A1A",
  textAlign: "center",
  cursor: "pointer",
  border: "none",
  transition: "background-color 200ms ease, color 200ms ease",
};

/** 개별 시간 슬롯 — 선택됨 */
const slotItemSelectedStyle: CSSProperties = {
  ...slotItemStyle,
  backgroundColor: "#9A001F",
  color: "#FFFFFF",
};

// ── 헬퍼 함수 ─────────────────────────────────────────────────────────────

/**
 * getDayButtonStyle
 *
 * 달력의 날짜 버튼 스타일을 동적으로 계산.
 * 오늘/선택됨/과거/멘토링가능 여부에 따라 색상을 달리한다.
 *
 * @param date        - 해당 날짜의 Date 객체
 * @param today       - 오늘 날짜 숫자 (일)
 * @param todayStart  - 오늘 자정 Date (과거 여부 비교용)
 * @param selectedDate - 현재 선택된 날짜 숫자 (null이면 미선택)
 * @param dayIndex    - 요일 인덱스 (0=일 ~ 6=토), 멘토링 가능 여부 판별
 */
function getDayButtonStyle(
  date: Date,
  today: number,
  todayStart: Date,
  selectedDate: number | null,
  dayIndex: number
): CSSProperties {
  const dateNum = date.getDate();
  const isPast = date < todayStart;          // 오늘 이전 날짜는 선택 불가
  const isSelected = selectedDate === dateNum;
  const isToday = dateNum === today;
  // MOCK_AVAILABLE_DAY_INDICES: 멘토링 가능 요일 Set — 해당 요일인지 확인
  const isAvailable = MOCK_AVAILABLE_DAY_INDICES.has(dayIndex);

  return {
    width: "100%",
    aspectRatio: "1",              // 정사각형 유지
    borderRadius: "10px",
    // 오늘 날짜에만 테두리 강조 (선택 상태가 아닐 때)
    border: isToday && !isSelected ? "2px solid #9A001F" : "none",
    cursor: isPast ? "default" : "pointer", // 과거 날짜는 클릭 불가 커서
    fontSize: "14px",
    fontWeight: 600,
    transition: "background-color 200ms ease, color 200ms ease, box-shadow 200ms ease",
    // 우선순위: 선택됨 > 오늘 > 기본
    backgroundColor: isSelected
      ? "#9A001F"   // 선택: 브랜드 레드
      : isToday
      ? "#FFFFFF"   // 오늘: 흰 배경 + 테두리
      : "#FFF8F7",  // 기본: 연한 크림 핑크
    color: isSelected
      ? "#FFFFFF"   // 선택: 흰 텍스트
      : isToday
      ? "#9A001F"   // 오늘: 레드 텍스트
      : isPast
      ? "#D1C4C4"   // 과거: 연한 회색 (비활성 표시)
      : "#916F6E",  // 미래: 갈색 계열
    boxShadow: "none",
  };
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * MentoringSchedule
 *
 * 이번 주 달력과 멘토링 가능 시간 슬롯을 표시하는 섹션.
 * 날짜를 클릭하면 onSelectDate 콜백으로 부모의 selectedDate를 업데이트한다.
 *
 * @param selectedDate - 현재 선택된 날짜 (부모 state 반영)
 * @param onSelectDate - 날짜 선택 시 부모에게 전달하는 콜백
 */
export default function MentoringSchedule({ selectedDate, onSelectDate }: MentoringScheduleProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().getDate();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 주간 범위 레이블 (예: "4월 7일 - 4월 13일")
  const first = weekDates[0];
  const last = weekDates[6];
  const weekLabel = first.getMonth() === last.getMonth()
    ? `${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getDate()}일`
    : `${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1}월 ${last.getDate()}일`;

  return (
    <section>
      {/* 섹션 헤더: 달력 아이콘 + 제목 */}
      <div style={sectionHeaderStyle}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1A1A" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <h2 style={sectionTitleStyle}>멘토링 가능 시간</h2>
      </div>

      <div style={cardStyle}>
        {/* ── 주간 네비게이션 ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            disabled={weekOffset <= 0}
            style={{ background: "none", border: "none", cursor: weekOffset <= 0 ? "default" : "pointer", padding: "4px", opacity: weekOffset <= 0 ? 0.3 : 1 }}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="#5C3F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#1F1A1A" }}>{weekLabel}</span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="#5C3F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* ── 주간 달력 그리드 ── */}
        <div style={calendarGridStyle}>
          {DAY_LABELS.map((label, i) => (
            <div key={label} style={dayLabelCellStyle}>
              <p style={dayLabelTextStyle}>{label}</p>
              <button
                onClick={() =>
                  !weekDates[i] || weekDates[i] < todayStart
                    ? undefined
                    : onSelectDate(weekDates[i].getDate())
                }
                style={getDayButtonStyle(weekDates[i], today, todayStart, selectedDate, i)}
              >
                {weekDates[i].getDate()}
              </button>
            </div>
          ))}
        </div>

        {/* ── 시간 슬롯 목록 ── */}
        {/* MOCK_SLOTS: 선배의 멘토링 가능 시간대 목 데이터 */}
        <div style={slotListStyle}>
          {MOCK_SLOTS.map((slot) => (
            <button
              key={slot}
              style={selectedSlot === slot ? slotItemSelectedStyle : slotItemStyle}
              onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
