// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  seniors/[id]/page.tsx — 선배 상세 프로필 페이지                           ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    특정 선배(URL 파라미터 :id)의 상세 정보를 표시하고,                       ║
// ║    현재 사용자가 해당 선배에게 연결 요청(커피챗)을 보낼 수 있는 페이지.       ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    URL /seniors/:id                                                       ║
// ║      → getSeniorById(id)   → senior 상태                                  ║
// ║      → getCurrentUser()    → currentUserId 상태                           ║
// ║      → buildYearColumns()  → yearColumns (학년별 시간표 그룹)               ║
// ║    연결 요청: sendConnectionRequest() → /messages?connId=xxx 이동          ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/services/seniors      : getSeniorById                             ║
// ║    - @/services/connections  : sendConnectionRequest                     ║
// ║    - @/services/user         : getCurrentUser                            ║
// ║    - @/lib/recentActivity    : 최근 방문 기록 저장                          ║
// ║    - ProfileCard             : 좌측 프로필 카드                             ║
// ║    - AcademicJourneyGrid     : 학업 여정 그리드                             ║
// ║    - MentoringSchedule       : 멘토링 가능 시간 캘린더                       ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// React 훅: 상태 관리 및 사이드 이펙트
import { useState, useEffect } from "react";
// Next.js 훅: 동적 라우트 파라미터([id]) 읽기 및 페이지 이동
import { useParams, useRouter } from "next/navigation";
// 선배 단건 조회 API
import { getSeniorById } from "@/services/seniors";
// 연결 요청 전송 / 기존 연결 조회 API
import { sendConnectionRequest, getConnections } from "@/services/connections";
// 현재 로그인한 사용자 정보 조회
import { getCurrentUser } from "@/services/user";
// 타입 정의
import type { Senior } from "@/types";
import type { CSSProperties } from "react";
// 좌측 프로필 카드 컴포넌트
import ProfileCard from "./_components/ProfileCard";
// 학업 여정 그리드 + 데이터 변환 헬퍼
import AcademicJourneyGrid, { buildYearColumns } from "./_components/AcademicJourneyGrid";
// 멘토링 가능 시간 캘린더 컴포넌트
import MentoringSchedule from "./_components/MentoringSchedule";
// 최근 방문 기록 저장 — 마이페이지 등에서 최근 본 선배 표시용
import { addRecentActivity } from "@/lib/recentActivity";

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/** 데이터 로딩 중 표시하는 안내 텍스트 스타일 */
const loadingStyle: CSSProperties = {
  padding: "60px",
  color: "#9CA3AF",
  fontSize: "15px",
};

/**
 * 페이지 레이아웃 — 좌우 2열 구조
 * 좌: ProfileCard(고정 너비) | 우: 학업 여정 + 멘토링 시간(flex 1)
 */
const pageLayoutStyle: CSSProperties = {
  fontFamily: "var(--font-roboto), sans-serif",
  display: "flex",
  gap: "40px",
  alignItems: "flex-start",
  padding: "48px 0",
};

/** 우측 패널 — 세로 방향으로 섹션들을 배치 */
const rightPanelStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "48px",
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * SeniorDetailPage
 *
 * 선배 상세 페이지. URL 파라미터 id로 선배 데이터를 로드하고
 * 프로필 / 학업 여정 / 멘토링 일정을 표시한다.
 */
export default function SeniorDetailPage() {
  // URL 파라미터에서 선배 ID 추출 — /seniors/[id]
  const { id } = useParams<{ id: string }>();
  // 연결 요청 성공 후 메시지 페이지로 이동하기 위해 사용
  const router = useRouter();

  // senior: 현재 페이지에서 표시할 선배 데이터 (로딩 전 null)
  const [senior, setSenior] = useState<Senior | null>(null);
  // isSending: 연결 요청 API 호출 중 여부 — 중복 클릭 방지 및 버튼 비활성화
  const [isSending, setIsSending] = useState(false);
  // selectedDate: 멘토링 달력에서 선택된 날짜 숫자 (일) — null이면 미선택
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  // currentUserId: 로그인한 사용자 ID — 연결 요청의 fromUserId로 사용
  const [currentUserId, setCurrentUserId] = useState("");
  // existingConnId: 이미 연결된 경우 해당 연결 ID — 있으면 새 요청 대신 메시지함으로 바로 이동
  const [existingConnId, setExistingConnId] = useState<string | null>(null);

  // ── 선배 데이터 로드 ──
  // id가 변경될 때마다(페이지 재방문 등) 재실행
  useEffect(() => {
    // 현재 사용자 ID 로드 + 이 선배와 기존 연결 여부 확인
    getCurrentUser().then(async (u) => {
      setCurrentUserId(u.id);
      const conns = await getConnections(u.id).catch(() => []);
      const existing = conns.find((c) => c.toSeniorId === id);
      if (existing) setExistingConnId(existing.id);
    }).catch(() => {});
    // 선배 상세 데이터 로드
    getSeniorById(id).then((s) => {
      setSenior(s);
      if (s) {
        // 선배 프로필 조회 시 최근 활동 기록에 추가 (마이페이지 등에서 활용)
        addRecentActivity({
          id: `senior-${s.id}`,
          label: `${s.name} 선배님 프로필`,
          sub: s.department ?? "",
          href: `/seniors/${s.id}`,
          type: "senior",
        });
      }
    });
  }, [id]); // id가 바뀌면 새로운 선배 데이터를 로드

  /**
   * handleConnect
   *
   * "선배와 연결하기" 버튼 클릭 핸들러.
   * 커피챗 유형의 연결 요청을 생성하고 메시지 페이지로 이동한다.
   */
  async function handleConnect() {
    if (!senior) return;
    // 이미 연결된 선배면 새 요청 없이 바로 메시지함으로 이동
    if (existingConnId) {
      router.push(`/messages?connId=${existingConnId}`);
      return;
    }
    setIsSending(true);
    try {
      const newConn = await sendConnectionRequest({
        fromUserId: currentUserId,
        toSeniorId: senior.id,
        type: "커피챗",
        message: "안녕하세요, 연결 요청드립니다!",
        meetingLink: undefined,
      });
      router.push(`/messages?connId=${newConn.id}`);
    } finally {
      setIsSending(false);
    }
  }

  // 데이터 로딩 중 안내 표시
  if (!senior) {
    return (
      <div style={loadingStyle}>
        불러오는 중...
      </div>
    );
  }

  // 선배의 시간표 데이터를 학년 컬럼 구조로 변환
  // (AcademicJourneyGrid가 소비하는 형태: [{yearLabel, semesters:[{label, courses}]}])
  const yearColumns = buildYearColumns(senior.timetable);

  return (
    <div style={pageLayoutStyle}>

      {/* ── 좌측: 프로필 카드 ── */}
      {/* ProfileCard: 사진, 이름, 직함, 한줄소개, 연결 버튼 포함 */}
      <ProfileCard
        senior={senior}
        isSending={isSending}
        onConnect={handleConnect}
        isConnected={!!existingConnId}
      />

      {/* ── 우측: 학업 여정 그리드 + 멘토링 가능 시간 ── */}
      <div style={rightPanelStyle}>
        {/* 학년/학기별 수강 과목을 그리드로 시각화 */}
        <AcademicJourneyGrid yearColumns={yearColumns} />
        {/* 이번 주 멘토링 가능 날짜 + 시간 슬롯 표시 */}
        <MentoringSchedule selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

    </div>
  );
}
