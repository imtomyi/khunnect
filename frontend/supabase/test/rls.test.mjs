// ════════════════════════════════════════════════════════════════════════
// khunnect DB 테스트 — 실제 Postgres(PGlite, WASM 내장) 위에서
// schema.sql + 마이그레이션 + RLS 정책 + 제약을 검증한다.
// 원격 Supabase 없이 오프라인 실행 가능.
//
//   npm run test:db     (frontend/ 에서)
//
// Supabase의 auth.uid() / anon·authenticated 롤 / JWT 클레임(GUC)을 재현해
// RLS를 실제로 태운다.
// ════════════════════════════════════════════════════════════════════════
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const sql = (p) => readFileSync(join(here, p), 'utf8')

const db = new PGlite()
let PASS = 0, FAIL = 0
const log = []
const check = (n, c, d = '') => { c ? (PASS++, log.push(`✅ ${n}`)) : (FAIL++, log.push(`❌ ${n} ${d}`)) }

// ── Supabase 환경 재현 ────────────────────────────────────────────────────
await db.exec(`
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  DO $$ BEGIN CREATE ROLE anon; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
  GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
  CREATE PUBLICATION supabase_realtime;
`)

// schema.sql 전체 (DDL·RLS·제약·시드·권한)
try { await db.exec(sql('../schema.sql')); check('schema.sql 전체 적용', true) }
catch (e) { check('schema.sql 전체 적용', false, '→ ' + e.message); report(); process.exit(1) }

// 마이그레이션 idempotent 재실행
for (const f of ['0001_senior_profile_fields', '0002_coffee_chats', '0003_messages', '0004_security_hardening', '0005_roadmaps']) {
  try { await db.exec(sql(`../migrations/${f}.sql`)); check(`migration ${f} (재실행)`, true) }
  catch (e) { check(`migration ${f}`, false, '→ ' + e.message) }
}

// 테스트 유저
const S = '11111111-1111-1111-1111-111111111111'
const A = '22222222-2222-2222-2222-222222222222'
const U = '33333333-3333-3333-3333-333333333333'
await db.exec(`
  INSERT INTO auth.users(id,email) VALUES ('${S}','s@t.com'),('${A}','a@t.com'),('${U}','u@t.com');
  INSERT INTO profiles(id,email,name,role) VALUES
   ('${S}','s@t.com','김학생','student'),('${A}','a@t.com','이선배','alumni'),('${U}','u@t.com','박제3','student');
  INSERT INTO user_majors(user_id,department_id,graduation_year,type) VALUES ('${A}',1,2022,'major'),('${S}',1,NULL,'major');
`)

