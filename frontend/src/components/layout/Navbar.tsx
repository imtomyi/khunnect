import { Link } from "@tanstack/react-router"
import Logo from "../Logo"
import { NAV_OPACITY } from "../../lib/constants"

export default function Navbar() {
  return (
    <div style={{
      position: "sticky",
      top: "10px",
      zIndex: 100,
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none",
    }}>
      <div style={{
        pointerEvents: "auto",
        display: "flex",
        width: "400px",
        padding: "2px 20px 2px 25px",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "9999px",
        border: "1.5px solid #F1F5F9",
        background: `rgba(244, 244, 244, ${NAV_OPACITY})`,
        boxShadow: "0 1.5px 3px 0 rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(18px)",
      }}>
        <Logo size={18} />
        <Link to="/login">
          <button style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#64748B",
            borderRadius: "100px",
            padding: "6px 20px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}>로그인</button>
        </Link>
      </div>
    </div>
  )
}