// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  서비스: 연결 요청 / 메시지 (connections)                                     ║
// ║  현재 모드 : MOCK (일부 함수는 Supabase 연동 시도 후 mock fallback)            ║
// ║  연동 대상 : Supabase — connections, messages 테이블                          ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║                                                                              ║
// ║  ★ 실시간 채팅 완전 연동을 위한 전체 설정 체크리스트 ★                         ║
// ║                                                                              ║
// ║  [ STEP 1 ] 환경변수 설정 (.env.local)                                       ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║    NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트ID>.supabase.co                 ║
// ║    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon 공개 키>                              ║
// ║    NEXT_PUBLIC_API_BASE_URL=https://<백엔드 서버 주소>                        ║
// ║                                                                              ║
// ║    → Supabase 대시보드: Project Settings > API 에서 확인                     ║
// ║    → 프론트엔드 개발 중에는 http://127.0.0.1:8000 이 기본값                   ║
// ║                                                                              ║
// ║  [ STEP 2 ] Supabase 테이블 생성 (SQL Editor에서 실행)                       ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║                                                                              ║
// ║    -- 연결 요청 테이블                                                        ║
// ║    CREATE TABLE connections (                                                ║
// ║      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),               ║
// ║      from_user_id  UUID NOT NULL REFERENCES auth.users(id),                  ║
// ║      to_senior_id  UUID NOT NULL REFERENCES seniors(id),                     ║
// ║      type          TEXT NOT NULL CHECK (type IN ('커피챗','멘토링')),          ║
// ║      message       TEXT NOT NULL,                                            ║
// ║      status        TEXT NOT NULL DEFAULT 'pending'                           ║
// ║                      CHECK (status IN ('pending','accepted','rejected')),    ║
// ║      meeting_link  TEXT,                                                     ║
// ║      created_at    TIMESTAMPTZ DEFAULT now()                                 ║
// ║    );                                                                        ║
// ║                                                                              ║
// ║    -- 메시지 테이블                                                           ║
// ║    CREATE TABLE messages (                                                   ║
// ║      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),              ║
// ║      connection_id  UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,║
// ║      sender_id      UUID NOT NULL REFERENCES auth.users(id),                 ║
// ║      content        TEXT NOT NULL,                                           ║
// ║      created_at     TIMESTAMPTZ DEFAULT now()                                ║
// ║    );                                                                        ║
// ║                                                                              ║
// ║  [ STEP 3 ] Row Level Security (RLS) 설정                                   ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║  ★ 이 설정을 빠뜨리면 Realtime 이벤트가 아예 수신되지 않는다.                  ║
// ║                                                                              ║
// ║    -- messages 테이블 RLS 활성화                                              ║
// ║    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;                           ║
// ║                                                                              ║
// ║    -- 자신이 속한 연결(connection)의 메시지만 SELECT 가능                       ║
// ║    CREATE POLICY "messages_select"                                           ║
// ║    ON messages FOR SELECT                                                    ║
// ║    USING (                                                                   ║
// ║      connection_id IN (                                                      ║
// ║        SELECT id FROM connections                                            ║
// ║        WHERE from_user_id = auth.uid()                                       ║
// ║           OR to_senior_id IN (                                               ║
// ║                SELECT id FROM seniors WHERE user_id = auth.uid()             ║
// ║              )                                                               ║
// ║      )                                                                       ║
// ║    );                                                                        ║
// ║                                                                              ║
// ║    -- 자신이 sender인 메시지만 INSERT 가능                                     ║
// ║    CREATE POLICY "messages_insert"                                           ║
// ║    ON messages FOR INSERT                                                    ║
// ║    WITH CHECK (sender_id = auth.uid());                                      ║
// ║                                                                              ║
// ║    -- connections 테이블도 동일하게 RLS 설정                                   ║
// ║    ALTER TABLE connections ENABLE ROW LEVEL SECURITY;                        ║
// ║    CREATE POLICY "connections_select"                                        ║
// ║    ON connections FOR SELECT                                                 ║
// ║    USING (from_user_id = auth.uid());                                        ║
// ║                                                                              ║
// ║  [ STEP 4 ] Supabase Realtime 활성화                                        ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║  ★ 이 설정 없이는 subscribeToMessages()가 이벤트를 받지 못한다.               ║
// ║                                                                              ║
// ║    방법 A — 대시보드에서 설정 (권장):                                          ║
// ║      1) Supabase 대시보드 → Database → Replication                          ║
// ║      2) "Realtime" 섹션에서 messages 테이블 토글 ON                           ║
// ║      3) (또는) Table Editor → messages 테이블 → Realtime 탭 → Enable          ║
// ║                                                                              ║
// ║    방법 B — SQL로 설정:                                                       ║
// ║      -- 메시지 테이블을 Realtime publication에 추가                            ║
// ║      ALTER PUBLICATION supabase_realtime ADD TABLE messages;                 ║
// ║                                                                              ║
// ║    확인 방법:                                                                 ║
// ║      SELECT * FROM pg_publication_tables                                     ║
// ║      WHERE pubname = 'supabase_realtime';                                    ║
// ║      -- 결과에 messages 행이 있어야 함                                         ║
// ║                                                                              ║
// ║  [ STEP 5 ] Supabase Auth 연동 (JWT 토큰 발급)                               ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║  ★ 로그인 후 발급된 JWT가 없으면 RLS 정책이 모두 차단된다.                      ║
// ║                                                                              ║
// ║    - src/services/auth.ts의 signIn()이 성공하면                               ║
// ║      Supabase가 자동으로 session을 관리한다.                                   ║
// ║    - supabase 클라이언트(src/lib/supabase.ts)가 내부적으로                    ║
// ║      세션 토큰을 Realtime 연결 시 Authorization 헤더에 포함시킨다.              ║
// ║    - 수동으로 토큰을 주입할 필요 없음 (createClient가 자동 처리)                ║
// ║                                                                              ║
// ║    ※ 현재 MOCK 모드에서는 CURRENT_USER_ID가 고정값이므로                       ║
// ║       실제 auth.uid()와 일치하지 않는다.                                       ║
// ║       연동 시 CURRENT_USER_ID를 supabase.auth.getUser()로 교체해야 한다.       ║
// ║       → src/app/(main)/messages/_lib/constants.ts 참고                       ║
// ║                                                                              ║
// ║  [ STEP 6 ] 백엔드 REST API 연동 (sendMessage)                               ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║                                                                              ║
// ║    현재 sendMessage()는 아래 엔드포인트를 호출한다:                            ║
// ║      POST {NEXT_PUBLIC_API_BASE_URL}/messages/{connection_id}                ║
// ║      Headers: Authorization: Bearer <access_token>                           ║
// ║      Body:    { "content": "메시지 내용" }                                    ║
// ║      Response: { "data": { id, connection_id, sender_id, content,           ║
// ║                            created_at } }                                    ║
// ║                                                                              ║
// ║    백엔드(FastAPI 등)에서 이 엔드포인트 구현 필요:                              ║
// ║      1) JWT 검증 → sender_id 추출                                            ║
// ║      2) Supabase에 메시지 INSERT                                              ║
// ║      3) 응답으로 { data: Message } 반환                                       ║
// ║                                                                              ║
// ║    또는 Supabase만으로 구현 시:                                               ║
// ║      sendMessage()의 try 블록을 아래로 교체:                                  ║
// ║        const { data, error } = await supabase                                ║
// ║          .from("messages")                                                   ║
// ║          .insert({ connection_id: msg.connectionId,                         ║
// ║                    sender_id: msg.senderId,                                  ║
// ║                    content: msg.content })                                   ║
// ║          .select().single();                                                 ║
// ║        if (error) throw error;                                               ║
// ║        return toMessage(data);                                               ║
// ║                                                                              ║
// ║  [ STEP 7 ] CURRENT_USER_ID 동적으로 교체                                    ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║                                                                              ║
// ║    현재: src/app/(main)/messages/_lib/constants.ts에 하드코딩된 UUID          ║
// ║    교체: 아래처럼 동적으로 가져오기                                            ║
// ║                                                                              ║
// ║      // messages/page.tsx 상단에서:                                          ║
// ║      const [currentUserId, setCurrentUserId] = useState<string>("");         ║
// ║      useEffect(() => {                                                       ║
// ║        supabase.auth.getUser().then(({ data }) => {                          ║
// ║          if (data.user) setCurrentUserId(data.user.id);                      ║
// ║        });                                                                   ║
// ║      }, []);                                                                 ║
// ║                                                                              ║
// ║  [ STEP 8 ] Mock 코드 제거                                                   ║
// ║  ─────────────────────────────────────────────────────────────────────────  ║
// ║                                                                              ║
// ║    연동 완료 후 아래 항목 정리:                                               ║
// ║      1) getConnections()  → MOCK 블록 삭제, SUPABASE 블록 주석 해제           ║
// ║      2) sendConnectionRequest() → 동일                                       ║
// ║      3) getMessages()     → try/catch 내 fallback 삭제                       ║
// ║      4) sendMessage()     → try/catch 내 fallback 삭제                       ║
// ║      5) src/mock/domains/user.ts 의 MOCK_CONNECTIONS, MOCK_MESSAGES 삭제     ║
// ║      6) sessionConnections 임시 배열 삭제                                    ║
// ║                                                                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import type { ConnectionRequest, Message } from "@/types";
import { MOCK_CONNECTIONS, MOCK_MESSAGES } from "@/mock"; // 연동 완료 후 삭제 예정 (STEP 8)
import { supabase } from "@/lib/supabase";               // Supabase 클라이언트 (src/lib/supabase.ts)
import { apiRequest } from "@/lib/api";                  // 인증 헤더 포함 REST API 래퍼 (src/lib/api.ts)

