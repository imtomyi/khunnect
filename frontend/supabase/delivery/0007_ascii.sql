CREATE TABLE IF NOT EXISTS curriculum_versions (
  id            SERIAL   PRIMARY KEY,
  department_id INTEGER  NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  year_start    SMALLINT NOT NULL,
  year_end      SMALLINT,
  total_credits SMALLINT,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CHECK (year_end IS NULL OR year_end >= year_start)
);
CREATE UNIQUE INDEX IF NOT EXISTS curriculum_versions_dept_start
  ON curriculum_versions (department_id, year_start);
ALTER TABLE course_catalog
  ADD COLUMN IF NOT EXISTS version_id INTEGER REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS year       SMALLINT,
  ADD COLUMN IF NOT EXISTS semester   SMALLINT;
DO $$ BEGIN
  ALTER TABLE course_catalog DROP CONSTRAINT IF EXISTS course_catalog_type_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
ALTER TABLE course_catalog
  ADD CONSTRAINT course_catalog_type_check
  CHECK (type IN (U&'\C804\ACF5\AE30\CD08',U&'\C804\ACF5\D544\C218',U&'\C0B0\D559\D544\C218',U&'\C804\ACF5\C120\D0DD'));
CREATE TABLE IF NOT EXISTS curriculum_version_requirements (
  id               SERIAL   PRIMARY KEY,
  version_id       INTEGER  NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  track            TEXT     NOT NULL DEFAULT 'single'
                            CHECK (track IN ('single','double','minor')),
  basic_credits    SMALLINT NOT NULL DEFAULT 0,
  required_credits SMALLINT NOT NULL DEFAULT 0,
  industry_credits SMALLINT NOT NULL DEFAULT 0,
  elective_credits SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (version_id, track)
);
CREATE TABLE IF NOT EXISTS curriculum_extra_requirements (
  id             SERIAL  PRIMARY KEY,
  version_id     INTEGER NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  kind           TEXT    NOT NULL
                         CHECK (kind IN ('english_lecture','sw_education','thesis','other')),
  label          TEXT    NOT NULL,
  count_required SMALLINT,
  applies_from   SMALLINT
);
CREATE INDEX IF NOT EXISTS idx_extra_req_version ON curriculum_extra_requirements (version_id);
DO $$
DECLARE v_id INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM curriculum_versions WHERE department_id = 1) THEN
    INSERT INTO curriculum_versions (department_id, year_start, year_end, total_credits, note)
    VALUES (1, 2018, NULL, NULL, U&'\AE30\C874 \B370\C774\D130 \C774\AD00(v1). \CD1D \C774\C218\D559\C810\00B7\C5F0\B3C4 \AD6C\AC04 \C7AC\D655\C778 \D544\C694')
    RETURNING id INTO v_id;
    UPDATE course_catalog SET version_id = v_id WHERE department_id = 1 AND version_id IS NULL;
    INSERT INTO curriculum_version_requirements
      (version_id, track, basic_credits, required_credits, industry_credits, elective_credits)
    SELECT v_id, 'single', basic_credits, required_credits, 0, elective_credits
    FROM curriculum_requirements WHERE department_id = 1
    LIMIT 1;
  END IF;
END $$;
GRANT SELECT ON curriculum_versions, curriculum_version_requirements, curriculum_extra_requirements
  TO anon, authenticated;
ALTER TABLE curriculum_versions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_version_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_extra_requirements   ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS curriculum_versions_read     ON curriculum_versions;
DROP POLICY IF EXISTS curriculum_ver_req_read      ON curriculum_version_requirements;
DROP POLICY IF EXISTS curriculum_extra_read        ON curriculum_extra_requirements;
CREATE POLICY curriculum_versions_read ON curriculum_versions FOR SELECT USING (true);
CREATE POLICY curriculum_ver_req_read  ON curriculum_version_requirements FOR SELECT USING (true);
CREATE POLICY curriculum_extra_read    ON curriculum_extra_requirements FOR SELECT USING (true);
