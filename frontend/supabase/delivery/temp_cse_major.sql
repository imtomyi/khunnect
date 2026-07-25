-- [임시 검증용] test-student에게 컴퓨터공학부 2024학번 전공을 부여
-- /curriculum 화면 확인 후 반드시 cleanup으로 제거할 것
INSERT INTO user_majors (user_id, department_id, track_id, type, admission_year)
VALUES ('a632bc35-c77f-49ff-8a86-c1108438b3a1', 13, NULL, 'major', 2024)
ON CONFLICT DO NOTHING;
