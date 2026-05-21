/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/onboarding/page.tsx                                           ║
║  역할: 서비스 소개 랜딩 페이지 (온보딩/마케팅 페이지)                         ║
║        비로그인 사용자가 처음 접하는 공개 페이지                              ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - 순수 정적 UI 컴포넌트 (외부 API 호출 없음)                               ║
║    - 모든 링크는 /login 또는 내부 섹션으로 연결                               ║
║                                                                              ║
║  하위 컴포넌트:                                                               ║
║    - ScrollingFrame  (이 파일 내 정의) 스크롤 연동 이미지 슬라이드 애니메이션 ║
║    - Logo            → @/components/Logo   네브바 및 CTA 섹션 로고            ║
║    - Footer          → @/components/Footer 하단 공통 푸터                    ║
║    - Link            → next/link           SPA 페이지 이동                   ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - Next.js App Router: "/onboarding" 경로에 자동 매핑                      ║
║    - (auth) 그룹 외부의 루트 레벨 페이지 (별도 레이아웃 없음)                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── Next.js Link: 로그인 버튼 및 CTA 버튼 이동에 사용 ────────────────────────
import Link from "next/link";

// ── 로고 컴포넌트: 네브바 및 CTA 섹션에서 사용 ───────────────────────────────
import Logo from "@/components/Logo";

// ── 공통 푸터 컴포넌트 ────────────────────────────────────────────────────────
import Footer from "@/components/Footer";

// ── React 훅 ──────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";

/** 브랜드 컬러 상수: 버튼 배경, 강조 색상 등에 공통 사용 */
const BRAND = "#9A001F";

/** 네브바 배경 투명도 (0 = 완전 투명, 1 = 불투명) */
const NAV_OPACITY = 0.8;

/**
 * ScrollingFrame
 *
 * 스크롤에 따라 이미지가 화면 오른쪽에서 왼쪽으로 이동하는 패럴랙스 섹션.
 *
 * 동작 원리:
 * 1. outerRef div의 높이를 300vh로 설정하여 이 구간에서 스크롤이 머물게 함
 * 2. 내부 div는 sticky로 화면 상단에 고정되어 스크롤 중에도 보임
 * 3. scroll 이벤트에서 outerRef의 getBoundingClientRect()로 현재 스크롤 진행도(0~1) 계산
 * 4. translateX를 +200px(오른쪽 밖) → -300px(왼쪽 밖) 범위로 변경
 */
function ScrollingFrame() {
  /** outerRef: 스크롤 공간을 만드는 tall 컨테이너에 대한 ref */
  const outerRef = useRef<HTMLDivElement>(null);

  /** 이미지의 현재 가로 이동 값 (px 단위, 양수: 오른쪽, 음수: 왼쪽) */
  const [translateX, setTranslateX] = useState(200);

  useEffect(() => {
    const handleScroll = () => {
      if (!outerRef.current) return;

      const rect = outerRef.current.getBoundingClientRect(); // 뷰포트 기준 위치
      const outerH = outerRef.current.offsetHeight;          // outerRef 전체 높이
      const windowH = window.innerHeight;                    // 현재 뷰포트 높이

      // 스크롤 가능한 총 거리: outerRef 높이에서 뷰포트 높이를 뺀 값
      const scrollable = outerH - windowH;

      // 현재까지 스크롤된 거리 (outerRef 최상단이 뷰포트 상단과 일치할 때 0 시작)
      const scrolled = Math.max(0, -rect.top);

      // 진행도: 0(시작) ~ 1(끝), 범위를 벗어나지 않도록 clamp
      const progress = scrollable > 0 ? Math.min(1, scrolled / scrollable) : 0;

      // 이미지 이동: 오른쪽(+200px)에서 시작하여 왼쪽 밖(-300px)까지 총 500px 이동
      setTranslateX(200 - progress * 500);
    };

    // passive: true로 등록하여 스크롤 성능 최적화
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 초기 위치 계산 (페이지 중간에서 로드된 경우 대응)

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // 세로를 충분히 확보해서 이 구간에서 스크롤이 머물게 함 (300vh)
    <div ref={outerRef} style={{ position: "relative", height: "300vh" }}>
      {/* sticky: 스크롤하는 동안 화면 상단에 고정 */}
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
            // translateX로 이미지를 가로 이동 (스크롤에 따라 연속적으로 갱신)
            transform: `translateX(${translateX}px)`,
            transition: "transform 0.05s linear",  // 짧은 전환 시간으로 즉각적인 반응
            display: "block",
            maxHeight: "85vh",
            width: "auto",
          }}
        />
      </div>
    </div>
  );
}

