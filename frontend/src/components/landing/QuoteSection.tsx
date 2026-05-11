import { BRAND } from "../../lib/constants"

interface QuoteSectionProps {
  quote: string
  author: string
}

export default function QuoteSection({ quote, author }: QuoteSectionProps) {
  return (
    <section style={{ backgroundColor: "#FFFFFF", padding: "120px 200px 120px 600px", position: "relative" }}>
      <div style={{ maxWidth: "640px", textAlign: "left" }}>
        <svg width="72" height="56" viewBox="0 0 72 56" fill="none" style={{ marginBottom: "24px" }}>
          <rect x="0" y="0" width="26" height="36" rx="4" fill={BRAND}/>
          <rect x="0" y="40" width="26" height="16" rx="4" fill={BRAND}/>
          <rect x="34" y="0" width="26" height="36" rx="4" fill={BRAND}/>
          <rect x="34" y="40" width="26" height="16" rx="4" fill={BRAND}/>
        </svg>
        <p style={{ fontSize: "26px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.5, marginBottom: "0", fontFamily: "Roboto, sans-serif" }}>
          {quote}
        </p>
      </div>
      <p style={{ position: "absolute", right: "600px", bottom: "120px", fontSize: "13px", color: "#916F6E", margin: 0 }}>
        {author}
      </p>
    </section>
  )
}