import type { CatalogCourse } from "@/types";
import { getCourseSubtitle } from "../_lib/utils";

type CourseStatus = "completed" | "available" | "locked";

interface CourseCardProps {
  course: CatalogCourse;
  status: CourseStatus;
  isPlanned: boolean;
  onToggle: () => void;
}

export function CourseCard({ course, status, isPlanned, onToggle }: CourseCardProps) {
  const subtitle = getCourseSubtitle(course);
  const isLocked = status === "locked";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 14px", borderRadius: "12px", height: "80px", boxSizing: "border-box", transition: "background-color 250ms ease, border-color 250ms ease",
      backgroundColor: status === "completed" ? "#FCF1F1" : status === "locked" ? "#EBE0E0" : isPlanned ? "#FCF1F1" : "#FFFFFF",
      border: `1px solid ${isPlanned ? "rgba(154,0,31,0.15)" : "#E6BDBB"}`,
    }}>

      {/* 과목 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "13px",
          fontWeight: 600,
          color: isLocked ? "#C4B5B5" : "#1F1A1A",
          marginBottom: "2px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {course.name}
        </p>
        <p style={{ fontSize: "11px", color: isLocked ? "#D4C5C5" : "#5C3F3F", fontWeight: 500 }}>
          {subtitle}
        </p>
      </div>

      {/* 상태 아이콘 */}
      <div style={{ flexShrink: 0, marginLeft: "10px" }}>
        {status === "completed" && <CompletedIcon />}
        {status === "available" && (
          <AddButton isPlanned={isPlanned} onToggle={onToggle} />
        )}
        {status === "locked" && <LockIcon />}
      </div>

    </div>
  );
}

// ── 아이콘 서브컴포넌트 ─────────────────────────────────────────

function CompletedIcon() {
  return (
    <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#9A001F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}

function AddButton({ isPlanned, onToggle }: { isPlanned: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "26px", height: "26px", borderRadius: "50%", padding: 0,
        border: `2px solid #9A001F`,
        backgroundColor: isPlanned ? "#9A001F" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}
    >
      {isPlanned ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <img src="/icon-plus.svg" alt="추가" width="9" height="9" />
      )}
    </button>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="21" viewBox="0 0 16 21" fill="none">
      <path d="M2 21C1.45 21 0.979167 20.8042 0.5875 20.4125C0.195833 20.0208 0 19.55 0 19V9C0 8.45 0.195833 7.97917 0.5875 7.5875C0.979167 7.19583 1.45 7 2 7H3V5C3 3.61667 3.4875 2.4375 4.4625 1.4625C5.4375 0.4875 6.61667 0 8 0C9.38333 0 10.5625 0.4875 11.5375 1.4625C12.5125 2.4375 13 3.61667 13 5V7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V19C16 19.55 15.8042 20.0208 15.4125 20.4125C15.0208 20.8042 14.55 21 14 21H2ZM2 19H14V9H2V19ZM8 16C8.55 16 9.02083 15.8042 9.4125 15.4125C9.80417 15.0208 10 14.55 10 14C10 13.45 9.80417 12.9792 9.4125 12.5875C9.02083 12.1958 8.55 12 8 12C7.45 12 6.97917 12.1958 6.5875 12.5875C6.19583 12.9792 6 13.45 6 14C6 14.55 6.19583 15.0208 6.5875 15.4125C6.97917 15.8042 7.45 16 8 16ZM5 7H11V5C11 4.16667 10.7083 3.45833 10.125 2.875C9.54167 2.29167 8.83333 2 8 2C7.16667 2 6.45833 2.29167 5.875 2.875C5.29167 3.45833 5 4.16667 5 5V7ZM2 19V9V19Z" fill="#916F6E"/>
    </svg>
  );
}