// ── 타입 변환 헬퍼 ────────────────────────────────────────────────────────────

/**
 * toMessage — Supabase DB row(snake_case)를 앱 내부 Message 타입(camelCase)으로 변환
 *
 * Supabase는 컬럼명을 snake_case로 반환하지만, 앱 내부 타입은 camelCase를 사용한다.
 * Realtime payload(payload.new)도 동일한 구조이므로 subscribeToMessages에서도 사용한다.
 *
 * @param row - Supabase에서 반환된 messages 테이블 행 (snake_case 키)
 * @returns Message 타입 객체 (camelCase 키)
 */
function toMessage(row: Record<string, string>): Message {
  return {
    id: row.id,
    connectionId: row.connection_id, // DB: connection_id → 앱: connectionId
    senderId: row.sender_id,         // DB: sender_id     → 앱: senderId
    content: row.content,
    createdAt: row.created_at,       // DB: created_at    → 앱: createdAt
  };
}

// ── 세션 임시 저장 ────────────────────────────────────────────────────────────

/**
 * sessionConnections — 세션 내에서 새로 생성된 연결을 메모리에 임시 보관
 *
 * MOCK 모드에서 sendConnectionRequest()로 만들어진 연결이
 * 페이지 새로고침 전까지 getConnections()에 나타나도록 하기 위한 임시 배열이다.
 * Supabase 연동 후 삭제 예정 (STEP 8).
 */
