import Navbar from "../components/layout/Navbar"
import HeroSection from "../components/landing/HeroSection"
import QuoteSection from "../components/landing/QuoteSection"
import FeaturesSection from "../components/landing/FeaturesSection"
import ScrollingFrame from "../components/landing/ScrollingFrame"
import CTASection from "../components/landing/CTASection"

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "Roboto, sans-serif", backgroundColor: "#FFFFFF", minWidth: "1280px" }}>
      <Navbar />
      <HeroSection />
      <QuoteSection
        quote="혼자 고민해서는 앞으로 어떤 길을 가야 할지 답이 안 나와요. 먼저 그 길을 걸어본 선배의 현실적인 조언이 필요해요."
        author="산업디자인학과 22학번 김모씨"
      />
      <FeaturesSection />
      <ScrollingFrame />
      <CTASection />
    </div>
  )
}