import { BRAND } from "../../lib/constants"

interface QuoteSectionProps {
  quote: string
  author: string
}

export default function QuoteSection({ quote, author }: QuoteSectionProps) {
  return (
    <section style={{ backgroundColor: "#FFFFFF", padding: "120px 48px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "580px" }}>
          <svg width="72" height="56" viewBox="0 0 72 56" fill="none" style={{ marginBottom: "24px" }}>
            <rect x="0" y="0" width="26" height="36" rx="4" fill={BRAND}/>
            <rect x="0" y="40" width="26" height="16" rx="4" fill={BRAND}/>
            <rect x="34" y="0" width="26" height="36" rx="4" fill={BRAND}/>
            <rect x="34" y="40" width="26" height="16" rx="4" fill={BRAND}/>
          </svg>
          <p style={{ fontSize: "26px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.5, margin: "0 0 16px", fontFamily: "Roboto, sans-serif" }}>
            {quote}
          </p>
          <p style={{ fontSize: "13px", color: "#916F6E", margin: 0, textAlign: "right" }}>
            {author}
          </p>
        </div>
      </div>
    </section>
  )
}