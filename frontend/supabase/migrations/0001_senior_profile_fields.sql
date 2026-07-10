-- ════════════════════════════════════════════════════════════════════════
-- 0001_senior_profile_fields.sql
-- 선배 프로필 확장 필드 (Phase 3)
--
-- profiles 테이블에 선배 카드/상세에 필요한 컬럼을 추가한다.
-- 기존 데이터를 보존하며 안전하게 적용되도록 idempotent하게 작성하였다.
-- (schema.sql은 전체 DROP&재생성 스크립트이므로 라이브 DB에는 이 파일을 실행할 것)
--
-- 적용: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS job_title    TEXT,
  ADD COLUMN IF NOT EXISTS company      TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS skills       TEXT[]  NOT NULL DEFAULT '{}';

COMMENT ON COLUMN profiles.bio          IS '한 줄 소개';
COMMENT ON COLUMN profiles.job_title    IS '현재 직무/직책';
COMMENT ON COLUMN profiles.company      IS '소속 회사/기관';
COMMENT ON COLUMN profiles.is_available IS '커피챗/상담 가능 여부 (선배)';
COMMENT ON COLUMN profiles.skills       IS '전문 분야 태그 목록';

-- 빈 상담가능 선배만 빠르게 거를 수 있도록 부분 인덱스 (선택)
CREATE INDEX IF NOT EXISTS idx_profiles_available_alumni
  ON profiles (is_available)
  WHERE role = 'alumni';

-- RLS: profiles는 SELECT 전체 공개 / UPDATE 본인만 정책이 이미 존재하므로
-- 추가 컬럼도 읽기 공개·본인 수정이 그대로 적용된다. 별도 정책 불필요.
