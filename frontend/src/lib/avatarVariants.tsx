/**
 * @file src/lib/avatarVariants.tsx
 * @description 사용자/선배 아바타 색상 변형(variant) 정의 및 관련 유틸리티
 */

export type AvatarVariant = {
  bg: string
  fill: string
  bodyPath: string
}

const BODY_PATH_A =
  'M15.5695 50.5184C17.4976 42.3701 25.5849 37.9167 33.9582 37.9167H36.0431C44.4165 37.9167 52.5037 42.3701 54.4318 50.5184C54.8049 52.095 55.1014 53.7449 55.2683 55.4215C55.4278 57.0245 54.1115 58.3334 52.5007 58.3334H17.5006C15.8898 58.3334 14.5735 57.0245 14.733 55.4215C14.8999 53.7449 15.1964 52.095 15.5695 50.5184Z'

const BODY_PATH_B =
  'M16.0559 48.6456C18.0061 41.7385 24.8466 37.9167 32.0238 37.9167H37.9775C45.1547 37.9167 51.9952 41.7385 53.9454 48.6456C54.5791 50.89 55.0911 53.3378 55.3068 55.8362C55.4256 57.2118 54.298 58.3334 52.9173 58.3334H17.084C15.7033 58.3334 14.5757 57.2118 14.6945 55.8362C14.9102 53.3378 15.4222 50.89 16.0559 48.6456Z'

export const AVATAR_VARIANTS: AvatarVariant[] = [
  { bg: '#EFF6FF', fill: '#2E6793', bodyPath: BODY_PATH_A }, // 0: 파란 계열
  { bg: '#FAF5FF', fill: '#5B14A2', bodyPath: BODY_PATH_B }, // 1: 보라 계열
  { bg: '#FFF7ED', fill: '#5C3F3F', bodyPath: BODY_PATH_B }, // 2: 갈색/주황 계열
  { bg: '#FDF2F8', fill: '#C7002B', bodyPath: BODY_PATH_B }, // 3: 핑크/빨강 계열
]

export function AvatarIcon({
  fill,
  bodyPath,
  size = 70,
}: {
  fill: string
  bodyPath: string
  size?: number
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 70 70"
      fill="none"
    >
      <circle cx="35.0007" cy="23.3334" r="11.6667" fill={fill} />
      <path d={bodyPath} fill={fill} />
    </svg>
  )
}

/** UUID 문자열을 해시하여 일관된 아바타 변형 반환 */
export function getAvatarVariantForId(id: string): AvatarVariant {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_VARIANTS[hash % AVATAR_VARIANTS.length]
}
