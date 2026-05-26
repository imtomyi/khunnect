import { useCallback, useEffect, useRef, useState } from "react"

/**
 * 이미지 프레임이 오른쪽에서 왼쪽으로 이동하는 스티키 스크롤 효과.
 * - startX = vw * 0.5       → 이미지 오른쪽 절반이 보이는 상태에서 진입
 * - endX = -(imgW - vw*0.5) → 이미지 왼쪽 절반이 보이는 상태에서 퇴장
 * - travel = imgW (항상 이미지 너비만큼만 이동 — 시작/끝 대칭)
 * - 컨테이너 높이 = 100vh + travel
 */
export default function ScrollingFrame() {
  const outerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // React state로 관리 → JSX style과 충돌 없음
  const [translateX, setTranslateX] = useState(0)
  const [containerH, setContainerH] = useState("300vh")

  /** 이미지·뷰포트 크기로 컨테이너 높이 재계산 */
  const recalcHeight = useCallback(() => {
    const img = imgRef.current
    if (!img || img.offsetWidth === 0) return
    const vw = window.innerWidth
    const imgW = img.offsetWidth
    const startX = vw * 0.5
    const endX = -(imgW - vw * 0.5)
    const travel = startX - endX   // = imgW (항상 이미지 너비)
    setContainerH(`${window.innerHeight + travel}px`)
  }, [])

  /** 스크롤 위치로 translateX 계산 */
  const updateTranslate = useCallback(() => {
    const outer = outerRef.current
    const img = imgRef.current
    if (!outer || !img) return
    const vw = window.innerWidth
    const imgW = img.offsetWidth
    const startX = vw * 0.5
    const endX = -(imgW - vw * 0.5)
    const rect = outer.getBoundingClientRect()
    const scrollable = outer.offsetHeight - window.innerHeight
    const scrolled = Math.max(0, -rect.top)
    const progress = scrollable > 0 ? Math.min(1, scrolled / scrollable) : 0
    setTranslateX(startX + (endX - startX) * progress)
  }, [])

  useEffect(() => {
    const onScroll = () => updateTranslate()
    const onResize = () => { recalcHeight(); updateTranslate() }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)

    // 이미 캐시된 이미지라면 바로 계산
    if (imgRef.current?.complete) {
      recalcHeight()
      updateTranslate()
    }

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [recalcHeight, updateTranslate])

  return (
    <div ref={outerRef} style={{ position: "relative", height: containerH }}>
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
          ref={imgRef}
          src="/onboarding_frame.png"
          alt="onboarding frame"
          onLoad={() => {
            recalcHeight()
            updateTranslate()
          }}
          style={{
            transform: `translateX(${translateX}px)`,
            display: "block",
            maxHeight: "85vh",
            width: "auto",
            flexShrink: 0,
            willChange: "transform",
          }}
        />
      </div>
    </div>
  )
}
