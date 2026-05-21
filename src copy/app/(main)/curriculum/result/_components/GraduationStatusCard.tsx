import { CATEGORY_ORDER, PROGRESS_COLORS, LAYOUT } from "../_lib/constants";
import type { CategoryType } from "../_lib/constants";

interface GraduationStatusCardProps {
  remaining: number;
  totalCompleted: number;
  totalRequired: number;
  completedByType: Record<CategoryType, number>;
  plannedByType: Record<CategoryType, number>;
  reqByType: Record<CategoryType, number>;
  // containerRef: 스크롤 시 sticky div의 bottom 위치를 page.tsx에서 추적하기 위한 ref
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function GraduationStatusCard({
  remaining, totalCompleted, totalRequired,
  completedByType, plannedByType, reqByType,
  containerRef,
}: GraduationStatusCardProps) {
  return (
    <div ref={containerRef} style={{ position: "sticky", top: "64px", zIndex: 10, backgroundColor: "#F6F6F6", padding: "24px 24px 20px" }}>
      {/* 하단 그라디언트: 과목 카드가 히어로 밑으로 스크롤될 때 border-radius가 부드럽게 사라지도록 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "48px",
        background: "linear-gradient(to bottom, transparent, #F6F6F6)",
        pointerEvents: "none", zIndex: 1,
      }} />
      <div style={{ width: LAYOUT.heroCardWidth, margin: "0 auto" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "36px 40px 42px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

          {/* 상단: 제목 + 학점 요약 */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "#5C3F3F", textTransform: "uppercase", marginBottom: "10px" }}>
                GRADUATION STATUS
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <h1 style={{ fontSize: "44px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1.2 }}>
                  졸업까지 <span style={{ color: "#C7002B" }}>{remaining}학점</span> 남았습니다
                </h1>
                <span style={{ padding: "4px 12px", backgroundColor: "#FCF1F1", borderRadius: "10319.28px", border: "1.032px solid rgba(0, 75, 226, 0.20)", fontSize: "12px", fontWeight: 600, color: "#5C3F3F", whiteSpace: "nowrap" }}>
                  3학년 1학기
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "26px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1 }}>
                {totalCompleted} / <span style={{ color: "#5C3F3F66" }}>{totalRequired}학점</span>
              </p>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: "#5C3F3F", textTransform: "uppercase", marginTop: "6px" }}>
                REMAINING CREDITS
              </p>
            </div>
          </div>

          {/* 카테고리별 진행도 바 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "28px" }}>
            {CATEGORY_ORDER.map((type) => {
              const completed = completedByType[type];
              const planned = plannedByType[type];
              const total = reqByType[type];
              const completedPct = total > 0 ? Math.min(100, Math.round((completed / total) * 1000) / 10) : 0;
              const plannedPct = total > 0 ? Math.min(100 - completedPct, Math.round((planned / total) * 1000) / 10) : 0;
              return (
                <ProgressBar
                  key={type}
                  label={type}
                  completedPct={completedPct}
                  plannedPct={plannedPct}
                  color={PROGRESS_COLORS[type]}
                  remaining={total - completed}
                  isComplete={completed >= total}
                />
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── 진행도 바 서브컴포넌트 ─────────────────────────────────────

interface ProgressBarProps {
  label: string;
  completedPct: number;
  plannedPct: number;
  color: string;
  remaining: number;
  isComplete: boolean;
}

function ProgressBar({ label, completedPct, plannedPct, color, remaining, isComplete }: ProgressBarProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: "#5C3F3F", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "20px", fontWeight: 700, color: "#1F1A1A" }}>{completedPct}%</span>
      </div>
      <div style={{ position: "relative", height: "20px", backgroundColor: "#F0ECEC", borderRadius: "999px", overflow: "hidden", marginBottom: "14px" }}>
        {/* 이수 완료 바 */}
        <div style={{
          position: "absolute", left: 0, top: 0,
          height: "100%", width: `${completedPct}%`,
          backgroundColor: color,
          borderRadius: plannedPct > 0 ? "999px 0 0 999px" : "999px 0 0 999px",
          transition: "width 400ms ease",
        }} />
        {/* 수강 예정 바 (흐린 연장) */}
        <div style={{
          position: "absolute", left: `${completedPct}%`, top: 0,
          height: "100%", width: `${plannedPct}%`,
          backgroundColor: color,
          opacity: 0.35,
          transition: "width 400ms ease, left 400ms ease",
        }} />
      </div>
      <p style={{ fontSize: "11px", color: "#5C3F3F", fontWeight: 500 }}>
        {isComplete ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            모두 이수하셨어요!
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path d="M13.0421 0.43918C13.6276 1.02493 13.6276 1.97443 13.0421 2.56018L5.54207 10.0602C4.95632 10.6458 4.00682 10.6458 3.42107 10.0602L0.421068 7.06018C-0.14739 6.47161 -0.139261 5.53605 0.43934 4.95745C1.01794 4.37885 1.9535 4.37072 2.54207 4.93918L4.48157 6.87868L10.9211 0.43918C11.5068 -0.146393 12.4563 -0.146393 13.0421 0.43918Z" fill="#5C3F3F"/>
            </svg>
          </span>
        ) : `남은 학점: ${remaining}학점`}
      </p>
    </div>
  );
}
