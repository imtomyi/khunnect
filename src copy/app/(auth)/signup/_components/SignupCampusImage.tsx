/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/signup/_components/SignupCampusImage.tsx               ║
║  역할: 회원가입 페이지 오른쪽 절반을 채우는 캠퍼스 배경 이미지 패널           ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - props 없음 (완전히 정적인 컴포넌트)                                      ║
║    - 이미지 소스: /public/campus.png                                         ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - src/app/(auth)/signup/page.tsx (오른쪽 50% 영역)                        ║
║                                                                              ║
║  참고: 로그인 페이지의 CampusImage와 동일한 역할이나 별도 컴포넌트로 분리됨.  ║
║        상단의 IMG_SCALE / IMG_X / IMG_Y 상수를 조정하여 이미지 위치를 변경.  ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── Next.js 최적화 이미지 컴포넌트 ────────────────────────────────────────────
import Image from "next/image";

// ── 이미지 위치 조정 상수 ──────────────────────────────────────────────────────
const IMG_SCALE = 2.0;       // 확대 배율 (클수록 확대) — 현재 style에서는 2.8 사용 중
const IMG_X = "65%";         // 좌우: 0% 왼쪽 ↔ 100% 오른쪽
const IMG_Y = "30%";         // 상하: 0% 위 ↔ 100% 아래
// 위 상수들은 style 속성에 직접 반영되어 있으니 변경 시 아래 Image 스타일도 함께 수정할 것

/**
 * SignupCampusImage
 *
 * 회원가입 페이지 오른쪽 절반을 차지하는 캠퍼스 사진 패널.
 * 로그인 페이지의 CampusImage와 동일한 구조이나 회원가입 전용으로 분리되어 있다.
 * - `fill` prop으로 부모 div 전체를 꽉 채운다.
 * - `transform: scale(2.8)` + `transformOrigin`으로 특정 지점을 확대하여
 *   캠퍼스의 원하는 부분(65% 수평, 53% 수직)을 클로즈업한다.
 * - 이미지 위에 반투명 검정 오버레이(opacity 0.25)를 올려 분위기를 조성한다.
 */
export default function SignupCampusImage() {
  return (
    // 오른쪽 50% 폭, 상대 위치 기준(fill 이미지용), overflow hidden으로 확대된 이미지 클리핑
    <div style={{ width: "50%", position: "relative", overflow: "hidden" }}>
      <Image
        src="/campus.png"         // public 폴더의 캠퍼스 이미지
        alt="캠퍼스"
        fill                      // 부모 div를 100% 채움 (absolute 포지셔닝 적용됨)
        style={{
          objectFit: "cover",            // 비율 유지하며 영역을 가득 채움
          objectPosition: "65% 53%",     // 이미지 초점 위치 (수평 65%, 수직 53%)
          transform: "scale(2.8)",       // 2.8배 확대하여 특정 부분 클로즈업
          transformOrigin: "65% 53%",    // 확대 기준점을 초점 위치와 동일하게 맞춤
        }}
        priority  // LCP 최적화: 페이지 로드 시 이미지를 우선 로딩
      />
      {/* 어두운 오버레이 — opacity로 밝기 조절 (0 = 없음, 1 = 완전 검정) */}
      <div
        style={{
          position: "absolute",
          inset: 0,                   // top/right/bottom/left 모두 0으로 이미지 전체를 덮음
          backgroundColor: "black",
          opacity: 0.25,              // 25% 불투명도 (값 증가 시 더 어두워짐)
          pointerEvents: "none",      // 이 오버레이가 마우스 이벤트를 가로채지 않도록
        }}
      />
    </div>
  );
}
