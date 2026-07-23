DO $$
DECLARE
  dept_id INTEGER;
  ver_id  INTEGER;
BEGIN
  SELECT d.id INTO dept_id
  FROM departments d JOIN colleges c ON c.id = d.college_id
  WHERE d.name = U&'\CEF4\D4E8\D130\ACF5\D559\BD80' AND c.name = U&'\C18C\D504\D2B8\C6E8\C5B4\C735\D569\B300\D559'
  LIMIT 1;
  IF dept_id IS NULL THEN
    RAISE EXCEPTION 'department (computer engineering) not found - run migration 0006 first';
  END IF;
  SELECT id INTO ver_id FROM curriculum_versions
  WHERE department_id = dept_id AND year_start = 2024;
  IF ver_id IS NULL THEN
    INSERT INTO curriculum_versions (department_id, year_start, year_end, total_credits, note)
    VALUES (dept_id, 2024, NULL, 130, U&'2024 \AD50\C721\ACFC\C815. \B2E8\C77C\C804\ACF5 \AE30\C900. \CD9C\CC98: ce.khu.ac.kr [\BCC4\D45C1]')
    RETURNING id INTO ver_id;
  END IF;
  DELETE FROM course_catalog WHERE version_id = ver_id;
  DELETE FROM curriculum_version_requirements WHERE version_id = ver_id;
  DELETE FROM curriculum_extra_requirements WHERE version_id = ver_id;
  INSERT INTO curriculum_version_requirements
    (version_id, track, basic_credits, required_credits, industry_credits, elective_credits)
  VALUES (ver_id, 'single', 15, 45, 12, 15);
  INSERT INTO curriculum_extra_requirements (version_id, kind, label, count_required, applies_from) VALUES
    (ver_id, 'english_lecture', U&'\C804\ACF5 \C601\C5B4\AC15\C88C 3\ACFC\BAA9 \C774\C0C1',        3, 2008),
    (ver_id, 'sw_education',    U&'SW\AD50\C721 \C774\C218(2018\D559\BC88 \C774\D6C4)',    NULL, 2018),
    (ver_id, 'thesis',         U&'\C878\C5C5\B17C\BB38(\C878\C5C5\D504\B85C\C81D\D2B8\B85C \AC08\C74C)',   NULL, NULL);
  INSERT INTO course_catalog (department_id, version_id, name, code, type, credits, year) VALUES
  (dept_id, ver_id, U&'\BBF8\BD84\BC29\C815\C2DD',        'AMTH1001', U&'\C804\ACF5\AE30\CD08', 3, 1),
  (dept_id, ver_id, U&'\C120\D615\B300\C218',          'AMTH1004', U&'\C804\ACF5\AE30\CD08', 3, 1),
  (dept_id, ver_id, U&'\BBF8\BD84\C801\BD84\D559',        'AMTH1009', U&'\C804\ACF5\AE30\CD08', 3, 1),
  (dept_id, ver_id, U&'\C774\C0B0\AD6C\C870',          'CSE201',   U&'\C804\ACF5\AE30\CD08', 3, 2),
  (dept_id, ver_id, U&'\D655\B960\BC0F\B79C\B364\BCC0\C218',    'EE211',    U&'\C804\ACF5\AE30\CD08', 3, 2),
  (dept_id, ver_id, U&'\AC1D\CCB4\C9C0\D5A5\D504\B85C\ADF8\B798\BC0D', 'CSE103',   U&'\C804\ACF5\D544\C218', 3, 1),
  (dept_id, ver_id, U&'\CEF4\D4E8\D130\AD6C\C870',        'CSE203',   U&'\C804\ACF5\D544\C218', 3, 2),
  (dept_id, ver_id, U&'\C790\B8CC\AD6C\C870',          'CSE204',   U&'\C804\ACF5\D544\C218', 3, 2),
  (dept_id, ver_id, U&'\C6B4\C601\CCB4\C81C',          'CSE301',   U&'\C804\ACF5\D544\C218', 3, 3),
  (dept_id, ver_id, U&'\CEF4\D4E8\D130\B124\D2B8\C6CC\D06C',    'CSE302',   U&'\C804\ACF5\D544\C218', 3, 3),
  (dept_id, ver_id, U&'\C54C\ACE0\B9AC\C998',          'CSE304',   U&'\C804\ACF5\D544\C218', 3, 3),
  (dept_id, ver_id, U&'\B370\C774\D130\BCA0\C774\C2A4',      'CSE305',   U&'\C804\ACF5\D544\C218', 3, 3),
  (dept_id, ver_id, U&'\C18C\D504\D2B8\C6E8\C5B4\ACF5\D559',    'CSE327',   U&'\C804\ACF5\D544\C218', 3, 3),
  (dept_id, ver_id, U&'\C878\C5C5\B17C\BB38(\CEF4\D4E8\D130\ACF5\D559)', 'CSE403', U&'\C804\ACF5\D544\C218', 0, 4),
  (dept_id, ver_id, U&'\C878\C5C5\D504\B85C\C81D\D2B8',      'CSE405',   U&'\C804\ACF5\D544\C218', 3, 4),
  (dept_id, ver_id, U&'\CEA1\C2A4\D1A4\B514\C790\C778',      'CSE406',   U&'\C804\ACF5\D544\C218', 3, 4),
  (dept_id, ver_id, U&'\B17C\B9AC\D68C\B85C',          'EE209',    U&'\C804\ACF5\D544\C218', 3, 2),
  (dept_id, ver_id, U&'\B514\C790\C778\C801\C0AC\ACE0',      'SWCON103', U&'\C804\ACF5\D544\C218', 3, 1),
  (dept_id, ver_id, U&'\C6F9/\D30C\C774\C120\D504\B85C\ADF8\B798\BC0D', 'SWCON104', U&'\C804\ACF5\D544\C218', 3, 1),
  (dept_id, ver_id, U&'\C624\D508\C18C\C2A4SW\AC1C\BC1C\BC29\BC95\BC0F\B3C4\AD6C', 'SWCON201', U&'\C804\ACF5\D544\C218', 3, 2),
  (dept_id, ver_id, U&'\AE30\ACC4\D559\C2B5',          'SWCON253', U&'\C804\ACF5\D544\C218', 3, 2),
  (dept_id, ver_id, U&'\C778\ACF5\C9C0\B2A5\D504\B85C\ADF8\B798\BC0D', 'AI1002',   U&'\C804\ACF5\C120\D0DD', 3, 1),
  (dept_id, ver_id, U&'\ACE0\AE09\B525\B7EC\B2DD',        'AI3001',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\BE45\B370\C774\D130\B9C8\C774\B2DD',    'AI3004',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\C2E4\AC10\BBF8\B514\C5B4\CEF4\D4E8\D305\AE30\CD08', 'CSE104', U&'\C804\ACF5\C120\D0DD', 3, 1),
  (dept_id, ver_id, U&'UI/UX\D504\B85C\ADF8\B798\BC0D',   'CSE224',   U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\CEF4\D30C\C77C\B7EC',          'CSE322',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\BA54\D0C0\BC84\C2A4\C2DC\C2A4\D15C',    'CSE324',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\D504\B85C\ADF8\B798\BC0D\C5B8\C5B4\B860',  'CSE328',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'SW\C2A4\D0C0\D2B8\C5C5\BE44\C988\B2C8\C2A4', 'CSE330',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\B525\B7EC\B2DD',            'CSE331',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\B9AC\B205\C2A4\C2DC\C2A4\D15C\D504\B85C\ADF8\B798\BC0D', 'CSE332', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'SW\C2A4\D0C0\D2B8\C5C5\D504\B85C\C81D\D2B8', 'CSE334',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\D074\B77C\C6B0\B4DC\CEF4\D4E8\D305',    'CSE335',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\C2E4\C804\AE30\ACC4\D559\C2B5',      'CSE340',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\C815\BCF4\BCF4\D638',          'CSE423',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\C601\C0C1\CC98\B9AC',          'CSE426',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\CEF4\D4E8\D130\ADF8\B798\D53D\C2A4',    'CSE428',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\BA54\D0C0\BC84\C2A4\B370\C774\D130\CC98\B9AC', 'CSE430',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\C778\AC04-\CEF4\D4E8\D130\C0C1\D638\C791\C6A9', 'CSE431',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\BE45\B370\C774\D130\D504\B85C\ADF8\B798\BC0D', 'CSE434',   U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\BE45\B370\C774\D130\D504\B85C\C81D\D2B8',  'CSE436',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\D074\B77C\C6B0\B4DC\D504\B85C\C81D\D2B8',  'CSE437',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\CD5C\C2E0\AE30\C220\CF5C\B85C\D0A4\C6C01', 'CSE438',   U&'\C804\ACF5\C120\D0DD', 2, 4),
  (dept_id, ver_id, U&'AIoT\B514\C9C0\D138\C2DC\C2A4\D15C',  'CSE439',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'AIoT\C18C\D504\D2B8\C6E8\C5B4',    'CSE440',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\CEF4\D4E8\D130\BE44\C83C',        'CSE441',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\BE14\B85D\CCB4\C778',          'CSE442',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'AI\B124\D2B8\C6CC\D0B9',        'CSE443',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'AIoT\B124\D2B8\C6CC\D06C',      'CSE444',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\BAA8\BC14\C77C/\C6F9\C11C\BE44\C2A4\D504\B85C\ADF8\B798\BC0D', 'CSE450', U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\BAA8\BC14\C77C/\C6F9\C11C\BE44\C2A4\D504\B85C\C81D\D2B8', 'CSE451', U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\C18C\D504\D2B8\C6E8\C5B4\BCF4\C548',    'CSE452',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\C6F9\BCF4\C548',            'CSE453',   U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\B3C5\B9BD\C2EC\D654\D559\C2B51(\CEF4\D4E8\D130\ACF5\D559\ACFC)', 'CSE495', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\C5F0\AD6C\C5F0\C218\D65C\B3D91',     'CSE496',   U&'\C804\ACF5\C120\D0DD', 1, 2),
  (dept_id, ver_id, U&'\C5F0\AD6C\C5F0\C218\D65C\B3D92',     'CSE497',   U&'\C804\ACF5\C120\D0DD', 1, 2),
  (dept_id, ver_id, U&'\B3C5\B9BD\C2EC\D654\D559\C2B52(\CEF4\D4E8\D130\ACF5\D559\ACFC)', 'CSE499', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\C2E0\D638\C640\C2DC\C2A4\D15C',      'EE210',    U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\AC8C\C784\D504\B85C\ADF8\B798\BC0D\C785\BB38', 'SWCON211', U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\AC8C\C784\C5D4\C9C4\AE30\CD08',      'SWCON212', U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\B9C8\C774\D06C\B85C\C11C\BE44\C2A4\D504\B85C\ADF8\B798\BC0D', 'SWCON221', U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\D68C\B85C\C640\C2E0\D638',        'SWCON254', U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\CD5C\C2E0\AE30\C220\CF5C\B85C\D0A4\C6C02', 'SWCON302', U&'\C804\ACF5\C120\D0DD', 2, 2),
  (dept_id, ver_id, U&'\AC8C\C784\ADF8\B798\D53D\D504\B85C\ADF8\B798\BC0D', 'SWCON311', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\AC8C\C784\C778\D130\B799\D2F0\BE0C\D14C\D06C\B180\B85C\C9C0', 'SWCON312', U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\AC00\C0C1/\C99D\AC15\D604\C2E4\C774\B860\BC0F\C2E4\C2B5', 'SWCON313', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\B85C\BD07\D504\B85C\ADF8\B798\BC0D',    'SWCON331', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'3D\B370\C774\D130\CC98\B9AC',      'SWCON366', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\D480\C2A4\D0DD\C11C\BE44\C2A4\D504\B85C\ADF8\B798\BC0D', 'SWCON370', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\C778\ACF5\C9C0\B2A5\ACFC\AC8C\C784\D504\B85C\ADF8\B798\BC0D', 'SWCON491', U&'\C804\ACF5\C120\D0DD', 3, 3),
  (dept_id, ver_id, U&'\D480\C2A4\D0DD\C11C\BE44\C2A4\B124\D2B8\C6CC\D0B9', 'SWCON492', U&'\C804\ACF5\C120\D0DD', 3, 2),
  (dept_id, ver_id, U&'\C790\C5F0\C5B4\CC98\B9AC',        'SWCON493', U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\AC15\D654\D559\C2B5',          'SWCON495', U&'\C804\ACF5\C120\D0DD', 3, 4),
  (dept_id, ver_id, U&'\B2E8\AE30\D604\C7A5\C2E4\C2B5',      'CSE-INT1', U&'\C0B0\D559\D544\C218', 3, 2),
  (dept_id, ver_id, U&'\C7A5\AE30\D604\C7A5\C2E4\C2B5',      'CSE-INT2', U&'\C0B0\D559\D544\C218', 9, 2);
  RAISE NOTICE 'CSE 2024 seed done: version_id=%', ver_id;
END $$;
