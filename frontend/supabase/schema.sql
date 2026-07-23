-- ════════════════════════════════════════════════════════════════════════
-- khunnect — Supabase 데이터베이스 스키마
-- 경희대학교 국제캠퍼스 커리큘럼 설계 플랫폼
--
-- 실행 방법:
--   Supabase Dashboard → SQL Editor → 새 탭에 전체 붙여넣기 → Run
-- ════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════
-- STEP 1: 기존 테이블 전체 삭제 (FK 의존성 순서 역순)
-- ════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS bookmarks             CASCADE;
DROP TABLE IF EXISTS coffee_chats          CASCADE;
DROP TABLE IF EXISTS messages              CASCADE;
DROP TABLE IF EXISTS checked_courses       CASCADE;
DROP TABLE IF EXISTS curriculum_requirements CASCADE;
DROP TABLE IF EXISTS course_catalog        CASCADE;
DROP TABLE IF EXISTS user_majors           CASCADE;
DROP TABLE IF EXISTS profiles              CASCADE;
DROP TABLE IF EXISTS tracks                CASCADE;
DROP TABLE IF EXISTS departments           CASCADE;
DROP TABLE IF EXISTS colleges              CASCADE;

-- semotone 잔여 테이블도 제거
DROP TABLE IF EXISTS roadmap_courses CASCADE;
DROP TABLE IF EXISTS user_courses    CASCADE;
DROP TABLE IF EXISTS connections     CASCADE;
DROP TABLE IF EXISTS fields          CASCADE;
DROP TABLE IF EXISTS jobs            CASCADE;


-- ════════════════════════════════════════════════════════════════════════
-- STEP 2: 테이블 생성
-- ════════════════════════════════════════════════════════════════════════

-- ── 단과대학 ─────────────────────────────────────────────────────────────
CREATE TABLE colleges (
  id     SERIAL       PRIMARY KEY,
  name   TEXT         NOT NULL,
  campus TEXT         NOT NULL DEFAULT '국제캠퍼스'
);

-- ── 학과 ─────────────────────────────────────────────────────────────────
CREATE TABLE departments (
  id         SERIAL   PRIMARY KEY,
  college_id INTEGER  NOT NULL REFERENCES colleges(id)    ON DELETE CASCADE,
  name       TEXT     NOT NULL,
  has_tracks BOOLEAN  NOT NULL DEFAULT FALSE
);

-- ── 트랙 (학과 내 세부 전공) ─────────────────────────────────────────────
CREATE TABLE tracks (
  id            SERIAL  PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL
);

-- ── 유저 프로필 (auth.users 와 1:1) ─────────────────────────────────────
CREATE TABLE profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'student'
                           CHECK (role IN ('student', 'alumni')),
  bio          TEXT,                              -- 한 줄 소개
  job_title    TEXT,                              -- 현재 직무/직책
  company      TEXT,                              -- 소속 회사/기관
  is_available BOOLEAN     NOT NULL DEFAULT TRUE, -- 커피챗/상담 가능 여부
  skills       TEXT[]      NOT NULL DEFAULT '{}', -- 전문 분야 태그
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 유저 전공 정보 ───────────────────────────────────────────────────────
-- type: 'major' | 'double_major' | 'minor'
-- admission_year: 학번 앞 4자리로 추출
-- graduation_year: 졸업생(alumni)일 때만 입력
CREATE TABLE user_majors (
  id              SERIAL   PRIMARY KEY,
  user_id         UUID     NOT NULL REFERENCES profiles(id)     ON DELETE CASCADE,
  department_id   INTEGER  NOT NULL REFERENCES departments(id),
  track_id        INTEGER           REFERENCES tracks(id),
  type            TEXT     NOT NULL DEFAULT 'major'
                           CHECK (type IN ('major', 'double_major', 'minor')),
  admission_year  INTEGER,
  graduation_year INTEGER
);

-- ── 과목 카탈로그 ────────────────────────────────────────────────────────
-- type: '전공기초' | '전공필수' | '전공선택'
-- admission_year: NULL이면 모든 입학년도에 적용
CREATE TABLE course_catalog (
  id             SERIAL  PRIMARY KEY,
  department_id  INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name           TEXT    NOT NULL,
  code           TEXT,
  type           TEXT    NOT NULL
                         CHECK (type IN ('전공기초', '전공필수', '전공선택')),
  credits        INTEGER NOT NULL DEFAULT 3,
  admission_year INTEGER
);

-- ── 이수한 과목 체크 ─────────────────────────────────────────────────────
CREATE TABLE checked_courses (
  id        SERIAL  PRIMARY KEY,
  user_id   UUID    NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES course_catalog(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id)
);

