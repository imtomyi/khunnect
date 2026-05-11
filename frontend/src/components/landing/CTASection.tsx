import CTAButton from "../common/CTAButton"
import Logo from "../Logo"

export default function CTASection() {
  return (
    <section style={{
      position: "relative", overflow: "hidden",
      backgroundColor: "#FFFFFF", padding: "140px 48px",
      textAlign: "center", display: "flex",
      flexDirection: "column", alignItems: "center", gap: "28px",
    }}>
      {/* 배경 데코레이션 블롭 */}
      <div style={{ position: "absolute", top: "10%", left: "12%", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#FEF08A", opacity: 0.7, zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "30%", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#BFDBFE", opacity: 0.6, filter: "blur(1.5px)", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "15%", width: "100px", height: "24px", borderRadius: "12px", backgroundColor: "#BBF7D0", opacity: 0.6, transform: "rotate(-30deg)", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "25%", right: "30%", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "transparent", border: "2px solid #F9A8D4", opacity: 0.8, filter: "blur(3px)", zIndex: 1, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>
        <h2 style={{ fontSize: "40px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1.3, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <span>설계는 <Logo size={36} />가,</span>
          <span>성장은 당신이.</span>
        </h2>
        <p style={{ fontSize: "15px", color: "#5C3F3F", lineHeight: 1.7 }}>
          더이상 혼자 고민하지 마세요. 지금 이미 선배의 경험을 만나보세요.
        </p>
        <CTAButton to="/login">지금 시작하기</CTAButton>
      </div>
    </section>
  )
}