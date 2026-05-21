/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/mock/domains/user.ts                                            ║
║  역할: 현재 로그인 유저 / 연결 요청 / 메시지 mock 데이터                   ║
║                                                                              ║
║  포함 데이터:                                                                ║
║    MOCK_USER        - 현재 로그인한 학생(이연수) 프로필 및 수강 과목        ║
║    MOCK_CONNECTIONS - 유저가 선배에게 보낸 연결 요청 (수락된 것들)          ║
║    MOCK_MESSAGES    - 각 연결 대화의 메시지 내역                            ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types: User, ConnectionRequest, Message 타입                          ║
║                                                                              ║
║  Supabase 연동 시:                                                           ║
║    services/user.ts 또는 인증 세션에서 실제 데이터로 교체                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// 타입 임포트: 유저, 연결 요청, 메시지 타입
import type { User, ConnectionRequest, Message } from "@/types";

/**
 * MOCK_USER
 *
 * 현재 로그인한 학생 프로필 (산업디자인학과 이연수).
 * 앱 전체에서 "내 정보"로 사용되며, 커리큘럼 계산기의 기준 데이터.
 *
 * id "user-1"은 CURRENT_USER_ID 상수와 반드시 일치해야 함.
 */
export const MOCK_USER: User = {
  id: "user-1",
  name: "이연수",
  email: "yeonsu@khu.ac.kr",
  department: "dept-5", // 산업디자인학과
  student_id: 2022110182,
  created_at: "2025.04.01",
  is_graduated: false,
  grade: 3,
  interestedFields: ["field-5", "field-6"],
  profileImage: null,
  courses: [
    { id: "u-c-1", name: "자료구조",       credits: 3, type: "전공필수", semester: "2023-1", grade: "A+" },
    { id: "u-c-2", name: "알고리즘",       credits: 3, type: "전공필수", semester: "2023-2", grade: "A0" },
    { id: "u-c-3", name: "웹프로그래밍",   credits: 3, type: "전공선택", semester: "2023-1", grade: "B+" },
    { id: "u-c-4", name: "선형대수학",     credits: 3, type: "전공기초", semester: "2022-2", grade: "A0" },
    { id: "u-c-5", name: "영어회화",       credits: 2, type: "교양",     semester: "2022-1", grade: "A+" },
    { id: "u-c-6", name: "공학수학",       credits: 3, type: "전공기초", semester: "2022-1", grade: "B0" },
    // grade: null = 현재 수강 중 (이수 완료 전)
    { id: "u-c-7", name: "소프트웨어공학", credits: 3, type: "전공필수", semester: "2024-1", grade: null },
    { id: "u-c-8", name: "캡스톤디자인",   credits: 3, type: "전공선택", semester: "2024-1", grade: null },
  ],
  scrapedSeniorIds: ["senior-1", "senior-2"], // 스크랩(찜)한 선배 목록
  scrapedCourseIds: ["c-1", "c-5"],           // 스크랩한 과목 목록
};

/**
 * MOCK_CONNECTIONS
 *
 * 현재 유저(user-1)가 선배들에게 보낸 연결 요청 목록.
 * status "accepted"인 것들만 메시지 페이지에 대화 목록으로 표시됨.
 *
 * 주의: conn-1은 포함되지 않음 (rejected 또는 pending 상태로 가정)
 */
export const MOCK_CONNECTIONS: ConnectionRequest[] = [
  {
    id: "conn-2",
    fromUserId: "user-1",
    toSeniorId: "senior-2",   // 김성백 선배 (seniors.ts 참조)
    type: "멘토링",
    message: "AI/ML 분야로 취업을 준비 중인데 조언 부탁드립니다.",
    status: "accepted",       // 수락 완료 → 메시지 교환 가능
    createdAt: "2024-03-15T14:00:00Z",
  },
  {
    id: "conn-3",
    fromUserId: "user-1",
    toSeniorId: "senior-3",   // 신현섭 선배 (seniors.ts 참조)
    type: "커피챗",
    message: "디자인 커리어에 대해 여쭤보고 싶습니다!",
    status: "accepted",       // 수락 완료 → 메시지 교환 가능
    createdAt: "2024-03-20T10:00:00Z",
  },
];

/**
 * MOCK_MESSAGES
 *
 * 각 연결(connectionId)별 채팅 메시지 내역.
 * 메시지 페이지에서 선택한 대화의 connectionId를 기준으로 필터링하여 표시.
 *
 * senderId가 "user-1"이면 우측(내 메시지), 선배 ID이면 좌측(상대 메시지)으로 렌더링.
 */
export const MOCK_MESSAGES: Message[] = [
  // ── conn-2 (김성백 선배와의 멘토링 대화) ────────────────────────────────
  {
    id: "msg-1",
    connectionId: "conn-2",
    senderId: "user-1",       // 내가 보낸 첫 메시지
    content: "안녕하세요! 멘토링 요청드립니다.",
    createdAt: "2024-03-15T14:30:00Z",
  },
  {
    id: "msg-2",
    connectionId: "conn-2",
    senderId: "senior-2",     // 선배의 응답 (마지막 메시지 → 사이드바 미리보기에 표시)
    content: "다음 주 화요일 예디대 1층 어떠신가요?",
    createdAt: "2024-03-15T15:00:00Z",
  },

  // ── conn-3 (신현섭 선배와의 커피챗 대화) ────────────────────────────────
  {
    id: "msg-3",
    connectionId: "conn-3",
    senderId: "user-1",       // 내가 보낸 첫 메시지
    content: "안녕하세요! 커피챗 요청드립니다.",
    createdAt: "2024-03-20T10:30:00Z",
  },
  {
    id: "msg-4",
    connectionId: "conn-3",
    senderId: "user-1",       // 내가 연속으로 보낸 메시지 (마지막 발신자 = 내가 → 사이드바에 "회원님:" 접두사)
    content: "감사합니다!",
    createdAt: "2024-03-20T11:00:00Z",
  },
];
