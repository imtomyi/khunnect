# 피그마 감사 노트 (high_fi_wireframe)

> 피그마 REST API로 추출한 정밀 스펙·액션 명세·감사 결과.
> 참고 기준: `세모톤 UI` 파일(key `hnDACdMCwbyhhAr3Aa4DW7`)의 **high_fi_wireframe** 프레임(node `22:3580`).
> 최종 갱신: 2026-07-25

## 화면 node ID (다음 감사 시 바로 fetch)

| 화면 | node | 라이브 |
|---|---|---|
| main (홈) | `190:10397` | /home |
| main_zero_state | `220:12542` | /home (데이터 없음) |
| main_onboarding | `368:13757` | ❌ 미구현 |
| mentor_01 (선배 탐색) | `309:14372` (색감 확정본) | /explore |
| mentor_profile (선배 상세) | `53:3793` | /seniors/:id |
| mentor_chat_01/02 (채팅) | `109:7833` 등 | 채팅 모달 |
| curriculum_calculator_01~03 | `132:6795` `136:10020` `136:10251` | /curriculum |
| curriculum_calculator_results_05/06 | `181:9872` `181:9735` | /curriculum 결과 |
| roadmap_01/02 | `110:5850` `114:6492` | /roadmap |
| mypage | `230:14584` | /my |
| mypage_calendar_01~04 | `237:15329`~`237:16402` | ❌ 미구현 (캘린더) |
| mypage_profile_personalisation | `266:12221` | ❌ 미구현 |
| signup_01 | `40:3920` | /register |
| login_output | `126:7616` | /login |

API 호출 예:
`GET api.figma.com/v1/files/hnDACdMCwbyhhAr3Aa4DW7/nodes?ids=309:14372&depth=6`
(헤더 `X-Figma-Token`, 토큰은 ~/.claude.json mcpServers.figma.env.FIGMA_API_KEY)

## 디자인 토큰 (mentor_01에서 추출)

**색상 팔레트**
`#9A001F`(브랜드) `#3A3A3A`(제목) `#5C3F3F`(서브텍스트) `#1F1A1A`(본문)
`#64748B`(비활성) `#2E6793`(파랑 액션) `#C8E2FF`(분야칩) `#F6F6F6` `#FDF2F8` `#FFFFFF`

**타이포 (선배 탐색 기준)**
- 히어로 제목: 50px / w600 / #3A3A3A
- 히어로 부제: 19px / w400 / #5C3F3F
- 학과 섹션 헤딩: 50px / #000000  ← 피그마는 학과별 섹션으로 구분
- 분야 드롭다운("모든 분야"): 16px / #C8E2FF 칩

## 팀 액션 명세 (주석) + 구현 상태

> 프로토타입 링크는 없고, 인터랙션 의도가 팀 주석에 적혀 있음.

| # | 액션 명세 (원문) | 상태 |
|---|---|---|
| A1 | 선배에게 질문하기 누르면 → 그 분야 선배 프로필 → 메세지함으로 이어지게 | ✅ 커피챗 신청→상세→수락 후 채팅 (대체로 반영) |
| A2 | '계산하기' 누르면 로딩 아이콘/'잠시만 기다려주세요' 표시 | ✅ 로딩('계산 중…')+졸업사정 결과 모달 |
| A3 | 커리큘럼 스크롤 시 상단 졸업요건 영역 고정, 하단 리스트만 스크롤 | ❌ 현재 좌(카테고리)/우(과목) 레이아웃이라 다름 |
| A4 | 리스트 5개까지 보이고 넘으면 스크롤 | 🚧 overflow는 있으나 '정확히 5개 높이' 아님 |
| A5 | 메인화면 디폴트 = 계산/입력 전 zero state | ✅ 구현됨 |
| A6 | 로그인 후 계산 전 zero state 화면 | ✅ 구현됨 |
| A7 | 마이페이지: 프로필 수정 + 즐겨찾기 | ✅ 프로필 수정 모달 + 스크랩북 |
| A8 | 대화창 스크롤 해결 | 🚧 채팅 모달 스크롤 확인 필요 |

**미구현 화면 (피그마엔 있음)**
- main_onboarding (온보딩) · mypage_calendar (캘린더) · mypage_profile_personalisation (프로필 개인화)
- → SPEC의 D1(캘린더)·D7(프로필) + ROADMAP Phase B5

## 감사로 수정한 것

- 선배 탐색 히어로 타이포 정렬: 36px/w700/#1F1A1A → **50px/w600/#3A3A3A** (부제 15→19px)
- (이전) 네비 드롭다운 복원, 홈 추천선배 카드, 선배상세 북마크, dead 버튼 액션

## 다음 감사 대상 (정밀)

- mentor_01 카드 레이아웃(학과 섹션 구조), 분야 드롭다운(트랙 필터 D3)
- curriculum_results 화면(sticky 졸업요건 A3)
- A2 계산 로딩 피드백
