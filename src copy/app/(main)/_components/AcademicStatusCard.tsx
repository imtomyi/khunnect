"use client";

import type { CurriculumStatus } from "@/types";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
const cardStyle = (isZeroState?: boolean): React.CSSProperties => ({
  backgroundColor: "#2E6793",
  height: isZeroState ? "450px" : "500px",
  borderRadius: "32px",
  padding: "41.281px",
});

const titleTextStyle: React.CSSProperties = {
  color: "#C8E2FF",
  fontFamily: "Roboto",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "100%",
};

const zeroStateLabelStyle: React.CSSProperties = {
  color: "#C8E2FF",
  fontSize: "14px",
  fontWeight: 500,
};

const barLabelStyle: React.CSSProperties = { color: "#C8E2FF" };

const barTrackStyle: React.CSSProperties = { backgroundColor: "#C8E2FF1A" };

const barFillStyle = (pct: number): React.CSSProperties => ({
  backgroundColor: "#C8E2FF",
  width: `${Math.min(100, Math.round(pct))}%`,
});

const overallPctWrapStyle: React.CSSProperties = { color: "#C8E2FF" };

const overallPctSubStyle: React.CSSProperties = {
  color: "#C8E2FF",
  opacity: 0.7,
};

// ── 타입 ─────────────────────────────────────────────────────────────────────
type AcademicStatusCardProps = {
  status: CurriculumStatus | null;
  overallPct: number;
  isZeroState?: boolean;
};

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function AcademicStatusCard({ status, overallPct, isZeroState }: AcademicStatusCardProps) {
  return (
    <div className="flex-1 flex flex-col gap-5 text-white" style={cardStyle(isZeroState)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.33333 18.6667H8V12H5.33333V18.6667ZM16 18.6667H18.6667V5.33333H16V18.6667ZM10.6667 18.6667H13.3333V14.6667H10.6667V18.6667ZM10.6667 12H13.3333V9.33333H10.6667V12ZM2.66667 24C1.93333 24 1.30556 23.7389 0.783333 23.2167C0.261111 22.6944 0 22.0667 0 21.3333V2.66667C0 1.93333 0.261111 1.30556 0.783333 0.783333C1.30556 0.261111 1.93333 0 2.66667 0H21.3333C22.0667 0 22.6944 0.261111 23.2167 0.783333C23.7389 1.30556 24 1.93333 24 2.66667V21.3333C24 22.0667 23.7389 22.6944 23.2167 23.2167C22.6944 23.7389 22.0667 24 21.3333 24H2.66667ZM2.66667 21.3333H21.3333V2.66667H2.66667V21.3333Z" fill="#C8E2FF"/>
          </svg>
          <span style={titleTextStyle}>학업 현황</span>
        </div>
      </div>

      {isZeroState ? (
        /* ── Zero state: ? 링 ── */
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#C8E2FF" strokeWidth="10"/>
            <circle
              cx="80" cy="80" r="54"
              fill="none" stroke="#C8E2FF4D" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 54 * 0.75} ${2 * Math.PI * 54 * 0.25}`}
              transform="rotate(-90 80 80)"
            />
            <text x="80" y="93" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="44" fontWeight="700" fontFamily="Roboto">?</text>
          </svg>
          <p style={zeroStateLabelStyle}>전체 전공 수료율</p>
        </div>
      ) : (
        <>
          {/* 학점 진행 바 목록 */}
          {status && (
            <div className="flex flex-col gap-[30px]">
              {[
                { label: "전공 기초 학점", ...status.basic },
                { label: "전공 필수 학점", ...status.required },
                { label: "전공 선택 학점", ...status.elective },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold" style={barLabelStyle}>{item.label}</span>
                    <span className="font-medium" style={barLabelStyle}>{item.completed}/{item.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={barTrackStyle}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={barFillStyle((item.completed / item.total) * 100)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 전체 수료율 숫자 */}
          <div className="mt-auto pt-2" style={overallPctWrapStyle}>
            <div className="font-bold leading-none" style={{ fontSize: "90px" }}>
              {overallPct}<span className="text-2xl font-semibold">%</span>
            </div>
            <p className="text-sm mt-2" style={overallPctSubStyle}>전체 전공 수료율</p>
          </div>
        </>
      )}
    </div>
  );
}
