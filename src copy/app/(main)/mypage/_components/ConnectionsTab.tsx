// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ConnectionsTab.tsx — 마이페이지 연결 요청 탭 컴포넌트                      ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    마이페이지 탭 내 "연결 요청" 섹션.                                       ║
// ║    진행 예정 미팅과 완료된 상담 기록을 두 섹션으로 나누어 표시한다.           ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    부모 컴포넌트 → ConnectionsTab(upcomingConnections, historyConnections)  ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/link          : 메시지 페이지(/messages) 이동 링크               ║
// ║    - @/types            : ConnectionRequest 타입                          ║
// ║    - @/components/ui/badge : shadcn/ui Badge 컴포넌트 (상태 표시)          ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// Link: "메시지 보기" 버튼 클릭 시 /messages로 이동
import Link from "next/link";
// ConnectionRequest 타입: 연결 요청 데이터 구조 명세
import type { ConnectionRequest } from "@/types";
// Badge: shadcn/ui 뱃지 컴포넌트 — 연결 유형, 상태 표시에 사용
import { Badge } from "@/components/ui/badge";

/** 컴포넌트 Props 타입 */
type ConnectionsTabProps = {
  /** 진행 예정 연결 요청 목록 — 미팅 링크, 유형, 상대 정보 포함 */
  upcomingConnections: ConnectionRequest[];
  /** 완료(수락/거절/대기)된 연결 요청 기록 목록 */
  historyConnections: ConnectionRequest[];
};

/**
 * ConnectionsTab
 *
 * 마이페이지의 연결 요청 탭 내용.
 * "진행 예정" 섹션과 "완료된 상담 기록" 섹션으로 구성된다.
 *
 * 스타일링 방식: Tailwind CSS 클래스 사용 (인라인 스타일 미사용)
 *
 * @param upcomingConnections - 예정된 미팅 목록
 * @param historyConnections  - 완료된 상담 이력 목록
 */
export default function ConnectionsTab({ upcomingConnections, historyConnections }: ConnectionsTabProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* ── 진행 예정 섹션 ── */}
      <div>
        {/* 섹션 제목: 예정된 미팅 수를 괄호로 표시 */}
        <h3 className="font-semibold mb-3">진행 예정 ({upcomingConnections.length})</h3>
        {/* 예정된 미팅이 없을 때 안내 문구 */}
        {upcomingConnections.length === 0 ? (
          <p className="text-sm text-muted-foreground">예정된 미팅이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingConnections.map((conn) => (
              <div
                key={conn.id}
                // 브랜드 레드 테두리로 활성 연결 요청 강조
                className="border border-[var(--color-brand)] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  {/* 연결 유형(커피챗 등) + 상대 선배 ID */}
                  <div className="flex items-center gap-2">
                    {/* Badge: 연결 유형 표시 (예: "커피챗") */}
                    <Badge>{conn.type}</Badge>
                    <span className="text-sm font-medium">{conn.toSeniorId}</span>
                  </div>
                  {/* 미팅 링크가 있을 경우에만 표시 — 외부 링크로 열기 */}
                  {conn.meetingLink && (
                    <a
                      href={conn.meetingLink}
                      target="_blank"           // 새 탭에서 열기
                      rel="noopener noreferrer" // 보안: 새 탭이 opener에 접근하지 못하도록
                      className="text-xs text-[var(--color-brand)] underline mt-1 block"
                    >
                      미팅 링크 열기
                    </a>
                  )}
                </div>
                {/* "메시지 보기" 링크 — /messages 페이지로 이동 */}
                <Link href="/messages">
                  <Badge variant="outline">메시지 보기</Badge>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 완료된 상담 기록 섹션 ── */}
      <div>
        <h3 className="font-semibold mb-3">완료된 상담 기록</h3>
        {/* 완료된 상담이 없을 때 안내 문구 */}
        {historyConnections.length === 0 ? (
          <p className="text-sm text-muted-foreground">완료된 상담이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {historyConnections.map((conn) => (
              <div
                key={conn.id}
                // 기본 테두리(회색)로 완료된 항목 표시 — 진행 예정보다 시각적 강조 낮음
                className="border border-border rounded-xl px-4 py-3 flex items-center justify-between"
              >
                {/* 연결 유형 + 상대 선배 ID */}
                <div className="flex items-center gap-2">
                  {/* secondary 변형 뱃지 — 중요도가 낮은 상태 표시 */}
                  <Badge variant="secondary">{conn.type}</Badge>
                  <span className="text-sm">{conn.toSeniorId}</span>
                </div>
                {/*
                  상태 뱃지 — conn.status에 따라 variant 분기:
                  - "accepted" → default (강조)
                  - "rejected" → destructive (빨강, 거절 상태)
                  - 그 외("pending") → outline (대기 중)
                */}
                <Badge
                  variant={
                    conn.status === "accepted" ? "default"
                    : conn.status === "rejected" ? "destructive"
                    : "outline"
                  }
                >
                  {conn.status === "accepted" ? "수락됨"
                    : conn.status === "rejected" ? "거절됨"
                    : "대기 중"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
