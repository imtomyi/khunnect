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
