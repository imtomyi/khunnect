-- ════════════════════════════════════════════════════════════════════════
-- 0004_security_hardening.sql
-- 실서비스 보안 점검에서 발견된 항목 보완. 재실행 안전(idempotent).
-- Supabase Dashboard → SQL Editor 에서 실행.
-- ════════════════════════════════════════════════════════════════════════

-- [1] profiles.email 노출 차단
-- profiles 는 "SELECT USING (true)" 전체 공개 정책이라, 공개 anon 키로
-- 누구나 전체 사용자 이메일을 조회할 수 있었다(개인정보 유출).
--
-- ⚠️ 테이블 단위 SELECT 권한이 있으면 컬럼 단위 REVOKE는 무효이므로
--    (Postgres 권한 규칙), 테이블 SELECT를 회수하고 email을 제외한
--    안전한 컬럼만 명시적으로 GRANT한다. INSERT/UPDATE 권한은 유지되어
--    회원가입 시 email 저장·본인 프로필 수정은 정상 동작한다.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT  SELECT (id, name, role, bio, job_title, company, is_available, skills, created_at)
  ON public.profiles TO anon, authenticated;

-- [2] 커피챗 자기 자신 신청 방지
DO $$
BEGIN
  ALTER TABLE coffee_chats ADD CONSTRAINT coffee_chats_no_self CHECK (student_id <> senior_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
