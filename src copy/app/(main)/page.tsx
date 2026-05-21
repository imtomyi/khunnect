/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/page.tsx                                               ║
║  역할: 로그인 후 첫 화면인 홈 페이지 (대시보드)                               ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - getCurrentUser()     → @/services/user       현재 로그인 유저 정보 조회  ║
║    - getSeniors()         → @/services/seniors    추천 선배 목록 조회         ║
║    - getCheckedCourses()  → @/services/curriculum 체크(이수)한 과목 ID Set    ║
║    - getPlannedCourses()  → @/services/curriculum 계획에 추가한 과목 ID Set   ║
║    - getCatalogCourses()  → @/services/curriculum 전체 과목 카탈로그          ║
║    - getCurriculumRequirement() → 졸업요건 총 학점 정보                       ║
║    - MOCK_USER            → @/mock               API 실패 시 폴백 유저        ║
║                                                                              ║
║  사용하는 타입: User, CurriculumStatus, Senior, CatalogCourse (@/types)      ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - Next.js App Router의 (main) 레이아웃 아래 "/" 경로에 자동 렌더링         ║
║    - src/app/(main)/layout.tsx 가 이 페이지를 감싼다                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── React 훅 ──────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "@/services/user";
import { MOCK_USER } from "@/mock";
import { getPlannedCourses, getCatalogCourses, getCheckedCourses, getCurriculumRequirement, getCurriculumStatus } from "@/services/curriculum";
import { getSeniors } from "@/services/seniors";
import { getNearestEvent } from "@/lib/sharedEvents";
import type { User, CurriculumStatus, Senior, CatalogCourse } from "@/types";
import { Badge } from "@/components/ui/badge";
import AcademicStatusCard from "./_components/AcademicStatusCard";
import PriorityCoursesCard from "./_components/PriorityCoursesCard";
import RecommendedSeniorCard from "./_components/RecommendedSeniorCard";
import RecentActivities from "./_components/RecentActivities";
import HomeFooter from "./_components/HomeFooter";


/**
 * HomePage
 *
 * 로그인한 사용자의 대시보드 화면.
 * - 학업 현황 (전공기초/필수/선택 이수율)
 * - 커리큘럼 계획 과목 목록
 * - 추천 선배 슬라이드 카드
 * - 최근 활동 이력
 * 총 4개 섹션으로 구성된다.
 */
