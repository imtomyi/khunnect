/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/mock/domains/seniors.ts                                         ║
║  역할: 선배 멘토 프로필 mock 데이터                                          ║
║                                                                              ║
║  포함 데이터:                                                                ║
║    MOCK_SENIORS - 3명의 선배 프로필 (강대균, 김성백, 신현섭)                ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types: Senior 타입                                                    ║
║                                                                              ║
║  사용처:                                                                     ║
║    - 선배 목록 페이지: 카드 렌더링, 필터링                                   ║
║    - 메시지 페이지: seniorMap 구성 (ID → Senior 룩업)                        ║
║    - 채팅 헤더: 선택된 선배 정보 표시                                        ║
║                                                                              ║
║  Supabase 연동 시:                                                           ║
║    services/seniors.ts의 getSeniors() 함수로 교체                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// 선배 프로필 타입 임포트
import type { Senior } from "@/types";

/**
 * MOCK_SENIORS
 *
 * 3명의 선배 프로필 목록.
 * 모두 산업디자인학과(dept-5) 소속으로 설정되어 있으며,
 * MOCK_USER의 departmentId와 일치하여 필터링 시 기본 노출됨.
 *
 * 주의: bio와 tips가 실제 직무(jobTitle)와 일치하지 않는 경우가 있음
 * (예: 강대균 선배의 jobTitle은 "UX 디자인 석사"이지만 bio는 백엔드 개발자 내용)
 * → 목 데이터이므로 추후 실제 데이터 입력 시 수정 필요
 */
