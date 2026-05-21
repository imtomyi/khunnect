import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
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

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const errorTextStyle: CSSProperties = {
  fontSize: '11px',
  color: '#DC2626',
  marginTop: '4px',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const clearFieldError = (field: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!email) newErrors.email = '이메일을 입력해주세요'
    if (!password) newErrors.password = '비밀번호를 입력해주세요'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrors({ password: '이메일 또는 비밀번호가 올바르지 않습니다' })
      setLoading(false)
      return
    }

    navigate({ to: '/home' })
  }

  const ec = (field: string) => errors[field] ? ' error' : ''

  return (
    <AuthLayout title="Welcome back" subtitle="로그인하고 선배들의 커리큘럼을 만나보세요">
      <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

        <div style={fieldStyle}>
          <label style={labelStyle}>이메일 (Email)</label>
          <input
            className={`auth-input${ec('email')}`}
            type="email"
            placeholder="example@khu.ac.kr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
          />
          {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>비밀번호 (Password)</label>
          <input
            className={`auth-input${ec('password')}`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
          />
          {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={loading}
          style={{
            marginTop: '4px',
            padding: '13px',
            fontSize: '14px',
            fontWeight: 600,
            border: `1.5px solid ${loading ? '#E5C5CB' : BRAND}`,
            borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
            transition: 'all 0.15s ease',
            fontFamily: 'Roboto, system-ui, sans-serif',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(154, 0, 31, 0.25)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#78716C' }}>
          <Link to="/register" style={{ color: '#78716C', textDecoration: 'none' }}>비밀번호 찾기</Link>
          <Link to="/register" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>회원가입</Link>
        </div>

      </form>
    </AuthLayout>
  )
}
