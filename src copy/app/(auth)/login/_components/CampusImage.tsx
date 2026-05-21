/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(auth)/login/_components/CampusImage.tsx                      ║
║  역할: 로그인 페이지 오른쪽 절반을 채우는 캠퍼스 배경 이미지 패널             ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    - props 없음 (완전히 정적인 컴포넌트)                                      ║
║    - 이미지 소스: /public/campus.png                                         ║
║                                                                              ║
║  이 파일을 사용하는 곳:                                                       ║
║    - src/app/(auth)/login/page.tsx (오른쪽 50% 영역)                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// ── Next.js 최적화 이미지 컴포넌트 ────────────────────────────────────────────
import Image from "next/image";

/**
 * CampusImage
 *
 * 로그인 페이지 오른쪽 절반을 차지하는 캠퍼스 사진 패널.
 * - `fill` prop으로 부모 div 전체를 꽉 채운다.
 * - `transform: scale(2.8)` + `transformOrigin`으로 특정 지점을 확대하여
 *   캠퍼스의 원하는 부분(65% 수평, 53% 수직)을 클로즈업한다.
 * - 이미지 위에 반투명 검정 오버레이(opacity 0.25)를 올려 분위기를 조성한다.
 */
export default function CampusImage() {
  return (
    // 오른쪽 50% 폭, 상대 위치 기준(fill 이미지용), overflow hidden으로 확대된 이미지 클리핑
    <div style={{ width: "50%", position: "relative", overflow: "hidden" }}>
      <Image
        src="/campus.png"        // public 폴더의 캠퍼스 이미지
        alt="캠퍼스"
        fill                     // 부모 div를 100% 채움 (absolute 포지셔닝 적용됨)
        style={{
          objectFit: "cover",           // 비율 유지하며 영역을 가득 채움
          objectPosition: "65% 53%",    // 이미지의 초점 위치 (좌우 65%, 상하 53% 지점 중심)
          transform: "scale(2.8)",      // 2.8배 확대하여 특정 부분 클로즈업
          transformOrigin: "65% 53%",   // 확대 기준점을 초점 위치와 동일하게 맞춤
        }}
        priority  // LCP 최적화: 페이지 로드 시 이미지를 우선 로딩
      />
      {/* 어두운 오버레이: 이미지 위에 반투명 검정을 덮어 전체 분위기 조절 */}
      <div
        style={{
          position: "absolute",
          inset: 0,                  // top/right/bottom/left 모두 0으로 이미지 전체를 덮음
          backgroundColor: "black",
          opacity: 0.25,             // 25% 불투명도 (값 증가 시 더 어두워짐)
          pointerEvents: "none",     // 이 오버레이가 마우스 이벤트를 가로채지 않도록
        }}
      />
    </div>
  );
}
