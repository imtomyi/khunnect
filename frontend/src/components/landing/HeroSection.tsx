import CTAButton from "../common/CTAButton"

export default function HeroSection() {
  return (
    <section style={{
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 48px",
      textAlign: "center",
      gap: "32px",
    }}>
      {/* 블러 블롭 — 왼쪽 파랑 */}
      <div style={{
        position: "absolute", top: "150px", left: "500px",
        width: "420px", height: "420px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(150,180,255,0.85) 0%, rgba(180,205,255,0.45) 50%, transparent 70%)",
        filter: "blur(48px)", pointerEvents: "none", zIndex: 1,
      }} />
      {/* 블러 블롭 — 오른쪽 보라 */}
      <div style={{
        position: "absolute", top: "300px", right: "500px",
        width: "380px", height: "380px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(150,80,255,0.55) 0%, rgba(170,110,255,0.28) 50%, transparent 70%)",
        filter: "blur(56px)", pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ fontSize: "52px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1.2, margin: 0 }}>
            당신의 빛나는 미래를 그려나가는
          </h1>
          <h1 style={{ fontSize: "52px", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
            <span style={{
              background: "linear-gradient(90deg, #0052FF, #60A5FA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>졸업 내비게이션, </span>
            <span style={{ fontFamily: '"AvantGarde LT Bold"', fontSize: "72px", fontWeight: 400, lineHeight: "72px", letterSpacing: "-3px", color: "#9A001F" }}>khu</span>
            <span style={{ fontFamily: '"AvantGarde Bk BT"', fontSize: "72px", fontWeight: 400, lineHeight: "72px", letterSpacing: "-3px", color: "#524949" }}>nnect.</span>
          </h1>
        </div>

        <p style={{ fontSize: "16px", color: "#5C3F3F", lineHeight: 1.5, maxWidth: "520px", margin: 0 }}>
          직무 맞춤 커리어 로드맵부터 현직 선배와의 연결, 그리고 복잡한 학점 계산까지<br />
          khunnect와 함께 성공적인 대학 생활을 설계하세요.
        </p>

        <CTAButton to="/login">지금 시작하기</CTAButton>

        <div style={{
          marginTop: "8px",
          width: "760px", borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
        }}>
          <img src="/main 1.png" alt="앱 스크린샷" style={{ width: "100%", display: "block" }} />
        </div>
      </div>
    </section>
  )
}