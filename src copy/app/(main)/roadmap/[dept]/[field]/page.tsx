/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/roadmap/[dept]/[field]/page.tsx                      ║
║  역할: 특정 세부 분야(트랙)의 커리어 로드맵 상세 페이지                     ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    URL 파라미터 [dept] + [field]                                             ║
║    → getTrackCourses(deptName, fieldId) 호출 (서비스 레이어)                 ║
║    → buildTrackFromCourses()로 RoadmapCourse[] → TrackYear[] 변환            ║
║    → TRACK_META로 트랙 메타데이터(제목, 핵심 스킬 등) 조회                  ║
║    → TrackLeftPanel (메타 패널) + TrackCurriculum (연도별 타임라인) 렌더링   ║
║                                                                              ║
║  상태:                                                                       ║
║    years          : 연도별 학기/과목 구조 (백엔드에서 로드)                  ║
║    selectedYear   : 현재 탭/스크롤 위치의 연도 인덱스                        ║
║    selectedCourses: 사용자가 선택(토글)한 과목 키 집합                       ║
║    saved          : 저장 버튼 클릭 후 3초간 확인 상태 표시                   ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/services/roadmap        : getTrackCourses, buildTrackFromCourses       ║
║    - ./_lib/constants          : TRACK_META, DEFAULT_META                    ║
║    - @/types                   : TrackYear 타입                              ║
║    - @/lib/recentActivity      : 최근 방문 기록 추가                         ║
║    - ./_components/TrackBreadcrumb  : 상단 브레드크럼 네비게이션              ║
║    - ./_components/TrackLeftPanel   : 트랙 정보 사이드 패널                  ║
║    - ./_components/TrackCurriculum  : 연도/학기별 과목 타임라인              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// React 핵심 훅 임포트
import React, { useState, useRef, useEffect } from "react";
// Next.js App Router 동적 라우트 파라미터 접근
import { useParams } from "next/navigation";
// 인라인 스타일 타입 지원
import type { CSSProperties } from "react";
// 로드맵 과목 데이터 조회 및 UI용 구조 변환 서비스 함수
import { getTrackCourses, buildTrackFromCourses } from "@/services/roadmap";
// 트랙별 메타데이터 (제목, 직무 정의, 핵심 스킬, 데이터 인사이트)
import { TRACK_META, DEFAULT_META } from "./_lib/constants";
// 연도별 학기/과목을 담는 UI 구조 타입
import type { TrackYear } from "@/types";
// 상단 브레드크럼 (CAREER PATHS > 트랙명)
import TrackBreadcrumb from "./_components/TrackBreadcrumb";
// 좌측 트랙 정보 패널 (직무 정의, 핵심 스킬, 데이터 인사이트, 선배 링크)
import TrackLeftPanel from "./_components/TrackLeftPanel";
// 우측 커리큘럼 타임라인 (연도 탭 + 학기별 과목 카드)
import TrackCurriculum from "./_components/TrackCurriculum";
// 최근 방문 기록에 이 로드맵 트랙을 추가 (홈 화면 "최근 활동"에 표시)
import { addRecentActivity } from "@/lib/recentActivity";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 페이지 전체 폰트 패밀리 지정
const pageStyle: CSSProperties = {
  fontFamily: "var(--font-roboto), sans-serif",
};

// 내용 영역 최대 너비 제한 및 여백
const contentStyle: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "48px 24px 100px",
};

// 페이지 헤더: 제목 영역과 저장 버튼을 양끝 정렬
const pageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "32px",
};

// 페이지 메인 제목 ("커리어 로드맵") 스타일
const pageTitleStyle: CSSProperties = {
  fontSize: "32px",
  fontWeight: 700,
  color: "#1F1A1A",
};

// "내 로드맵으로 저장" 버튼 기본 스타일
// saved 상태에 따라 배경색/테두리가 동적으로 변경됨
const saveButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "12px 20px",
  minWidth: "180px",
  backgroundColor: "#094F7A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

// 좌측 패널 + 우측 커리큘럼을 가로 배치
const mainContentStyle: CSSProperties = {
  display: "flex",
  gap: "24px",
  alignItems: "stretch",
};

