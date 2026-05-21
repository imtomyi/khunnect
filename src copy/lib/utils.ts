/**
 * @file src/lib/utils.ts
 * @description Tailwind CSS 클래스 병합 유틸리티
 *
 * 역할:
 *  - clsx로 조건부 클래스 문자열을 만들고,
 *    twMerge로 충돌하는 Tailwind 클래스(예: p-2 vs p-4)를 자동으로 해소한다.
 *  - shadcn/ui 컴포넌트 및 프로젝트 전반의 모든 컴포넌트에서 className 처리에 사용한다.
 *
 * Export:
 *  - cn  — Tailwind 클래스 안전 병합 함수
 *
 * 사용처:
 *  - 프로젝트 내 거의 모든 UI 컴포넌트 파일
 */

// clsx — 조건부/배열/객체 형태의 클래스 값을 하나의 문자열로 합쳐준다.
import { clsx, type ClassValue } from "clsx"; // npm: clsx
// twMerge — Tailwind 클래스 간 충돌을 해소한다 (마지막으로 선언된 클래스가 우선 적용됨).
import { twMerge } from "tailwind-merge"; // npm: tailwind-merge

/**
 * 여러 클래스 값을 안전하게 병합하는 유틸리티 함수.
 *
 * 사용 예시:
 *  cn("px-2 py-1", isActive && "bg-blue-500", "px-4")
 *  → "py-1 bg-blue-500 px-4"  (px-2가 px-4로 덮어쓰여짐)
 *
 * @param {...ClassValue[]} inputs clsx가 받을 수 있는 모든 형태의 클래스 값
 * @returns {string} 충돌이 해소된 최종 클래스 문자열
 */
export function cn(...inputs: ClassValue[]) {
  // 1단계: clsx로 조건부/배열 클래스를 하나의 문자열로 합친다.
  // 2단계: twMerge로 Tailwind 유틸리티 충돌을 제거한다.
  return twMerge(clsx(inputs));
}
