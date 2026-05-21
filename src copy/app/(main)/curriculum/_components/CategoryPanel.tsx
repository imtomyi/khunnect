import type { CourseType } from "@/types";
import { CATEGORY_CONFIG } from "../_lib/constants";
import { TipIcon } from "./Icons";

interface CategoryPanelProps {
  selectedType: CourseType;
  onSelect: (type: CourseType) => void;
}

export function CategoryPanel({ selectedType, onSelect }: CategoryPanelProps) {
  const activeTip = CATEGORY_CONFIG.find(c => c.type === selectedType)!.tip;

  return (
    <div style={{ width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>

      {/* 카테고리 버튼 목록 */}
      {CATEGORY_CONFIG.map((cat) => {
        const isSelected = cat.type === selectedType;
        return (
          <button
            key={cat.type}
            onClick={() => onSelect(cat.type)}
            style={{
              width: "100%", textAlign: "left",
              padding: "16px 20px", borderRadius: "12px", border: "none",
              backgroundColor: isSelected ? "#EBE0E0" : "#FCF1F1",
              borderLeft: isSelected ? "3px solid #9A001F" : "3px solid transparent",
              cursor: "pointer", transition: "background-color 150ms ease",
            }}
          >
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "4px", color: isSelected ? "#9A001F" : "#5C3F3F99" }}>
              {cat.categoryNo}
            </p>
            <p style={{ fontSize: "16px", fontWeight: 600, color: isSelected ? "#1F1A1A" : "#78716C" }}>
              {cat.label}
            </p>
          </button>
        );
      })}

      {/* 선배의 팁 */}
      <div style={{ marginTop: "16px", padding: "20px 28px", borderRadius: "14px", backgroundColor: "#9A001F", color: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <TipIcon />
          <span style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.6px", color: "#FFFFFF", marginTop: "2px" }}>선배의 팁</span>
        </div>
        <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: "1.6", opacity: 0.95 }}>{activeTip}</p>
      </div>

    </div>
  );
}
