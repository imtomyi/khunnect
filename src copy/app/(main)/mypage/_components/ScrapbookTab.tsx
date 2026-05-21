// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ScrapbookTab.tsx — 마이페이지 스크랩북 탭 컴포넌트                         ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    마이페이지 탭 내 "스크랩북" 섹션.                                        ║
// ║    사용자가 저장(스크랩)한 선배 목록을 카드 형태로 표시한다.                  ║
// ║    각 카드를 클릭하면 해당 선배의 상세 페이지로 이동한다.                     ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    부모 컴포넌트 → ScrapbookTab(scrapedSeniors: Senior[])                  ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - next/link          : 선배 상세 페이지(/seniors/[id])로 이동            ║
// ║    - @/types            : Senior 타입                                     ║
// ║    - @/components/ui/avatar : shadcn/ui Avatar 컴포넌트 (아바타 표시)       ║
// ║                                                                          ║
// ║  참고:                                                                    ║
// ║    이 컴포넌트는 Tailwind CSS 클래스 기반으로 스타일링되어 있다.              ║
// ║    ScrapbookSection.tsx(인라인 스타일)와 유사한 역할이지만                   ║
// ║    마이페이지 탭 UI 내에서 사용되는 별도 버전이다.                           ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// Link: 선배 카드 클릭 시 /seniors/[id]로 클라이언트 사이드 이동
import Link from "next/link";
// Senior 타입: 스크랩된 선배 데이터 구조 명세
import type { Senior } from "@/types";
// Avatar / AvatarFallback: shadcn/ui 아바타 컴포넌트
// AvatarFallback: 이미지 로드 실패 또는 이미지 없을 때 대체 텍스트(이니셜) 표시
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** 컴포넌트 Props 타입 */
type ScrapbookTabProps = {
  /** 사용자가 스크랩한 선배 데이터 배열 */
  scrapedSeniors: Senior[];
};

/**
 * ScrapbookTab
 *
 * 마이페이지 탭 UI의 스크랩북 콘텐츠.
 * 스크랩된 선배 목록을 아바타(이니셜) + 이름 + 회사/직함 형태로 표시.
 * hover 시 브랜드 레드 테두리로 인터랙션 피드백 제공.
 *
 * 스타일링 방식: Tailwind CSS 클래스 사용
 *
 * @param scrapedSeniors - 저장된 선배 데이터 배열
 */
export default function ScrapbookTab({ scrapedSeniors }: ScrapbookTabProps) {
  return (
    <div>
      {/* 섹션 제목: 저장된 선배 수를 괄호로 표시 */}
      <h3 className="font-semibold mb-3">저장한 선배 로드맵 ({scrapedSeniors.length})</h3>
      {/* 저장된 선배가 없을 때 안내 문구 */}
      {scrapedSeniors.length === 0 ? (
        <p className="text-sm text-muted-foreground">저장한 선배가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {scrapedSeniors.map((senior) => (
            // 선배 카드 전체를 Link로 감싸 클릭 시 상세 페이지 이동
            // hover:border-[var(--color-brand)]: 마우스 올릴 때 브랜드 레드 테두리
            // transition-all: 테두리 색상 변화를 부드럽게 처리
            <Link
              key={senior.id}
              href={`/seniors/${senior.id}`}
              className="border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[var(--color-brand)] transition-all"
            >
              {/* 아바타 — 이미지 없으면 이름 첫 글자(이니셜)를 Fallback으로 표시 */}
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs font-bold bg-muted">
                  {senior.name[0]}  {/* 예: "김" → "김" */}
                </AvatarFallback>
              </Avatar>
              {/* 선배 이름 + 회사/직함 */}
              <div>
                <p className="text-sm font-medium">{senior.name}</p>
                <p className="text-xs text-muted-foreground">{senior.company} · {senior.jobTitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
