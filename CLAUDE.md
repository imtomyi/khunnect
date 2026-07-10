# Khunnect

경희대학교 국제캠퍼스 학생들을 위한 커리큘럼 설계 플랫폼.
재학생과 졸업생이 자신의 커리큘럼/자기개발 경로를 공유하고, 후배들이 이를 참고해 방향을 잡을 수 있도록 돕는 선순환 플랫폼.

## 핵심 기능
- 커리큘럼 과목 체크 & 졸업 요건 진행률 시각화
- 선배 탐색 & 상세 프로필 보기
- 선배에게 커피챗 신청 (Phase 4)
- 실시간 채팅 (Phase 5)
- 대상: 경희대 국제캠퍼스 재학생 / 졸업생

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 + Vite 8 + TypeScript |
| Routing | TanStack Router v1 (파일 기반, `src/routes/`) |
| Data Fetching | TanStack Query v5 (`useQuery`, `useMutation`) |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) |
| CSS | Tailwind CSS v4 + 인라인 스타일 (`style={}`) |
| Container | Docker Engine |
| Orchestration | Kubernetes (minikube) |
| CI/CD | GitHub Actions |
| 개발 환경 | Ubuntu (OrbStack Linux Machine) |

---

## 프로젝트 구조

```
khunnect/
├── .github/
│   └── workflows/
│       └── ci.yml
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/          # AuthLayout
│   │   │   ├── common/        # CTAButton
│   │   │   ├── curriculum/    # CategoryPanel, CourseGrid, Icons
│   │   │   ├── dashboard/     # DashboardNav, AcademicStatusCard, ...
│   │   │   ├── landing/       # HeroSection, FeaturesSection, ...
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── mypage/        # ProfileSection, ScrapbookSection
│   │   │   └── seniors/       # SeniorCard, SeniorsHero
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx        # AuthProvider + useAuth
│   │   │   └── useDepartments.ts  # useColleges, useDepartments, useTracks
│   │   ├── lib/
│   │   │   ├── avatarVariants.tsx # ID 기반 아바타 색상/아이콘 결정
│   │   │   ├── constants.ts       # BRAND 색상 등 상수
│   │   │   └── supabase.ts        # Supabase 클라이언트
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── HomePage.tsx       # 대시보드 (학점 진행률)
│   │   │   ├── CurriculumPage.tsx # 과목 체크
│   │   │   ├── ExplorePage.tsx    # 선배 탐색
│   │   │   ├── MyPage.tsx         # 마이페이지
│   │   │   ├── SeniorDetailPage.tsx
│   │   │   └── RoadmapPage (inline in roadmap.tsx)
│   │   ├── routes/                # TanStack Router 파일 기반 라우트
│   │   │   ├── __root.tsx         # 루트 레이아웃 (Suspense + Footer)
│   │   │   ├── index.tsx          # /
│   │   │   ├── login.tsx          # /login
│   │   │   ├── register.tsx       # /register
│   │   │   ├── home.tsx           # /home (인증 필요)
│   │   │   ├── curriculum.tsx     # /curriculum (인증 필요)
│   │   │   ├── explore.tsx        # /explore (인증 필요)
│   │   │   ├── my.tsx             # /my (인증 필요)
│   │   │   ├── roadmap.tsx        # /roadmap (인증 필요, Phase 3)
│   │   │   └── seniors.$seniorId.tsx
│   │   ├── types/
│   │   │   └── index.ts           # 공유 타입 (Senior, CatalogCourse, …)
│   │   ├── index.css
│   │   └── main.tsx
│   ├── public/
│   │   ├── main 1.png             # 랜딩 HeroSection 스크린샷 이미지
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── AvantGardeLT-Bold.otf  # 브랜드 폰트
│   ├── supabase/
│   │   └── schema.sql             # DB 스키마 + 시드 데이터 (SQL Editor에서 실행)
│   ├── .env                       # 환경변수 (git 제외)
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── k8s/
│   └── frontend-deployment.yaml
└── assignment.md                  # 리눅스 한달살기 보고서
```

---

## 페이지 구조

