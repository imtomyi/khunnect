"use client";

import Logo from "@/components/Logo";

export default function HomeFooter() {
  return (
    <footer className="border-t border-border pt-8 pb-4 mt-2 flex items-start justify-between">
      <div>
        <Logo size={20} />
        <p className="text-xs text-muted-foreground mt-1">
          © 2026 우리 앱 이름. 경희대생을 위한 졸업 내비게이션 서비스
        </p>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground">개인정보 처리방침</span>
        <span className="cursor-pointer hover:text-foreground">이용 약관</span>
        <span className="cursor-pointer hover:text-foreground">대학 파트너십</span>
        <span className="cursor-pointer hover:text-foreground">채용 정보</span>
      </div>
    </footer>
  );
}
