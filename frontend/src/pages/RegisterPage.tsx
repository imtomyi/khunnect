import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { BRAND } from '../lib/constants'
import { useDepartments, useTracks } from '../hooks/useDepartments'
import AuthLayout from '../components/auth/AuthLayout'

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 400,
  color: '#5C3F3F',
  marginBottom: '4px',
  display: 'block',
  letterSpacing: '0.02em',
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const errorTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#DC2626',
  marginTop: '4px',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [studentId, setStudentId] = useState('')
  const [departmentId, setDepartmentId] = useState<number | null>(null)
  const [trackId, setTrackId] = useState<number | null>(null)
  const [role, setRole] = useState<'student' | 'alumni'>('student')
  const [graduationYear, setGraduationYear] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const setFieldError = (field: string, msg: string) =>
    setErrors((prev) => ({ ...prev, [field]: msg }))
  const clearFieldError = (field: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })

  const { data: departments } = useDepartments(1)
  const { data: tracks } = useTracks(departmentId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!email) newErrors.email = '이메일을 입력해주세요'
    if (!name) newErrors.name = '이름을 입력해주세요'
    if (password.length < 6)
      newErrors.password = '비밀번호는 6자 이상이어야 합니다'
    if (password !== passwordConfirm)
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    if (studentId.length < 4 || isNaN(parseInt(studentId.substring(0, 4))))
      newErrors.studentId = '학번을 올바르게 입력해주세요'
    if (!departmentId)
      newErrors.department = '학과를 선택해주세요'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    const admissionYear = parseInt(studentId.substring(0, 4))

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !authData.user) {
      setFieldError('email', authError?.message || '회원가입에 실패했습니다')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id, email, name, role,
    })
    if (profileError) {
      setFieldError('email', profileError.message)
      setLoading(false)
      return
    }

    const { error: majorError } = await supabase.from('user_majors').insert({
      user_id: authData.user.id,
      department_id: departmentId,
      track_id: trackId,
      type: 'major',
      admission_year: admissionYear,
      graduation_year: role === 'alumni' ? parseInt(graduationYear) : null,
    })
    if (majorError) {
      setFieldError('department', majorError.message)
      setLoading(false)
      return
    }

    navigate({ to: '/' })
  }

  const ec = (field: string) => errors[field] ? ' error' : ''

  return (
    <AuthLayout
      title="Khunnect에 오신 것을 환영합니다"
      subtitle="당신의 학업 여정을 스마트하게 설계하세요"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

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
          <label style={labelStyle}>이름 (Name)</label>
          <input
            className={`auth-input${ec('name')}`}
            type="text"
            placeholder="홍길동"
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
          />
          {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
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

        <div style={fieldStyle}>
          <label style={labelStyle}>비밀번호 확인 (Verify Password)</label>
          <input
            className={`auth-input${ec('passwordConfirm')}`}
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); clearFieldError('passwordConfirm') }}
          />
          {errors.passwordConfirm && <span style={errorTextStyle}>{errors.passwordConfirm}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>학번 (Student ID)</label>
            <input
              className={`auth-input${ec('studentId')}`}
              type="text"
              placeholder="20240001"
              maxLength={10}
              value={studentId}
              onChange={(e) => { setStudentId(e.target.value); clearFieldError('studentId') }}
            />
            {errors.studentId && <span style={errorTextStyle}>{errors.studentId}</span>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>학과 (Department)</label>
            <select
              className={`auth-input${ec('department')}`}
              value={departmentId ?? ''}
              onChange={(e) => {
                setDepartmentId(e.target.value ? Number(e.target.value) : null)
                setTrackId(null)
                clearFieldError('department')
              }}
              style={{ color: departmentId ? '#1F1A1A' : '#C9A0A0', cursor: 'pointer' }}
            >
              <option value="" disabled>선택</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id} style={{ color: '#1F1A1A' }}>{d.name}</option>
              ))}
            </select>
            {errors.department && <span style={errorTextStyle}>{errors.department}</span>}
          </div>
        </div>

        {tracks && tracks.length > 0 && (
          <div style={fieldStyle}>
            <label style={labelStyle}>트랙 (Track, 선택사항)</label>
            <select
              className="auth-input"
              value={trackId ?? ''}
              onChange={(e) => setTrackId(e.target.value ? Number(e.target.value) : null)}
              style={{ color: trackId ? '#1F1A1A' : '#C9A0A0', cursor: 'pointer' }}
            >
              <option value="">선택 안함</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id} style={{ color: '#1F1A1A' }}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>재학/졸업 여부 (Status)</label>
          <div style={{
            display: 'flex',
            backgroundColor: '#FEF2F2',
            borderRadius: '10px',
            padding: '4px',
            gap: '4px',
            marginTop: '2px',
          }}>
            {(['student', 'alumni'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  borderRadius: '7px',
                  backgroundColor: role === r ? '#FFFFFF' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: role === r ? 400 : 400,
                  color: role === r ? BRAND : '#5C3F3F',
                  boxShadow: role === r ? '0 1px 3px rgba(154,0,31,0.12)' : 'none',
                  transition: 'all 0.15s ease',
                  fontFamily: 'Roboto, system-ui, sans-serif',
                }}
              >
                {r === 'student' ? '재학 (Current)' : '졸업 (Graduate)'}
              </button>
            ))}
          </div>
        </div>

        {role === 'alumni' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>졸업년도 (Graduation Year)</label>
            <input
              className="auth-input"
              type="number"
              placeholder="2024"
              min={2000}
              max={2030}
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
            />
          </div>
        )}

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
          {loading ? '가입 중...' : '회원가입'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716C', margin: 0 }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>
            로그인
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}