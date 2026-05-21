/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: roadmap/[dept]/[field]/_components/TrackLeftPanel.tsx               ║
║  역할: 트랙 상세 페이지 좌측 정보 패널                                       ║
║                                                                              ║
║  표시 섹션 (상→하):                                                          ║
║    1. 트랙 제목 (track.title)                                                ║
║    2. Job Definition (직무 정의 텍스트)                                      ║
║    3. Core Skills (핵심 기술 배지 목록)                                      ║
║    4. Data Insights: 선배들의 필수 강의 (프로그레스 바)                      ║
║    5. "선배에게 질문하기" 링크 버튼 → /seniors?dept=[학과명]                 ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(page.tsx)에서 track(메타 + 연도 데이터)과 deptName을 props로 수신  ║
║    → 트랙 메타데이터만 사용 (years는 사용하지 않음)                          ║
║                                                                              ║
║  의존성:                                                                     ║
║    - next/link          : "선배에게 질문하기" 링크                           ║
║    - ./_lib/constants   : TrackMeta 타입                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// Next.js Link: 클라이언트 사이드 라우팅
import Link from "next/link";
// 인라인 스타일 타입
import type { CSSProperties } from "react";
// 트랙 메타데이터 타입 (title, jobDefinition, coreSkills, dataInsights 포함)
import type { TrackMeta } from "../_lib/constants";

/**
 * TrackLeftPanelProps
 * track은 TrackMeta + years를 합친 형태이지만,
 * 이 컴포넌트는 TrackMeta 필드만 사용함.
 */
type TrackLeftPanelProps = {
  track: TrackMeta;  // 트랙 메타데이터 (제목, 직무 정의, 스킬, 인사이트)
  deptName: string;  // 학과명 ("선배에게 질문하기" 링크 쿼리 파라미터로 사용)
};

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 패널 컨테이너: 고정 너비 320px, 흰 배경, 섹션 간 gap
const panelStyle: CSSProperties = {
  width: "320px",
  flexShrink: 0,           // 부모 flex 컨테이너에서 너비 축소 방지
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "32px 28px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

// 트랙 제목 스타일 (큰 볼드체)
const titleStyle: CSSProperties = {
  fontSize: "26px",
  fontWeight: 700,
  color: "#1F1A1A",
  lineHeight: "1.3",
};

// 섹션 레이블 공통 스타일 ("JOB DEFINITION", "CORE SKILLS" 등)
// 대문자로 표기되며 자간이 넓어 레이블임을 시각적으로 구분
const sectionLabelStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#78716C",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  lineHeight: "16px",
  marginBottom: "8px",
};

// Job Definition 텍스트 스타일
const jobDefinitionTextStyle: CSSProperties = {
  fontSize: "16px",
  color: "#292524",
  fontWeight: 400,
  lineHeight: "26px",
};

// Core Skills 레이블 (sectionLabelStyle 확장)
const coreSkillsLabelStyle: CSSProperties = {
  ...sectionLabelStyle,
  marginBottom: "10px",
};

// 스킬 배지 컨테이너 (줄바꿈 허용)
const skillsWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

// 개별 스킬 배지 스타일
const skillBadgeStyle: CSSProperties = {
  padding: "6px 14px",
  borderRadius: "6px",
  border: "1.5px solid #E5E7EB",
  fontSize: "12px",
  color: "#44403C",
  fontWeight: 600,
  lineHeight: "16px",
  textAlign: "center",
};

// Data Insights 섹션 헤더 (차트 아이콘 + 제목 가로 배치)
const insightsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginBottom: "12px",
};

// "Data Insights: 선배들의 필수 강의" 제목 스타일
const insightsLabelStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#1F1A1A",
};

// 인사이트 항목 목록 세로 배치
const insightsListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

// 각 항목의 레이블(좌) + 퍼센트(우) 가로 배치 행
const insightsRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "4px",
};

// 인사이트 항목 레이블 텍스트 (강의명)
const insightsTextStyle: CSSProperties = {
  fontSize: "10px",
  color: "#78716C",
  fontWeight: 400,
  lineHeight: "15px",
};

