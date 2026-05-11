import { BRAND } from "../../lib/constants"

export default function QuoteSection() {
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
          혼자 고민해서는 앞으로 어떤 길을 가야 할지<br />
          답이 안 나와요. 먼저 그 길을 걸어본 선배의<br />
          현실적인 조언이 필요해요.
        </p>
      </div>
      <p style={{ position: "absolute", right: "600px", bottom: "120px", fontSize: "13px", color: "#916F6E", margin: 0 }}>
        산업디자인학과 22학번 김모씨
      </p>
    </section>
  )
}