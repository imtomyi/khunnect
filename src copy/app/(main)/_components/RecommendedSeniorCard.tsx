"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Senior } from "@/types";
import { getAvatarVariantForId, AvatarIcon, AVATAR_VARIANTS } from "@/lib/avatarVariants";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
const cardStyle = (isZeroState?: boolean): React.CSSProperties => ({
  backgroundColor: "#FCF1F1",
  height: isZeroState ? "450px" : "646.052px",
  borderRadius: "32px",
  padding: "41.281px",
  gap: "24px",
  boxShadow: "0 1.032px 2.064px 0 rgba(0,0,0,0.05)",
});

const titleTextStyle: React.CSSProperties = {
  color: "#5C3F3F",
  fontFamily: "Roboto",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "100%",
};

const zeroStateIconWrapStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const zeroStateTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1F1A1A",
  marginBottom: "8px",
};

const zeroStateDescStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#916F6E",
  lineHeight: 1.6,
};

const zeroStateBtnBaseStyle: React.CSSProperties = {
  width: "100%",
  border: "2px solid rgba(154,0,31,0.15)",
  borderRadius: "16px",
  height: "56px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#9A001F",
  backgroundColor: "transparent",
  cursor: "pointer",
  transition: "background-color 150ms ease",
};

const slideAreaStyle = (sliding: boolean, slideDir: "left" | "right"): React.CSSProperties => ({
  transition: "opacity 220ms ease, transform 220ms ease",
  opacity: sliding ? 0 : 1,
  transform: sliding
    ? `translateX(${slideDir === "left" ? "-12px" : "12px"})`
    : "translateX(0)",
  cursor: "grab",
  userSelect: "none",
});

const profileCardStyle: React.CSSProperties = {
  padding: "24.769px",
  gap: "16.512px",
  borderRadius: "24px",
  background: "#FFF",
  boxShadow: "0 1.032px 2.064px 0 rgba(0,0,0,0.05)",
};

const avatarWrapStyle = (bg: string): React.CSSProperties => ({
  width: "66.05px",
  height: "66.05px",
  borderRadius: "16.512px",
  background: bg,
});

const profileImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const profileNameStyle: React.CSSProperties = {
  color: "#1F1A1A",
  fontFamily: "Roboto",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "100%",
};

const profileJobStyle: React.CSSProperties = {
  color: "#5C3F3F",
  fontFamily: "Roboto",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "100%",
};

const skillTagStyle: React.CSSProperties = {
  display: "flex",
  padding: "4.128px 12.384px",
  borderRadius: "9999px",
  background: "#F6EBEB",
  color: "#1F1A1A",
  fontFamily: "Roboto",
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: "100%",
};

const connectBtnStyle: React.CSSProperties = {
  display: "flex",
  padding: "12.384px 0",
  justifyContent: "center",
  alignItems: "center",
  gap: "8.256px",
  alignSelf: "stretch",
  borderRadius: "12px",
  background: "#9A001F",
  color: "#FFF8F7",
  fontFamily: "Roboto",
  fontSize: "16px",
  fontWeight: 800,
  lineHeight: "100%",
  border: "none",
  cursor: "pointer",
};

const dotStyle = (isActive: boolean): React.CSSProperties => ({
  height: "6px",
  borderRadius: "9999px",
  transition: "all 250ms ease",
  width: isActive ? "20px" : "6px",
  backgroundColor: isActive ? "#1F1A1A" : "#E6BDBB",
  border: "none",
  padding: 0,
  cursor: "pointer",
});

const sessionBoxStyle: React.CSSProperties = {
  backgroundColor: "#094F7A1A",
  border: "1.032px solid rgba(9, 79, 122, 0.20)",
};

// ── 서브컴포넌트 ────────────────────────────────────────────────────────────

