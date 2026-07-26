import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import Logo from '../components/Logo'

type Section = { heading: string; body: string[] }
type LegalKind = 'terms' | 'privacy'

// 정직한 실제 내용 — 이 서비스가 실제로 다루는 데이터/정책만 서술한다.
const CONTENT: Record<LegalKind, { title: string; updated: string; intro: string; sections: Section[] }> = {
  terms: {
    title: '이용약관',
    updated: '2026년 7월',
    intro:
      'Khunnect(이하 “서비스”)는 경희대학교 국제캠퍼스 재학생·졸업생이 커리큘럼과 진로 경로를 ' +
      '공유하도록 돕는 학생 주도 프로젝트입니다. 본 약관은 서비스 이용에 관한 조건을 정합니다.',
    sections: [
      {
        heading: '제1조 (목적)',
        body: [
          '본 약관은 서비스가 제공하는 커리큘럼 계산, 선배 탐색, 커피챗·채팅, 로드맵 공유 등 ' +
            '기능의 이용 조건과 이용자·운영자의 권리·의무를 규정하는 것을 목적으로 합니다.',
        ],
      },
      {
        heading: '제2조 (이용 자격)',
        body: [
          '서비스는 경희대학교 국제캠퍼스 구성원을 대상으로 합니다. 가입 시 제공한 학과·학번 등 ' +
            '정보는 정확해야 하며, 타인의 정보를 도용해서는 안 됩니다.',
        ],
      },
      {
        heading: '제3조 (이용자의 의무)',
        body: [
          '이용자는 다음 행위를 해서는 안 됩니다: 타인에 대한 비방·차별·괴롭힘, 허위 정보 게시, ' +
            '타인의 개인정보 무단 수집·공개, 서비스 운영을 방해하는 행위.',
          '이용자가 작성·공개한 로드맵·프로필·메시지 등 콘텐츠에 대한 책임은 작성자 본인에게 있습니다.',
        ],
      },
      {
        heading: '제4조 (면책)',
        body: [
          '본 서비스는 학생 프로젝트로 베타 단계에서 제공되며, 커리큘럼·졸업요건 계산 결과는 참고용입니다. ' +
            '정확한 졸업 요건은 반드시 학과 사무실·공식 학사 시스템을 통해 확인하시기 바랍니다.',
        ],
      },
      {
        heading: '제5조 (약관의 변경)',
        body: ['운영자는 필요 시 약관을 변경할 수 있으며, 변경 시 서비스 내 공지합니다.'],
      },
    ],
  },
  privacy: {
    title: '개인정보처리방침',
    updated: '2026년 7월',
    intro:
      'Khunnect는 이용자의 개인정보를 소중히 다루며, 서비스 제공에 필요한 최소한의 정보만 수집합니다. ' +
      '본 방침은 어떤 정보를 왜 수집하고 어떻게 보관하는지 설명합니다.',
    sections: [
      {
        heading: '1. 수집하는 정보',
        body: [
          '· 계정: 이메일, 비밀번호(인증 제공자 Supabase Auth가 안전하게 해시로 보관 — 운영자는 열람 불가)',
          '· 프로필: 이름, 역할(재학생/졸업생), 학과·트랙·학번·졸업연도',
          '· 선배 프로필(선택): 소개, 직무, 회사, 전문 분야, 상담 가능 여부',
          '· 활동 데이터: 체크한 과목, 북마크, 커피챗 신청·메시지, 로드맵',
        ],
      },
      {
        heading: '2. 수집·이용 목적',
        body: [
          '수집한 정보는 로그인 인증, 졸업요건 진행률 계산, 학과별 선배 매칭, 커피챗·채팅 연결 등 ' +
            '서비스 핵심 기능 제공에만 사용합니다. 광고·마케팅 목적으로 사용하지 않습니다.',
        ],
      },
      {
        heading: '3. 보관 및 보호',
        body: [
          '데이터는 Supabase(PostgreSQL)에 저장되며, 행 수준 보안(RLS) 정책으로 본인 또는 권한이 있는 ' +
            '이용자만 접근하도록 제한합니다. 메시지·커피챗은 신청 당사자 간에만 조회됩니다.',
        ],
      },
      {
        heading: '4. 제3자 제공',
        body: ['운영자는 법령에 따른 경우를 제외하고 이용자의 개인정보를 외부에 제공하지 않습니다.'],
      },
      {
        heading: '5. 이용자의 권리',
        body: [
          '이용자는 언제든 자신의 프로필 정보를 열람·수정할 수 있으며, 계정·데이터 삭제를 요청할 수 있습니다. ' +
            '작성한 메시지·커피챗·로드맵도 본인이 관리·삭제할 수 있습니다.',
        ],
      },
    ],
  },
}

const wrapStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#FFFFFF',
  fontFamily: 'var(--font-roboto), sans-serif',
  color: '#1F1A1A',
}
const headerStyle: CSSProperties = {
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  borderBottom: '1px solid #F3E8E8',
}
const mainStyle: CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '56px 24px 80px',
}
const h1Style: CSSProperties = { fontSize: '30px', fontWeight: 700, margin: '0 0 6px' }
const updatedStyle: CSSProperties = { fontSize: '13px', color: '#9CA3AF', margin: '0 0 28px' }
const introStyle: CSSProperties = { fontSize: '15px', lineHeight: 1.7, color: '#5C3F3F', margin: '0 0 36px' }
const hStyle: CSSProperties = { fontSize: '17px', fontWeight: 700, color: '#9A001F', margin: '28px 0 10px' }
const pStyle: CSSProperties = { fontSize: '14px', lineHeight: 1.8, color: '#3F3838', margin: '0 0 8px' }

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const doc = CONTENT[kind]
  return (
    <div style={wrapStyle}>
      <header style={headerStyle}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={22} />
        </Link>
      </header>

      <main style={mainStyle}>
        <h1 style={h1Style}>{doc.title}</h1>
        <p style={updatedStyle}>최종 업데이트: {doc.updated}</p>
        <p style={introStyle}>{doc.intro}</p>

        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 style={hStyle}>{s.heading}</h2>
            {s.body.map((line, i) => (
              <p key={i} style={pStyle}>{line}</p>
            ))}
          </section>
        ))}

        <div style={{ marginTop: '48px', display: 'flex', gap: '20px' }}>
          <Link to="/terms" style={{ fontSize: '13px', color: '#9A001F', textDecoration: 'none', fontWeight: 600 }}>
            이용약관
          </Link>
          <Link to="/privacy" style={{ fontSize: '13px', color: '#9A001F', textDecoration: 'none', fontWeight: 600 }}>
            개인정보처리방침
          </Link>
          <Link to="/" style={{ fontSize: '13px', color: '#9CA3AF', textDecoration: 'none' }}>
            홈으로
          </Link>
        </div>
      </main>
    </div>
  )
}
