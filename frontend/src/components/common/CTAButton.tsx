import { Link } from "@tanstack/react-router"
import { BRAND } from "../../lib/constants"

interface CTAButtonProps {
  to: string
  children: React.ReactNode
}

export default function CTAButton({ to, children }: CTAButtonProps) {
  return (
    <Link to={to}>
      <button style={{
        backgroundColor: BRAND,
        color: "#FFFFFF",
        border: "none",
        borderRadius: "100px",
        padding: "16px 48px",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(154,0,31,0.3)",
      }}>
        {children}
      </button>
    </Link>
  )
}