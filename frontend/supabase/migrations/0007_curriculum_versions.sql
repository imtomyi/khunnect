-- ════════════════════════════════════════════════════════════════════════
-- 0007_curriculum_versions.sql
-- 교육과정 버전 모델 (docs/CURRICULUM_DATA.md 참조)
--
-- 왜: 실제 경희대 교육과정은 (1) 입학년도별로 다르고 (2) 이수구분이 4종
-- (전공기초/전공필수/산학필수/전공선택)이며 (3) 졸업 총 이수학점과
-- (4) 영어강좌·SW교육·졸업논문 같은 부가조건을 가진다. 기존 모델은
-- department당 요건 1행 + 3분류라 이걸 담지 못한다.
--
-- 범위(결정): 단일전공(single)만 먼저. 다/부전공은 구조만 열어두고 데이터는 later.
--
-- 안전: 기존 소융(department_id=1) 과목 25개·요건 1행을 v1 버전으로 무손실 이관한다.
-- 재실행 안전(idempotent). Supabase Dashboard → SQL Editor 에서 실행.
-- ════════════════════════════════════════════════════════════════════════

-- ── 교육과정 버전 (학과 × 입학년도 구간) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_versions (
  id            SERIAL   PRIMARY KEY,
  department_id INTEGER  NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  year_start    SMALLINT NOT NULL,            -- 적용 시작 입학년도
  year_end      SMALLINT,                     -- 적용 끝(포함). NULL = 현행
  total_credits SMALLINT,                     -- 졸업 총 이수학점 (예: 130)
  note          TEXT,                         -- 서술형 비고
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CHECK (year_end IS NULL OR year_end >= year_start)
);
-- 같은 학과에서 입학년도 구간이 겹치지 않도록 시작연도로 유니크
CREATE UNIQUE INDEX IF NOT EXISTS curriculum_versions_dept_start
  ON curriculum_versions (department_id, year_start);

-- ── 과목 (버전에 소속) ───────────────────────────────────────────────────
-- 기존 course_catalog는 department_id 직속 + 3분류. version_id를 추가하고
-- 산학필수를 CHECK에 넣는다. department_id는 이관 편의를 위해 유지(중복이지만
-- version_id가 정본이며, 하위호환·조회 편의로 둔다).
ALTER TABLE course_catalog
  ADD COLUMN IF NOT EXISTS version_id INTEGER REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS year       SMALLINT,   -- 개설 학년
  ADD COLUMN IF NOT EXISTS semester   SMALLINT;   -- 개설 학기 (1|2)

-- 이수구분에 산학필수 추가 (기존 CHECK 교체)
DO $$ BEGIN
  ALTER TABLE course_catalog DROP CONSTRAINT IF EXISTS course_catalog_type_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
ALTER TABLE course_catalog
  ADD CONSTRAINT course_catalog_type_check
  CHECK (type IN ('전공기초','전공필수','산학필수','전공선택'));

-- ── 졸업요건 (버전 × 전공유형별) ─────────────────────────────────────────
-- 기존 curriculum_requirements(department당 1행)를 대체하는 정본.
-- 산학필수를 분리하고 전공유형(single/double/minor)을 둔다.
CREATE TABLE IF NOT EXISTS curriculum_version_requirements (
  id               SERIAL   PRIMARY KEY,
  version_id       INTEGER  NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  track            TEXT     NOT NULL DEFAULT 'single'
                            CHECK (track IN ('single','double','minor')),
  basic_credits    SMALLINT NOT NULL DEFAULT 0,   -- 전공기초
  required_credits SMALLINT NOT NULL DEFAULT 0,   -- 전공필수
  industry_credits SMALLINT NOT NULL DEFAULT 0,   -- 산학필수
  elective_credits SMALLINT NOT NULL DEFAULT 0,   -- 전공선택
  UNIQUE (version_id, track)
);

-- ── 부가 졸업조건 (구조화, D-C3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_extra_requirements (
  id             SERIAL  PRIMARY KEY,
  version_id     INTEGER NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  kind           TEXT    NOT NULL
                         CHECK (kind IN ('english_lecture','sw_education','thesis','other')),
  label          TEXT    NOT NULL,        -- 예: '전공 영어강좌 3과목 이상'
  count_required SMALLINT,                -- 과목 수 요건(영어강좌 3). 이수여부형은 NULL
  applies_from   SMALLINT                 -- 적용 시작 학번(2008,2018). NULL = 전체
);
CREATE INDEX IF NOT EXISTS idx_extra_req_version ON curriculum_extra_requirements (version_id);

-- ════════════════════════════════════════════════════════════════════════
-- 기존 소융(department_id=1) 데이터 이관 → v1 버전
-- 이미 이관됐으면(버전 존재) 건너뛴다.
-- ════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_id INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM curriculum_versions WHERE department_id = 1) THEN
    -- 소융 현행 버전 (연도 미상이므로 넓게: 2018~현행). total_credits는 확인 전 NULL.
    INSERT INTO curriculum_versions (department_id, year_start, year_end, total_credits, note)
    VALUES (1, 2018, NULL, NULL, '기존 데이터 이관(v1). 총 이수학점·연도 구간 재확인 필요')
    RETURNING id INTO v_id;

    -- 기존 과목 25개를 이 버전에 연결
    UPDATE course_catalog SET version_id = v_id WHERE department_id = 1 AND version_id IS NULL;

    -- 기존 요건 1행 → single 트랙으로 이관 (산학필수는 기존에 없었으니 0)
    INSERT INTO curriculum_version_requirements
      (version_id, track, basic_credits, required_credits, industry_credits, elective_credits)
    SELECT v_id, 'single', basic_credits, required_credits, 0, elective_credits
    FROM curriculum_requirements WHERE department_id = 1
    LIMIT 1;
  END IF;
END $$;

-- 권한
GRANT SELECT ON curriculum_versions, curriculum_version_requirements, curriculum_extra_requirements
  TO anon, authenticated;
