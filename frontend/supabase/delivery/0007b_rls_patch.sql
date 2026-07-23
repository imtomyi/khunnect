-- 교육과정 버전 테이블 공개 읽기 (RLS 정책 누락 보완)
ALTER TABLE curriculum_versions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_version_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_extra_requirements   ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS curriculum_versions_read ON curriculum_versions;
DROP POLICY IF EXISTS curriculum_ver_req_read  ON curriculum_version_requirements;
DROP POLICY IF EXISTS curriculum_extra_read    ON curriculum_extra_requirements;
CREATE POLICY curriculum_versions_read ON curriculum_versions FOR SELECT USING (true);
CREATE POLICY curriculum_ver_req_read  ON curriculum_version_requirements FOR SELECT USING (true);
CREATE POLICY curriculum_extra_read    ON curriculum_extra_requirements FOR SELECT USING (true);
