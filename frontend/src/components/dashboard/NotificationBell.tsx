import { useState, useRef, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useNotifications, useMarkNotificationsRead } from '../../hooks/useNotifications'
import type { NotificationType } from '../../types/index'

const MESSAGES: Record<NotificationType, (actor: string) => string> = {
  coffee_chat_request:   (a) => `${a}님이 커피챗을 신청했어요`,
  coffee_chat_accepted:  (a) => `${a}님이 커피챗을 수락했어요`,
  coffee_chat_declined:  (a) => `${a}님이 커피챗을 거절했어요`,
  coffee_chat_cancelled: (a) => `${a}님이 커피챗을 취소했어요`,
  new_message:           (a) => `${a}님이 메시지를 보냈어요`,
}

const panelStyle: CSSProperties = {
  position: 'absolute', top: '100%', right: 0, marginTop: '10px',
  width: '320px', maxHeight: '420px', overflowY: 'auto',
  backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #F3E8E8',
  boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 70, padding: '8px',
}
const itemStyle = (unread: boolean): CSSProperties => ({
  display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
  padding: '12px 14px', borderRadius: '10px', backgroundColor: unread ? '#FFF8F7' : 'transparent',
  transition: 'background-color .12s ease',
})

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export default function NotificationBell() {
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.isRead)

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    // 열 때 안읽음 전부 읽음 처리
    if (next && unread.length) markRead.mutate(unread.map((n) => n.id))
  }

  const onItemClick = () => {
    setOpen(false)
    // 커피챗·메시지 알림은 마이페이지(커피챗 관리)로 이동
    navigate({ to: '/my' })
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        aria-label="알림"
        style={{
          width: '38px', height: '38px', borderRadius: '50%', border: 'none',
          backgroundColor: open ? '#FCF1F1' : 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5.5-6.83V3.5a1.5 1.5 0 0 0-3 0v.67A7 7 0 0 0 5 11v5l-1.7 1.7a1 1 0 0 0 .7 1.7h16a1 1 0 0 0 .7-1.7L19 16Z"
            fill="none" stroke="#64748B" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        {unread.length > 0 && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px', minWidth: '16px', height: '16px',
            padding: '0 4px', borderRadius: '9999px', backgroundColor: '#9A001F', color: '#FFFFFF',
            fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #FFFFFF',
          }}>
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div style={panelStyle}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1F1A1A', padding: '8px 14px 4px', margin: 0 }}>
            알림
          </p>
          {notifications.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9CA3AF', padding: '24px 14px', textAlign: 'center', margin: 0 }}>
              새로운 알림이 없어요
            </p>
          ) : (
            notifications.map((n) => (
              <button key={n.id} style={itemStyle(!n.isRead)} onClick={onItemClick}>
                <span style={{ fontSize: '13px', color: '#1F1A1A', lineHeight: 1.5 }}>
                  {MESSAGES[n.type](n.actorName ?? '누군가')}
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
                  {timeAgo(n.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
