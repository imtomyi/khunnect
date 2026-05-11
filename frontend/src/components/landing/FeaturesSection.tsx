import { BRAND } from "../../lib/constants"

export default function FeaturesSection() {
  return (
    <section style={{ backgroundColor: "#FFFFFF", padding: "80px 48px 120px" }}>
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#1F1A1A", marginBottom: "12px" }}>
          선배의 지혜가 담긴 핵심 기능
        </h2>
        <p style={{ fontSize: "14px", color: "#78716C" }}>
          필요한 모든 것을 하나의 플랫폼에서 해결하세요
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "960px", margin: "0 auto" }}>

        {/* 카드 1: 선배와 연결 */}
        <div style={{
          background: "linear-gradient(135deg, #FFFFFF 55%, #DCFCE7CF 100%)",
          borderRadius: "24px", padding: "24px", minHeight: "280px",
          display: "flex", flexDirection: "column", gap: "12px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>취업 준비에 강해지는, 선배와 연결</h3>
            <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>비슷한 고민을 했던 선배들의 실제 이야기와 조언을 들어보세요.</p>
          </div>
          <div style={{ marginTop: "auto", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
              <div style={{ backgroundColor: BRAND, borderRadius: "16px 4px 16px 16px", padding: "10px 14px", maxWidth: "220px" }}>
                <p style={{ fontSize: "12px", color: "#FFFFFF", margin: 0, lineHeight: 1.5 }}>포트폴리오와 면접은 어떤 방법으로 준비해야 할까요?</p>
              </div>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#D1D5DB", flexShrink: 0 }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #FACC15, #FB923C)", flexShrink: 0 }} />
              <div style={{
                display: "flex", maxWidth: "201.6px", padding: "12px",
                flexDirection: "column", alignItems: "flex-start", gap: "8px",
                borderRadius: "32px 32px 32px 0", border: "1px solid #F3F4F6",
                background: "#FFF", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              }}>
                <div style={{ width: "120px", height: "8px", borderRadius: "4px", backgroundColor: "#E5E7EB" }} />
                <div style={{ width: "80px", height: "8px", borderRadius: "4px", backgroundColor: "#E5E7EB" }} />
              </div>
            </div>
          </div>
        </div>

        {/* 카드 2: 커리큘럼 설계 */}
        <div style={{
          background: "linear-gradient(225deg, #FFFFFF 55%, #F3E8FF 100%)",
          borderRadius: "24px", padding: "24px", minHeight: "280px",
          display: "flex", flexDirection: "column", gap: "12px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>나에게 맞는 커리큘럼 설계</h3>
            <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>원하는 직무에 맞는 최적의 수강 순서를 설계하세요.</p>
          </div>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginTop: "10px" }}>
              <div style={{ position: "absolute", left: "8px", right: "8px", height: "2px", backgroundColor: "#E5E7EB", top: "50%", transform: "translateY(-50%)" }} />
              <div style={{ position: "absolute", left: "8px", width: "35%", height: "2px", backgroundColor: BRAND, top: "50%", transform: "translateY(-50%)" }} />
              {[{ label: "2학년", bg: BRAND, color: "#fff" }, { label: "3학년", bg: "#0A4DDE", color: "#fff" }, { label: "4학년", bg: "#D1D5DB", color: "#6B7280" }].map((item) => (
                <div key={item.label} style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 400, color: item.color }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", width: "250px", margin: "auto auto 0" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #FACC15, #FB923C)", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>산업디자인학과 선배</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1F1A1A", margin: 0 }}>"이 강의는 꼭 들어보세요!"</p>
              </div>
            </div>
          </div>
        </div>

        {/* 카드 3: 커리큘럼 계산기 */}
        <div style={{
          background: "linear-gradient(45deg, #FFFFFF 55%, #DBEAFE 100%)",
          borderRadius: "24px", padding: "24px", minHeight: "280px",
          display: "flex", flexDirection: "column", gap: "12px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>커리큘럼 계산기</h3>
            <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>복잡한 학점 계산을 시각화하여 앞으로 들어야 할 강의들을 한눈에 파악하세요.</p>
          </div>
          <div style={{ marginTop: "auto", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "20px", display: "flex", justifyContent: "space-around", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            {["전공기초", "전공필수", "전공선택"].map((label, i) => {
              const pcts = [75, 50, 60]
              const r = 40
              const sw = 8
              const size = (r + sw) * 2
              const cx = size / 2, cy = size / 2
              return (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
                    <circle cx={cx} cy={cy} r={r - sw - 1} fill="none" stroke={BRAND} strokeWidth={sw - 1}
                      strokeDasharray={`${2 * Math.PI * (r - sw - 1) * pcts[i] / 100} ${2 * Math.PI * (r - sw - 1)}`}
                      strokeLinecap="butt"
                      transform={`rotate(240 ${cx} ${cy}) scale(-1,1) translate(-${size},0)`} />
                    <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="600" fill="#111827">{label}</text>
                  </svg>
                </div>
              )
            })}
          </div>
        </div>

        {/* 카드 4: 선배와의 약속 기록 */}
        <div style={{
          background: "linear-gradient(315deg, #FFFFFF 55%, #FFEDD5 100%)",
          borderRadius: "24px", padding: "24px", minHeight: "280px",
          display: "flex", flexDirection: "column", gap: "12px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>선배와의 약속 기록</h3>
            <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>채팅으로 이루어진 선배와의 만남 일정과 계획을 캘린더로 관리하세요.</p>
          </div>
          <div style={{ position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "375px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", gap: "2px" }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ fontSize: "12px", color: "#9CA3AF", padding: "6px 0", fontWeight: 600 }}>{d}</div>
              ))}
              {[null,null,null,1,2,3,4].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px" }}>
                  {d && (
                    <div style={{ width: "40px", height: "40px", borderRadius: "5px", backgroundColor: d === 3 ? BRAND : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: d === 3 ? 700 : 400, color: d === 3 ? "#FFFFFF" : "#1F1A1A" }}>{d}</span>
                    </div>
                  )}
                </div>
              ))}
              {[5,6,7,8,9,10,11].map((d) => (
                <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "5px", backgroundColor: d === 8 ? "#FEE2E2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: 400, color: d === 8 ? "#3B82F6" : "#1F1A1A" }}>{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}