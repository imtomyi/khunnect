import type { CatalogCourse } from "@/types";
import { LAYOUT } from "../_lib/constants";

interface SimulatorPanelProps {
  remaining: number;
  planned: Set<string>;
  catalog: CatalogCourse[];
  onRecord: () => void;
}

export function SimulatorPanel({ remaining, planned, catalog, onRecord }: SimulatorPanelProps) {
  const plannedCredits = [...planned].reduce((sum, id) => {
    return sum + (catalog.find(c => c.id === id)?.credits ?? 0);
  }, 0);

  return (
    <div style={{
      width: LAYOUT.simulatorWidth, flexShrink: 0,
      backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "24px 20px",
      position: "sticky", top: LAYOUT.simulatorStickyTop,
      boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
    }}>

      <p style={{ fontSize: "12px", fontWeight: 600, color: "#1F1A1A", paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #E6BDBB" }}>시뮬레이터</p>

      {/* 잔여 학점 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: "20px", fontWeight: 700, color: "#1F1A1A" }}>잔여 학점:</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {plannedCredits > 0 ? (
            <>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#A8A29E", textDecoration: "line-through" }}>{remaining}</span>
              <span style={{ fontSize: "14px", color: "#A8A29E" }}>→</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#9A001F" }}>{remaining - plannedCredits}학점</span>
            </>
          ) : (
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#1F1A1A" }}>{remaining}학점</span>
          )}
        </div>
      </div>

      {/* 담은 강의 내역 */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", color: "#5C3F3F", marginBottom: "8px" }}>담은 강의 내역</p>
        {planned.size === 0 ? (
          <p style={{ fontSize: "12px", color: "#C4B5B5", textAlign: "center", padding: "12px 0" }}>
            + 버튼으로 과목을 추가해보세요
          </p>
        ) : (
          [...planned].map(id => {
            const course = catalog.find(c => c.id === id);
            if (!course) return null;
            return (
              <div key={id} style={{
                position: "relative",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px 10px 15px", marginBottom: "6px",
                backgroundColor: "#FCF1F1", borderRadius: "8px", overflow: "hidden",
              }}>
                {/* 왼쪽 직선 보더 */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", backgroundColor: "#9A001F" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1F1A1A", flex: 1, marginRight: "8px" }}>
                  {course.name}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#9A001F", flexShrink: 0 }}>
                  {course.credits}.0
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 구분선 */}
      <div style={{ borderTop: "1px solid #E6BDBB", marginBottom: "16px" }} />

      {/* 기록하기 버튼 */}
      <button
        onClick={onRecord}
        style={{ width: "100%", padding: "12px 0", borderRadius: "10px", border: "none", backgroundColor: "#9A001F", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
      >
        기록하기
      </button>

    </div>
  );
}
