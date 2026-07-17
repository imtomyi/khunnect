import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { BRAND } from '../lib/constants'
import AuthLayout from '../components/auth/AuthLayout'

const labelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#78716C',
  marginBottom: '4px',
  display: 'block',
  letterSpacing: '0.02em',
}

const errorTextStyle: CSSProperties = {
  fontSize: '11px',
  color: '#DC2626',
  marginTop: '4px',
}

const noticeStyle: CSSProperties = {
  backgroundColor: '#FFF8F7',
  border: '1px solid #F3E8E8',
  borderRadius: '10px',
  padding: '16px',
  fontSize: '13px',
  color: '#5C3F3F',
  lineHeight: 1.6,
}

const btnStyle = (disabled: boolean): CSSProperties => ({
  marginTop: '4px',
  padding: '13px',
  fontSize: '14px',
  fontWeight: 600,
  border: `1.5px solid ${disabled ? '#E5C5CB' : BRAND}`,
  borderRadius: '10px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  letterSpacing: '0.02em',
  transition: 'all 0.15s ease',
  fontFamily: 'Roboto, system-ui, sans-serif',
  boxShadow: disabled ? 'none' : '0 4px 12px rgba(154, 0, 31, 0.25)',
  opacity: disabled ? 0.5 : 1,
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('이메일을 입력해주세요')
      return
    }

    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    // 계정 존재 여부를 노출하지 않는다 (이메일 열거 공격 방지).
    // 전송 실패(네트워크·레이트리밋)만 사용자에게 알린다.
    if (err && err.status === 429) {
      setError('요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="메일을 확인해주세요" subtitle="비밀번호 재설정 링크를 보냈습니다">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={noticeStyle}>
            <strong style={{ color: '#1F1A1A' }}>{email}</strong> 로 재설정 링크를 보냈습니다.
            메일의 링크를 열면 새 비밀번호를 설정할 수 있습니다.
            <br />
            <br />
            메일이 보이지 않으면 스팸함을 확인해주세요. 가입되지 않은 이메일이라면
            메일이 오지 않습니다.
          </div>
          <Link
            to="/login"
            style={{ fontSize: '13px', color: BRAND, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="비밀번호 찾기" subtitle="가입한 이메일로 재설정 링크를 보내드립니다">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>이메일 (Email)</label>
          <input
            className={`auth-input${error ? ' error' : ''}`}
            type="email"
            placeholder="example@khu.ac.kr"
            value={email}
            autoFocus
            onChange={(e) => { setEmail(e.target.value); setError('') }}
          />
          {error && <span style={errorTextStyle}>{error}</span>}
        </div>

        <button type="submit" className="auth-btn" disabled={loading} style={btnStyle(loading)}>
          {loading ? '보내는 중...' : '재설정 링크 받기'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#78716C' }}>
          <Link to="/login" style={{ color: '#78716C', textDecoration: 'none' }}>로그인</Link>
          <Link to="/register" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>회원가입</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