type RecommendedSeniorCardProps = {
  seniors: Senior[];
  seniorIndex: number;
  sliding: boolean;
  slideDir: "left" | "right";
  dragStartX: React.MutableRefObject<number | null>;
  onGoToSenior: (index: number) => void;
  onDragStart: (clientX: number) => void;
  onDragEnd: (clientX: number) => void;
  isZeroState?: boolean;
  // wheel 이벤트 리스너 등록용 ref — wrapper div 없이 직접 연결
  containerRef?: React.RefObject<HTMLDivElement | null>;
  // 캘린더에서 가져온 가장 가까운 예정 세션 (없으면 senior.scheduledSession 폴백)
  upcomingSession?: { title: string; description?: string } | null;
};

function ZeroStateSection() {
  return (
    <div className="flex flex-col items-center flex-1 justify-center gap-4 text-center">
      <div style={zeroStateIconWrapStyle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 34 22" fill="none">
          <path d="M17.9086 10.4615C18.5574 9.76488 19.0371 8.96497 19.3478 8.06181C19.6584 7.15866 19.8138 6.22752 19.8138 5.2684C19.8138 4.30928 19.6584 3.37815 19.3478 2.47499C19.0371 1.57184 18.5574 0.771927 17.9086 0.0752637C19.2471 0.227717 20.3585 0.79846 21.2427 1.78749C22.1269 2.77652 22.569 3.93683 22.569 5.2684C22.569 6.59998 22.1269 7.76028 21.2427 8.74931C20.3585 9.73835 19.2471 10.3091 17.9086 10.4615ZM25.9104 22V18.4685C25.9104 17.6479 25.7414 16.8671 25.4033 16.1263C25.0653 15.3855 24.5856 14.7497 23.9642 14.219C25.1327 14.603 26.2084 15.1212 27.1912 15.7735C28.1741 16.4258 28.6655 17.3241 28.6655 18.4685V22H25.9104ZM28.6655 12.1289V9.11838H25.6173V6.86053H28.6655V3.84998H30.9517V6.86053H34V9.11838H30.9517V12.1289H28.6655ZM11.431 10.5368C9.95967 10.5368 8.70275 10.022 7.66028 8.99247C6.61782 7.96291 6.09659 6.72156 6.09659 5.2684C6.09659 3.81525 6.61782 2.57389 7.66028 1.54434C8.70275 0.514779 9.95967 0 11.431 0C12.9024 0 14.1593 0.514779 15.2018 1.54434C16.2443 2.57389 16.7655 3.81525 16.7655 5.2684C16.7655 6.72156 16.2443 7.96291 15.2018 8.99247C14.1593 10.022 12.9024 10.5368 11.431 10.5368ZM0 22V18.6537C0 17.9165 0.20273 17.2339 0.608189 16.6057C1.01365 15.9776 1.5554 15.4946 2.23345 15.1569C3.74 14.4274 5.25974 13.8803 6.79268 13.5156C8.32561 13.1508 9.87173 12.9685 11.431 12.9685C12.9904 12.9685 14.5365 13.1508 16.0694 13.5156C17.6023 13.8803 19.1221 14.4274 20.6286 15.1569C21.3067 15.4946 21.8484 15.9776 22.2539 16.6057C22.6594 17.2339 22.8621 17.9165 22.8621 18.6537V22H0ZM11.431 8.27895C12.2693 8.27895 12.9869 7.98417 13.5839 7.3946C14.1809 6.80504 14.4793 6.0963 14.4793 5.2684C14.4793 4.4405 14.1809 3.73177 13.5839 3.1422C12.9869 2.55264 12.2693 2.25786 11.431 2.25786C10.5928 2.25786 9.87514 2.55264 9.27818 3.1422C8.68123 3.73177 8.38275 4.4405 8.38275 5.2684C8.38275 6.0963 8.68123 6.80504 9.27818 7.3946C9.87514 7.98417 10.5928 8.27895 11.431 8.27895ZM2.28616 19.7421H20.5759V18.6537C20.5759 18.3488 20.4865 18.0666 20.3077 17.807C20.1289 17.5474 19.8861 17.3356 19.5793 17.1716C18.2662 16.5328 16.9273 16.0489 15.5625 15.7199C14.1978 15.3908 12.8206 15.2263 11.431 15.2263C10.0415 15.2263 8.6643 15.3908 7.29954 15.7199C5.93478 16.0489 4.59584 16.5328 3.28274 17.1716C2.97595 17.3356 2.73316 17.5474 2.55436 17.807C2.37556 18.0666 2.28616 18.3488 2.28616 18.6537V19.7421Z" fill="#C7002B"/>
        </svg>
      </div>
      <div>
        <p style={zeroStateTitleStyle}>선배한테 도움 요청</p>
        <p style={zeroStateDescStyle}>
          나와 같은 고민을 했던 선배들은<br />어떤 길을 걸었을까요?
        </p>
      </div>
    </div>
  );
}

type ProfileCardSectionProps = {
  senior: Senior;
  sliding: boolean;
  slideDir: "left" | "right";
  dragStartX: React.MutableRefObject<number | null>;
  onDragStart: (clientX: number) => void;
  onDragEnd: (clientX: number) => void;
  avatarBg: string;
  avatarFill: string;
  avatarBodyPath: string;
};

function ProfileCardSection({
  senior,
  sliding,
  slideDir,
  dragStartX,
  onDragStart,
  onDragEnd,
  avatarBg,
  avatarFill,
  avatarBodyPath,
}: ProfileCardSectionProps) {
  // 스와이프 시작 X 좌표 — 끝점과 비교해 스와이프 여부 판정
  const swipeStartX = useRef<number | null>(null);
  // 스와이프로 판정된 경우 click 이벤트 차단용 플래그
  const wasSwipe = useRef(false);
  const SWIPE_THRESHOLD = 30; // 30px 이상 이동 시 스와이프로 판정

  function handleStart(clientX: number) {
    swipeStartX.current = clientX;
    wasSwipe.current = false;
    onDragStart(clientX);
  }

  function handleEnd(clientX: number) {
    if (swipeStartX.current !== null) {
      if (Math.abs(clientX - swipeStartX.current) >= SWIPE_THRESHOLD) wasSwipe.current = true;
      swipeStartX.current = null;
    }
    onDragEnd(clientX);
  }

  return (
    <div
      style={slideAreaStyle(sliding, slideDir)}
      onClickCapture={(e) => {
        // 스와이프였으면 클릭 이벤트 차단 (Link 버튼 오작동 방지)
        if (wasSwipe.current) { e.stopPropagation(); wasSwipe.current = false; }
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseUp={(e) => handleEnd(e.clientX)}
      onMouseLeave={() => { swipeStartX.current = null; dragStartX.current = null; }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
    >
      <div className="flex flex-col items-start w-full" style={profileCardStyle}>
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 flex items-center justify-center overflow-hidden"
            style={avatarWrapStyle(senior.profileImage ? "#F6EBEB" : avatarBg)}
          >
            {senior.profileImage ? (
              <img src={senior.profileImage} alt={senior.name} style={profileImgStyle} />
            ) : (
              <AvatarIcon fill={avatarFill} bodyPath={avatarBodyPath} size={54} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p style={profileNameStyle}>{senior.name}</p>
            <p style={profileJobStyle}>{senior.jobTitle}</p>
          </div>
        </div>

        {/* 스킬 태그 */}
        <div className="flex flex-wrap gap-2">
          {senior.skills.map((skill) => (
            <span key={skill} style={skillTagStyle}>{skill}</span>
          ))}
        </div>

        {/* 연결 버튼 */}
        <Link href={`/seniors/${senior.id}`} className="w-full">
          <button className="w-full" style={connectBtnStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
              <path d="M4.8 15H14.4V12.5H4.8V15ZM4.8 11.25H19.2V8.75H4.8V11.25ZM4.8 7.5H19.2V5H4.8V7.5ZM0 25V2.5C0 1.8125 0.235 1.22396 0.705 0.734375C1.175 0.244792 1.74 0 2.4 0H21.6C22.26 0 22.825 0.244792 23.295 0.734375C23.765 1.22396 24 1.8125 24 2.5V17.5C24 18.1875 23.765 18.776 23.295 19.2656C22.825 19.7552 22.26 20 21.6 20H4.8L0 25ZM3.78 17.5H21.6V2.5H2.4V18.9062L3.78 17.5Z" fill="#FFF8F7"/>
            </svg>
            지금 연결하기
          </button>
        </Link>
      </div>
    </div>
  );
}

type PaginationDotsProps = {
  seniors: Senior[];
  seniorIndex: number;
  onGoToSenior: (index: number) => void;
};

function PaginationDots({ seniors, seniorIndex, onGoToSenior }: PaginationDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      {seniors.map((_, i) => (
        <button
          key={i}
          onClick={() => onGoToSenior(i)}
          style={dotStyle(i === seniorIndex)}
        />
      ))}
    </div>
  );
}

type SessionBoxProps = {
  title: string;
  description?: string;
};

function SessionBox({ title, description }: SessionBoxProps) {
  return (
    <div className="rounded-2xl px-6 pt-[26px] pb-9 flex flex-col gap-1" style={sessionBoxStyle}>
      <p className="text-xs text-[#094F7A]">예정된 세션</p>
      <p className="text-sm text-[#1F1A1A] leading-snug" style={{ fontWeight: 800 }}>{title}</p>
      {description && (
        <p className="text-sm text-[#1F1A1A] leading-snug">{description}</p>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function RecommendedSeniorCard({
  seniors,
  seniorIndex,
  sliding,
  slideDir,
  dragStartX,
  onGoToSenior,
  onDragStart,
  onDragEnd,
  isZeroState,
  containerRef,
  upcomingSession,
}: RecommendedSeniorCardProps) {
  const senior = seniors[seniorIndex];
  const avatarVariant = senior ? getAvatarVariantForId(senior.id) : AVATAR_VARIANTS[3];

  // upcomingSession(캘린더 공유 소스) 우선, 없으면 senior.scheduledSession 폴백
  const fallbackSession = seniors
    .filter((s) => s.scheduledSession)
    .map((s) => s.scheduledSession!)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0] ?? null;
  const nearestSession = upcomingSession ?? fallbackSession;

  return (
    <div ref={containerRef} className="flex-1 flex flex-col" style={cardStyle(isZeroState)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M10.1875 19.44L16.6562 12H11.6562L12.5625 5.19L6.78125 13.2H11.125L10.1875 19.44ZM7 24L8.25 15.6H2L13.25 0H15.75L14.5 9.6H22L9.5 24H7Z" fill="#094F7A"/>
          </svg>
          <span style={titleTextStyle}>선배와의 연결</span>
        </div>
      </div>

      {/* 제로 스테이트 본문 */}
      {isZeroState && <ZeroStateSection />}

      {/* 제로 스테이트 버튼 */}
      {isZeroState && (
        <Link href="/seniors">
          <button
            style={zeroStateBtnBaseStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#9A001F"; e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9A001F"; }}
          >
            선배 찾기
          </button>
        </Link>
      )}

      {/* 정상 상태 */}
      {!isZeroState && seniors.length > 0 && senior && (
        <div className="flex flex-col gap-3 flex-1">
          <ProfileCardSection
            senior={senior}
            sliding={sliding}
            slideDir={slideDir}
            dragStartX={dragStartX}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            avatarBg={avatarVariant.bg}
            avatarFill={avatarVariant.fill}
            avatarBodyPath={avatarVariant.bodyPath}
          />
          <PaginationDots seniors={seniors} seniorIndex={seniorIndex} onGoToSenior={onGoToSenior} />
          {nearestSession && (
            <div className="mt-auto mb-[30px]">
              <SessionBox title={nearestSession.title} description={nearestSession.description} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
