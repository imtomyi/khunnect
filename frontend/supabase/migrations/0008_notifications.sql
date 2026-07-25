-- ════════════════════════════════════════════════════════════════════════
-- 0008_notifications.sql
-- 인앱 알림 (SPEC §2.7, ROADMAP A2)
--
-- 커피챗 신청/수락/거절/취소·새 메시지를 상대방에게 알린다. 지금은 새로고침
-- 해야만 알 수 있어 커피챗이 실제로 돌아가지 않는다.
--
-- 알림 생성은 DB 트리거(SECURITY DEFINER)로 처리한다 — 클라이언트가 상대방
-- 명의로 알림을 넣을 필요가 없고(RLS 안전), 어느 경로로 상태가 바뀌든 일관되게
-- 생성된다. Supabase Realtime으로 실시간 수신.
--
-- 재실행 안전(idempotent). Supabase SQL Editor 에서 실행.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id             SERIAL      PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- 받는 사람
  actor_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,          -- 유발한 사람
  type           TEXT        NOT NULL
                             CHECK (type IN (
                               'coffee_chat_request','coffee_chat_accepted',
                               'coffee_chat_declined','coffee_chat_cancelled','new_message')),
  coffee_chat_id INTEGER     REFERENCES coffee_chats(id) ON DELETE CASCADE,
  is_read        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, is_read, created_at DESC);

-- ── RLS: 본인 알림만 조회·읽음처리. INSERT는 트리거(정의자 권한)만. ────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_select_own ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
DROP POLICY IF EXISTS notifications_delete_own ON notifications;
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_delete_own ON notifications FOR DELETE USING (user_id = auth.uid());

GRANT SELECT, UPDATE, DELETE ON notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;

-- ── 트리거 1: 커피챗 신청 → 선배에게 알림 ────────────────────────────────
CREATE OR REPLACE FUNCTION notify_coffee_chat_insert() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, coffee_chat_id)
  VALUES (NEW.senior_id, NEW.student_id, 'coffee_chat_request', NEW.id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_coffee_chat_insert ON coffee_chats;
CREATE TRIGGER trg_coffee_chat_insert AFTER INSERT ON coffee_chats
  FOR EACH ROW EXECUTE FUNCTION notify_coffee_chat_insert();

-- ── 트리거 2: 커피챗 상태 변경 → 상대방에게 알림 ─────────────────────────
CREATE OR REPLACE FUNCTION notify_coffee_chat_status() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status = 'accepted' THEN
    INSERT INTO notifications (user_id, actor_id, type, coffee_chat_id)
    VALUES (NEW.student_id, NEW.senior_id, 'coffee_chat_accepted', NEW.id);
  ELSIF NEW.status = 'declined' THEN
    INSERT INTO notifications (user_id, actor_id, type, coffee_chat_id)
    VALUES (NEW.student_id, NEW.senior_id, 'coffee_chat_declined', NEW.id);
  ELSIF NEW.status = 'cancelled' THEN
    INSERT INTO notifications (user_id, actor_id, type, coffee_chat_id)
    VALUES (NEW.senior_id, NEW.student_id, 'coffee_chat_cancelled', NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_coffee_chat_status ON coffee_chats;
CREATE TRIGGER trg_coffee_chat_status AFTER UPDATE OF status ON coffee_chats
  FOR EACH ROW EXECUTE FUNCTION notify_coffee_chat_status();

-- ── 트리거 3: 새 메시지 → 상대방에게 알림 ────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_message() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE recipient UUID;
BEGIN
  SELECT CASE WHEN c.student_id = NEW.sender_id THEN c.senior_id ELSE c.student_id END
    INTO recipient
  FROM coffee_chats c WHERE c.id = NEW.coffee_chat_id;
  IF recipient IS NOT NULL THEN
    INSERT INTO notifications (user_id, actor_id, type, coffee_chat_id)
    VALUES (recipient, NEW.sender_id, 'new_message', NEW.coffee_chat_id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_new_message ON messages;
CREATE TRIGGER trg_new_message AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ── Realtime 발행 ────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
