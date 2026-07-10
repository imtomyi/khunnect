-- ════════════════════════════════════════════════════════════════════════
-- 0003_messages.sql
-- 실시간 채팅 (Phase 5)
--
-- 수락된 커피챗(coffee_chats)에 연결된 1:1 메시지.
-- Supabase Realtime으로 새 메시지를 구독한다.
-- 재실행 안전(idempotent). Supabase Dashboard → SQL Editor 에서 실행.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS messages (
  id             SERIAL      PRIMARY KEY,
  coffee_chat_id INTEGER     NOT NULL REFERENCES coffee_chats(id) ON DELETE CASCADE,
  sender_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages (coffee_chat_id, created_at);

-- Realtime 발행 대상에 messages 추가 (이미 있으면 무시)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── RLS ─────────────────────────────────────────────────────────────────
-- 해당 커피챗의 당사자(학생/선배)만 메시지를 읽고 보낼 수 있다.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "메시지 조회 - 커피챗 당사자만" ON messages;
DROP POLICY IF EXISTS "메시지 전송 - 커피챗 당사자만" ON messages;

CREATE POLICY "메시지 조회 - 커피챗 당사자만"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM coffee_chats c
    WHERE c.id = messages.coffee_chat_id
      AND (c.student_id = auth.uid() OR c.senior_id = auth.uid())
  ));

CREATE POLICY "메시지 전송 - 커피챗 당사자만"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coffee_chats c
      WHERE c.id = messages.coffee_chat_id
        AND c.status = 'accepted'
        AND (c.student_id = auth.uid() OR c.senior_id = auth.uid())
    )
  );