const sessionConnections: ConnectionRequest[] = [];

// ── getConnections ────────────────────────────────────────────────────────────

/**
 * getConnections — 유저의 연결 요청 목록 조회
 *
 * [현재] MOCK 모드: MOCK_CONNECTIONS + sessionConnections 반환
 * [연동] SUPABASE 블록 주석 해제 후 MOCK 블록 삭제
 *
 * DB 쿼리: SELECT * FROM connections WHERE from_user_id = {userId}
 *
 * ★ 연동 시 추가 설정 필요:
 *   - connections 테이블에 RLS 정책 설정 (STEP 3 참고)
 *   - from_user_id가 로그인한 유저의 auth.uid()와 일치해야 조회됨
 *
 * @param userId - 조회할 유저 ID (현재는 CURRENT_USER_ID 상수, 연동 후 auth.uid()로 교체)
 */
export async function getConnections(userId: string): Promise<ConnectionRequest[]> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━━━━━━━━━━━━━━━━━
  // const { data, error } = await supabase
  //   .from("connections")
  //   .select("*")
  //   .eq("from_user_id", userId);     // RLS가 활성화되어 있어도 명시적 필터 권장
  // if (error) throw error;
  // return data ?? [];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  void userId;
  return [...MOCK_CONNECTIONS, ...sessionConnections];
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ── sendConnectionRequest ─────────────────────────────────────────────────────

/**
 * sendConnectionRequest — 선배에게 연결 요청(커피챗/멘토링) 전송
 *
 * [현재] MOCK 모드: 메모리 배열(sessionConnections)에 추가 후 반환
 * [연동] SUPABASE 블록 주석 해제 후 MOCK 블록 삭제
 *
 * DB 쿼리: INSERT INTO connections (...) VALUES (...) RETURNING *
 *
 * ★ 연동 시 추가 설정 필요:
 *   - connections 테이블 INSERT RLS 정책 필요
 *     (CREATE POLICY "connections_insert" ON connections FOR INSERT
 *      WITH CHECK (from_user_id = auth.uid()))
 *
 * @param req - id, status, createdAt을 제외한 연결 요청 데이터
 * @returns 생성된 ConnectionRequest (서버에서 할당된 id 포함)
 */
