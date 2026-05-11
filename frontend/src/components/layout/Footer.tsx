import Logo from "../Logo"
import { Link } from "@tanstack/react-router"

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#FFFFFF",
      borderTop: "1px solid #F3F4F6",
      padding: "48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
    }}>
      <Logo size={22} />

      <div style={{
        display: "flex",
        gap: "32px",
      }}>
        {[
          { label: "서비스 소개", to: "/" },
          { label: "이용약관", to: "/" },
          { label: "개인정보처리방침", to: "/" },
          { label: "문의하기", to: "/" },
        ].map((item) => (
          <Link key={item.label} to={item.to} style={{
            fontSize: "13px",
            color: "#9CA3AF",
            textDecoration: "none",
          }}>
            {item.label}
          </Link>
        ))}
      </div>

      <p style={{ fontSize: "12px", color: "#D1D5DB", margin: 0 }}>
        © 2026 khunnect. All rights reserved.
      </p>
    </footer>
  )
}