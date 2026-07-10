import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useMessages, useSendMessage } from '../../hooks/useMessages'

const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }
const modalStyle: CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: '20px', width: '440px', height: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
const headerStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F3F4F6' }
const listStyle: CSSProperties = { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#FCF1F1' }
const inputRowStyle: CSSProperties = { display: 'flex', gap: '8px', padding: '14px', borderTop: '1px solid #F3F4F6' }
const inputStyle: CSSProperties = { flex: 1, padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E6BDBB', fontSize: '14px', fontFamily: 'var(--font-roboto)', outline: 'none' }
const sendBtnStyle: CSSProperties = { padding: '0 20px', borderRadius: '10px', border: 'none', backgroundColor: '#9A001F', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }

const bubbleStyle = (mine: boolean): CSSProperties => ({
  alignSelf: mine ? 'flex-end' : 'flex-start',
  maxWidth: '72%',
  padding: '10px 14px',
  borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
  backgroundColor: mine ? '#9A001F' : '#FFFFFF',
  color: mine ? '#FFFFFF' : '#1F1A1A',
  fontSize: '14px',
  lineHeight: 1.5,
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  wordBreak: 'break-word',
})

export default function ChatModal({ coffeeChatId, counterpartName, onClose }: { coffeeChatId: number; counterpartName: string; onClose: () => void }) {
  const { user } = useAuth()
  const { data: messages = [], isLoading } = useMessages(coffeeChatId)
  const send = useSendMessage()
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  const handleSend = () => {
    if (!text.trim()) return
    send.mutate({ coffeeChatId, content: text })
    setText('')
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#1F1A1A', margin: 0 }}>{counterpartName} 님과의 채팅</p>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer' }}>×</button>
        </div>

        <div style={listStyle} ref={listRef}>
          {isLoading ? (
            <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>불러오는 중...</p>
          ) : messages.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', margin: 'auto' }}>첫 메시지를 보내보세요.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} style={bubbleStyle(m.senderId === user?.id)}>{m.content}</div>
            ))
          )}
        </div>

        <div style={inputRowStyle}>
          <input
            style={inputStyle}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요"
          />
          <button style={sendBtnStyle} onClick={handleSend}>전송</button>
        </div>
      </div>
    </div>
  )
}