```
/                   랜딩 페이지 (공개)
/login              로그인 (공개)
/register           회원가입 (공개)
/home               홈 대시보드 - 학점 진행률, 선배 추천 (인증)
/curriculum         커리큘럼 과목 체크 & 졸업 요건 계산 (인증)
/explore            선배 탐색/필터 (인증)
/my                 마이페이지 - 프로필 수정, 스크랩북 (인증)
/roadmap            커리어 로드맵 (인증, Phase 3 구현 예정)
/seniors/:seniorId  선배 상세 프로필 (인증)
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

스키마 파일: `frontend/supabase/schema.sql`
변경 시 Supabase Dashboard → SQL Editor에서 실행

### 학과 관련
```sql
colleges(id serial PK, name text, campus text)
departments(id serial PK, college_id → colleges, name text, has_tracks bool)
tracks(id serial PK, department_id → departments, name text)
```

### 유저 관련
```sql
profiles(id uuid PK → auth.users, email, name, role: 'student'|'alumni',
         bio text, job_title text, company text,
         is_available bool DEFAULT true, skills text[] DEFAULT '{}')  -- 선배 필드: migrations/0001
user_majors(id serial PK, user_id → profiles, department_id → departments,
            track_id → tracks nullable, type: 'major'|'double_major'|'minor',
            admission_year int, graduation_year int nullable)
```

### 커리큘럼 관련
```sql
course_catalog(id serial PK, department_id → departments, name, code,
               type: '전공기초'|'전공필수'|'전공선택', credits int, admission_year int nullable)
checked_courses(id serial PK, user_id → profiles, course_id → course_catalog, UNIQUE)
curriculum_requirements(id serial PK, department_id → departments,
                        basic_credits int, required_credits int, elective_credits int)
```

### 소셜 관련
```sql
bookmarks(id serial PK, user_id → profiles, senior_id → profiles, UNIQUE)  -- Phase 3
-- coffee_chats  Phase 4 예정
-- messages      Phase 5 예정
```

### Seed 데이터 (완료)
- 소프트웨어융합대학 > 소프트웨어융합학과
- 트랙: 게임콘텐츠 / 데이터사이언스 / 로봇·비전 / 융합리더
- 졸업 요건: 전공기초 27학점 / 전공필수 18학점 / 전공선택 15학점
- 과목: 전공기초 9개, 전공필수 6개, 전공선택 10개 (총 25과목)

---

## 개발 Phase

```
Phase 1 ✅  환경 세팅 + 프로젝트 스캐폴딩 + Docker + K8s 로컬 배포 + CI/CD
Phase 2 ✅  Supabase Auth + 유저 프로필 (회원가입/로그인/홈/커리큘럼/마이페이지)
Phase 3 ✅  선배 탐색/필터 + 북마크 + 선배 프로필(소개·직무·전문분야·상담가능) 편집/표시
            └ 남은 항목: /roadmap (커리어 로드맵 — 데이터 모델 설계 후 별도 진행)
Phase 4 ✅  커피챗 신청 시스템 — coffee_chats 테이블 + RLS + 신청 폼(선배 상세) +
            신청 관리(마이페이지: 받은/보낸 신청 수락·거절·취소)
Phase 5 ✅  실시간 채팅 — messages 테이블 + Supabase Realtime 구독 +
            채팅 모달(수락된 커피챗에서 '채팅 열기')
Phase 6     프로덕션 배포 (Ingress, TLS, 모니터링) — 배포 틀은 아래 완료, 실제 배포만 남음

## 배포 틀 (구축 완료)

```
frontend/nginx.conf            SPA 라우팅(try_files) + gzip + 자산 캐시
frontend/Dockerfile            멀티스테이지 + nginx.conf 적용 (.env로 VITE_* 주입)
frontend/.dockerignore         빌드 컨텍스트 경량화 (.env는 유지)
.github/workflows/ci.yml        push/PR 시 빌드 검증
.github/workflows/deploy.yml    main push → amd64 빌드 → ghcr.io push
deploy/docker-compose.yml       시놀로지: khunnect + Watchtower(자동 pull/교체)
frontend/.env.example           환경변수 템플릿
```

⚠️ 배포 전 준비: GitHub repo Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록.
docker-compose.yml의 `<OWNER>`를 GitHub 계정(소문자)으로 치환.

