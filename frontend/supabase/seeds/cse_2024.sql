-- ════════════════════════════════════════════════════════════════════════
-- 컴퓨터공학과 2024 교육과정 시드 (파일럿)
--
-- 출처: ce.khu.ac.kr 공식 '2024 컴퓨터공학과 교육과정.pdf' [별표1] 편성표
--   (pdftoppm으로 8~9p 이미지 렌더 후 표를 직접 판독 — 정규식 파싱은
--    병합 셀·세로 이수구분 때문에 부정확해 이미지 판독으로 확정)
--
-- 단일전공 기준. 74 전공과목 + 산학필수(현장실습) 2.
-- 요약표 검증: 전공기초5 · 전공필수16 · 산학필수13(선택형13) · 전공선택44 → 아래와 대조.
--   ※ 편성표상 실제 개수: 전공기초5, 전공필수16(6~21), 전공선택(22~74 중), 산학필수(75~76)
--
-- 재실행 안전: 시드 재실행 전 해당 버전 과목/요건을 지우고 다시 넣는다.
-- Supabase SQL Editor에서 0006·0007 적용 후 실행.
-- ════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  dept_id INTEGER;
  ver_id  INTEGER;
BEGIN
  -- 컴퓨터공학과 department_id (0006에서 시드됨)
  SELECT d.id INTO dept_id
  FROM departments d JOIN colleges c ON c.id = d.college_id
  WHERE d.name = '컴퓨터공학부' AND c.name = '소프트웨어융합대학'
  LIMIT 1;

  IF dept_id IS NULL THEN
    RAISE EXCEPTION '컴퓨터공학부를 찾을 수 없음 — 0006 마이그레이션 먼저 실행';
  END IF;

  -- 2024 버전 (요건 개편 이력상 현행. 정확한 시작연도는 시행세칙 표 재확인 여지 있음)
  SELECT id INTO ver_id FROM curriculum_versions
  WHERE department_id = dept_id AND year_start = 2024;

  IF ver_id IS NULL THEN
    INSERT INTO curriculum_versions (department_id, year_start, year_end, total_credits, note)
    VALUES (dept_id, 2024, NULL, 130, '2024 교육과정. 단일전공 기준. 출처: ce.khu.ac.kr [별표1]')
    RETURNING id INTO ver_id;
  END IF;

  -- 재실행 안전: 이 버전의 과목·요건 초기화
  DELETE FROM course_catalog WHERE version_id = ver_id;
  DELETE FROM curriculum_version_requirements WHERE version_id = ver_id;
  DELETE FROM curriculum_extra_requirements WHERE version_id = ver_id;

  -- ── 졸업요건 (단일전공): 전공기초15·전공필수45·산학필수12·전공선택15 = 전공87 / 졸업130 ──
  INSERT INTO curriculum_version_requirements
    (version_id, track, basic_credits, required_credits, industry_credits, elective_credits)
  VALUES (ver_id, 'single', 15, 45, 12, 15);

  -- ── 부가 졸업조건 ──
  INSERT INTO curriculum_extra_requirements (version_id, kind, label, count_required, applies_from) VALUES
    (ver_id, 'english_lecture', '전공 영어강좌 3과목 이상',        3, 2008),
    (ver_id, 'sw_education',    'SW교육 이수(2018학번 이후)',    NULL, 2018),
    (ver_id, 'thesis',         '졸업논문(졸업프로젝트로 갈음)',   NULL, NULL);

  -- ── 과목 (편성표 순번·이수구분·학수번호·학점·개설학년) ──
  INSERT INTO course_catalog (department_id, version_id, name, code, type, credits, year) VALUES
  -- 전공기초 (1~5)
  (dept_id, ver_id, '미분방정식',        'AMTH1001', '전공기초', 3, 1),
  (dept_id, ver_id, '선형대수',          'AMTH1004', '전공기초', 3, 1),
  (dept_id, ver_id, '미분적분학',        'AMTH1009', '전공기초', 3, 1),
  (dept_id, ver_id, '이산구조',          'CSE201',   '전공기초', 3, 2),
  (dept_id, ver_id, '확률및랜덤변수',    'EE211',    '전공기초', 3, 2),
  -- 전공필수 (6~21)
  (dept_id, ver_id, '객체지향프로그래밍', 'CSE103',   '전공필수', 3, 1),
  (dept_id, ver_id, '컴퓨터구조',        'CSE203',   '전공필수', 3, 2),
  (dept_id, ver_id, '자료구조',          'CSE204',   '전공필수', 3, 2),
  (dept_id, ver_id, '운영체제',          'CSE301',   '전공필수', 3, 3),
  (dept_id, ver_id, '컴퓨터네트워크',    'CSE302',   '전공필수', 3, 3),
  (dept_id, ver_id, '알고리즘',          'CSE304',   '전공필수', 3, 3),
  (dept_id, ver_id, '데이터베이스',      'CSE305',   '전공필수', 3, 3),
  (dept_id, ver_id, '소프트웨어공학',    'CSE327',   '전공필수', 3, 3),
  (dept_id, ver_id, '졸업논문(컴퓨터공학)', 'CSE403', '전공필수', 0, 4),
  (dept_id, ver_id, '졸업프로젝트',      'CSE405',   '전공필수', 3, 4),
  (dept_id, ver_id, '캡스톤디자인',      'CSE406',   '전공필수', 3, 4),
  (dept_id, ver_id, '논리회로',          'EE209',    '전공필수', 3, 2),
  (dept_id, ver_id, '디자인적사고',      'SWCON103', '전공필수', 3, 1),
  (dept_id, ver_id, '웹/파이선프로그래밍', 'SWCON104', '전공필수', 3, 1),
  (dept_id, ver_id, '오픈소스SW개발방법및도구', 'SWCON201', '전공필수', 3, 2),
  (dept_id, ver_id, '기계학습',          'SWCON253', '전공필수', 3, 2),
  -- 전공선택 (22~74)
  (dept_id, ver_id, '인공지능프로그래밍', 'AI1002',   '전공선택', 3, 1),
  (dept_id, ver_id, '고급딥러닝',        'AI3001',   '전공선택', 3, 3),
  (dept_id, ver_id, '빅데이터마이닝',    'AI3004',   '전공선택', 3, 3),
  (dept_id, ver_id, '실감미디어컴퓨팅기초', 'CSE104', '전공선택', 3, 1),
  (dept_id, ver_id, 'UI/UX프로그래밍',   'CSE224',   '전공선택', 3, 2),
  (dept_id, ver_id, '컴파일러',          'CSE322',   '전공선택', 3, 3),
  (dept_id, ver_id, '메타버스시스템',    'CSE324',   '전공선택', 3, 3),
  (dept_id, ver_id, '프로그래밍언어론',  'CSE328',   '전공선택', 3, 3),
  (dept_id, ver_id, 'SW스타트업비즈니스', 'CSE330',   '전공선택', 3, 3),
  (dept_id, ver_id, '딥러닝',            'CSE331',   '전공선택', 3, 3),
  (dept_id, ver_id, '리눅스시스템프로그래밍', 'CSE332', '전공선택', 3, 3),
  (dept_id, ver_id, 'SW스타트업프로젝트', 'CSE334',   '전공선택', 3, 3),
  (dept_id, ver_id, '클라우드컴퓨팅',    'CSE335',   '전공선택', 3, 3),
  (dept_id, ver_id, '실전기계학습',      'CSE340',   '전공선택', 3, 3),
  (dept_id, ver_id, '정보보호',          'CSE423',   '전공선택', 3, 4),
  (dept_id, ver_id, '영상처리',          'CSE426',   '전공선택', 3, 4),
  (dept_id, ver_id, '컴퓨터그래픽스',    'CSE428',   '전공선택', 3, 4),
  (dept_id, ver_id, '메타버스데이터처리', 'CSE430',   '전공선택', 3, 4),
  (dept_id, ver_id, '인간-컴퓨터상호작용', 'CSE431',   '전공선택', 3, 4),
  (dept_id, ver_id, '빅데이터프로그래밍', 'CSE434',   '전공선택', 3, 3),
  (dept_id, ver_id, '빅데이터프로젝트',  'CSE436',   '전공선택', 3, 4),
  (dept_id, ver_id, '클라우드프로젝트',  'CSE437',   '전공선택', 3, 4),
  (dept_id, ver_id, '최신기술콜로키움1', 'CSE438',   '전공선택', 2, 4),
  (dept_id, ver_id, 'AIoT디지털시스템',  'CSE439',   '전공선택', 3, 4),
  (dept_id, ver_id, 'AIoT소프트웨어',    'CSE440',   '전공선택', 3, 4),
  (dept_id, ver_id, '컴퓨터비젼',        'CSE441',   '전공선택', 3, 4),
  (dept_id, ver_id, '블록체인',          'CSE442',   '전공선택', 3, 4),
  (dept_id, ver_id, 'AI네트워킹',        'CSE443',   '전공선택', 3, 4),
  (dept_id, ver_id, 'AIoT네트워크',      'CSE444',   '전공선택', 3, 4),
  (dept_id, ver_id, '모바일/웹서비스프로그래밍', 'CSE450', '전공선택', 3, 4),
  (dept_id, ver_id, '모바일/웹서비스프로젝트', 'CSE451', '전공선택', 3, 4),
  (dept_id, ver_id, '소프트웨어보안',    'CSE452',   '전공선택', 3, 4),
  (dept_id, ver_id, '웹보안',            'CSE453',   '전공선택', 3, 4),
  (dept_id, ver_id, '독립심화학습1(컴퓨터공학과)', 'CSE495', '전공선택', 3, 3),
  (dept_id, ver_id, '연구연수활동1',     'CSE496',   '전공선택', 1, 2),
  (dept_id, ver_id, '연구연수활동2',     'CSE497',   '전공선택', 1, 2),
  (dept_id, ver_id, '독립심화학습2(컴퓨터공학과)', 'CSE499', '전공선택', 3, 3),
  (dept_id, ver_id, '신호와시스템',      'EE210',    '전공선택', 3, 2),
  (dept_id, ver_id, '게임프로그래밍입문', 'SWCON211', '전공선택', 3, 2),
  (dept_id, ver_id, '게임엔진기초',      'SWCON212', '전공선택', 3, 2),
  (dept_id, ver_id, '마이크로서비스프로그래밍', 'SWCON221', '전공선택', 3, 2),
  (dept_id, ver_id, '회로와신호',        'SWCON254', '전공선택', 3, 2),
  (dept_id, ver_id, '최신기술콜로키움2', 'SWCON302', '전공선택', 2, 2),
  (dept_id, ver_id, '게임그래픽프로그래밍', 'SWCON311', '전공선택', 3, 3),
  (dept_id, ver_id, '게임인터랙티브테크놀로지', 'SWCON312', '전공선택', 3, 4),
  (dept_id, ver_id, '가상/증강현실이론및실습', 'SWCON313', '전공선택', 3, 3),
  (dept_id, ver_id, '로봇프로그래밍',    'SWCON331', '전공선택', 3, 3),
  (dept_id, ver_id, '3D데이터처리',      'SWCON366', '전공선택', 3, 3),
  (dept_id, ver_id, '풀스택서비스프로그래밍', 'SWCON370', '전공선택', 3, 3),
  (dept_id, ver_id, '인공지능과게임프로그래밍', 'SWCON491', '전공선택', 3, 3),
  (dept_id, ver_id, '풀스택서비스네트워킹', 'SWCON492', '전공선택', 3, 2),
  (dept_id, ver_id, '자연어처리',        'SWCON493', '전공선택', 3, 4),
  (dept_id, ver_id, '강화학습',          'SWCON495', '전공선택', 3, 4),
  -- 산학필수 (75~76 현장실습)
  (dept_id, ver_id, '단기현장실습',      'CSE-INT1', '산학필수', 3, 2),
  (dept_id, ver_id, '장기현장실습',      'CSE-INT2', '산학필수', 9, 2);

  RAISE NOTICE '컴퓨터공학과 2024 시드 완료: version_id=%', ver_id;
END $$;
