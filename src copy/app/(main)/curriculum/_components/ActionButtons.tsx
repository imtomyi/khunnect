import { SavedCheckIcon, CalculatorIcon } from "./Icons";

interface ActionButtonsProps {
  saveStatus: "idle" | "saved";
  onSave: () => void;
  onCalculate: () => void;
}

const BUTTON_SHADOW = "0 8px 16px -4px rgba(46, 103, 147, 0.6)";

export function ActionButtons({ saveStatus, onSave, onCalculate }: ActionButtonsProps) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>

      {/* 저장 버튼 */}
      <button
        onClick={onSave}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          width: "130px", borderRadius: "999px", border: "none",
          backgroundColor: saveStatus === "saved" ? "#FFFFFF" : "#2E6793",
          color: saveStatus === "saved" ? "#094F7A" : "#FFFFFF",
          fontSize: "15px", fontWeight: 600, cursor: "pointer",
          transition: "background-color 300ms ease, color 300ms ease",
          boxShadow: BUTTON_SHADOW,
        }}
      >
        {saveStatus === "saved" ? (
          <>
            <SavedCheckIcon />
            저장됨
          </>
        ) : "저장"}
      </button>

      {/* 커리큘럼 계산하기 버튼 */}
      <button
        onClick={onCalculate}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "14px 40px", minWidth: "120px",
          borderRadius: "999px", border: "none",
          backgroundColor: "#2E6793", color: "#FFFFFF",
          fontSize: "15px", fontWeight: 600, cursor: "pointer",
          boxShadow: BUTTON_SHADOW,
        }}
      >
        <CalculatorIcon />
        커리큘럼 계산하기
      </button>

    </div>
  );
}
