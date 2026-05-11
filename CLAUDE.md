# Khunnect

경희대학교 학생들을 위한 커리큘럼 설계 플랫폼.
재학생과 졸업생이 자신의 커리큘럼/자기개발 경로를 공유하고, 후배들이 이를 참고해 방향을 잡을 수 있도록 돕는 선순환 플랫폼.

## 핵심 기능
- 커리큘럼 게시/탐색 (졸업생 선례 공유)
- 선배에게 커피챗 신청
- 실시간 채팅 (Phase 5)
- 대상: 경희대 국제캠퍼스 재학생 / 졸업생

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React + Vite + TypeScript |
| Routing | TanStack Router (파일 기반) |
| Data Fetching | TanStack Query |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| CSS | Tailwind CSS (예정) |
| Container | Docker |
| Orchestration | Kubernetes (OrbStack) |
| CI/CD | GitHub Actions |
| 개발 환경 | macOS + OrbStack |

---

## 프로젝트 구조

```
khunnect/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI 파이프라인
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # 공통 컴포넌트
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── lib/
│   │   │   └── supabase.ts  # Supabase 클라이언트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env                 # 환경변수 (git 제외)
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
└── k8s/
    └── frontend-deployment.yaml
```

---

## 페이지 구조

```
/                  랜딩 페이지
/login             로그인
/register          회원가입 (멀티스텝)
/explore           커리큘럼 탐색
/curriculum/:id    커리큘럼 상세
/profile/:id       유저 프로필
/my                내 프로필/커리큘럼 관리
```

---

## 환경 변수

`frontend/.env` 파일 (절대 git에 올리지 말 것):
```
VITE_SUPABASE_URL=https://zmlldljddwcjvbnumwfi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

---

## DB 스키마

### 학과 관련
```sql
colleges        -- 단과대학 (캠퍼스 포함)
departments     -- 학과 (has_tracks 여부)
tracks          -- 트랙 (학과별)
```

### 유저 관련
```sql
profiles        -- 유저 기본 정보 (role: student | alumni)
user_majors     -- 전공 정보 (type: major | double_major | minor)
                -- admission_year, graduation_year 포함
                -- 입학년도별 교육과정 차이 반영
```

### 커리큘럼 관련 (예정)
```sql
curricula            -- 커리큘럼 게시물
curriculum_items     -- 세부 항목
                     -- type: course | activity | work | certificate | project | education
course_catalog       -- 과목 카탈로그 (학과 + 입학년도별)
bookmarks            -- 북마크
```

### 소셜 관련 (예정)
```sql
coffee_chats    -- 커피챗 신청 (Phase 4)
messages        -- 채팅 (Phase 5)
```

### Seed 데이터 (완료)
- 소프트웨어융합대학 > 소프트웨어융합학과
- 트랙: 게임콘텐츠 / 데이터사이언스 / 로봇·비전 / 융합리더

---

## 개발 Phase

```
Phase 1 ✅  환경 세팅 + 프로젝트 스캐폴딩 + Docker + K8s 로컬 배포 + CI/CD
Phase 2 🔄  Supabase Auth + 유저 프로필 (재학생/졸업생) ← 현재 진행중
Phase 3     커리큘럼 CRUD + 탐색/필터/북마크
Phase 4     커피챗 신청 시스템
Phase 5     실시간 채팅 (Supabase Realtime / Socket)
Phase 6     프로덕션 배포 (Ingress, TLS, 모니터링)
```

---

## 자주 쓰는 명령어

### 개발 서버 실행
```bash
cd frontend && npm run dev
# http://localhost:5173
```

### Docker 빌드 & 실행
```bash
docker build -t khunnect-frontend:latest ./frontend
docker run -p 3000:80 khunnect-frontend:latest
# http://localhost:3000
```

### K8s 배포
```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl get pods
kubectl get services
# http://localhost:30080
```

### K8s 상태 확인
```bash
kubectl get nodes
kubectl get pods
kubectl get services
```

### Git
```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

---

## 컴포넌트화 원칙

UI/UX 개발 중 아래 경우에 해당하면 항상 컴포넌트 분리 여부를 확인할 것:
- 동일한 UI가 2곳 이상에서 반복될 때
- 하나의 페이지 컴포넌트가 너무 길어질 때 (200줄 이상 기준)
- 독립적으로 동작하는 UI 블록일 때 (폼, 카드, 모달 등)
- 재사용 가능성이 있는 버튼, 인풋, 배지 등 공통 요소일 때

컴포넌트 위치 기준:
```
components/common/     버튼, 인풋, 배지 등 어디서든 쓰는 것
components/layout/     헤더, 푸터, 사이드바 등 레이아웃
components/auth/       로그인/회원가입 전용
components/curriculum/ 커리큘럼 관련 전용
components/profile/    프로필 관련 전용
```

---

## 주요 참고 사항

- `.env` 파일은 절대 GitHub에 올리지 말 것
- `service_role` 키는 절대 공유 금지
- SQL 실행 시 Supabase SQL Editor에서 새 탭을 열어서 진행
- K8s 이미지는 `imagePullPolicy: Never` (로컬 이미지 사용)
- 이메일 인증은 개발 중 비활성화 (Authentication > Settings > Confirm email OFF)
- TanStack Router는 `tanstackRouter()` import 사용 (구버전 `TanStackRouterVite` deprecated)
