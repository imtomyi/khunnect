-- ════════════════════════════════════════════════════════════════════════
-- 0005_roadmaps.sql
-- 커리어 로드맵 (Phase 3 잔여 항목)
--
-- 플랫폼의 핵심 선순환: 선배가 자신의 학기별 경로를 공개하면
-- 후배가 그것을 참고해 방향을 잡는다.
--
-- 항목마다 status('done'|'planned')를 둬서 하나의 모델로 둘 다 지원한다:
--   - 선배(졸업생): 대부분 done  → 회고록 성격
--   - 후배(재학생): 대부분 planned → 계획표 성격
--
-- 재실행 안전(idempotent). Supabase Dashboard → SQL Editor 에서 실행.
-- ════════════════════════════════════════════════════════════════════════

-- ── 로드맵 (유저당 1개) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
  id         SERIAL      PRIMARY KEY,
  user_id    UUID        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL DEFAULT '나의 커리어 로드맵',
  summary    TEXT,                                  -- 한 줄 소개 (예: "게임 개발자가 되기까지")
  is_public  BOOLEAN     NOT NULL DEFAULT FALSE,    -- 기본 비공개 — 본인이 명시적으로 공개해야 노출
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_public ON roadmaps (is_public) WHERE is_public = TRUE;

-- ── 로드맵 항목 (학기별 마일스톤) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_items (
  id          SERIAL      PRIMARY KEY,
  roadmap_id  INTEGER     NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  year        SMALLINT    NOT NULL CHECK (year BETWEEN 1 AND 6),      -- 학년
  semester    SMALLINT    NOT NULL CHECK (semester IN (1, 2)),        -- 학기
  type        TEXT        NOT NULL
                          CHECK (type IN ('수강', '인턴', '프로젝트', '대외활동', '자격증', '취업', '기타')),
  title       TEXT        NOT NULL CHECK (length(btrim(title)) > 0),
  description TEXT,
  status      TEXT        NOT NULL DEFAULT 'done'
                          CHECK (status IN ('done', 'planned')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_items_roadmap
  ON roadmap_items (roadmap_id, year, semester);

-- ── RLS: roadmaps ────────────────────────────────────────────────────────
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS roadmaps_select ON roadmaps;
DROP POLICY IF EXISTS roadmaps_insert_own ON roadmaps;
DROP POLICY IF EXISTS roadmaps_update_own ON roadmaps;
DROP POLICY IF EXISTS roadmaps_delete_own ON roadmaps;

-- 공개된 로드맵은 누구나, 비공개는 본인만
CREATE POLICY roadmaps_select ON roadmaps FOR SELECT
  USING (is_public = TRUE OR user_id = auth.uid());

CREATE POLICY roadmaps_insert_own ON roadmaps FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY roadmaps_update_own ON roadmaps FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY roadmaps_delete_own ON roadmaps FOR DELETE
  USING (user_id = auth.uid());

-- ── RLS: roadmap_items ───────────────────────────────────────────────────
-- 부모 로드맵의 공개 여부를 따라간다 (비공개 로드맵의 항목은 본인만).
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS roadmap_items_select ON roadmap_items;
DROP POLICY IF EXISTS roadmap_items_insert_own ON roadmap_items;
DROP POLICY IF EXISTS roadmap_items_update_own ON roadmap_items;
DROP POLICY IF EXISTS roadmap_items_delete_own ON roadmap_items;

CREATE POLICY roadmap_items_select ON roadmap_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM roadmaps r
    WHERE r.id = roadmap_items.roadmap_id
      AND (r.is_public = TRUE OR r.user_id = auth.uid())
  ));

CREATE POLICY roadmap_items_insert_own ON roadmap_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  ));

CREATE POLICY roadmap_items_update_own ON roadmap_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  ));

CREATE POLICY roadmap_items_delete_own ON roadmap_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  ));

-- ── 권한 ─────────────────────────────────────────────────────────────────
GRANT SELECT ON roadmaps, roadmap_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON roadmaps, roadmap_items TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE roadmaps_id_seq, roadmap_items_id_seq TO authenticated;
