/**
 * @file src/lib/avatarVariants.tsx
 * @description 사용자/선배 아바타 색상 변형(variant) 정의 및 관련 유틸리티
 *
 * 역할:
 *  - 아바타 배경색·아이콘 색상·몸통 SVG 경로의 4가지 조합(variant)을 정의한다.
 *  - 사용자 ID 문자열을 해시해 항상 동일한 아바타 variant를 결정한다.
 *  - 회원가입 시 랜덤 아바타 인덱스를 선택하고 localStorage에 저장한다.
 *  - SVG 기반의 아바타 아이콘 컴포넌트(AvatarIcon)를 제공한다.
 *
 * Export:
 *  - AvatarVariant         — 아바타 variant 타입
 *  - AVATAR_VARIANTS       — 4가지 아바타 variant 배열
 *  - AvatarIcon            — SVG 아바타 렌더링 React 컴포넌트
 *  - getAvatarVariantForId — ID 기반으로 일관된 variant 반환
 *  - getRandomAvatarIdx    — 랜덤 아바타 인덱스 반환
 *  - saveAvatarIdx         — 선택한 아바타 인덱스를 localStorage에 저장
 *  - loadAvatarVariant     — localStorage에서 아바타 variant 불러오기
 *
 * 사용처:
 *  - 선배 프로필 카드, 채팅 목록, 마이페이지 등 아바타가 표시되는 모든 컴포넌트
 */

/**
 * 아바타 한 가지 변형(variant)의 타입 정의.
 *
 * @property {string} bg       아바타 배경 원의 색상 (hex)
 * @property {string} fill     아이콘(머리·몸통) 채우기 색상 (hex)
 * @property {string} bodyPath 몸통 부분의 SVG path d 속성 값
 */
export type AvatarVariant = {
  bg: string;
  fill: string;
  bodyPath: string;
};

// 몸통 SVG 경로 A — 어깨가 약간 좁은 실루엣
const BODY_PATH_A =
  "M15.5695 50.5184C17.4976 42.3701 25.5849 37.9167 33.9582 37.9167H36.0431C44.4165 37.9167 52.5037 42.3701 54.4318 50.5184C54.8049 52.095 55.1014 53.7449 55.2683 55.4215C55.4278 57.0245 54.1115 58.3334 52.5007 58.3334H17.5006C15.8898 58.3334 14.5735 57.0245 14.733 55.4215C14.8999 53.7449 15.1964 52.095 15.5695 50.5184Z";

// 몸통 SVG 경로 B — 어깨가 약간 넓은 실루엣
const BODY_PATH_B =
  "M16.0559 48.6456C18.0061 41.7385 24.8466 37.9167 32.0238 37.9167H37.9775C45.1547 37.9167 51.9952 41.7385 53.9454 48.6456C54.5791 50.89 55.0911 53.3378 55.3068 55.8362C55.4256 57.2118 54.298 58.3334 52.9173 58.3334H17.084C15.7033 58.3334 14.5757 57.2118 14.6945 55.8362C14.9102 53.3378 15.4222 50.89 16.0559 48.6456Z";

// 4가지 아바타 variant 정의 (배경색 계열: 파랑, 보라, 주황, 핑크)
export const AVATAR_VARIANTS: AvatarVariant[] = [
  { bg: "#EFF6FF", fill: "#2E6793", bodyPath: BODY_PATH_A }, // 0: 파란 계열
  { bg: "#FAF5FF", fill: "#5B14A2", bodyPath: BODY_PATH_B }, // 1: 보라 계열
  { bg: "#FFF7ED", fill: "#5C3F3F", bodyPath: BODY_PATH_B }, // 2: 갈색/주황 계열
  { bg: "#FDF2F8", fill: "#C7002B", bodyPath: BODY_PATH_B }, // 3: 핑크/빨강 계열
];

// localStorage에서 선택된 아바타 인덱스를 저장/불러올 때 사용하는 키
const STORAGE_KEY = "avatar_variant_idx";

/**
 * SVG 기반 아바타 아이콘 컴포넌트.
 *
 * 머리(원)와 몸통(path)으로 구성된 단순한 인물 실루엣을 렌더링한다.
 * fill과 bodyPath를 외부에서 주입받아 다양한 색상/형태를 표현한다.
 *
 * @param {string} fill      SVG 도형 채우기 색상 (hex)
 * @param {string} bodyPath  몸통 SVG path의 d 속성 값
 * @param {number} [size=70] SVG의 width/height (기본값 70px)
 */