async function asUser(uid, q, p) {
  await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`, [uid])
  await db.exec(`SET ROLE authenticated`)
  try { return await db.query(q, p) } finally { await db.exec(`RESET ROLE`); await db.query(`SELECT set_config('request.jwt.claim.sub','',false)`) }
}
const T = async (uid, q, p) => { try { return { data: (await asUser(uid, q, p)).rows, error: null } } catch (e) { await db.exec('RESET ROLE').catch(() => {}); return { data: null, error: e } } }

// ── Phase 3 ──
await T(A, `UPDATE profiles SET bio=$1,job_title=$2,company=$3,skills=$4 WHERE id=$5`, ['소개', '데이터 엔지니어', '네이버', ['Python', 'SQL'], A])
check('P3 선배 프로필 편집(본인)', (await db.query(`SELECT bio FROM profiles WHERE id=$1`, [A])).rows[0].bio === '소개')
await T(S, `UPDATE profiles SET bio='x' WHERE id=$1`, [A])
check('P3 RLS 타인 프로필 수정 무효', (await db.query(`SELECT bio FROM profiles WHERE id=$1`, [A])).rows[0].bio === '소개')
{ const r = await T(S, `SELECT id,name,skills FROM profiles WHERE role='alumni'`); check('P3 선배 조회+전문분야', r.data?.length === 1 && JSON.stringify(r.data[0].skills) === JSON.stringify(['Python', 'SQL'])) }
{ const r = await T(S, `SELECT email FROM profiles WHERE id=$1`, [A]); check('보안 email 컬럼 차단(0004)', !!r.error, r.error?.message) }
{ const r = await T(S, `SELECT id,name FROM profiles WHERE id=$1`, [A]); check('email 외 컬럼 정상', !r.error && r.data.length === 1) }
await T(S, `INSERT INTO bookmarks(user_id,senior_id) VALUES($1,$2)`, [S, A])
check('P3 북마크 추가', (await T(S, `SELECT senior_id FROM bookmarks WHERE user_id=$1`, [S])).data?.[0]?.senior_id === A)
check('P3 RLS 타인 북마크 비공개', (await T(U, `SELECT id FROM bookmarks WHERE user_id=$1`, [S])).data?.length === 0)
check('P3 RLS 타인 명의 북마크 차단', !!(await T(U, `INSERT INTO bookmarks(user_id,senior_id) VALUES($1,$2)`, [S, A])).error)

// ── Phase 4 ──
let chatId
{ const r = await T(S, `INSERT INTO coffee_chats(student_id,senior_id,message) VALUES($1,$2,'hi') RETURNING id`, [S, A]); check('P4 커피챗 신청', !r.error); chatId = r.data?.[0]?.id }
check('P4 중복 pending 차단', !!(await T(S, `INSERT INTO coffee_chats(student_id,senior_id) VALUES($1,$2)`, [S, A])).error)
check('P4 자기신청 차단(CHECK)', !!(await T(U, `INSERT INTO coffee_chats(student_id,senior_id) VALUES($1,$1)`, [U])).error)
check('P4 RLS 타인 명의 신청 차단', !!(await T(U, `INSERT INTO coffee_chats(student_id,senior_id) VALUES($1,$2)`, [S, A])).error)
check('P4 선배 받은 신청', (await T(A, `SELECT status FROM coffee_chats WHERE senior_id=$1`, [A])).data?.[0]?.status === 'pending')
check('P4 RLS 제3자 커피챗 비공개', (await T(U, `SELECT id FROM coffee_chats WHERE id=$1`, [chatId])).data?.length === 0)
await T(A, `UPDATE coffee_chats SET status='accepted' WHERE id=$1`, [chatId])
check('P4 선배 수락', (await db.query(`SELECT status FROM coffee_chats WHERE id=$1`, [chatId])).rows[0].status === 'accepted')

// ── Phase 5 ──
check('P5 학생 메시지 전송', !(await T(S, `INSERT INTO messages(coffee_chat_id,sender_id,content) VALUES($1,$2,'hi')`, [chatId, S])).error)
check('P5 선배 메시지 전송', !(await T(A, `INSERT INTO messages(coffee_chat_id,sender_id,content) VALUES($1,$2,'yo')`, [chatId, A])).error)
check('P5 양측 메시지 2건', (await T(S, `SELECT id FROM messages WHERE coffee_chat_id=$1`, [chatId])).data?.length === 2)
check('P5 RLS 제3자 메시지 비공개', (await T(U, `SELECT id FROM messages WHERE coffee_chat_id=$1`, [chatId])).data?.length === 0)
check('P5 RLS 제3자 메시지 전송 차단', !!(await T(U, `INSERT INTO messages(coffee_chat_id,sender_id,content) VALUES($1,$2,'x')`, [chatId, U])).error)
await T(U, `INSERT INTO coffee_chats(student_id,senior_id,message) VALUES($1,$2,'hi')`, [U, A])
{ const pend = (await db.query(`SELECT id FROM coffee_chats WHERE student_id=$1 AND status='pending'`, [U])).rows[0].id
  check('P5 미수락 채팅 전송 차단', !!(await T(U, `INSERT INTO messages(coffee_chat_id,sender_id,content) VALUES($1,$2,'x')`, [pend, U])).error) }

// ── 커리어 로드맵 ──
let rmA
{ const r = await T(A, `INSERT INTO roadmaps(user_id) VALUES($1) RETURNING id, is_public, title`, [A])
  check('RM 로드맵 생성(본인)', !r.error); rmA = r.data?.[0]?.id
  check('RM 기본 비공개(is_public=false)', r.data?.[0]?.is_public === false)
  check('RM 기본 제목', r.data?.[0]?.title === '나의 커리어 로드맵') }
check('RM 타인 명의 로드맵 생성 차단', !!(await T(U, `INSERT INTO roadmaps(user_id) VALUES($1)`, [A])).error)
check('RM 유저당 1개(UNIQUE)', !!(await T(A, `INSERT INTO roadmaps(user_id) VALUES($1)`, [A])).error)

// 항목 추가 — 회고(done) / 계획(planned) 둘 다
await T(A, `INSERT INTO roadmap_items(roadmap_id,year,semester,type,title,status) VALUES($1,2,1,'인턴','네이버 인턴','done')`, [rmA])
await T(A, `INSERT INTO roadmap_items(roadmap_id,year,semester,type,title,status) VALUES($1,4,2,'취업','정규직 전환','planned')`, [rmA])
check('RM 항목 추가(done+planned)', (await T(A, `SELECT id FROM roadmap_items WHERE roadmap_id=$1`, [rmA])).data?.length === 2)
check('RM 잘못된 type 차단(CHECK)', !!(await T(A, `INSERT INTO roadmap_items(roadmap_id,year,semester,type,title) VALUES($1,1,1,'해킹','x')`, [rmA])).error)
check('RM 잘못된 학기 차단(CHECK)', !!(await T(A, `INSERT INTO roadmap_items(roadmap_id,year,semester,type,title) VALUES($1,1,3,'수강','x')`, [rmA])).error)
check('RM 빈 제목 차단(CHECK)', !!(await T(A, `INSERT INTO roadmap_items(roadmap_id,year,semester,type,title) VALUES($1,1,1,'수강','   ')`, [rmA])).error)

// 핵심: 비공개 경계
check('RM 비공개 로드맵 타인에게 숨김', (await T(U, `SELECT id FROM roadmaps WHERE id=$1`, [rmA])).data?.length === 0)
check('RM 비공개 항목 타인에게 숨김', (await T(U, `SELECT id FROM roadmap_items WHERE roadmap_id=$1`, [rmA])).data?.length === 0)
check('RM 비공개라도 본인은 조회', (await T(A, `SELECT id FROM roadmaps WHERE id=$1`, [rmA])).data?.length === 1)

// 공개 전환 후
await T(A, `UPDATE roadmaps SET is_public=TRUE WHERE id=$1`, [rmA])
check('RM 공개 후 타인 조회 가능', (await T(U, `SELECT id FROM roadmaps WHERE id=$1`, [rmA])).data?.length === 1)
check('RM 공개 후 항목도 조회 가능', (await T(U, `SELECT id FROM roadmap_items WHERE roadmap_id=$1`, [rmA])).data?.length === 2)
check('RM 공개돼도 타인 수정 차단', (await T(U, `UPDATE roadmaps SET title='해킹' WHERE id=$1`, [rmA])).data !== null
  && (await db.query(`SELECT title FROM roadmaps WHERE id=$1`, [rmA])).rows[0].title === '나의 커리어 로드맵')
check('RM 공개돼도 타인 항목 추가 차단', !!(await T(U, `INSERT INTO roadmap_items(roadmap_id,year,semester,type,title) VALUES($1,1,1,'수강','침입')`, [rmA])).error)
{ const before = (await db.query(`SELECT count(*)::int c FROM roadmap_items WHERE roadmap_id=$1`, [rmA])).rows[0].c
  await T(U, `DELETE FROM roadmap_items WHERE roadmap_id=$1`, [rmA])
  const after = (await db.query(`SELECT count(*)::int c FROM roadmap_items WHERE roadmap_id=$1`, [rmA])).rows[0].c
  check('RM 공개돼도 타인 항목 삭제 차단', before === after && after === 2) }

// 본인 편집 + CASCADE
await T(A, `UPDATE roadmap_items SET status='done' WHERE roadmap_id=$1 AND status='planned'`, [rmA])
check('RM 본인 항목 상태 변경(계획→완료)', (await T(A, `SELECT id FROM roadmap_items WHERE roadmap_id=$1 AND status='done'`, [rmA])).data?.length === 2)
await T(A, `DELETE FROM roadmaps WHERE id=$1`, [rmA])
check('RM 로드맵 삭제 시 항목 CASCADE', (await db.query(`SELECT id FROM roadmap_items WHERE roadmap_id=$1`, [rmA])).rows.length === 0)

function report() {
  console.log('\n════ khunnect DB 테스트 (실제 Postgres/PGlite) ════\n')
  for (const l of log) console.log(l)
  console.log(`\n총 ${PASS + FAIL} · 통과 ${PASS} · 실패 ${FAIL}`)
  console.log(FAIL === 0 ? '🎉 스키마·RLS·제약 전부 정상' : '⚠️ 실패 존재')
}
report()
process.exit(FAIL === 0 ? 0 : 1)
