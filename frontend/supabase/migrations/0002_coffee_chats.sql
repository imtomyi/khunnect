-- ════════════════════════════════════════════════════════════════════════
-- 0002_coffee_chats.sql
-- 커피챗 신청 시스템 (Phase 4)
--
-- 학생(후배)이 선배에게 커피챗을 신청하고, 선배가 수락/거절한다.
-- 재실행 안전(idempotent). Supabase Dashboard → SQL Editor 에서 실행.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coffee_chats (
  id           SERIAL      PRIMARY KEY,
  student_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- 신청자(학생)
  senior_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- 대상 선배
  message      TEXT,                                                           -- 신청 메시지
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- 같은 선배에게 pending 상태 중복 신청 방지 (거절/취소 후 재신청은 허용)
CREATE UNIQUE INDEX IF NOT EXISTS coffee_chats_unique_pending
  ON coffee_chats (student_id, senior_id)
  WHERE status = 'pending';

-- 목록 조회 최적화
CREATE INDEX IF NOT EXISTS idx_coffee_chats_senior  ON coffee_chats (senior_id, status);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_student ON coffee_chats (student_id, status);

-- ── RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "커피챗 조회 - 당사자만"     ON coffee_chats;
DROP POLICY IF EXISTS "커피챗 신청 - 학생 본인만"  ON coffee_chats;
DROP POLICY IF EXISTS "커피챗 상태 변경 - 당사자만" ON coffee_chats;

-- 신청자·대상 선배만 조회 가능
CREATE POLICY "커피챗 조회 - 당사자만"
  ON coffee_chats FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = senior_id);

-- 본인(student_id) 명의로만 신청 가능
CREATE POLICY "커피챗 신청 - 학생 본인만"
  ON coffee_chats FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- 당사자만 상태 변경 (학생: 취소 / 선배: 수락·거절 — 세부 전환은 앱에서 강제)
CREATE POLICY "커피챗 상태 변경 - 당사자만"
  ON coffee_chats FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = senior_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = senior_id);