⚠️ DB 마이그레이션 (Supabase SQL Editor에서 순서대로 실행):
  - `migrations/0001_senior_profile_fields.sql` — 선배 프로필 컬럼(bio·job_title·company·is_available·skills)
  - `migrations/0002_coffee_chats.sql` — 커피챗 테이블(coffee_chats) + RLS
  - `migrations/0003_messages.sql` — 채팅 messages 테이블 + RLS + Realtime 발행
  미실행 시 해당 기능이 빈 값/비활성으로 보임.
  ※ 0003은 Realtime을 위해 Supabase Dashboard → Database → Replication 에서 messages 발행 확인 권장.

## Linux 환경 (OrbStack) — 확인된 버전

| 도구 | 버전 |
|------|------|
| OS | Ubuntu (Linux 7.0.5-orbstack, aarch64) |
| Node.js | v20.20.2 |
| npm | 10.8.2 |
| minikube | v1.38.1 |
| kubectl | v1.36.1 |
| Vite dev server | v8.0.10 (541ms cold start) |
| Docker 이미지 | 94.1MB (nginx/1.31.1) |
| K8s 서비스 URL | http://192.168.49.2:30080 |

⚠️ OrbStack Linux Machine은 **ARM64(aarch64)** — minikube/kubectl 설치 시 반드시 `arm64` 바이너리 사용
```

---

## 자주 쓰는 명령어

### 개발 서버 실행
```bash
cd frontend && npm run dev
# http://localhost:5173
```

### 빌드 & 타입 체크
```bash
cd frontend && npm run build
```

### DB 테스트 (스키마·RLS·제약 검증 — 오프라인)
```bash
cd frontend && npm run test:db
```
PGlite(WASM 내장 Postgres)로 원격 Supabase 없이 `schema.sql` + `migrations/*` +
RLS 정책 + 제약을 실제 Postgres 엔진에서 검증. Supabase의 `auth.uid()`·`anon`/
`authenticated` 롤을 재현하여 권한/RLS를 실제로 태운다.
테스트 하네스: `frontend/supabase/test/rls.test.mjs`

### Docker 빌드 & 실행
```bash
docker build -t khunnect-frontend:latest ./frontend
docker run -p 3000:80 khunnect-frontend:latest
# http://localhost:3000
```

### K8s 배포 (minikube)
```bash
eval $(minikube docker-env)
docker build -t khunnect-frontend:latest ./frontend
kubectl apply -f k8s/frontend-deployment.yaml
minikube service frontend-service --url
```

### Git
```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

---

## 코드 컨벤션

### 라우팅
- 모든 라우트 파일: `src/routes/` 안에 `createFileRoute()` 사용
- 인증이 필요한 라우트: `beforeLoad`에서 `supabase.auth.getSession()` 체크
- 페이지 컴포넌트는 `React.lazy()`로 동적 import → `__root.tsx`의 `Suspense`가 처리

### 데이터 패칭
- 모든 비동기 데이터는 `useQuery` 사용 — `useEffect`로 데이터 패칭 금지
- Mock 데이터 fallback 패턴: `queryFn: () => fetchData().catch(() => MOCK_DATA)`

### 스타일링
- 주요 스타일: 인라인 `style={}`
- 레이아웃 유틸리티: Tailwind 클래스 (`flex`, `grid`, `gap`, `max-w-*` 등)
- 색상 팔레트: `#9A001F`(브랜드), `#FCF1F1`(배경), `#1F1A1A`(텍스트), `#5C3F3F`(서브텍스트)

### TypeScript
- `verbatimModuleSyntax` 활성화 → 타입 import는 반드시 `import type { ... }` 사용
- `CSSProperties` → `import type { CSSProperties } from 'react'`

### 컴포넌트화 기준
- 동일 UI가 2곳 이상 반복될 때
- 페이지 파일이 200줄 초과할 때
- 독립적으로 동작하는 UI 블록 (폼, 카드, 모달)

```
components/auth/       로그인/회원가입 전용
components/common/     어디서든 재사용 가능한 요소
components/curriculum/ 커리큘럼 관련
components/dashboard/  홈 대시보드 관련
components/landing/    랜딩 페이지 관련
components/layout/     헤더, 푸터, 네비게이션
components/mypage/     마이페이지 관련
components/seniors/    선배 관련
```

---

## 빌드 최적화

`vite.config.ts`에 `manualChunks` 설정으로 벤더 라이브러리 청크 분리:
- `vendor-react` — React + React DOM
- `vendor-router` — TanStack Router
- `vendor-query` — TanStack Query
- `vendor-supabase` — Supabase JS SDK

모든 페이지 컴포넌트는 `React.lazy()` + `Suspense`로 코드 스플리팅 적용.
빌드 결과: 최대 청크 196KB (경고 없음)

---

## OrbStack Linux Machine

### 진입
```bash
orb                  # macOS 터미널에서
# VS Code: Remote SSH → Host: orb
```

### 초기 세팅 (최초 1회)
```bash
sudo apt-get update && sudo apt-get upgrade -y

# Node.js 20
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20

# kubectl (ARM64 — OrbStack Linux Machine은 aarch64)
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# minikube (ARM64)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-arm64
sudo install minikube-linux-arm64 /usr/local/bin/minikube
minikube start --driver=docker
```

### 프로젝트 클론
```bash
git clone https://github.com/<username>/khunnect.git
cd khunnect/frontend
npm install
# .env 파일 직접 생성 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
npm run dev
# → OrbStack 포트 자동 포워딩: http://localhost:5173
```

---

## 주요 참고 사항

- `.env` 파일은 절대 GitHub에 올리지 말 것
- `service_role` 키는 절대 프론트엔드에서 사용 금지
- DB 스키마 변경 시 `frontend/supabase/schema.sql` 수정 후 Supabase SQL Editor에서 실행
- K8s 이미지 빌드 전 반드시 `eval $(minikube docker-env)` 실행
- minikube 서비스 접근: `minikube service frontend-service --url`
- 이메일 인증: 개발 중 비활성화 (Supabase → Authentication → Settings → Confirm email OFF)
- TanStack Router: `tanstackRouter()` import 사용 (`TanStackRouterVite` deprecated)

---

## ⚠️ 주의사항 & 앞으로 진행할 때 참고할 점

### 타입 관리

**규칙: 공유 타입은 반드시 `src/types/index.ts`에만 정의**

```
✅ import type { Senior } from '../types/index'
❌ export type Senior = { ... }  // 컴포넌트 파일 안에 절대 금지
```

현재 `src/types/index.ts`에 정의된 공유 타입:
- `Senior` — 선배 프로필 (ExplorePage, SeniorCard, SeniorDetailPage에서 사용)
- `CourseType` — `'전공기초' | '전공필수' | '전공선택'`
- `CatalogCourse` — 과목 카탈로그 항목
- `CurriculumRequirement` — 졸업 요건 학점

`CategoryPanel.tsx`와 `CourseGrid.tsx`는 하위호환을 위해 `export type { CourseType }` / `export type { CatalogCourse }` 로 re-export하고 있음.
새 코드에서는 반드시 `src/types/index.ts`에서 직접 import할 것.

---

### 데이터 패칭 — useQuery 패턴

**규칙: 모든 서버 데이터 로딩은 `useQuery` — `useEffect` 내 데이터 패칭 절대 금지**

```tsx
// ✅ 올바른 패턴
const { data, isLoading } = useQuery({
  queryKey: ['seniors', dept],
  queryFn: () => fetchSeniors(dept),
})

// ❌ 금지 패턴
useEffect(() => {
  fetchData().then(setData)
}, [dep])
```

**낙관적 업데이트 (Optimistic Update) 패턴** — CurriculumPage의 과목 토글 참고:
```tsx
// queryClient.setQueryData로 캐시 즉시 업데이트 → 백그라운드 Supabase 동기화
queryClient.setQueryData<string[]>(['checked_courses', user?.id], (prev = []) =>
  isChecked ? prev.filter(x => x !== id) : [...prev, id]
)
```

**의존 쿼리 패턴** — 이전 쿼리 결과에 의존할 때 `enabled` 사용:
```tsx
const { data: majorData } = useQuery({ queryKey: ['user_major', userId], ... })
const { data: requirements } = useQuery({
  queryKey: ['requirements', majorData?.department_id],
  queryFn: ...,
  enabled: !!majorData?.department_id,  // department_id가 있을 때만 실행
})
```

---

### 인증 가드 — 이중 중복 금지

**규칙: 인증 체크는 라우트 파일의 `beforeLoad`에서 한 번만**

```tsx
// routes/explore.tsx — 여기서 처리 완료
beforeLoad: async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw redirect({ to: '/login' })
},
```

따라서 페이지 컴포넌트 내부에 아래 패턴을 **다시 작성하지 말 것**:
```tsx
// ❌ 중복 — beforeLoad가 이미 처리함
useEffect(() => {
  if (!loading && !user) navigate({ to: '/login' })
}, [user, loading, navigate])

if (loading || !user) return null  // ❌ 이것도 불필요
```

`useAuth()`는 `user.id`가 실제로 필요한 경우(CurriculumPage 등)에만 사용.
auth redirect만 목적이라면 `useAuth` import 자체가 필요 없음.

---

### Vite 8 / Rolldown — manualChunks

**규칙: `manualChunks`는 반드시 함수 형태**

```ts
// ✅ 함수 형태 (Rolldown 호환)
manualChunks: (id: string) => {
  if (id.includes('node_modules/react')) return 'vendor-react'
}

// ❌ 객체 형태 — Rolldown에서 타입 오류
manualChunks: { 'vendor-react': ['react', 'react-dom'] }
```

---

### TypeScript — verbatimModuleSyntax

**규칙: 타입 전용 import는 반드시 `import type`**

```ts
✅ import type { CSSProperties } from 'react'
✅ import type { Senior } from '../types/index'
❌ import { Senior } from '../types/index'   // 빌드 오류
```

`tsconfig.json`에 `"verbatimModuleSyntax": true` 활성화됨.

---

### 아바타 시스템

`src/lib/avatarVariants.tsx`:
- `getAvatarVariantForId(id: string)` — UUID 해시 기반으로 4가지 변형 중 하나 반환
- 특정 ID에 다른 아바타를 강제하는 override 로직 **삭제됨** (mock 데이터 잔재)
- 새 사용자를 추가해도 ID 해시로 자동 결정되므로 별도 작업 불필요

---

### Linux 환경 (OrbStack) — ARM64 주의

OrbStack Linux Machine은 **aarch64(ARM64)** 아키텍처.
도구 설치 시 반드시 `arm64` 바이너리 사용:

```bash
# ✅ ARM64
minikube-linux-arm64
kubectl .../linux/arm64/kubectl

# ❌ x86_64 — OrbStack에서 실행 불가
minikube-linux-amd64
kubectl .../linux/amd64/kubectl
```

오류 메시지: `OrbStack ERROR: Dynamic loader not found: /lib64/ld-linux-x86-64.so.2`
→ 이 오류가 나오면 amd64 바이너리를 설치한 것. arm64로 재설치.

---

### Phase 3 진행 시 주의사항

**`bookmarks` 테이블** (schema.sql에 이미 정의):
```sql
bookmarks(id serial PK, user_id → profiles, senior_id → profiles, UNIQUE)
```
- 북마크 추가/삭제도 `useMutation` + `queryClient.invalidateQueries`로 구현할 것
- 낙관적 업데이트 패턴(위 CurriculumPage 참고) 적용 권장

**선배 디렉토리 (`/explore`)** 확장 시:
- `skills` 필드는 현재 항상 `[]` (DB에 없음) — Phase 3에서 `profiles` 또는 별도 테이블로 추가 예정
- `isAvailable` 필드도 현재 하드코딩 `true` — 추후 DB 컬럼으로 관리 필요

**선배 상세 (`/seniors/$seniorId`)** 확장 시:
- 현재 "Phase 4에서 상세 프로필 기능 추가 예정" 플레이스홀더만 존재
- "선배와 연결하기" 버튼은 커피챗 신청 폼으로 연결 예정 (Phase 4)

---

### 빌드 상태 (2026-05-26 기준)

```
✓ 234 modules transformed
✓ 19 chunks, 최대 청크 195.90 kB (vendor-supabase)
✓ TypeScript 오류 0개
✓ 경고 0개
```

빌드 명령: `cd frontend && npm run build`

---

## 랜딩 페이지 UI 수정 이력 (2026-05-26)

### ✅ ScrollingFrame 스티키 스크롤 복구

**원인:** `LandingPage.tsx` 루트 div에 `overflowX: "hidden"`이 있으면 CSS 스펙상 모든 하위 `position: sticky`가 동작하지 않음.

**수정:**
- `LandingPage.tsx` 루트 div에서 `overflowX: hidden` 제거
- overflow가 필요한 섹션(HeroSection, QuoteSection, FeaturesSection, CTASection)은 별도 div로 감싸 개별 격리
- `ScrollingFrame`은 overflow 래퍼 **밖**에 배치 (sticky 정상 동작의 필수 조건)

```tsx
// LandingPage.tsx 구조
<div style={{ width: "100%" }}>
  <div style={{ overflowX: "hidden" }}>
    <Navbar />
    <HeroSection />
    <QuoteSection ... />
    <FeaturesSection />
  </div>
  {/* ScrollingFrame은 overflow 래퍼 밖 — sticky가 작동하려면 필수 */}
  <ScrollingFrame />
  <div style={{ overflowX: "hidden" }}>
    <CTASection />
  </div>
