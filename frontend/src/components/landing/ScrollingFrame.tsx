import { useEffect, useRef, useState } from "react"

export default function ScrollingFrame() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(200)

  useEffect(() => {
    const handleScroll = () => {
      if (!outerRef.current) return
      const rect = outerRef.current.getBoundingClientRect()
      const outerH = outerRef.current.offsetHeight
      const windowH = window.innerHeight
      const scrollable = outerH - windowH
      const scrolled = Math.max(0, -rect.top)
      const progress = scrollable > 0 ? Math.min(1, scrolled / scrollable) : 0
      setTranslateX(200 - progress * 500)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={outerRef} style={{ position: "relative", height: "300vh" }}>
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}>
        <img
          src="/onboarding_frame.png"
          alt="onboarding frame"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: "transform 0.05s linear",
            display: "block",
            maxHeight: "85vh",
            width: "auto",
          }}
        />
      </div>
    </div>
  )
}