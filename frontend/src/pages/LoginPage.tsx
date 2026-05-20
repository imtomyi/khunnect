import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { BRAND } from '../lib/constants'
import AuthLayout from '../components/auth/AuthLayout'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate({ to: '/' })
  }

  const inputStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '14px',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    outline: 'none',
    width: '100%',
  }

  return (
    <AuthLayout title="Welcome back" subtitle="로그인하고 선배들의 커리큘럼을 만나보세요">
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

        {error && <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          backgroundColor: BRAND, color: '#FFFFFF', border: 'none',
          borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px',
        }}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#78716C' }}>
        <Link to="/register" style={{ color: '#78716C', textDecoration: 'none' }}>비밀번호 찾기</Link>
        <Link to="/register" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>회원가입</Link>
      </div>
    </AuthLayout>
  )
}