-- ── 졸업 요건 (학과별) ───────────────────────────────────────────────────
CREATE TABLE curriculum_requirements (
  id               SERIAL  PRIMARY KEY,
  department_id    INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  basic_credits    INTEGER NOT NULL DEFAULT 0,   -- 전공기초 이수 학점
  required_credits INTEGER NOT NULL DEFAULT 0,   -- 전공필수 이수 학점
  elective_credits INTEGER NOT NULL DEFAULT 0    -- 전공선택 이수 학점
);

-- ── 북마크 (선배 스크랩 — Phase 3) ──────────────────────────────────────
CREATE TABLE bookmarks (
  id         SERIAL      PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  senior_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, senior_id)
);

-- ── 커피챗 신청 (Phase 4) ─────────────────────────────────────────────────
CREATE TABLE coffee_chats (
  id           SERIAL      PRIMARY KEY,
  student_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  senior_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message      TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CHECK (student_id <> senior_id)   -- 자기 자신에게 신청 방지
);
CREATE UNIQUE INDEX coffee_chats_unique_pending
  ON coffee_chats (student_id, senior_id) WHERE status = 'pending';
CREATE INDEX idx_coffee_chats_senior  ON coffee_chats (senior_id, status);
CREATE INDEX idx_coffee_chats_student ON coffee_chats (student_id, status);

-- ── 채팅 메시지 (Phase 5) ─────────────────────────────────────────────────
CREATE TABLE messages (
  id             SERIAL      PRIMARY KEY,
  coffee_chat_id INTEGER     NOT NULL REFERENCES coffee_chats(id) ON DELETE CASCADE,
  sender_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_chat ON messages (coffee_chat_id, created_at);


-- ════════════════════════════════════════════════════════════════════════
-- STEP 3: Row Level Security (RLS) 활성화 & 정책 설정
-- ════════════════════════════════════════════════════════════════════════

-- ── 공개 읽기 테이블 (로그인 없이도 조회 가능) ───────────────────────────

ALTER TABLE colleges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_catalog          ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기 - colleges"
  ON colleges FOR SELECT USING (true);

CREATE POLICY "공개 읽기 - departments"
  ON departments FOR SELECT USING (true);

CREATE POLICY "공개 읽기 - tracks"
  ON tracks FOR SELECT USING (true);

CREATE POLICY "공개 읽기 - course_catalog"
  ON course_catalog FOR SELECT USING (true);

CREATE POLICY "공개 읽기 - curriculum_requirements"
  ON curriculum_requirements FOR SELECT USING (true);

-- ── profiles ─────────────────────────────────────────────────────────────
-- 멘토링 플랫폼 특성상 모든 프로필은 인증된 유저에게 공개
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필 읽기 - 전체 공개"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "프로필 삽입 - 본인만"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "프로필 수정 - 본인만"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- email은 전체 공개 SELECT 대상에서 제외 (개인정보 보호).
-- 테이블 SELECT를 회수하고 email 외 안전한 컬럼만 GRANT. INSERT/UPDATE는 유지.
REVOKE SELECT ON profiles FROM anon, authenticated;
GRANT  SELECT (id, name, role, bio, job_title, company, is_available, skills, created_at)
  ON profiles TO anon, authenticated;

-- ── user_majors ───────────────────────────────────────────────────────────
-- 선배 상세 프로필 조회 시 타인의 전공 정보 읽기 필요 → 전체 공개
ALTER TABLE user_majors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "전공 정보 읽기 - 인증 유저"
  ON user_majors FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "전공 정보 삽입 - 본인만"
  ON user_majors FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "전공 정보 수정 - 본인만"
  ON user_majors FOR UPDATE USING (auth.uid() = user_id);

-- ── checked_courses ───────────────────────────────────────────────────────
ALTER TABLE checked_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "체크 과목 읽기 - 본인만"
  ON checked_courses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "체크 과목 삽입 - 본인만"
  ON checked_courses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "체크 과목 삭제 - 본인만"
  ON checked_courses FOR DELETE USING (auth.uid() = user_id);

-- ── bookmarks ─────────────────────────────────────────────────────────────
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "북마크 읽기 - 본인만"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "북마크 삽입 - 본인만"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "북마크 삭제 - 본인만"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ── coffee_chats (Phase 4) ────────────────────────────────────────────────
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "커피챗 조회 - 당사자만"
  ON coffee_chats FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = senior_id);

CREATE POLICY "커피챗 신청 - 학생 본인만"
  ON coffee_chats FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "커피챗 상태 변경 - 당사자만"
  ON coffee_chats FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = senior_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = senior_id);

-- ── messages (Phase 5) ────────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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


-- ════════════════════════════════════════════════════════════════════════
-- STEP 4: 시드 데이터 (소프트웨어융합대학 > 소프트웨어융합학과)
-- ════════════════════════════════════════════════════════════════════════