/**
 * OnboardingPage
 *
 * 서비스 소개 랜딩 페이지. 총 6개의 섹션으로 구성:
 * 1. 고정 네브바 (로고 + 로그인 버튼)
 * 2. 히어로 섹션 (헤드라인 + CTA + 앱 목업 이미지)
 * 3. 인용구 섹션 (실제 사용자 후기 형태)
 * 4. 핵심 기능 소개 카드 그리드 (4개)
 * 5. 스크롤 연동 이미지 애니메이션 (ScrollingFrame)
 * 6. 최종 CTA 섹션 + 푸터
 */
export default function OnboardingPage() {
  return (
    <div className="page-transition" style={{ fontFamily: "var(--font-roboto), sans-serif", backgroundColor: "#FFFFFF", minWidth: "1280px" }}>

      {/* ── 네브바: 스크롤 시 상단에 sticky로 고정되는 pill 형태 ── */}
      {/* 바깥 래퍼: sticky 위치 + 가운데 정렬 담당 */}
      <div style={{
        position: "sticky",
        top: "10px",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",           // 래퍼 자체는 클릭 통과
      }}>
        {/* 안쪽 pill 네브바 */}
        <div style={{
          pointerEvents: "auto",         // 실제 클릭은 pill에서만 받음
          display: "flex",
          width: "400px",
          padding: "2px 20px 2px 25px",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "9999px",        // pill 형태
          border: "1.5px solid #F1F5F9",
          background: `rgba(244, 244, 244, ${NAV_OPACITY})`,  // 반투명 배경
          boxShadow: "0 1.5px 3px 0 rgba(0, 0, 0, 0.05)",
          backdropFilter: "blur(18px)",  // 배경 흐림 효과 (유리 느낌)
        }}>
          <Logo size={18} />
          {/* 로그인 버튼: /login 페이지로 이동 */}
          <Link href="/login">
            <button style={{
              backgroundColor: "transparent", border: "none",
              color: "#64748B", borderRadius: "100px", padding: "6px 20px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}>로그인</button>
          </Link>
        </div>
      </div>

      {/* ── 1. 히어로 섹션 ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        minHeight: "100vh", backgroundColor: "#FFFFFF",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "80px 48px 80px",
        textAlign: "center", gap: "32px",
      }}>
        {/* 데코레이션 블러 블롭 — 왼쪽 파랑 (배경 분위기 연출) */}
        <div style={{
          position: "absolute", top: "150px", left: "500px",
          width: "420px", height: "420px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(150,180,255,0.85) 0%, rgba(180,205,255,0.45) 50%, transparent 70%)",
          filter: "blur(48px)", pointerEvents: "none", zIndex: 1,
        }} />
        {/* 데코레이션 블러 블롭 — 오른쪽 보라 */}
        <div style={{
          position: "absolute", top: "300px", right: "500px",
          width: "380px", height: "380px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(150,80,255,0.55) 0%, rgba(170,110,255,0.28) 50%, transparent 70%)",
          filter: "blur(56px)", pointerEvents: "none", zIndex: 1,
        }} />

        {/* 콘텐츠 래퍼: 블롭(zIndex:1)보다 위에 표시되도록 zIndex:2 */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
          {/* 헤드라인: 두 줄 구성. 두 번째 줄에 그라디언트 텍스트와 브랜드 로고명 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ fontSize: "52px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1.2, margin: 0 }}>
              당신의 빛나는 미래를 그려나가는
            </h1>
            <h1 style={{ fontSize: "52px", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
              {/* "졸업 내비게이션" 파랑 그라디언트 텍스트 */}
              <span style={{
                background: "linear-gradient(90deg, #0052FF, #60A5FA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>졸업 내비게이션, </span>
              {/* "khu" — AvantGarde LT Bold 폰트, 브랜드 빨강 */}
              <span style={{ fontFamily: '"AvantGarde LT Bold"', fontSize: "72px", fontWeight: 400, lineHeight: "72px", letterSpacing: "-3px", color: "#9A001F" }}>khu</span>
              {/* "nnect." — AvantGarde Bk BT 폰트, 다크 그레이 */}
              <span style={{ fontFamily: '"AvantGarde Bk BT"', fontSize: "72px", fontWeight: 400, lineHeight: "72px", letterSpacing: "-3px", color: "#524949" }}>nnect.</span>
            </h1>
          </div>

          {/* 서브텍스트: 서비스의 주요 가치 제안 */}
          <p style={{ fontSize: "16px", color: "#5C3F3F", lineHeight: 1.5, maxWidth: "520px", margin: 0 }}>
            직무 맞춤 커리어 로드맵부터 현직 선배와의 연결, 그리고 복잡한 학점 계산까지<br />
            khunnect와 함께 성공적인 대학 생활을 설계하세요.
          </p>

          {/* CTA 버튼: /login으로 이동 */}
          <Link href="/login">
            <button style={{
              backgroundColor: BRAND, color: "#FFFFFF", border: "none",
              borderRadius: "100px", padding: "16px 48px",
              fontSize: "15px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(154,0,31,0.3)",
            }}>지금 시작하기</button>
          </Link>

          {/* 앱 목업 이미지: 실제 서비스 화면 스크린샷 */}
          <div style={{
            marginTop: "8px",
            width: "760px", borderRadius: "20px", overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
          }}>
            <img src="/main 1.png" alt="앱 스크린샷" style={{ width: "100%", display: "block" }} />
          </div>
        </div>
      </section>

      {/* ── 2. 인용구 섹션 ── */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "120px 200px 120px 600px", position: "relative" }}>
        <div style={{ maxWidth: "640px", textAlign: "left" }}>
          {/* 따옴표 SVG 아이콘: 브랜드 컬러로 2개의 큰따옴표 형태 표현 */}
          <svg width="72" height="56" viewBox="0 0 72 56" fill="none" style={{ marginBottom: "24px" }}>
            <rect x="0" y="0" width="26" height="36" rx="4" fill={BRAND}/>
            <rect x="0" y="40" width="26" height="16" rx="4" fill={BRAND}/>
            <rect x="34" y="0" width="26" height="36" rx="4" fill={BRAND}/>
            <rect x="34" y="40" width="26" height="16" rx="4" fill={BRAND}/>
          </svg>
          {/* 인용 문구 본문 */}
          <p style={{ fontSize: "26px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.5, marginBottom: "0", fontFamily: "Roboto, sans-serif" }}>
            혼자 고민해서는 앞으로 어떤 길을 가야 할지<br />
            답이 안 나와요. 먼저 그 길을 걸어본 선배의<br />
            현실적인 조언이 필요해요.
          </p>
        </div>
        {/* 인용 출처: absolute로 우측 하단에 배치 */}
        <p style={{ position: "absolute", right: "600px", bottom: "120px", fontSize: "13px", color: "#916F6E", margin: 0 }}>
          산업디자인학과 22학번 김모씨
        </p>
      </section>

      {/* ── 3. 핵심 기능 소개 카드 그리드 ── */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 48px 120px" }}>

        {/* 섹션 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#1F1A1A", marginBottom: "12px" }}>
            선배의 지혜가 담긴 핵심 기능
          </h2>
          <p style={{ fontSize: "14px", color: "#78716C" }}>
            필요한 모든 것을 하나의 플랫폼에서 해결하세요
          </p>
        </div>

        {/* 2x2 기능 카드 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "960px", margin: "0 auto" }}>

          {/* ── 카드 1: 선배와 연결 (채팅 기능) ── */}
          <div style={{
            background: "linear-gradient(135deg, #FFFFFF 55%, #DCFCE7CF 100%)",  // 흰색 → 연한 녹색 그라디언트
            borderRadius: "24px", padding: "24px", minHeight: "280px",
            display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>취업 준비에 강해지는, 선배와 연결</h3>
              <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>비슷한 고민을 했던 선배들의 실제 이야기와 조언을<br />들어보세요.</p>
            </div>
            {/* 채팅 목업 UI */}
            <div style={{ marginTop: "auto", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* 내 메시지 (오른쪽) */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                <div style={{ backgroundColor: BRAND, borderRadius: "16px 4px 16px 16px", padding: "10px 14px", maxWidth: "220px" }}>
                  <p style={{ fontSize: "12px", color: "#FFFFFF", margin: 0, lineHeight: 1.5 }}>포트폴리오와 면접은 어떤 방법으로 준비해야 할까요?</p>
                </div>
                {/* 내 아바타 (원형 회색 플레이스홀더) */}
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#D1D5DB", flexShrink: 0 }} />
              </div>
              {/* 선배 메시지 (왼쪽): 로딩 중을 표현하는 회색 막대 */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                {/* 선배 아바타 (노랑-주황 그라디언트) */}
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #FACC15, #FB923C)", flexShrink: 0 }} />
                <div style={{
                  display: "flex", maxWidth: "201.6px", padding: "12px",
                  flexDirection: "column", alignItems: "flex-start", gap: "8px",
                  borderRadius: "32px 32px 32px 0",
                  border: "1px solid #F3F4F6",
                  background: "#FFF",
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                }}>
                  {/* 답변 로딩 중 표현: 회색 막대 2개 */}
                  <div style={{ width: "120px", height: "8px", borderRadius: "4px", backgroundColor: "#E5E7EB" }} />
                  <div style={{ width: "80px", height: "8px", borderRadius: "4px", backgroundColor: "#E5E7EB" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 카드 2: 커리큘럼 설계 ── */}
          <div style={{
            background: "linear-gradient(225deg, #FFFFFF 55%, #F3E8FF 100%)",  // 흰색 → 연한 보라 그라디언트
            borderRadius: "24px", padding: "24px", minHeight: "280px",
            display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>나에게 맞는 커리큘럼 설계</h3>
              <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>원하는 직무에 맞는 최적의 수강 순서를 설계하세요.</p>
            </div>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              {/* 타임라인: 학년별 진행 상황을 가로 타임라인으로 표현 */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginTop: "10px" }}>
                {/* 전체 타임라인 배경 선 */}
                <div style={{ position: "absolute", left: "8px", right: "8px", height: "2px", backgroundColor: "#E5E7EB", top: "50%", transform: "translateY(-50%)" }} />
                {/* 진행 완료 구간 (브랜드 빨강, 35%까지) */}
                <div style={{ position: "absolute", left: "8px", width: "35%", height: "2px", backgroundColor: BRAND, top: "50%", transform: "translateY(-50%)" }} />
                {/* 학년 노드: 2학년(완료-빨강), 3학년(진행중-파랑), 4학년(미완료-회색) */}
                {[{ label: "2학년", bg: BRAND, color: "#fff" }, { label: "3학년", bg: "#0A4DDE", color: "#fff" }, { label: "4학년", bg: "#D1D5DB", color: "#6B7280" }].map((item) => (
                  <div key={item.label} style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 400, color: item.color }}>{item.label}</span>
                  </div>
                ))}
              </div>
              {/* 선배 추천 말풍선 */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", width: "250px", margin: "auto auto 0" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #FACC15, #FB923C)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>산업디자인학과 선배</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1F1A1A", margin: 0 }}>"이 강의는 꼭 들어보세요!"</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 카드 3: 커리큘럼 계산기 (학점 도넛 차트) ── */}
          <div style={{
            background: "linear-gradient(45deg, #FFFFFF 55%, #DBEAFE 100%)",  // 흰색 → 연한 파랑 그라디언트
            borderRadius: "24px", padding: "24px", minHeight: "280px",
            display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>커리큘럼 계산기</h3>
              <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>복잡한 학점 계산을 시각화하여 앞으로 들어야 할 강의들을 한눈에 파악하세요.</p>
            </div>
            {/* 전공기초/필수/선택 각각의 도넛 차트 3개 */}
            <div style={{ marginTop: "auto", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "20px", display: "flex", justifyContent: "space-around", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {["전공기초", "전공필수", "전공선택"].map((label, i) => {
                const pcts = [75, 50, 60]; // 각 카테고리의 임시 이수율(%) — 목업용 하드코딩
                const r = 40, circ = 2 * Math.PI * r;
                const sw = 8;               // SVG strokeWidth
                const size = (r + sw) * 2;  // SVG 전체 크기
                const cx = size / 2, cy = size / 2;
                return (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                      {/* 배경 링 (회색) */}
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
                      {/* 진행 링 (브랜드 빨강, 안쪽 원): strokeDasharray로 이수율에 따라 채워짐 */}
                      <circle cx={cx} cy={cy} r={r - sw - 1} fill="none" stroke={BRAND} strokeWidth={sw - 1}
                        strokeDasharray={`${2 * Math.PI * (r - sw - 1) * pcts[i] / 100} ${2 * Math.PI * (r - sw - 1)}`}
                        strokeLinecap="butt"
                        transform={`rotate(240 ${cx} ${cy}) scale(-1,1) translate(-${size},0)`} />
                      {/* 중앙 카테고리 레이블 */}
                      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="600" fill="#111827">{label}</text>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 카드 4: 선배와의 약속 기록 (미니 캘린더) ── */}
          <div style={{
            background: "linear-gradient(315deg, #FFFFFF 55%, #FFEDD5 100%)",  // 흰색 → 연한 주황 그라디언트
            borderRadius: "24px", padding: "24px", minHeight: "280px",
            display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6",
            position: "relative", overflow: "hidden",  // 하단 미니 캘린더 클리핑용
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#1F1A1A", lineHeight: 1.4, margin: 0 }}>선배와의 약속 기록</h3>
              <p style={{ fontSize: "13px", color: "#5C3F3F", lineHeight: 1.7, margin: 0 }}>채팅으로 이루어진 선배와의 만남 일정과 계획을 캘린더로 관리하세요.</p>
            </div>
            {/* 미니 캘린더 목업: absolute로 카드 하단에 배치 */}
            <div style={{ position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "375px" }}>
              {/* 7열 그리드: 요일 헤더 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", gap: "2px" }}>
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#9CA3AF", padding: "6px 0", fontWeight: 600 }}>{d}</div>
                ))}
                {/* 첫 번째 주: 1일 전 3칸 비움 + 1~4일 */}
                {[null,null,null,1,2,3,4].map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px" }}>
                    {d && (
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "5px",
                        // 3일은 브랜드 빨강으로 강조 (선배 약속 날짜 예시)
                        backgroundColor: d === 3 ? BRAND : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: "10px", fontWeight: d === 3 ? 700 : 400, color: d === 3 ? "#FFFFFF" : "#1F1A1A" }}>{d}</span>
                      </div>
                    )}
                  </div>
                ))}
                {/* 두 번째 주: 5~11일 */}
                {[5,6,7,8,9,10,11].map((d) => (
                  <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "5px",
                      // 8일은 연한 파랑 배경 + 파랑 텍스트 (다른 일정 예시)
                      backgroundColor: d === 8 ? "#FEE2E2" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "10px", fontWeight: 400, color: d === 8 ? "#3B82F6" : "#1F1A1A" }}>{d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. 스크롤 연동 이미지 애니메이션 섹션 ── */}
      {/* ScrollingFrame: 스크롤에 따라 이미지가 오른쪽에서 왼쪽으로 이동 */}
      <ScrollingFrame />


      {/* ── 5. 최종 CTA 섹션 ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        backgroundColor: "#FFFFFF", padding: "140px 48px",
        textAlign: "center", display: "flex",
        flexDirection: "column", alignItems: "center", gap: "28px",
      }}>
        {/* 배경 데코레이션 블롭들: 다양한 색상과 모양으로 생동감 연출 */}
        <div style={{ position: "absolute", top: "10%", left: "12%", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#FEF08A", opacity: 0.7, zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "30%", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#BFDBFE", opacity: 0.6, filter: "blur(1.5px)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "15%", width: "100px", height: "24px", borderRadius: "12px", backgroundColor: "#BBF7D0", opacity: 0.6, transform: "rotate(-30deg)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", right: "30%", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "transparent", border: "2px solid #F9A8D4", opacity: 0.8, filter: "blur(3px)", zIndex: 1, pointerEvents: "none" }} />

        {/* 콘텐츠 래퍼: 블롭(zIndex:1)보다 위에 표시되도록 zIndex:2 */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>
          {/* CTA 헤드라인: 로고를 인라인으로 삽입 */}
          <h2 style={{ fontSize: "40px", fontWeight: 700, color: "#1F1A1A", lineHeight: 1.3, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span>설계는 <Logo size={36} />가,</span>
            <span>성장은 당신이.</span>
          </h2>
          <p style={{ fontSize: "15px", color: "#5C3F3F", lineHeight: 1.7 }}>
            더이상 혼자 고민하지 마세요. 지금 이미 선배의 경험을 만나보세요.
          </p>
          {/* 최종 CTA 버튼 */}
          <Link href="/login">
            <button style={{
              backgroundColor: BRAND, color: "#FFFFFF", border: "none",
              borderRadius: "100px", padding: "16px 48px",
              fontSize: "15px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(154,0,31,0.3)",
            }}>지금 시작하기</button>
          </Link>
        </div>
      </section>

      {/* ── 6. 공통 푸터 ── */}
      <Footer />

    </div>
  );
}