// 인사이트 항목 퍼센트 텍스트
const insightsPercentStyle: CSSProperties = {
  fontSize: "10px",
  color: "#78716C",
  fontWeight: 600,
  lineHeight: "15px",
};

// 프로그레스 바 배경 트랙 (회색)
const barTrackStyle: CSSProperties = {
  height: "4px",
  backgroundColor: "#E7E5E4",
  borderRadius: "9999px",
};

// "선배에게 질문하기" 링크 버튼: 파란 배경, 화살표 아이콘 포함
const askLinkStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "16px 0",
  backgroundColor: "#094F7A",   // 파란색 (로드맵 저장 버튼과 동일한 색)
  color: "#FFF",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "24px",
  textAlign: "center",
  textDecoration: "none",
};

/**
 * getBarFillStyle
 * 프로그레스 바 채움 스타일 (percent에 따라 너비 동적 설정)
 *
 * @param percent - 0~100 사이의 숫자 (데이터 인사이트 비율)
 */
function getBarFillStyle(percent: number): CSSProperties {
  return {
    height: "100%",
    width: `${percent}%`,         // percent를 CSS 너비로 직접 변환
    backgroundColor: "#9A001F",   // 브랜드 레드로 채움
    borderRadius: "9999px",
  };
}

/**
 * TrackLeftPanel
 *
 * 트랙 상세 페이지 좌측에 고정되는 정보 패널.
 * 트랙 메타데이터(제목, 직무 정의, 핵심 스킬, 데이터 인사이트)를 표시하고,
 * 하단의 "선배에게 질문하기" 버튼으로 관련 선배 목록 페이지로 이동.
 *
 * @param track    - 트랙 메타데이터
 * @param deptName - 학과명 (선배 목록 필터링 쿼리 파라미터로 사용)
 */
export default function TrackLeftPanel({ track, deptName }: TrackLeftPanelProps) {
  // 선배 목록 링크: 학과명으로 필터링된 선배 목록 페이지
  const seniorsHref = `/seniors?dept=${encodeURIComponent(deptName)}`;

  return (
    <div style={panelStyle}>
      {/* 트랙 제목 */}
      <h2 style={titleStyle}>
        {track.title}
      </h2>

      {/* Job Definition 섹션: 직무 전문가에 대한 한 문장 정의 */}
      <div>
        <p style={sectionLabelStyle}>
          Job Definition
        </p>
        <p style={jobDefinitionTextStyle}>
          {track.jobDefinition}
        </p>
      </div>

      {/* Core Skills 섹션: 핵심 기술 스택 배지 목록 */}
      <div>
        <p style={coreSkillsLabelStyle}>
          Core Skills
        </p>
        <div style={skillsWrapStyle}>
          {track.coreSkills.map((skill) => (
            <span key={skill} style={skillBadgeStyle}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Data Insights 섹션: 선배들의 수강 데이터 기반 필수 강의 비율 */}
      <div>
        <div style={insightsHeaderStyle}>
          {/* 막대 차트 미니 아이콘 (SVG 인라인) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 12V6.75H12V12H9ZM4.5 12V0H7.5V12H4.5ZM0 12V3.75H3V12H0Z" fill="#9A001F"/>
          </svg>
          <p style={insightsLabelStyle}>
            Data Insights: 선배들의 필수 강의
          </p>
        </div>
        <div style={insightsListStyle}>
          {track.dataInsights.map((item) => (
            <div key={item.label}>
              {/* 강의명(좌) + 비율 퍼센트(우) */}
              <div style={insightsRowStyle}>
                <span style={insightsTextStyle}>{item.label}</span>
                <span style={insightsPercentStyle}>{item.percent}%</span>
              </div>
              {/* 프로그레스 바: 배경 트랙 위에 채움 */}
              <div style={barTrackStyle}>
                <div style={getBarFillStyle(item.percent)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 선배에게 질문하기 링크: 해당 학과 선배 목록으로 이동 */}
      <Link href={seniorsHref} style={askLinkStyle}>
        선배에게 질문하기
        {/* 오른쪽 화살표 아이콘 */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z" fill="white"/>
        </svg>
      </Link>
    </div>
  );
}