-- ── 단과대학 ─────────────────────────────────────────────────────────────
INSERT INTO colleges (name, campus) VALUES
  ('소프트웨어융합대학', '국제캠퍼스');
-- colleges.id = 1

-- ── 학과 ─────────────────────────────────────────────────────────────────
INSERT INTO departments (college_id, name, has_tracks) VALUES
  (1, '소프트웨어융합학과', TRUE);
-- departments.id = 1

-- ── 트랙 ─────────────────────────────────────────────────────────────────
INSERT INTO tracks (department_id, name) VALUES
  (1, '게임콘텐츠'),
  (1, '데이터사이언스'),
  (1, '로봇·비전'),
  (1, '융합리더');

-- ── 졸업 요건 ─────────────────────────────────────────────────────────────
-- 소프트웨어융합학과: 전공기초 27학점, 전공필수 18학점, 전공선택 15학점
INSERT INTO curriculum_requirements (department_id, basic_credits, required_credits, elective_credits) VALUES
  (1, 27, 18, 15);

-- ── 과목 카탈로그 (소프트웨어융합학과) ─────────────────────────────────────

-- 전공기초 (9개 × 3학점 = 27학점)
INSERT INTO course_catalog (department_id, name, code, type, credits) VALUES
  (1, '프로그래밍기초',  'SWC1001', '전공기초', 3),
  (1, '자료구조',        'SWC1002', '전공기초', 3),
  (1, '알고리즘',        'SWC1003', '전공기초', 3),
  (1, '컴퓨터구조',      'SWC1004', '전공기초', 3),
  (1, '운영체제',        'SWC1005', '전공기초', 3),
  (1, '데이터베이스',    'SWC1006', '전공기초', 3),
  (1, '소프트웨어공학',  'SWC1007', '전공기초', 3),
  (1, '컴퓨터네트워크',  'SWC1008', '전공기초', 3),
  (1, '이산수학',        'SWC1009', '전공기초', 3);

-- 전공필수 (6개 × 3학점 = 18학점)
INSERT INTO course_catalog (department_id, name, code, type, credits) VALUES
  (1, '캡스톤디자인 I',      'SWC2001', '전공필수', 3),
  (1, '캡스톤디자인 II',     'SWC2002', '전공필수', 3),
  (1, '소프트웨어프로젝트',  'SWC2003', '전공필수', 3),
  (1, '인공지능',            'SWC2004', '전공필수', 3),
  (1, '머신러닝',            'SWC2005', '전공필수', 3),
  (1, '컴퓨터비전',          'SWC2006', '전공필수', 3);

-- 전공선택 (10개 × 3학점 = 30학점 중 15학점 충족)
INSERT INTO course_catalog (department_id, name, code, type, credits) VALUES
  (1, '웹프로그래밍',      'SWC3001', '전공선택', 3),
  (1, '모바일앱개발',      'SWC3002', '전공선택', 3),
  (1, '클라우드컴퓨팅',    'SWC3003', '전공선택', 3),
  (1, '빅데이터분석',      'SWC3004', '전공선택', 3),
  (1, '게임프로그래밍',    'SWC3005', '전공선택', 3),
  (1, '임베디드시스템',    'SWC3006', '전공선택', 3),
  (1, '사물인터넷',        'SWC3007', '전공선택', 3),
  (1, '정보보안',          'SWC3008', '전공선택', 3),
  (1, '자연어처리',        'SWC3009', '전공선택', 3),
  (1, '컴파일러이론',      'SWC3010', '전공선택', 3);


-- ════════════════════════════════════════════════════════════════════════
-- 완료! 이제 회원가입 → 홈 → 커리큘럼 페이지가 정상 동작합니다.
-- ════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- 커리어 로드맵 (0005_roadmaps.sql)
-- ════════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════════
-- 경희대 국제캠퍼스 전 학과 시드 (0006_khu_departments.sql)
-- ════════════════════════════════════════════════════════════════

-- ── 중복 방지 제약 (재실행 안전의 전제) ──────────────────────────────────
-- 기존 스키마에 유니크 제약이 없어 이 시드를 두 번 돌리면 학과가 중복 생성된다.
DO $$ BEGIN
  ALTER TABLE colleges ADD CONSTRAINT colleges_name_campus_key UNIQUE (name, campus);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE departments ADD CONSTRAINT departments_college_name_key UNIQUE (college_id, name);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- ── 단과대학 9개 ─────────────────────────────────────────────────────────