export function AvatarIcon({
  fill,
  bodyPath,
  size = 70, // 기본 크기 70px — 다양한 컨텍스트에서 prop으로 조정 가능
}: {
  fill: string;
  bodyPath: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 70 70" // viewBox는 고정 — size가 바뀌어도 내부 비율은 유지된다
      fill="none"
    >
      {/* 머리 — 중앙 상단에 위치한 원 */}
      <circle cx="35.0007" cy="23.3334" r="11.6667" fill={fill} />
      {/* 몸통 — 어깨/상체 실루엣을 나타내는 path */}
      <path d={bodyPath} fill={fill} />
    </svg>
  );
}

/** ID별 아바타 색상 오버라이드 (0=파랑, 1=보라, 2=갈색, 3=빨강) */
// 특정 선배 ID에 대해 해시 계산 없이 직접 variant를 지정한다.
// 디자이너가 특정 인물의 아바타를 고정할 때 여기에 추가한다.
const AVATAR_IDX_OVERRIDES: Record<string, number> = {
  "senior-2": 0, // 파란 계열 고정
  "senior-3": 2, // 갈색 계열 고정
};

/**
 * ID 문자열을 기반으로 항상 동일한 variant를 반환한다.
 *
 * - AVATAR_IDX_OVERRIDES에 ID가 있으면 지정된 variant를 반환한다.
 * - 없으면 ID 각 문자의 charCode 합산 값을 variant 개수로 나눈 나머지를 인덱스로 사용한다.
 *   → 같은 ID는 항상 같은 아바타 색상을 가진다 (일관성 보장).
 *
 * @param {string} id 선배 ID 또는 사용자 ID 문자열
 * @returns {AvatarVariant} 해당 ID에 대응하는 아바타 variant
 */
export function getAvatarVariantForId(id: string): AvatarVariant {
  // 직접 지정된 오버라이드가 있으면 해시 계산 없이 즉시 반환한다.
  if (id in AVATAR_IDX_OVERRIDES) return AVATAR_VARIANTS[AVATAR_IDX_OVERRIDES[id]];
  // 문자열의 각 문자 코드를 모두 더해 단순 해시를 만든다.
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // 해시를 variant 배열 길이로 나눈 나머지를 인덱스로 사용한다.
  return AVATAR_VARIANTS[hash % AVATAR_VARIANTS.length];
}

/**
 * 0 ~ AVATAR_VARIANTS.length-1 범위의 랜덤 인덱스를 반환한다.
 *
 * 회원가입 시 아바타를 무작위로 선택할 때 사용한다.
 *
 * @returns {number} 랜덤 아바타 인덱스
 */
export function getRandomAvatarIdx(): number {
  return Math.floor(Math.random() * AVATAR_VARIANTS.length);
}

/**
 * 선택된 아바타 인덱스를 localStorage에 저장한다.
 *
 * SSR 환경에서는 window가 없으므로 실행을 건너뛴다.
 *
 * @param {number} idx 저장할 아바타 인덱스 (0~3)
 */
export function saveAvatarIdx(idx: number): void {
  if (typeof window !== "undefined") {
    // 숫자를 문자열로 변환해 저장한다 (localStorage는 문자열만 지원).
    localStorage.setItem(STORAGE_KEY, String(idx));
  }
}

/**
 * localStorage에서 저장된 아바타 variant를 불러온다.
 *
 * - SSR 환경이면 기본값(인덱스 0)을 반환한다.
 * - 저장된 값이 없으면 인덱스 0을 기본값으로 사용한다.
 * - 저장된 인덱스가 유효하지 않으면(범위 초과 등) 인덱스 0으로 폴백한다.
 *
 * @returns {AvatarVariant} 저장된(또는 기본) 아바타 variant
 */
export function loadAvatarVariant(): AvatarVariant {
  // SSR에서는 localStorage 접근 불가 → 기본 variant 반환
  if (typeof window === "undefined") return AVATAR_VARIANTS[0];
  const raw = localStorage.getItem(STORAGE_KEY);
  // raw가 null이면 parseInt가 NaN을 반환하므로 null 체크 후 0을 기본값으로 사용한다.
  const idx = raw !== null ? parseInt(raw, 10) : 0;
  // 인덱스가 범위를 벗어나거나 NaN인 경우 AVATAR_VARIANTS[0]으로 폴백한다.
  return AVATAR_VARIANTS[idx] ?? AVATAR_VARIANTS[0];
}
