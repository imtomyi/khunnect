-- [임시 검증용] 중복으로 들어간 컴공 major 제거 후,
-- 원래 소융 major를 잠깐 컴공 2024로 전환 (major 행은 항상 1개 유지)
DELETE FROM user_majors
WHERE user_id = 'a632bc35-c77f-49ff-8a86-c1108438b3a1' AND department_id = 13;

UPDATE user_majors
SET department_id = 13, admission_year = 2024
WHERE user_id = 'a632bc35-c77f-49ff-8a86-c1108438b3a1' AND type = 'major';
