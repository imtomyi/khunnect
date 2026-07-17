import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
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

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  // 메일의 복구 링크를 열면 supabase-js가 URL의 토큰을 읽어 세션을 만든다
  // (detectSessionInUrl 기본값 true). AuthProvider가 그 세션을 잡아준다.
  const { session, loading: sessionLoading } = useAuth()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const clearFieldError = (field: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다'
    if (password !== passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSaving(true)

    const { error } = await supabase.auth.updateUser({ password })

    setSaving(false)

    if (error) {
      setErrors({
        password:
          error.message.includes('same as the old')
            ? '기존 비밀번호와 다른 비밀번호를 입력해주세요'
            : '변경에 실패했습니다. 링크가 만료되었을 수 있습니다.',
      })
      return
    }

    setDone(true)
  }

  const ec = (field: string) => (errors[field] ? ' error' : '')

  // ── 링크 확인 중 ──
  if (sessionLoading) {
    return (
      <AuthLayout title="확인 중...">
        <div style={noticeStyle}>재설정 링크를 확인하고 있습니다.</div>
      </AuthLayout>
    )
  }

  // ── 토큰 없이 들어왔거나 링크 만료 ──
  if (!session) {
    return (
      <AuthLayout title="링크가 유효하지 않습니다" subtitle="만료되었거나 잘못된 링크입니다">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={noticeStyle}>
            재설정 링크는 일정 시간이 지나면 만료됩니다.
            아래에서 새 링크를 다시 요청해주세요.
          </div>
          <Link
            to="/forgot-password"
            className="auth-btn"
            style={{ ...btnStyle(false), textAlign: 'center', textDecoration: 'none', display: 'block' }}
          >
            재설정 링크 다시 받기
          </Link>
        </div>
      </AuthLayout>
    )
  }

  // ── 변경 완료 ──
  if (done) {
    return (
      <AuthLayout title="비밀번호가 변경되었습니다" subtitle="새 비밀번호로 계속 이용해주세요">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={noticeStyle}>비밀번호가 성공적으로 변경되었습니다.</div>
          <button
            type="button"
            className="auth-btn"
            style={btnStyle(false)}
            onClick={() => navigate({ to: '/home' })}
          >
            홈으로 가기
          </button>
        </div>
      </AuthLayout>
    )
  }

  // ── 새 비밀번호 입력 ──
  return (
    <AuthLayout title="새 비밀번호 설정" subtitle="사용할 새 비밀번호를 입력해주세요">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>새 비밀번호 (New Password)</label>
          <input
            className={`auth-input${ec('password')}`}
            type="password"
            placeholder="••••••••"
            value={password}
            autoFocus
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
          />
          {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>새 비밀번호 확인 (Verify Password)</label>
          <input
            className={`auth-input${ec('passwordConfirm')}`}
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); clearFieldError('passwordConfirm') }}
          />
          {errors.passwordConfirm && <span style={errorTextStyle}>{errors.passwordConfirm}</span>}
        </div>

        <button type="submit" className="auth-btn" disabled={saving} style={btnStyle(saving)}>
          {saving ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </AuthLayout>
  )
}
