import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

type SeniorFields = {
  bio: string | null
  job_title: string | null
  company: string | null
  is_available: boolean
  skills: string[]
}

const cardStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '32px',
}

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
}

const titleStyle: CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#1F1A1A', margin: 0 }

const editBtnStyle: CSSProperties = {
  padding: '8px 18px',
  borderRadius: '10px',
  border: '1.5px solid #9A001F',
  backgroundColor: '#FFFFFF',
  color: '#9A001F',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
}

const labelStyle: CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#916F6E', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }
const valueStyle: CSSProperties = { fontSize: '15px', color: '#1F1A1A', margin: '0 0 18px', lineHeight: 1.6 }
const skillTagStyle: CSSProperties = { padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, backgroundColor: '#F6EBEB', color: '#5C3F3F' }

// 모달 스타일
const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modalStyle: CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px', width: '460px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }
const fieldLabelStyle: CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#5C3F3F', marginBottom: '6px' }
const inputStyle: CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E6BDBB', fontSize: '15px', fontFamily: 'var(--font-roboto)', outline: 'none', boxSizing: 'border-box' }
const saveBtnStyle: CSSProperties = { padding: '12px 0', backgroundColor: '#9A001F', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', width: '100%' }
const cancelBtnStyle: CSSProperties = { padding: '12px 0', backgroundColor: 'transparent', color: '#78716C', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', width: '100%' }

function EditModal({ initial, onClose, onSave }: { initial: SeniorFields; onClose: () => void; onSave: (v: SeniorFields) => Promise<void> }) {
  const [bio, setBio] = useState(initial.bio ?? '')
  const [jobTitle, setJobTitle] = useState(initial.job_title ?? '')
  const [company, setCompany] = useState(initial.company ?? '')
  const [isAvailable, setIsAvailable] = useState(initial.is_available)
  const [skillsText, setSkillsText] = useState(initial.skills.join(', '))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      bio: bio.trim() || null,
      job_title: jobTitle.trim() || null,
      company: company.trim() || null,
      is_available: isAvailable,
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setSaving(false)
    onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <p style={titleStyle}>선배 프로필 편집</p>

        <div>
          <p style={fieldLabelStyle}>한 줄 소개</p>
          <textarea style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }} value={bio}
            onChange={(e) => setBio(e.target.value)} placeholder="후배들에게 자신을 소개해주세요" />
        </div>
        <div>
          <p style={fieldLabelStyle}>현재 직무</p>
          <input style={inputStyle} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="예: 백엔드 엔지니어" />
        </div>
        <div>
          <p style={fieldLabelStyle}>회사 / 기관</p>
          <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="예: 네이버" />
        </div>
        <div>
          <p style={fieldLabelStyle}>전문 분야 (쉼표로 구분)</p>
          <input style={inputStyle} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="예: React, 데이터분석, 면접" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#5C3F3F', cursor: 'pointer' }}>
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
          커피챗/상담 가능
        </label>

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button style={cancelBtnStyle} onClick={onClose}>취소</button>
          <button style={saveBtnStyle} onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
    </div>
  )
}

/** 선배(alumni)만 노출 — 자신의 선배 프로필 필드 표시 및 편집 */
export default function SeniorProfileSection({ role }: { role?: string }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data: fields } = useQuery({
    queryKey: ['senior_fields', user?.id],
    queryFn: async (): Promise<SeniorFields> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, job_title, company, is_available, skills')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      const r = data as any
      return {
        bio: r.bio ?? null,
        job_title: r.job_title ?? null,
        company: r.company ?? null,
        is_available: r.is_available ?? true,
        skills: (r.skills as string[] | null) ?? [],
      }
    },
    enabled: !!user && role === 'alumni',
  })

  const save = useMutation({
    mutationFn: async (v: SeniorFields) => {
      const { error } = await supabase.from('profiles').update(v).eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senior_fields', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['seniors'] })
      queryClient.invalidateQueries({ queryKey: ['senior', user?.id] })
    },
  })

  if (role !== 'alumni' || !fields) return null

  return (
    <div style={cardStyle}>
      <div style={headerRowStyle}>
        <p style={titleStyle}>선배 프로필</p>
        <button style={editBtnStyle} onClick={() => setEditing(true)}>편집</button>
      </div>

      <p style={labelStyle}>현재</p>
      <p style={valueStyle}>{[fields.job_title, fields.company].filter(Boolean).join(' · ') || '미입력'}</p>

      <p style={labelStyle}>한 줄 소개</p>
      <p style={valueStyle}>{fields.bio || '미입력'}</p>

      <p style={labelStyle}>전문 분야</p>
      {fields.skills.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {fields.skills.map((s) => <span key={s} style={skillTagStyle}>{s}</span>)}
        </div>
      ) : (
        <p style={valueStyle}>미입력</p>
      )}

      <p style={labelStyle}>상담 가능 여부</p>
      <p style={{ ...valueStyle, marginBottom: 0, color: fields.is_available ? '#094F7A' : '#9A001F' }}>
        {fields.is_available ? '상담 가능' : '상담 중'}
      </p>

      {editing && (
        <EditModal initial={fields} onClose={() => setEditing(false)} onSave={(v) => save.mutateAsync(v)} />
      )}
    </div>
  )
}
