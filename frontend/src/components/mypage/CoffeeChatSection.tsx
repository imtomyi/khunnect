import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useMyCoffeeChats, useRespondCoffeeChat } from '../../hooks/useCoffeeChats'
import ChatModal from '../chat/ChatModal'
import type { CoffeeChat, CoffeeChatStatus } from '../../types/index'

const cardStyle: CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px' }
const titleStyle: CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#1F1A1A', margin: '0 0 24px' }
const twoColStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }
const colLabelStyle: CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#5C3F3F', marginBottom: '12px' }
const itemStyle: CSSProperties = { backgroundColor: '#FCF1F1', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px' }
const itemTopStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
const nameStyle: CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#1F1A1A' }
const msgStyle: CSSProperties = { fontSize: '13px', color: '#5C3F3F', margin: '6px 0 0', lineHeight: 1.5 }
const emptyStyle: CSSProperties = { fontSize: '13px', color: '#9CA3AF' }

const STATUS_META: Record<CoffeeChatStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: '대기중', color: '#92400E', bg: '#FEF3C7' },
  accepted:  { label: '수락됨', color: '#094F7A', bg: '#DBEAFE' },
  declined:  { label: '거절됨', color: '#5C3F3F', bg: '#F3E8E8' },
  cancelled: { label: '취소됨', color: '#78716C', bg: '#F5F5F4' },
}

const badge = (status: CoffeeChatStatus): CSSProperties => ({
  padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
  color: STATUS_META[status].color, backgroundColor: STATUS_META[status].bg, flexShrink: 0,
})

const actionBtn = (variant: 'accept' | 'decline' | 'cancel'): CSSProperties => ({
  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
  backgroundColor: variant === 'accept' ? '#9A001F' : variant === 'decline' ? '#F3E8E8' : '#F5F5F4',
  color: variant === 'accept' ? '#FFFFFF' : '#5C3F3F',
})

export default function CoffeeChatSection() {
  const { data } = useMyCoffeeChats()
  const respond = useRespondCoffeeChat()
  const [openChat, setOpenChat] = useState<CoffeeChat | null>(null)

  const sent = data?.sent ?? []
  const received = data?.received ?? []

  const setStatus = (id: number, status: CoffeeChatStatus) => respond.mutate({ id, status })

  const renderMsg = (c: CoffeeChat) =>
    c.message ? <p style={msgStyle}>“{c.message}”</p> : null

  return (
    <div style={cardStyle}>
      <p style={titleStyle}>커피챗</p>
      <div style={twoColStyle}>
        {/* 받은 신청 (내가 선배) */}
        <div>
          <div style={colLabelStyle}>받은 신청</div>
          {received.length === 0 ? (
            <p style={emptyStyle}>받은 신청이 없습니다.</p>
          ) : (
            received.map((c) => (
              <div key={c.id} style={itemStyle}>
                <div style={itemTopStyle}>
                  <span style={nameStyle}>{c.counterpartName ?? '후배'} 님</span>
                  <span style={badge(c.status)}>{STATUS_META[c.status].label}</span>
                </div>
                {renderMsg(c)}
                {c.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button style={actionBtn('accept')} onClick={() => setStatus(c.id, 'accepted')}>수락</button>
                    <button style={actionBtn('decline')} onClick={() => setStatus(c.id, 'declined')}>거절</button>
                  </div>
                )}
                {c.status === 'accepted' && (
                  <div style={{ marginTop: '10px' }}>
                    <button style={actionBtn('accept')} onClick={() => setOpenChat(c)}>채팅 열기</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 보낸 신청 (내가 학생) */}
        <div>
          <div style={colLabelStyle}>보낸 신청</div>
          {sent.length === 0 ? (
            <p style={emptyStyle}>보낸 신청이 없습니다.</p>
          ) : (
            sent.map((c) => (
              <div key={c.id} style={itemStyle}>
                <div style={itemTopStyle}>
                  <span style={nameStyle}>{c.counterpartName ?? '선배'} 선배</span>
                  <span style={badge(c.status)}>{STATUS_META[c.status].label}</span>
                </div>
                {renderMsg(c)}
                {c.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button style={actionBtn('cancel')} onClick={() => setStatus(c.id, 'cancelled')}>신청 취소</button>
                  </div>
                )}
                {c.status === 'accepted' && (
                  <div style={{ marginTop: '10px' }}>
                    <button style={actionBtn('accept')} onClick={() => setOpenChat(c)}>채팅 열기</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {openChat && (
        <ChatModal
          coffeeChatId={openChat.id}
          counterpartName={openChat.counterpartName ?? '상대방'}
          onClose={() => setOpenChat(null)}
        />
      )}
    </div>
  )
}
