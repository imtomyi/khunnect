import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { BRAND } from '../lib/constants'
import { INITIAL_FORM_DATA } from '../types/auth'
import type { RegisterFormData } from '../types/auth'
import { useColleges, useDepartments, useTracks } from '../hooks/useDepartments'
import AuthLayout from '../components/auth/AuthLayout'

const TOTAL_STEPS = 4

const inputStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '14px',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  outline: 'none',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#1F1A1A',
  marginBottom: '6px',
  display: 'block',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [collegeId, setCollegeId] = useState<number | null>(null)

  const { data: colleges } = useColleges()
  const { data: departments } = useDepartments(collegeId)
  const { data: tracks } = useTracks(formData.departmentId)

  const updateForm = (updates: Partial<RegisterFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (step === 1 && (!formData.email || formData.password.length < 6)) {
      setError('이메일과 6자 이상의 비밀번호를 입력해주세요')
      return
    }
    if (step === 2 && !formData.role) {
      setError('재학생 또는 졸업생을 선택해주세요')
      return
    }
    if (step === 3 && !formData.departmentId) {
      setError('학과를 선택해주세요')
      return
    }
    setError('')
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.admissionYear) {
      setError('이름과 입학년도를 입력해주세요')
      return
    }
    setError('')
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })
    if (authError || !authData.user) {
      setError(authError?.message || '회원가입 실패')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: formData.email,
      name: formData.name,
      role: formData.role!,
    })
    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    const { error: majorError } = await supabase.from('user_majors').insert({
      user_id: authData.user.id,
      department_id: formData.departmentId!,
      track_id: formData.trackId,
      type: 'major',
      admission_year: formData.admissionYear!,
      graduation_year: formData.graduationYear,
    })
    if (majorError) {
      setError(majorError.message)
      setLoading(false)
      return
    }

    navigate({ to: '/' })
  }

  return (
    <AuthLayout title="Khunnect에 오신 것을 환영합니다" subtitle="당신의 학업 여정을 스마트하게 설계하세요">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            backgroundColor: s <= step ? BRAND : '#E5E7EB',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {step === 1 && (
          <>
            <div>
              <label style={labelStyle}>이메일 (Email)</label>
              <input type="email" placeholder="example@university.ac.kr" value={formData.email} onChange={(e) => updateForm({ email: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>비밀번호 (Password)</label>
              <input type="password" placeholder="6자 이상" value={formData.password} onChange={(e) => updateForm({ password: e.target.value })} style={inputStyle} />
            </div>
          </>
        )}

        {step === 2 && (
          <div>
            <label style={labelStyle}>재학/졸업 여부 (Status)</label>
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FEF2F2', padding: '4px', borderRadius: '12px' }}>
              {(['student', 'alumni'] as const).map(role => (
                <button key={role} onClick={() => updateForm({ role })} style={{
                  flex: 1, padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: formData.role === role ? '#FFFFFF' : 'transparent',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  color: formData.role === role ? BRAND : '#78716C',
                  boxShadow: formData.role === role ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}>
                  {role === 'student' ? '재학 (Current)' : '졸업 (Graduate)'}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div>
              <label style={labelStyle}>단과대학 (College)</label>
              <select value={collegeId ?? ''} onChange={(e) => { setCollegeId(e.target.value ? Number(e.target.value) : null); updateForm({ departmentId: null, trackId: null }) }} style={inputStyle}>
                <option value="">선택</option>
                {colleges?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>학과 (Department)</label>
              <select value={formData.departmentId ?? ''} onChange={(e) => updateForm({ departmentId: e.target.value ? Number(e.target.value) : null, trackId: null })} style={inputStyle} disabled={!collegeId}>
                <option value="">선택</option>
                {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {tracks && tracks.length > 0 && (
              <div>
                <label style={labelStyle}>트랙 (Track, 선택사항)</label>
                <select value={formData.trackId ?? ''} onChange={(e) => updateForm({ trackId: e.target.value ? Number(e.target.value) : null })} style={inputStyle}>
                  <option value="">선택</option>
                  {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <label style={labelStyle}>이름 (Name)</label>
              <input type="text" placeholder="홍길동" value={formData.name} onChange={(e) => updateForm({ name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>입학년도 (Admission Year)</label>
              <input type="number" placeholder="2022" value={formData.admissionYear ?? ''} onChange={(e) => updateForm({ admissionYear: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
            </div>
            {formData.role === 'alumni' && (
              <div>
                <label style={labelStyle}>졸업년도 (Graduation Year)</label>
                <input type="number" placeholder="2026" value={formData.graduationYear ?? ''} onChange={(e) => updateForm({ graduationYear: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
              </div>
            )}
          </>
        )}
      </div>

      {error && <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px' }}>
        {step > 1 && (
          <button onClick={handleBack} style={{
            flex: 1, padding: '14px', fontSize: '15px', fontWeight: 600,
            color: '#78716C', backgroundColor: 'transparent',
            border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer',
          }}>이전</button>
        )}
        {step < TOTAL_STEPS ? (
          <button onClick={handleNext} style={{
            flex: 2, padding: '14px', fontSize: '15px', fontWeight: 600,
            color: BRAND, backgroundColor: 'transparent',
            border: `1px solid ${BRAND}`, borderRadius: '12px', cursor: 'pointer',
          }}>다음</button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 2, padding: '14px', fontSize: '15px', fontWeight: 600,
            color: BRAND, backgroundColor: 'transparent',
            border: `1px solid ${BRAND}`, borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          }}>{loading ? '가입 중...' : '회원가입'}</button>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716C', margin: 0 }}>
        이미 계정이 있으신가요?{' '}
        <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>로그인</Link>
      </p>
    </AuthLayout>
  )
}