-- 소프트웨어융합대학은 이미 존재(id=1) — ON CONFLICT로 보존된다.
INSERT INTO colleges (name, campus) VALUES
  ('공과대학',           '국제캠퍼스'),
  ('전자정보대학',       '국제캠퍼스'),
  ('소프트웨어융합대학', '국제캠퍼스'),
  ('응용과학대학',       '국제캠퍼스'),
  ('생명과학대학',       '국제캠퍼스'),
  ('국제대학',           '국제캠퍼스'),
  ('외국어대학',         '국제캠퍼스'),
  ('예술·디자인대학',    '국제캠퍼스'),
  ('체육대학',           '국제캠퍼스')
ON CONFLICT (name, campus) DO NOTHING;

-- ── 학과/학부 46개 ───────────────────────────────────────────────────────
-- 소프트웨어융합학과는 이미 존재(id=1, has_tracks=TRUE) — 보존된다.
-- has_tracks는 트랙 데이터를 확인한 학과에만 TRUE. 나머지는 기본 FALSE.
INSERT INTO departments (college_id, name)
SELECT c.id, v.dept
FROM (VALUES
  -- 공과대학 (9)
  ('공과대학',           '기계공학부'),
  ('공과대학',           '산업경영공학과'),
  ('공과대학',           '원자력공학과'),
  ('공과대학',           '화학공학과'),
  ('공과대학',           '신소재공학과'),
  ('공과대학',           '사회기반시스템공학과'),
  ('공과대학',           '건축공학과'),
  ('공과대학',           '환경학및환경공학과'),
  ('공과대학',           '건축학과'),
  -- 전자정보대학 (2)
  ('전자정보대학',       '전자공학부'),
  ('전자정보대학',       '생체의공학과'),
  -- 소프트웨어융합대학 (2) — 소프트웨어융합학과는 기존 행 유지
  ('소프트웨어융합대학', '컴퓨터공학부'),
  ('소프트웨어융합대학', '소프트웨어융합학과'),
  -- 응용과학대학 (4)
  ('응용과학대학',       '응용수학과'),
  ('응용과학대학',       '응용물리학과'),
  ('응용과학대학',       '응용화학과'),
  ('응용과학대학',       '우주과학과'),
  -- 생명과학대학 (7)
  ('생명과학대학',       '스마트팜과학과'),
  ('생명과학대학',       '식물환경신소재공학과'),
  ('생명과학대학',       '식품생명공학과'),
  ('생명과학대학',       '원예생명공학과'),
  ('생명과학대학',       '유전생명공학과'),
  ('생명과학대학',       '한방생명공학과'),
  ('생명과학대학',       '융합바이오·신소재공학과'),
  -- 국제대학 (2)
  ('국제대학',           '국제학과'),
  ('국제대학',           '아시아학과(글로벌한국학과)'),
  -- 외국어대학 (7)
  ('외국어대학',         '프랑스어학과'),
  ('외국어대학',         '스페인어학과'),
  ('외국어대학',         '러시아어학과'),
  ('외국어대학',         '중국어학과'),
  ('외국어대학',         '일본어학과'),
  ('외국어대학',         '한국어학과'),
  ('외국어대학',         '글로벌커뮤니케이션학부'),
  -- 예술·디자인대학 (8)
  ('예술·디자인대학',    '산업디자인학과'),
  ('예술·디자인대학',    '시각디자인학과'),
  ('예술·디자인대학',    '환경조경디자인학과'),
  ('예술·디자인대학',    '디지털콘텐츠학과'),
  ('예술·디자인대학',    '의류디자인학과'),
  ('예술·디자인대학',    '도예학과'),
  ('예술·디자인대학',    '연극영화학과'),
  ('예술·디자인대학',    'PostModern음악학과'),
  -- 체육대학 (5)
  ('체육대학',           '체육학과'),
  ('체육대학',           '스포츠지도학과'),
  ('체육대학',           '스포츠의학과'),
  ('체육대학',           '골프산업학과'),
  ('체육대학',           '태권도학과')
) AS v(college, dept)
JOIN colleges c ON c.name = v.college AND c.campus = '국제캠퍼스'
ON CONFLICT (college_id, name) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 교육과정 버전 모델 (0007_curriculum_versions.sql)
-- ════════════════════════════════════════════════════════════════

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

ALTER TABLE curriculum_versions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_version_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_extra_requirements   ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS curriculum_versions_read ON curriculum_versions;
DROP POLICY IF EXISTS curriculum_ver_req_read  ON curriculum_version_requirements;
DROP POLICY IF EXISTS curriculum_extra_read    ON curriculum_extra_requirements;
CREATE POLICY curriculum_versions_read ON curriculum_versions FOR SELECT USING (true);
CREATE POLICY curriculum_ver_req_read  ON curriculum_version_requirements FOR SELECT USING (true);
CREATE POLICY curriculum_extra_read    ON curriculum_extra_requirements FOR SELECT USING (true);
