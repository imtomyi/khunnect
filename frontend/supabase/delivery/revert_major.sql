-- [검증 후] test-student 전공을 원래 소융(dept 1, 2025)으로 복구
UPDATE user_majors
SET department_id = 1, admission_year = 2025
WHERE user_id = 'a632bc35-c77f-49ff-8a86-c1108438b3a1' AND type = 'major';