export default function HomePage() {
  // ── 상태 변수 ─────────────────────────────────────────────────────────────

  /** 현재 로그인한 유저 정보 (이름, 학과 ID 등) */
  const [user, setUser] = useState<User | null>(null);

  /** 학업 현황 데이터: 전공기초/필수/선택별 총 학점 & 이수 학점 */
  const [status, setStatus] = useState<CurriculumStatus | null>(null);

  /** 같은 학과 선배 목록 */
  const [seniors, setSeniors] = useState<Senior[]>([]);

  /** 커리큘럼 시뮬레이터에서 계획으로 추가된 과목 목록 */
  const [checkedCourses, setCheckedCourses] = useState<CatalogCourse[]>([]);

  /** 추천 선배 슬라이더에서 현재 보여지는 선배의 인덱스 */
  const [seniorIndex, setSeniorIndex] = useState(0);

  /** 선배 카드 슬라이드 애니메이션 진행 중 여부 (중복 클릭 방지) */
  const [sliding, setSliding] = useState(false);
  /** sliding의 동기 버전 — React 리렌더 전에도 중복 호출 차단 */
  const slidingRef = useRef(false);

  /** 슬라이드 방향: "left" = 다음 선배, "right" = 이전 선배 */
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");

  // ── 데이터 로드 ──
  useEffect(() => {
    // getCurrentUser 실패 시 MOCK_USER로 폴백하여 개발 환경에서도 동작
    getCurrentUser().catch(() => MOCK_USER).then(async (u) => {
      setUser(u);
      const [fetchedSeniors, checkedIds, plannedIds, catalog, req, calcStatus] = await Promise.all([
        getSeniors({ departmentId: u.department }),
        getCheckedCourses(u.id),
        getPlannedCourses(u.id),
        getCatalogCourses().catch(() => []),
        getCurriculumRequirement().catch(() => null),
        getCurriculumStatus(u.id)
      ]);

      setSeniors(fetchedSeniors);

      // 커리큘럼 계획 카드: 시뮬레이터에서 기록한 과목
      // plannedIds Set에 포함된 과목만 필터링
      setCheckedCourses(catalog.filter((c) => plannedIds.has(c.id)));

      // 학업 현황 카드: API 결과 우선, 없으면 로컬 계산으로 폴백
      if (calcStatus) {
        setStatus(calcStatus);
      } else if (req) {
        // 특정 과목 유형(type) 중 이수된 과목들의 학점 합산 헬퍼
        const sum = (type: string) =>
          catalog.filter(c => c.type === type && checkedIds.has(c.id))
                 .reduce((s, c) => s + c.credits, 0);

        setStatus({
          basic:    { total: req.basic,    completed: sum("전공기초") },
          required: { total: req.required, completed: sum("전공필수") },
          elective: { total: req.elective, completed: sum("전공선택") },
        });
      }
    });
  }, []); // 마운트 시 1회만 실행

  // ── 추천 선배 슬라이드 ──

  /**
   * 특정 인덱스의 선배로 슬라이드 이동.
   * 현재 인덱스와 같거나 이미 슬라이딩 중이면 무시한다.
   * @param index - 이동할 선배의 인덱스
   */
  const goToSenior = (index: number) => {
    if (index === seniorIndex || slidingRef.current) return;

    // ref를 즉시 true로 — React 리렌더 전 중복 호출 차단
    slidingRef.current = true;
    setSlideDir(index > seniorIndex ? "left" : "right");
    setSliding(true);

    // 250ms 애니메이션 후 인덱스 변경 및 슬라이딩 플래그 해제
    setTimeout(() => {
      setSeniorIndex(index);
      setSliding(false);
      slidingRef.current = false;
    }, 250);
  };

  /** 드래그/스와이프 시작 X 좌표 (마우스 및 터치 공통) */
  const dragStartX = useRef<number | null>(null);

  /** 선배 카드 영역 ref — 트랙패드 수평 스크롤(wheel) 감지용 */
  const seniorCardRef = useRef<HTMLDivElement>(null);
  /** wheel 제스처 잠금 — 한 제스처에서 첫 이벤트만 슬라이드로 처리 */
  const wheelLockedRef = useRef(false);
  /** 잠금 해제 타이머 ref */
  const wheelCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 트랙패드 수평 스크롤로 선배 카드 슬라이드
  useEffect(() => {
    const el = seniorCardRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // 수직 스크롤보다 수평 스크롤이 클 때만 처리 (페이지 스크롤과 구분)
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      // 이미 이 제스처에서 슬라이드했으면 타이머만 연장 후 무시
      if (wheelCooldownRef.current) clearTimeout(wheelCooldownRef.current);
      wheelCooldownRef.current = setTimeout(() => {
        wheelLockedRef.current = false; // wheel 이벤트가 300ms 멈추면 다음 제스처 허용
      }, 300);

      if (wheelLockedRef.current) return;

      // 제스처 첫 이벤트 — 슬라이드 실행 후 잠금
      wheelLockedRef.current = true;
      if (e.deltaX > 0) goToSenior((seniorIndex + 1) % seniors.length);
      else goToSenior((seniorIndex - 1 + seniors.length) % seniors.length);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [seniorIndex, seniors.length]);

  /**
   * 드래그/터치 시작 이벤트 핸들러.
   * 시작 X 좌표를 ref에 저장한다.
   * @param clientX - 시작 좌표
   */
  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
  };

  /**
   * 드래그/터치 종료 이벤트 핸들러.
   * 이동 거리(delta)를 계산하여 40px 이상이면 슬라이드를 실행한다.
   * @param clientX - 종료 좌표
   */
  const handleDragEnd = (clientX: number) => {
    if (dragStartX.current === null) return;
    const delta = clientX - dragStartX.current; // 양수: 오른쪽으로 드래그, 음수: 왼쪽으로 드래그
    dragStartX.current = null;

    // 40px 미만의 미세한 움직임은 무시 (실수 클릭 방지)
    if (Math.abs(delta) < 40) return;

    if (delta < 0) {
      // 왼쪽으로 드래그 → 다음 선배로 이동 (범위 초과 방지)
      goToSenior((seniorIndex + 1) % seniors.length);
    } else {
      // 오른쪽으로 드래그 → 이전 선배로 이동 (처음이면 마지막으로 순환)
      goToSenior((seniorIndex - 1 + seniors.length) % seniors.length);
    }
  };

  // ── 전체 수료율 계산 ──

  // 3개 카테고리(기초/필수/선택)의 이수 학점 합계
  // 각 카테고리는 졸업 요건(total)을 초과해도 요건까지만 인정 (초과분 수료율 미반영)
  const totalCompleted = status
    ? Math.min(status.basic.completed, status.basic.total) +
      Math.min(status.required.completed, status.required.total) +
      Math.min(status.elective.completed, status.elective.total)
    : 0;

  // 3개 카테고리의 요구 학점 합계 (0 나누기 방지를 위해 기본값 1)
  const totalRequired = status
    ? status.required.total + status.elective.total + status.basic.total
    : 1;

  /** 전체 전공 수료율 (0~100, 반올림) */
  const overallPct = Math.round((totalCompleted / totalRequired) * 100);

  /** 학업 현황 데이터가 없거나 이수 학점이 0인 경우 (빈 상태 UI 표시용) */
  const isZeroState = !status || totalCompleted === 0;

  /** 커리큘럼 계획 과목이 없는 경우 (빈 상태 UI 표시용) */
  const isPlanZeroState = checkedCourses.length === 0;

  /** 추천 선배 목록이 없는 경우 (빈 상태 UI 표시용) */
  const isSeniorZeroState = seniors.length === 0;

  return (
    <div className="flex flex-col gap-[49.54px]" style={{ fontFamily: "var(--font-roboto), sans-serif" }}>

      {/* ── 인사말 ── */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h1
            style={{
              fontSize: "49.54px",
              fontWeight: 600,
              letterSpacing: "-2.48px",
              lineHeight: "100%",
              color: "#1F1A1A",
            }}
          >
            {/* 유저 이름이 로드되기 전엔 "..."으로 플레이스홀더 표시 */}
            반가워요, {user?.name ?? "..."}님.
          </h1>
          {/* 현재 학기 표시 뱃지 (현재는 하드코딩, 추후 유저 데이터 연동 예정) */}
          <Badge
            variant="outline"
            className="rounded-full border-none text-sm px-3 py-1 shrink-0"
            style={{ backgroundColor: "#FFF8F7", color: "#5C3F3F" }}
          >
            3학년 1학기
          </Badge>
        </div>
        {/* 전체 전공 수료율 문구 */}
        <p
          style={{
            fontSize: "18.58px",
            lineHeight: "28.9px",
            color: "#5C3F3F",
          }}
        >
          현재 전공 과정을 {overallPct}% 달성하셨네요!
        </p>
      </section>

      {/* ── 메인 카드 3개 ── */}
      <section className="flex flex-wrap" style={{ gap: "33.02px" }}>
        {/* 학업 현황 카드: 전공기초/필수/선택 이수율 도넛 차트 */}
        <AcademicStatusCard status={status} overallPct={overallPct} isZeroState={isZeroState} />

        {/* 커리큘럼 계획 카드: 시뮬레이터에서 추가한 과목 목록 */}
        <PriorityCoursesCard isZeroState={isPlanZeroState} checkedCourses={checkedCourses} />

        {/* 추천 선배 카드: 드래그/스와이프/트랙패드 수평 스크롤로 넘기는 슬라이더 */}
        {/* seniorCardRef: wheel 이벤트로 트랙패드 수평 스크롤 감지 */}
        <RecommendedSeniorCard
          seniors={seniors}
          seniorIndex={seniorIndex}
          sliding={sliding}
          slideDir={slideDir}
          dragStartX={dragStartX}
          onGoToSenior={goToSenior}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          isZeroState={isSeniorZeroState}
          containerRef={seniorCardRef}
          upcomingSession={getNearestEvent()}
        />
      </section>

      {/* 최근 활동 이력 (로컬스토리지 기반) */}
      <RecentActivities />


    </div>
  );
}