export async function sendConnectionRequest(
  req: Omit<ConnectionRequest, "id" | "status" | "createdAt">
): Promise<ConnectionRequest> {

  // ━━━ SUPABASE (연동 시 이 블록 주석 해제, MOCK 블록 삭제) ━━━━━━━━━━━━━━━━━━━
  // const { data, error } = await supabase
  //   .from("connections")
  //   .insert({ ...req, status: "pending" })
  //   .select()
  //   .single();
  // if (error) throw error;
  // return data;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━ MOCK (현재 사용 중) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const newConn: ConnectionRequest = {
    ...req,
    id: `conn-${Date.now()}`,            // 실제 DB에서는 gen_random_uuid()가 생성
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  sessionConnections.push(newConn);      // 페이지 새로고침 전까지만 유지
  return newConn;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ── getMessages ───────────────────────────────────────────────────────────────

/**
 * getMessages — 특정 연결(connection)의 메시지 목록 조회
 *
 * [현재] Supabase 연결 시도 → 실패 시 MOCK fallback
 * [연동] try/catch의 catch 블록(mock fallback) 삭제
 *
 * DB 쿼리: SELECT * FROM messages
 *          WHERE connection_id = {connectionId}
 *          ORDER BY created_at ASC
 *
 * ★ 연동 시 확인 사항:
 *   1) messages 테이블 RLS SELECT 정책 설정 여부 (STEP 3)
 *      → 설정 안 되어 있으면 빈 배열([]) 반환 (에러 없이 조용히 실패)
 *   2) Supabase 프로젝트 URL / anon key가 .env.local에 있는지 (STEP 1)
 *   3) toMessage()로 snake_case → camelCase 변환이 일어남
 *
 * @param connectionId - 조회할 연결 ID (connections.id)
 * @returns 시간순 정렬된 Message 배열
 */
export async function getMessages(connectionId: string): Promise<Message[]> {

  // ━━━ SUPABASE (현재 활성화 — 실패 시 mock fallback) ━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("connection_id", connectionId) // 해당 연결의 메시지만 필터링
      .order("created_at", { ascending: true }); // 오래된 메시지부터 정렬
    if (error) throw error;
    // Supabase가 빈 배열 반환 시 mock fallback
    if (data && data.length > 0) return data.map(toMessage);
    const mock = MOCK_MESSAGES.filter((m) => m.connectionId === connectionId);
    if (mock.length > 0) return mock;
    return [];
  } catch {
    // ★ Supabase 미연결 또는 RLS 차단 시 mock 데이터로 폴백
    //    연동 완료 후 이 catch 블록 전체 삭제 (STEP 8)
    return MOCK_MESSAGES.filter((m) => m.connectionId === connectionId);
  }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ── sendMessage ───────────────────────────────────────────────────────────────

/**
 * sendMessage — 메시지 전송
 *
 * [현재] REST API 호출 시도 → 실패 시 MOCK fallback (id, createdAt 로컬 생성)
 * [연동] try/catch의 catch 블록 삭제
 *
 * 호출 엔드포인트:
 *   POST {NEXT_PUBLIC_API_BASE_URL}/messages/{connection_id}
 *   Headers: { Authorization: Bearer <access_token>, Content-Type: application/json }
 *   Body:    { "content": "메시지 내용" }
 *   응답:    { "data": { id, connection_id, sender_id, content, created_at } }
 *
 * ★ 연동 시 확인 사항:
 *   1) NEXT_PUBLIC_API_BASE_URL이 .env.local에 설정되어 있는지 (STEP 1)
 *   2) localStorage에 "access_token" 키로 JWT가 저장되어 있는지
 *      → src/services/auth.ts의 signIn() 참고
 *   3) 백엔드가 응답을 { data: Message } 형태로 반환하는지 (STEP 6 참고)
 *
 *   또는 백엔드 없이 Supabase 직접 사용 시:
 *      STEP 6의 Supabase 전용 코드로 교체
 *
 * @param msg - id, createdAt을 제외한 메시지 데이터
 * @returns 서버에서 생성된 Message (실제 id, createdAt 포함)
 */
export async function sendMessage(
  msg: Omit<Message, "id" | "createdAt">
): Promise<Message> {

  // ━━━ REST API (현재 활성화 — 실패 시 mock fallback) ━━━━━━━━━━━━━━━━━━━━━━━
  try {
    // apiRequest는 src/lib/api.ts에서 localStorage의 access_token을 Bearer 헤더로 붙임
    return await apiRequest<Message>(`/messages/${msg.connectionId}`, {
      method: "POST",
      body: JSON.stringify({ content: msg.content }),
    });
  } catch {
    // ★ API 서버 미연결 시 로컬에서 임시 id/createdAt 생성해 폴백
    //    연동 완료 후 이 catch 블록 전체 삭제 (STEP 8)
    return {
      ...msg,
      id: `msg-${Date.now()}`,          // 실제 DB에서는 gen_random_uuid()
      createdAt: new Date().toISOString(),
    };
  }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
}

// ── subscribeToMessages ───────────────────────────────────────────────────────

/**
 * subscribeToMessages — Supabase Realtime을 통한 새 메시지 실시간 구독
 *
 * messages 테이블에 INSERT 이벤트가 발생하면 onNewMessage 콜백을 호출한다.
 * connection_id 필터를 사용해 현재 열린 대화의 메시지만 수신한다.
 *
 * 반환값(cleanup 함수)은 React useEffect의 return에서 호출해야 한다.
 * → 대화 전환 또는 컴포넌트 언마운트 시 채널 구독이 해제된다.
 *
 * ★ 연동 시 반드시 확인해야 할 설정:
 *
 *   1) Realtime 활성화 여부 (STEP 4) ← 가장 자주 빠뜨리는 설정
 *      Supabase 대시보드 > Database > Replication > messages 테이블 토글 ON
 *      이 설정이 없으면 INSERT가 일어나도 이벤트가 전달되지 않는다.
 *
 *   2) RLS SELECT 정책 (STEP 3)
 *      Realtime은 내부적으로 SELECT를 통해 변경 데이터를 전달한다.
 *      RLS SELECT 정책이 없거나 잘못 설정되면 이벤트를 받을 수 없다.
 *
 *   3) Supabase 클라이언트 인증 상태 (STEP 5)
 *      supabase.auth.signIn() 또는 setSession()이 완료된 상태여야
 *      RLS가 auth.uid()를 올바르게 평가한다.
 *
 *   4) filter 문자열 형식
 *      filter: `connection_id=eq.${connectionId}`
 *      → Supabase Realtime filter 문법은 PostgREST와 동일:
 *        컬럼명=연산자.값 (eq, neq, lt, gt, in 등)
 *      → connection_id가 UUID 타입이면 그대로 문자열로 넣으면 됨
 *
 *   5) 채널 이름 충돌 방지
 *      채널 이름을 `messages:${connectionId}`로 지정해
 *      대화 전환 시 새 채널이 생성된다.
 *      같은 이름으로 중복 구독하면 이벤트가 2번씩 수신되므로
 *      반드시 cleanup 함수(supabase.removeChannel)를 호출해야 한다.
 *
 * ★ 디버깅 팁:
 *   - 이벤트가 수신되지 않을 때 확인 순서:
 *     ① Realtime 활성화 (STEP 4) → ② RLS 정책 (STEP 3) →
 *     ③ .env.local URL/key 오류 (STEP 1) → ④ 로그인 상태 (STEP 5)
 *   - Supabase 대시보드 > Realtime > Inspector 탭에서
 *     실시간 이벤트가 발생하는지 모니터링 가능
 *
 * @param connectionId - 구독할 연결 ID (이 연결의 INSERT 이벤트만 수신)
 * @param onNewMessage - 새 메시지 수신 시 호출될 콜백 (Message 타입으로 변환 후 전달)
 * @returns cleanup 함수 — useEffect return에서 호출해 채널 구독 해제
 */
export function subscribeToMessages(
  connectionId: string,
  onNewMessage: (msg: Message) => void
) {
  const channel = supabase
    // 채널 이름: "messages:{connectionId}" — 대화별로 고유한 채널
    .channel(`messages:${connectionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",              // INSERT 이벤트만 수신 (UPDATE, DELETE 제외)
        schema: "public",             // 기본 스키마 (변경하지 않았다면 "public")
        table: "messages",            // 구독할 테이블명
        // ★ 이 필터가 없으면 모든 connection의 메시지가 수신된다
        filter: `connection_id=eq.${connectionId}`,
      },
      (payload) => {
        // payload.new: 새로 INSERT된 행 (snake_case) → toMessage()로 camelCase 변환
        onNewMessage(toMessage(payload.new as Record<string, string>));
      }
    )
    .subscribe(); // 구독 시작 — 이 시점부터 이벤트 수신

  // cleanup 함수: useEffect return에서 호출
  // 대화 전환 시 이전 채널을 해제하지 않으면 중복 수신 발생
  return () => {
    supabase.removeChannel(channel);
  };
}