</div>
```

---

### ✅ ScrollingFrame 이미지 애니메이션 범위 조정

**변경 전:** `startX = vw`, `endX = -imgW` → 시작/끝에서 이미지가 완전히 화면 밖으로 나감  
**변경 후:** `startX = vw * 0.5`, `endX = -(imgW - vw * 0.5)` → 시작에는 오른쪽 절반, 끝에는 왼쪽 절반만 보임 (대칭)

- travel = imgW (항상 이미지 너비만큼 이동)
- containerH = `100vh + imgW` (스크롤 지속 시간 = 이동 거리에 비례)
- 이미지는 `position: absolute`로 레이아웃 흐름에서 분리 → flex 컨테이너 팽창 방지
- `transform: translateX(${x}px) translateY(-50%)` — 수평 애니메이션 + 수직 중앙 정렬 동시 처리

---

### ✅ Navbar position: fixed 적용

**변경 전:** `position: "sticky"` → `overflowX: hidden` 내부에 위치해 동작 안 함  
**변경 후:** `position: "fixed"` + `left: 0, right: 0` → 스크롤과 무관하게 항상 상단 고정

---

### ✅ HeroSection 스크린샷 그림자 제거

`HeroSection.tsx` 내 앱 스크린샷 컨테이너의 `boxShadow` 속성 완전 제거.

---

### ✅ QuoteSection 텍스트 레이아웃 수정

**변경 전:** `paddingLeft: "600px"` + `position: absolute; right: 600px` → 넓은 뷰포트 전용 고정 픽셀 레이아웃, 좁은 화면에서 깨짐  
**변경 후:** `display: flex; justifyContent: flex-end` + `maxWidth: 580px` → 반응형 flexbox 레이아웃, 인용문 작성자는 인라인 `textAlign: right`

---

### ✅ body min-width 제거 (index.css)

**원인:** `body { min-width: 1280px }` 가 전체 페이지를 1280px로 강제 → ScrollingFrame 이미지 크기 계산 오류, QuoteSection 레이아웃 파괴  
**수정:** `frontend/src/index.css` body 규칙에서 `min-width: 1280px` 제거

```css
/* 수정 전 */
body {
  @apply font-sans antialiased;
  font-family: var(--font-roboto);
  min-width: 1280px;  /* ← 제거 */
}
```

---

### ⚠️ CSS 레이아웃 함정 — 향후 주의사항

| 함정 | 원인 | 해결책 |
|------|------|--------|
| `position: sticky` 미작동 | 조상 요소에 `overflow: hidden` 또는 `overflowX: hidden` 존재 | sticky 요소는 overflow 컨텍스트 밖에 배치 |
| flex 컨테이너가 이미지 너비만큼 팽창 | 이미지에 `flexShrink: 0` + 넓은 `width` | 이미지를 `position: absolute`로 레이아웃에서 분리 |
| 전체 페이지 강제 너비 | `body { min-width: Npx }` | body에 min-width 설정 금지; 섹션별 maxWidth 사용 |
| Navbar sticky 미작동 | overflow 래퍼 내부에 위치 | `position: fixed` + `left: 0, right: 0` 사용 |
