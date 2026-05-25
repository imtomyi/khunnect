# 리눅스 한달살기 보고서

**프로젝트명**: Khunnect — 경희대학교 학생 커리큘럼 설계 플랫폼  
**개발 환경**: macOS + OrbStack Linux Machine (Ubuntu 24.04 noble, ARM64)  
**개발 기간**: 2025년 ~ 2026년  

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [가상화 도구 비교 — UTM vs OrbStack](#2-가상화-도구-비교--utm-vs-orbstack)
3. [OrbStack 사용기](#3-orbstack-사용기)
4. [개발 서버 사용기](#4-개발-서버-사용기)
5. [Supabase 서버 사용기](#5-supabase-서버-사용기)
6. [Kubernetes / minikube 사용기](#6-kubernetes--minikube-사용기)
7. [프로젝트 개발 결과](#7-프로젝트-개발-결과)
8. [결론 및 회고](#8-결론-및-회고)

---

## 1. 프로젝트 개요

### 서비스 소개

Khunnect는 경희대학교 국제캠퍼스 재학생과 졸업생을 연결하는 커리큘럼 설계 플랫폼이다.  
졸업생이 자신의 커리큘럼과 커리어 경로를 공유하고, 재학생이 이를 참고해 학업 방향을 잡을 수 있도록 돕는다.

**핵심 기능**
- 커리큘럼 계산기 — 수강 완료 과목 체크, 졸업 요건 달성률 실시간 계산
- 선배 디렉토리 — 졸업생 프로필 탐색, 관심 분야 필터
- 커피챗 신청 — 선배에게 멘토링 신청 (Phase 4 예정)
- 실시간 채팅 — Supabase Realtime (Phase 5 예정)

### 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React + Vite + TypeScript |
| Routing | TanStack Router v1 (파일 기반) |
| Data Fetching | TanStack Query |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| CSS | Tailwind CSS v4 + 인라인 CSSProperties |
| Container | Docker Engine (멀티스테이지 빌드) |
| Orchestration | Kubernetes — minikube (로컬) |
| CI/CD | GitHub Actions |
| **개발 환경** | **Ubuntu 24.04 on OrbStack Linux Machine** |

---

## 2. 가상화 도구 비교 — UTM vs OrbStack

### 배경

리눅스 한달살기 과제를 수행하기 위해 macOS 위에서 리눅스를 **주 개발 환경**으로 운용해야 했다.  
처음에는 UTM을 검토했고, 이후 OrbStack으로 전환했다.

### UTM 검토

UTM은 macOS에서 동작하는 오픈소스 가상화 소프트웨어(QEMU 기반)다.  
M1/M2 Mac에서 ARM64 Ubuntu를 무료로 실행할 수 있다는 점에서 유력한 선택지였다.

**설치 및 초기 설정 시도:**
- App Store에서 UTM 설치
- Ubuntu 22.04 ARM64 ISO 다운로드 → 가상 머신 생성
- 네트워크 설정(NAT), 공유 폴더(VirtFS) 수동 구성 필요

**UTM을 포기한 이유:**

| 항목 | 문제 |
|------|------|
| 파일 공유 | macOS ↔ VM 간 공유 폴더 설정이 번거로움. VirtFS 설정 후에도 경로 불일치 발생 |
| 포트포워딩 | 개발 서버(5173) → macOS 브라우저 접근을 위해 수동 포트포워딩 설정 필요 |
| 성능 | `npm install`, Docker 빌드 시 체감 속도가 느림 |
| VS Code 연결 | Remote SSH 설정을 위해 VM IP를 매번 확인해야 함. 재시작 시 IP 변동 |
| Docker 사용 | VM 안에 Docker를 별도 설치해야 함 |
| 편의성 | VM 시작/종료 과정이 무거움 |

### OrbStack 선택

OrbStack은 Docker Desktop의 경량 대안으로 알려진 macOS 전용 컨테이너/VM 관리 도구다.  
그 중 **Linux Machine** 기능이 UTM의 모든 불편함을 해결해 주었다.

**OrbStack 설치:**
```bash
# Homebrew로 설치 (macOS)
brew install orbstack

# 또는 orbstack.dev 에서 직접 다운로드
```

**Linux Machine 생성:**
OrbStack 앱 실행 → Linux Machines → New Machine → Ubuntu 24.04 (noble) 선택  
→ 머신 이름: `ubuntu`, ARCH: ARM64, 8.3 GB 생성

### UTM vs OrbStack 비교

| 항목 | UTM | OrbStack Linux Machine |
|------|-----|------------------------|
| 설치 난이도 | 중 (ISO 직접 설정) | 하 (앱에서 클릭 몇 번) |
| 성능 | 보통~느림 | 네이티브급 (Virtualization.framework) |
| macOS 파일 공유 | 수동 VirtFS 설정 필요 | `/mac/...` 경로로 자동 마운트 |
| 포트포워딩 | 수동 설정 | 자동 (localhost로 즉시 접근) |
| Docker | VM 내 별도 설치 | OrbStack 소켓 공유 (설치 불필요) |
| VS Code SSH | IP 직접 지정, 재시작 시 변동 | `orb` 호스트 고정, 즉시 연결 |
| 비용 | 무료 | 개인 무료 |
| 적합한 용도 | 다양한 OS 에뮬레이션, GUI VM | 리눅스 개발 환경으로 최적 |

---

## 3. OrbStack 사용기

### 머신 진입 및 기본 조작

```bash
# macOS 터미널에서 Linux 머신 진입
orb                    # 기본 머신
orb shell ubuntu       # ubuntu 이름의 머신 진입

# 머신 상태 확인
orb list
# NAME    STATE    DISTRO   VERSION   ARCH    SIZE
# ubuntu  running  ubuntu   noble     arm64   8.3GB
```

머신 내부는 완전한 Ubuntu 24.04 환경:
```
Linux ubuntu 6.x.x-orbstack #1 SMP aarch64 GNU/Linux
```

### 개발 환경 설치

```bash
# 1. Node.js 20 (nvm 사용)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20
node -v   # v20.x.x

# 2. Docker — OrbStack 소켓 공유로 이미 사용 가능
docker ps   # 바로 동작

# 3. kubectl
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 4. minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### VS Code Remote SSH 연결

1. VS Code → Extensions → Remote - SSH 설치
2. `Cmd+Shift+P` → `Remote-SSH: Connect to Host`
3. 호스트: `orb` (OrbStack이 SSH 설정 자동 등록)
4. 연결 즉시 Linux 머신 내부 파일 편집 가능

### 실제 개발 경험

```bash
# 프로젝트 클론
git clone https://github.com/<username>/khunnect.git
cd khunnect/frontend

# 의존성 설치
npm install

# 환경 변수 설정 (nano 미설치 → heredoc 사용)
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://zmlldljddwcjvbnumwfi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
EOF

# 개발 서버 실행
npm run dev
# → Local: http://localhost:5173
```

**핵심 편의 기능 — 자동 포트포워딩:**  
Linux Machine 안에서 `npm run dev`를 실행하면, OrbStack이 5173 포트를 자동으로 macOS localhost로 포워딩한다.  
macOS 브라우저에서 `http://localhost:5173`으로 바로 접근 가능 — 별도 설정 불필요.

**파일 공유:**  
macOS의 `/Users/tom/Desktop/projects/khunnect`는 Linux 머신 안에서도 동일 경로(`/mac/Users/tom/Desktop/projects/khunnect`)로 접근된다.  
VS Code에서 편집한 파일이 즉시 Linux 환경에 반영되어 HMR(Hot Module Replacement)도 정상 동작했다.

### OrbStack 장단점 정리

**장점**
- 설치 및 설정이 거의 없음 — 앱 설치 후 머신 생성만 하면 끝
- macOS와의 통합이 자연스러움 (파일, 포트, SSH 모두 자동)
- Docker가 별도 설치 없이 바로 동작
- 성능이 뛰어남 (Virtualization.framework 사용, QEMU 에뮬레이션 아님)
- `orb` 명령 하나로 즉시 접근

**단점**
- macOS 전용 (Windows/Linux에서는 사용 불가)
- 팀 기능은 유료
- 무거운 GUI 앱 실행에는 부적합 (개발 서버 용도로 최적)

---

## 4. 개발 서버 사용기

### Vite 개발 서버

```bash
cd ~/Desktop/projects/khunnect/frontend
npm run dev
# VITE v6.x  ready in 312 ms
# → Local:   http://localhost:5173/
```

Vite의 HMR이 OrbStack Linux Machine 환경에서 정상 동작했다.  
TypeScript 파일 저장 → 브라우저 자동 반영까지 체감 속도 < 100ms.

### Docker 멀티스테이지 빌드

```dockerfile
# Stage 1: 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: 서빙 스테이지
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**빌드 및 실행:**
```bash
docker build -t khunnect-frontend:latest ./frontend
docker run -p 3000:80 khunnect-frontend:latest
# → http://localhost:3000 (OrbStack 자동 포트포워딩)
```

최종 이미지 크기: ~50MB (`node_modules` 포함 빌더 스테이지는 버려짐)

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - run: docker build -t khunnect-frontend:latest ./frontend
```

main 브랜치 push / PR 시 자동 실행:
1. `npm ci` → 의존성 설치
2. `npm run build` → TypeScript 컴파일 + Vite 번들링
3. `docker build` → 이미지 빌드 검증

---

## 5. Supabase 서버 사용기

### 선택 이유

별도 백엔드 서버를 구축하는 대신 Supabase를 선택했다.

- **PostgreSQL** 기반 → 표준 SQL, 복잡한 JOIN 쿼리 지원
- **Auth 내장** → JWT 기반 이메일 인증, 세션 관리 바로 사용
- **RLS (Row Level Security)** → DB 레벨 접근 제어
- **JavaScript 클라이언트** → React에서 직접 호출, API 서버 불필요
- **무료 티어** → 프로토타입 개발에 충분

### 프로젝트 구성

**클라이언트 초기화** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### DB 스키마

```
colleges
  └── departments (has_tracks)
        └── tracks

profiles (auth.users와 1:1)
  └── user_majors (type: major | double_major | minor)

course_catalog (학과별 과목 카탈로그)
  └── checked_courses (유저별 수강 완료 체크)

curriculum_requirements (학과별 졸업 요건 학점)
```

**학과 관련**
```sql
colleges        -- 단과대학 (id, name, campus)
departments     -- 학과 (id, college_id, name, has_tracks)
tracks          -- 트랙 (id, department_id, name)
```

**유저 관련**
```sql
profiles        -- 기본 정보 (id, name, role: student|alumni)
user_majors     -- 전공 (user_id, type, admission_year, graduation_year, department_id)
```

**커리큘럼 관련**
```sql
course_catalog          -- 과목 카탈로그 (id, name, type, credits, code, department_id)
checked_courses         -- 수강 완료 (user_id, course_id) — UNIQUE 제약
curriculum_requirements -- 졸업 요건 (department_id, basic/required/elective_credits)
```

### RLS 정책

```sql
-- profiles: 본인만 조회/수정
CREATE POLICY "own profile select" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_majors: 본인만 조회/수정
CREATE POLICY "own major" ON user_majors
  FOR ALL USING (auth.uid() = user_id);

-- checked_courses: 본인만 INSERT/DELETE
CREATE POLICY "own checked courses" ON checked_courses
  FOR ALL USING (auth.uid() = user_id);

-- course_catalog, curriculum_requirements: 누구나 조회
CREATE POLICY "public read catalog" ON course_catalog
  FOR SELECT USING (true);
CREATE POLICY "public read requirements" ON curriculum_requirements
  FOR SELECT USING (true);
```

### 실제 사용 경험

**Supabase JS 클라이언트 — 중첩 JOIN 쿼리:**
```typescript
// user_majors → departments 조인
const { data } = await supabase
  .from('user_majors')
  .select('admission_year, departments(name)')
  .eq('user_id', userId)
  .eq('type', 'major')
  .single()

// checked_courses → course_catalog 조인 (달성률 계산)
const { data } = await supabase
  .from('checked_courses')
  .select('course_catalog(id, name, code, credits, type)')
  .eq('user_id', userId)
```

**실시간 체크박스 저장:**
```typescript
// 과목 체크 시 즉시 INSERT
await supabase.from('checked_courses')
  .insert({ user_id: userId, course_id: courseId })

// 과목 언체크 시 즉시 DELETE
await supabase.from('checked_courses')
  .delete()
  .eq('user_id', userId)
  .eq('course_id', courseId)
```

**좋았던 점**
- 빠른 프로토타이핑 — SQL 에디터에서 스키마 설계 → 바로 React에서 쿼리
- Auth 완성도 — 회원가입, 로그인, 세션 관리 서버 없이 처리
- 중첩 조인 — `.select('departments(name)')` 형태로 간단하게 관계 조회
- RLS — 코드 없이 DB 레벨에서 데이터 격리 보장

**아쉬운 점**
- 무료 티어: 1주 미접속 시 프로젝트 일시 중지 (수동 재개 필요)
- RLS 정책 오류 시 빈 결과 반환 (에러 메시지 없음 → 디버깅 어려움)
- `service_role` 키 노출 시 전체 DB 접근 가능 → 프론트엔드 코드에 절대 포함 금지

---

## 6. Kubernetes / minikube 사용기

### 구성

OrbStack Linux Machine의 Docker를 드라이버로 minikube를 실행했다.

```bash
# minikube 시작
minikube start --driver=docker

# 중요: 반드시 minikube Docker daemon으로 환경변수 전환 후 빌드
eval $(minikube docker-env)
docker build -t khunnect-frontend:latest ./frontend

# 배포
kubectl apply -f k8s/frontend-deployment.yaml

# 상태 확인
kubectl get pods
kubectl get services

# 서비스 URL 확인
minikube service frontend-service --url
```

### Deployment 구성

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: khunnect-frontend:latest
          imagePullPolicy: Never   # 로컬 이미지 사용 (외부 pull 안 함)
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  type: NodePort
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
```

`imagePullPolicy: Never` — `eval $(minikube docker-env)` 후 빌드한 이미지를 minikube 내부에서 직접 사용.  
이 설정 없이 빌드하면 minikube가 이미지를 찾지 못해 `ImagePullBackOff` 에러 발생.

### K8s 배포 테스트 결과

```bash
$ kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
frontend-xxx-yyy            1/1     Running   0          30s

$ kubectl get services
NAME               TYPE       CLUSTER-IP     PORT(S)        AGE
frontend-service   NodePort   10.96.x.x      80:30080/TCP   30s

$ minikube service frontend-service --url
http://192.168.x.x:30080
```

→ 브라우저에서 URL 접속 시 Nginx가 React 앱 정상 서빙 확인.

### 실사용 경험

**배웠던 것**
- `kubectl apply / get / logs / describe` 기본 명령어
- Pod / Deployment / Service 개념과 관계
- NodePort vs ClusterIP 차이
- `eval $(minikube docker-env)` 의 역할 (minikube 내부 Docker daemon 연결)

**어려웠던 점**
- `eval $(minikube docker-env)` 없이 빌드하면 반드시 `ImagePullBackOff` → 처음에 이 점을 몰라 시간 소요
- OrbStack Linux Machine 재시작 시 minikube도 재시작 필요 (`minikube start`)
- `minikube service --url` 결과 IP가 `localhost`가 아닌 별도 IP — OrbStack 포트포워딩과 별개로 동작

---

## 7. 프로젝트 개발 결과

### 구현된 페이지

| URL | 페이지 | 주요 기능 |
|-----|--------|-----------|
| `/` | 랜딩 페이지 | 서비스 소개, CTA 버튼 |
| `/login` | 로그인 | Supabase Auth 이메일 로그인 |
| `/register` | 회원가입 | 역할 → 이름 → 학과 → 입학년도 → 계정 (멀티스텝) |
| `/home` | 홈 대시보드 | 인사말, 전공 달성률 %, AcademicStatusCard, PriorityCoursesCard |
| `/explore` | 선배 디렉토리 | 졸업생 목록, 학과 필터 |
| `/seniors/:id` | 선배 상세 | 프로필 카드, 커피챗 버튼 (Phase 4 예정) |
| `/curriculum` | 커리큘럼 계산기 | 과목 체크 → Supabase 즉시 저장, 카테고리별 진도 |
| `/my` | 마이페이지 | 프로필 수정 모달, 관심 분야 태그 |
| `/roadmap` | 커리어 로드맵 | Phase 3 예정 stub |

### 컴포넌트 구조

```
src/
├── lib/
│   ├── supabase.ts              Supabase 클라이언트
│   └── avatarVariants.tsx       아바타 색상 변형 (4종)
├── hooks/
│   ├── useAuth.tsx              AuthProvider + useAuth 훅
│   └── useDepartments.ts        학과 목록 조회
├── components/
│   ├── dashboard/               DashboardNav, AcademicStatusCard,
│   │                            PriorityCoursesCard, HomeFooter ...
│   ├── seniors/                 SeniorsHero, SeniorCard
│   ├── mypage/                  ProfileSection, ScrapbookSection
│   └── curriculum/              CategoryPanel, CourseGrid, Icons
└── pages/
    ├── LandingPage, LoginPage, RegisterPage
    ├── HomePage, ExplorePage, SeniorDetailPage
    ├── MyPage, CurriculumPage, RoadmapPage
```

### 인증 시스템

- `useAuth` 훅 — `AuthProvider`로 세션 전역 관리
- 라우트 보호 — `beforeLoad` + `supabase.auth.getSession()`으로 미인증 접근 차단
- 로그인/회원가입 완료 → `/home` 리다이렉트

### 아바타 시스템

- 4가지 색상 변형 (파랑 / 보라 / 갈색 / 빨강)
- `getAvatarVariantForId(userId)` — 사용자 ID 해시 기반 일관된 아바타 자동 결정
- SVG 기반 `AvatarIcon` 컴포넌트

---

## 8. 결론 및 회고

### 리눅스 환경에서 개발한 소감

한 달간 OrbStack Linux Machine을 주 개발 환경으로 사용하며 다음을 익혔다:

1. **패키지 관리**: `apt-get` 기반 Ubuntu 패키지 시스템
2. **쉘 활용**: heredoc(`cat > file << 'EOF'`), `eval`, 파이프라인
3. **Docker**: 멀티스테이지 빌드, 이미지 레이어 최적화
4. **Kubernetes**: Pod/Deployment/Service 개념, `kubectl` 명령어
5. **SSH 개발**: VS Code Remote SSH를 통한 원격 편집 생산성

UTM을 먼저 시도했다가 OrbStack으로 전환한 경험을 통해, **도구 선택이 개발 생산성에 얼마나 큰 영향을 미치는지** 직접 체감했다. OrbStack은 macOS 개발자가 리눅스 환경을 경험하기에 현재 가장 완성도 높은 도구라고 생각한다.

### 기술 스택 선택 회고

| 기술 | 선택 이유 | 실제 소감 |
|------|-----------|-----------|
| React + Vite | 빠른 HMR, TypeScript 지원 | 만족. 빌드 속도 빠름 |
| TanStack Router | 파일 기반, 타입 안전 | 초기 설정 복잡하지만 타입 자동완성 우수 |
| TanStack Query | 서버 상태 관리, 캐싱 | `invalidateQueries` 패턴 직관적 |
| Supabase | Auth + DB + RLS 통합 | 소규모 프로젝트에 최적. 빠른 프로토타이핑 |
| Docker + K8s | 실제 배포 경험 | 운영 환경과 유사한 경험 가능 |
| OrbStack | 리눅스 개발 환경 | UTM 대비 압도적으로 편리 |

---

## 부록 — 자주 쓰는 명령어

### 개발 서버

```bash
cd frontend && npm run dev         # http://localhost:5173
```

### Docker

```bash
docker build -t khunnect-frontend:latest ./frontend
docker run -p 3000:80 khunnect-frontend:latest
```

### Kubernetes (minikube)

```bash
minikube start --driver=docker
eval $(minikube docker-env)                          # 반드시 먼저 실행
docker build -t khunnect-frontend:latest ./frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl get pods
minikube service frontend-service --url
```

### OrbStack

```bash
orb                    # Linux Machine 진입
orb shell ubuntu       # ubuntu 머신 진입
orb list               # 머신 목록 확인
```

### Git

```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

---

## Phase 진행 현황

| Phase | 상태 | 내용 | 핵심 기술 |
|-------|------|------|-----------|
| **Phase 1** | ✅ 완료 | 환경 세팅 + Docker 빌드 + K8s 로컬 배포 + CI/CD | OrbStack, Docker, minikube, GitHub Actions |
| **Phase 2** | ✅ 완료 | Supabase Auth + 유저 프로필 + 커리큘럼 계산기 | Supabase, TanStack Router/Query, React |
| **Phase 3** | ⬜ 예정 | 커리큘럼 게시물 CRUD + 탐색/필터/북마크 | `curricula` 테이블, 검색 UI |
| **Phase 4** | ⬜ 예정 | 커피챗 신청 시스템 | 신청 폼, 선배 멘토링 일정 |
| **Phase 5** | ⬜ 예정 | 실시간 채팅 | Supabase Realtime |
| **Phase 6** | ⬜ 예정 | 프로덕션 배포 | Ingress + TLS + 모니터링 |