/**
 * RoadmapFieldPage
 *
 * 특정 커리어 트랙(분야)의 연도별 로드맵 상세 페이지.
 * URL: /roadmap/[dept]/[field]  (예: /roadmap/산업디자인학과/ux-ui)
 *
 * 주요 기능:
 * - 마운트 시 서비스에서 과목 데이터를 로드하고 연도/학기 구조로 변환
 * - 최근 방문 기록에 이 트랙을 등록
 * - 스크롤 이벤트로 현재 보이는 연도를 감지해 탭 인디케이터를 동기화
 * - 개별 과목 클릭 시 선택/해제 토글 (Set 기반으로 O(1) 조회)
 * - 저장 버튼 클릭 시 3초간 저장 완료 상태 표시 후 원상복구
 */
export default function RoadmapFieldPage() {
  // URL 파라미터에서 학과명과 분야 ID 추출
  const { dept } = useParams<{ dept: string; field: string }>();
  const deptName = decodeURIComponent(dept);
  // field 파라미터를 별도로 디코딩 (한국어가 아닌 slug 형태: "ux-ui", "ml" 등)
  const fieldId = decodeURIComponent(useParams<{ dept: string; field: string }>().field ?? "");
  // fieldId에 해당하는 트랙 메타데이터 조회 (없으면 기본값 사용)
  const meta = TRACK_META[fieldId] ?? DEFAULT_META;

  // ── 상태 정의 ─────────────────────────────────────────────────────────────
  // 연도별 학기/과목 데이터 (초기값 빈 배열 → 비동기 로드 후 채워짐)
  const [years, setYears] = useState<TrackYear[]>([]);
  // 현재 선택된 연도 탭의 인덱스 (0-based: 0=1학년, 1=2학년...)
  const [selectedYear, setSelectedYear] = useState(0);
  // 사용자가 토글한 과목 키 집합 (`학년-학기-과목명` 형태의 복합키)
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  // 저장 버튼의 완료 상태 (true이면 체크 아이콘 + "저장되었습니다!" 표시)
  const [saved, setSaved] = useState(false);

  // ── 초기 데이터 로드 ──────────────────────────────────────────────────────
  useEffect(() => {
    // 서비스 레이어에서 학과+분야에 맞는 RoadmapCourse[] 조회
    getTrackCourses(deptName, fieldId).then((courses) => {
      // 플랫 배열을 UI용 연도/학기 계층 구조(TrackYear[])로 변환
      setYears(buildTrackFromCourses(courses));
    });
    // 이 페이지 방문을 최근 활동으로 기록 (홈 화면 표시용)
    addRecentActivity({
      id: `roadmap-${fieldId}`,
      label: meta.title,
      sub: deptName,
      href: `/roadmap/${encodeURIComponent(dept)}/${encodeURIComponent(fieldId)}`,
      type: "roadmap",
    });
  }, [deptName, fieldId]); // 학과 또는 분야가 바뀌면 재로드

  // 메타데이터와 로드된 연도 데이터를 합쳐 track 객체 구성
  const track = { ...meta, years };

  /**
   * toggleCourse
   * 과목 카드 클릭 시 선택 집합에서 추가/제거를 토글.
   * Set를 불변적으로 업데이트하기 위해 새로운 Set를 생성해 반환.
   *
   * @param key - `학년-학기-과목명` 형태의 고유 과목 식별자
   */
  function toggleCourse(key: string) {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      // 이미 선택된 경우 제거, 미선택인 경우 추가
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // 커리큘럼 콘텐츠 영역의 가로 스크롤 컨테이너 ref
  const scrollRef = useRef<HTMLDivElement>(null);
  // 연도 탭 스크롤 컨테이너 ref (콘텐츠 스크롤과 동기화)
  const tabScrollRef = useRef<HTMLDivElement>(null);

  // ── 스크롤 동기화 이펙트 ──────────────────────────────────────────────────
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    /**
     * handleScroll
     * 사용자가 커리큘럼 영역을 좌우로 스크롤할 때 현재 보이는 연도 인덱스를 계산.
     * 컨테이너 너비의 절반 단위로 스냅되므로, scrollLeft를 그 단위로 나눠 인덱스 추출.
     */
    const handleScroll = () => {
      const { scrollLeft, offsetWidth } = container;
      // 각 연도 컬럼은 컨테이너 너비의 50%를 차지 (flex: 0 0 50%)
      const yearIndex = Math.round(scrollLeft / (offsetWidth / 2));
      // 유효 범위 내로 클램핑
      const clampedIdx = Math.max(0, Math.min(yearIndex, track.years.length - 1));
      setSelectedYear(clampedIdx);

      // 탭 컨테이너도 같은 비율로 스크롤 이동 (탭과 콘텐츠 동기화)
      const tabContainer = tabScrollRef.current;
      if (tabContainer) {
        tabContainer.scrollTo({ left: clampedIdx * (tabContainer.offsetWidth / 2), behavior: "smooth" });
      }
    };

    // passive: true로 스크롤 성능 최적화 (preventDefault 불필요)
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [track.years.length]); // 연도 수가 변경될 때만 리스너 재등록

  /**
   * scrollToYear
   * 탭 클릭 또는 이전/다음 버튼 클릭 시 해당 연도로 스크롤 이동.
   * 콘텐츠 영역과 탭 영역을 동시에 이동시켜 동기화 유지.
   *
   * @param idx - 이동할 연도의 인덱스 (0-based)
   */
  function scrollToYear(idx: number) {
    setSelectedYear(idx);
    const container = scrollRef.current;
    if (container) {
      // 각 연도는 컨테이너 너비의 50% 단위로 배치되어 있음
      container.scrollTo({ left: idx * (container.offsetWidth / 2), behavior: "smooth" });
    }
    const tabContainer = tabScrollRef.current;
    if (tabContainer) {
      tabContainer.scrollTo({ left: idx * (tabContainer.offsetWidth / 2), behavior: "smooth" });
    }
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <div style={pageHeaderStyle}>
          <div>
            {/* 브레드크럼: CAREER PATHS / [트랙 영문명] */}
            <TrackBreadcrumb deptName={deptName} breadcrumbField={track.breadcrumbField} />
            <h1 style={pageTitleStyle}>
              커리어 로드맵
            </h1>
          </div>

          {/* 저장 버튼: saved 상태에 따라 스타일 분기 */}
          <button
            style={{
              ...saveButtonStyle,
              // 저장 완료 상태: 흰 배경 + 파란 테두리/텍스트
              // 기본 상태: 파란 배경 + 흰 텍스트
              backgroundColor: saved ? "#FFFFFF" : "#094F7A",
              color: saved ? "#094F7A" : "#FFFFFF",
              border: saved ? "1px solid #094F7A" : "none",
            }}
            onClick={() => {
              setSaved(true);
              // 3초 후 원래 상태로 복구 (임시 피드백 UI 패턴)
              setTimeout(() => setSaved(false), 3000);
            }}
          >
            {/* 저장 완료: 체크 원형 아이콘 / 미저장: 북마크 아이콘 */}
            {saved ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12C2.25 6.61704 6.61704 2.25 12 2.25C17.383 2.25 21.75 6.61704 21.75 12C21.75 17.383 17.383 21.75 12 21.75C6.61704 21.75 2.25 17.383 2.25 12ZM12 3.75C7.44546 3.75 3.75 7.44546 3.75 12C3.75 16.5545 7.44546 20.25 12 20.25C16.5545 20.25 20.25 16.5545 20.25 12C20.25 7.44546 16.5545 3.75 12 3.75Z" fill="#094F7A"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M16.9824 7.67574C17.2996 7.94216 17.3407 8.41525 17.0743 8.73241L10.7743 16.2324C10.6347 16.3986 10.4299 16.4962 10.2128 16.4999C9.99576 16.5036 9.78776 16.4131 9.64254 16.2517L6.94254 13.2517C6.66544 12.9439 6.6904 12.4696 6.99828 12.1925C7.30617 11.9155 7.78038 11.9404 8.05748 12.2483L10.1805 14.6072L15.9257 7.76762C16.1921 7.45046 16.6652 7.40932 16.9824 7.67574Z" fill="#094F7A"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            )}
            {saved ? "저장되었습니다!" : "내 로드맵으로 저장"}
          </button>
        </div>

        {/* 메인 레이아웃: 좌측 정보 패널 + 우측 커리큘럼 타임라인 */}
        <div style={mainContentStyle}>
          {/* 좌측 패널: 트랙 제목, 직무 정의, 핵심 스킬, 데이터 인사이트 */}
          <TrackLeftPanel track={track} deptName={deptName} />
          {/* 우측 커리큘럼: 연도 탭 + 학기별 과목 카드 */}
          <TrackCurriculum
            years={track.years}
            selectedYear={selectedYear}
            selectedCourses={selectedCourses}
            scrollRef={scrollRef}
            tabScrollRef={tabScrollRef}
            onScrollToYear={scrollToYear}
            onToggleCourse={toggleCourse}
          />
        </div>
      </div>
    </div>
  );
}