export const MOCK_SENIORS: Senior[] = [
  {
    id: "senior-1",
    name: "강대균",
    departmentId: "dept-5",           // 산업디자인학과 (필터링용 기준 학과)
    department: "산업디자인학과",      // 카드에 표시할 학과명 텍스트
    graduationYear: 2023,
    company: "카카오",
    jobTitle: "UX 디자인 석사",
    skills: ["UX리서치", "인지 심리학", "학술 논문 작성"],
    profileImage: "/profile-kang.svg", // public/ 폴더의 SVG 파일 참조
    bio: "저는 대학교 3학년 때부터 백엔드 개발에 관심을 가지고 관련 과목들을 집중적으로 수강했습니다. 특히 데이터베이스와 네트워크 과목이 실무에 많은 도움이 되었습니다.",
    tips: "포트폴리오는 완성도보다 설명 능력이 중요해요. 왜 이 기술을 썼는지 말할 수 있어야 해요.",
    // 재학 시절 학기별 수강 과목 — UX/UI 커리어 로드맵(산업디자인학과) 기준
    // semester 형식: "학년-학기" (예: "1-1" = 1학년 1학기)
    timetable: [
      {
        semester: "1-1",
        courses: [
          { id: "ux-1-1-1", name: "디자인 기초 1", credits: 3, type: "전공기초", semester: "1-1", grade: "A+" },
          { id: "ux-1-1-2", name: "조형 연출",     credits: 3, type: "전공필수", semester: "1-1", grade: "A0" },
        ],
      },
      {
        semester: "1-2",
        courses: [
          { id: "ux-1-2-1", name: "디자인 기초 2", credits: 3, type: "전공기초", semester: "1-2", grade: "A0" },
          { id: "ux-1-2-2", name: "조형 연출 2",   credits: 3, type: "전공필수", semester: "1-2", grade: "B+" },
        ],
      },
      {
        semester: "2-1",
        courses: [
          { id: "ux-2-1-1", name: "인터랙션 디자인 1", credits: 3, type: "전공선택", semester: "2-1", grade: "A+" },
          { id: "ux-2-1-2", name: "사용자 리서치",     credits: 3, type: "전공선택", semester: "2-1", grade: "A0" },
          { id: "ux-2-1-3", name: "프로토타이핑",      credits: 3, type: "전공선택", semester: "2-1", grade: "A+" },
        ],
      },
      {
        semester: "2-2",
        courses: [
          { id: "ux-2-2-1", name: "인터랙션 디자인 2",  credits: 3, type: "전공선택", semester: "2-2", grade: "A0" },
          { id: "ux-2-2-2", name: "디지털 브랜딩",      credits: 3, type: "전공필수", semester: "2-2", grade: "A+" },
          { id: "ux-2-2-3", name: "사용자 경험 디자인", credits: 3, type: "전공선택", semester: "2-2", grade: "B+" },
          { id: "ux-2-2-4", name: "제품 관리",          credits: 3, type: "전공선택", semester: "2-2", grade: "A0" },
        ],
      },
      {
        semester: "3-1",
        courses: [
          { id: "ux-3-1-1", name: "사용자 경험 전략", credits: 3, type: "전공선택", semester: "3-1", grade: "A+" },
          { id: "ux-3-1-2", name: "정보 아키텍처",    credits: 3, type: "전공선택", semester: "3-1", grade: "A0" },
          { id: "ux-3-1-3", name: "디자인 시스템",    credits: 3, type: "전공선택", semester: "3-1", grade: "A+" },
        ],
      },
      {
        semester: "3-2",
        courses: [
          { id: "ux-3-2-1", name: "데이터 시각화",      credits: 3, type: "전공선택", semester: "3-2", grade: "A0" },
          { id: "ux-3-2-2", name: "인공지능",           credits: 3, type: "전공선택", semester: "3-2", grade: "B+" },
          { id: "ux-3-2-3", name: "사용자 경험",        credits: 3, type: "전공선택", semester: "3-2", grade: "A+" },
          { id: "ux-3-2-4", name: "모바일 애플리케이션", credits: 3, type: "전공선택", semester: "3-2", grade: "A0" },
        ],
      },
      {
        semester: "4-1",
        courses: [
          { id: "ux-4-1-1", name: "졸업 프로젝트 1", credits: 3, type: "전공기초", semester: "4-1", grade: "A+" },
        ],
      },
      {
        semester: "4-2",
        courses: [
          { id: "ux-4-2-1", name: "졸업 프로젝트 2", credits: 3, type: "전공기초", semester: "4-2", grade: "A+" },
          { id: "ux-4-2-2", name: "포트폴리오 완성", credits: 3, type: "전공필수", semester: "4-2", grade: "A+" },
        ],
      },
    ],
    isAvailable: true, // 현재 멘토링 가능
    // 예정된 세션 (홈 화면 또는 선배 프로필 상단에 표시)
    scheduledSession: { datetime: "2026-04-05 10:00", title: "내일 - 4월 5일", description: "오전 10:00 대균 선배와 함께 하는 포폴 리뷰, 1층 예디대 건물" },
  },
  {
    id: "senior-2",
    name: "김성백",
    departmentId: "dept-5",
    // 복수 전공 표기 (카드에 두 학과 모두 표시)
    department: "산업디자인학과, 경제학과",
    graduationYear: 2022,
    company: "삼성전자",
    jobTitle: "제품 디자이너",
    skills: ["금융 모델링", "공공 정책", "학위 논문 설계"],
    profileImage: null, // 이미지 없음 → 아이콘 아바타 사용
    bio: "AI로 세상을 바꾸고 싶은 엔지니어입니다.",
    tips: "수학 기초가 정말 중요합니다. 선형대수, 확률통계는 확실히 잡고 가세요.",
    timetable: [
      { semester: "1-1", courses: [{ id: "c-6", name: "드로잉",           credits: 3, type: "전공기초", semester: "1-1", grade: "A+" }] },
      { semester: "1-2", courses: [{ id: "c-7", name: "평면디자인",        credits: 3, type: "전공기초", semester: "1-2", grade: "A0" }] },
      { semester: "2-1", courses: [{ id: "c-8", name: "디자인 프로토타입", credits: 3, type: "전공필수", semester: "2-1", grade: "A+" }] },
      { semester: "2-2", courses: [{ id: "c-9", name: "조형디자인 1",      credits: 3, type: "전공필수", semester: "2-2", grade: "A0" }] },
      { semester: "3-1", courses: [
        { id: "c-9-1", name: "제품 디자인 1",   credits: 3, type: "전공선택", semester: "3-1", grade: "A+" },
        { id: "c-9-2", name: "인터페이스 설계", credits: 3, type: "전공선택", semester: "3-1", grade: "A0" },
      ]},
      { semester: "3-2", courses: [
        { id: "c-9-3", name: "제품 디자인 2",   credits: 3, type: "전공선택", semester: "3-2", grade: "A0" },
        { id: "c-9-4", name: "디자인 리서치",   credits: 3, type: "전공선택", semester: "3-2", grade: "A+" },
      ]},
      { semester: "4-1", courses: [
        { id: "c-9-5", name: "캡스톤 디자인 1", credits: 3, type: "전공필수", semester: "4-1", grade: "A+" },
        { id: "c-9-6", name: "사용자 중심 설계", credits: 3, type: "전공선택", semester: "4-1", grade: "A0" },
      ]},
      { semester: "4-2", courses: [
        { id: "c-9-7", name: "캡스톤 디자인 2", credits: 3, type: "전공필수", semester: "4-2", grade: "A+" },
        { id: "c-9-8", name: "졸업 포트폴리오", credits: 3, type: "전공필수", semester: "4-2", grade: "A+" },
      ]},
    ],
    isAvailable: false, // 현재 멘토링 불가 (오프라인 상태)
  },
  {
    id: "senior-3",
    name: "신현섭",
    departmentId: "dept-5",
    department: "산업디자인학과",
    graduationYear: 2024,
    company: "LG전자",
    jobTitle: "브랜드 디자이너",
    skills: ["시각적 정체성", "타이포그래피", "포트폴리오 리뷰"],
    profileImage: null,
    bio: "안정적인 시스템을 좋아하는 서버 개발자입니다.",
    tips: "데이터베이스 설계를 깊게 공부해두면 어디서든 인정받아요.",
    timetable: [
      { semester: "1-1", courses: [{ id: "c-10", name: "디지털디자인",  credits: 3, type: "전공기초", semester: "1-1", grade: "A0" }] },
      { semester: "1-2", courses: [{ id: "c-11", name: "현대미술사",    credits: 3, type: "전공기초", semester: "1-2", grade: "A+" }] },
      { semester: "2-1", courses: [{ id: "c-12", name: "UX 디자인",     credits: 3, type: "전공필수", semester: "2-1", grade: "A+" }] },
      { semester: "2-2", courses: [{ id: "c-13", name: "디자인 비즈니스", credits: 3, type: "전공필수", semester: "2-2", grade: "A0" }] },
      { semester: "3-1", courses: [
        { id: "c-13-1", name: "브랜드 아이덴티티", credits: 3, type: "전공선택", semester: "3-1", grade: "A+" },
        { id: "c-13-2", name: "타이포그래피",      credits: 3, type: "전공선택", semester: "3-1", grade: "A0" },
      ]},
      { semester: "3-2", courses: [
        { id: "c-13-3", name: "광고 디자인",       credits: 3, type: "전공선택", semester: "3-2", grade: "A+" },
        { id: "c-13-4", name: "패키지 디자인",     credits: 3, type: "전공선택", semester: "3-2", grade: "A0" },
      ]},
      { semester: "4-1", courses: [
        { id: "c-13-5", name: "브랜드 전략",       credits: 3, type: "전공필수", semester: "4-1", grade: "A0" },
        { id: "c-13-6", name: "디자인 경영",       credits: 3, type: "전공선택", semester: "4-1", grade: "A+" },
      ]},
      { semester: "4-2", courses: [
        { id: "c-13-7", name: "졸업 작품 1",       credits: 3, type: "전공필수", semester: "4-2", grade: "A+" },
        { id: "c-13-8", name: "졸업 작품 2",       credits: 3, type: "전공필수", semester: "4-2", grade: "A+" },
      ]},
    ],
    isAvailable: true, // 현재 멘토링 가능
  },
];
