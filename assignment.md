# 리눅스 한달살기 보고서

**학번**: 2025105228  
**이름**: 이승현  
**프로젝트명**: Khunnect — 경희대학교 학생 커리큘럼 설계 플랫폼  
**개발 환경**: macOS + OrbStack Linux Machine (Ubuntu 24.04 noble, ARM64)  
**서버 환경**: Synology NAS (DSM 7.x, Linux 커널 기반)  
**개발 기간**: 2025년 ~ 2026년  

## 목차

**한 주에 소프트웨어 하나씩, 총 8개를 직접 사용하며 정리하였다.**

1. 1주차 — OrbStack · 리눅스 개발 환경
2. 2주차 — Vite · 프론트엔드 빌드 도구
3. 3주차 — Docker · 컨테이너화
4. 4주차 — nginx · 웹 서버
5. 5주차 — Kubernetes · 컨테이너 오케스트레이션
6. 6주차 — Supabase · 서버리스 백엔드
7. 7주차 — Synology DSM · 자가 서버 배포
8. 8주차 — GitHub Actions · CI/CD
9. 맺음말 — 트러블슈팅과 회고

## 1주차 — OrbStack

> **소프트웨어 1/8:** OrbStack — macOS용 경량 Linux/컨테이너 가상화 도구  
> 한 달간의 리눅스 생활이 시작된 출발점. 개발 환경 자체를 Linux로 옮기는 단계이다.

### 왜 리눅스인가

평소 개발은 macOS 환경에서 진행해왔다. macOS 역시 UNIX 계열 운영체제로 터미널 활용에 불편함은 없었으나, 이번 과제를 계기로 실제 서버 환경에 더 가까운 곳에서 개발해보고자 하였다.

실제 운영 서버의 대부분은 Linux를 기반으로 한다. Docker 이미지, Kubernetes 노드, CI 서버 모두 Linux 환경에서 동작한다. macOS에서 개발할 경우 "로컬에서는 정상 동작하나 서버에서는 문제가 발생하는" 상황이 빈번히 발생한다. Linux 환경에서 직접 개발함으로써 그 간극을 줄일 수 있다고 판단하였다.

### UTM 시도 및 한계

초기 Linux 환경 구축을 위해 **UTM**(QEMU 기반 가상화 소프트웨어)을 검토하였다.  
M1/M2 Mac에서 ARM64 기반의 Ubuntu를 무료로 실행할 수 있다는 점에서 유력한 선택지였으며, App Store를 통한 설치와 Ubuntu 가상 머신 구성까지는 문제없이 진행되었다.

그러나 실제 개발 환경으로 활용하는 과정에서 **macOS와의 연동** 측면에 지속적인 불편함이 발생하였다.

코드 편집은 macOS 환경에서, 실행은 Linux VM 내부에서 진행해야 하는 구조였는데, 이를 위해 VirtFS 파일 공유 설정, 포트포워딩 구성, SSH 접속 환경 설정 등 여러 단계의 사전 작업이 요구되었다. 특히 VM 재시작 시 IP 주소가 변경되어 SSH 설정을 매번 갱신해야 하는 점이 반복적인 작업 흐름 단절로 이어졌다.

또한 QEMU 에뮬레이션 기반으로 동작하는 특성상, 이후 사용한 OrbStack과 비교하였을 때 VM 기동 속도 면에서 체감상 현저한 차이가 있었다.

깊이 있게 활용하기 이전에 지속적인 개발 환경으로 유지하기 어렵다는 판단이 섰고, 이에 대안을 모색하게 되었다.

> UTM은 다양한 OS 에뮬레이션이나 GUI 기반 VM 운용에 적합한 도구이다.  
> 다만 "macOS에서 편집하고 Linux에서 실행한다"는 개발 목적에 있어서는 환경 간 전환 비용이 과도하게 발생하였다.

### OrbStack 도입

검색을 통해 **OrbStack**을 알게 되었다. Docker Desktop의 경량 대안으로 알려진 macOS 전용 도구로, Linux Machine 기능이 UTM에서 발생하였던 연동 문제를 대부분 해소해주었다.

**설치:**
```bash
brew install orbstack
# 또는 https://orbstack.dev 에서 직접 다운로드
```

**Linux Machine 생성:**
OrbStack 앱 → Linux Machines 탭 → New Machine  
→ Ubuntu 24.04 (noble), Architecture: ARM64, 이름: ubuntu

머신 생성은 수십 초 내에 완료되었다.

```bash
# macOS 터미널에서 진입
orb

# 머신 목록 확인
orb list
# NAME    STATE    DISTRO   VERSION   ARCH    SIZE
# ubuntu  running  ubuntu   noble     arm64   8.3GB
```

**UTM과의 비교:**

| 항목 | UTM | OrbStack Linux Machine |
|------|-----|------------------------|
| 설치 난이도 | 중 (ISO 직접 설정) | 하 (클릭 몇 번) |
| 파일 공유 | 수동 VirtFS 설정 | `/mac/...` 경로로 자동 마운트 |
| 포트포워딩 | 수동 설정 | 자동 (macOS localhost로 즉시 접근) |
| Docker | VM 내 별도 설치 필요 | OrbStack 소켓 공유로 즉시 사용 |
| VS Code SSH | IP 직접 지정, 재시작 시 변동 | `orb` 호스트 고정, 즉시 연결 |
| 성능 기반 | QEMU 에뮬레이션 | Virtualization.framework (네이티브급) |
| VM 기동 속도 | 체감상 느림 | 빠름 |

### 개발 환경 구성

OrbStack Linux Machine 내에서 개발에 필요한 도구를 설치하였다.

```bash
# 패키지 목록 업데이트
sudo apt-get update && sudo apt-get upgrade -y

# Node.js 20 — nvm을 통해 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20
node -v   # v20.20.2
npm -v    # 10.8.2

# git
sudo apt-get install -y git
git --version  # git version 2.43.0
```

**VS Code Remote SSH 연결:**
1. VS Code → Extensions → `Remote - SSH` 설치
2. `Cmd+Shift+P` → `Remote-SSH: Connect to Host`
3. 호스트: `orb` 입력
4. 연결 후 Linux 머신 내 파일을 VS Code에서 직접 편집 가능

파일 공유 확인:
```bash
# macOS /Users/tom/Desktop/projects/khunnect 경로가
# Linux 머신 안에서도 동일하게 접근됨
ls /mac/Users/tom/Desktop/projects/khunnect
```

### 리눅스 환경 적응 — 파일 시스템 구조

macOS와 달리 Linux는 파일 시스템 구조가 FHS(Filesystem Hierarchy Standard)에 따라 명확히 정의되어 있다. 초기에는 `/usr`, `/var`, `/etc` 등의 역할이 명확히 구분되지 않아 혼란이 있었으나, 실제 개발 과정에서 각 디렉토리를 직접 활용하면서 구조를 익히게 되었다.

```
/
├── bin/        # 기본 실행 파일 (ls, cp, mv 등)
├── etc/        # 시스템 설정 파일 (apt 소스, SSH 설정 등)
├── home/       # 사용자 홈 디렉토리 (/home/tom)
├── usr/        # 사용자 설치 프로그램 (/usr/bin, /usr/local)
├── var/        # 가변 데이터 (로그, 캐시, DB 파일)
├── tmp/        # 임시 파일 (재시작 시 삭제)
├── proc/       # 프로세스 정보 (커널이 동적으로 생성)
└── sys/        # 시스템 및 하드웨어 정보
```

프로젝트 진행 중 실제로 접근한 주요 경로:
- `/etc/apt/sources.list` — 패키지 저장소 설정
- `/var/log/` — 서비스 로그 확인
- `/usr/local/bin/` — kubectl, minikube 설치 위치

### 패키지 관리 — apt

macOS의 Homebrew에 대응하는 Ubuntu의 패키지 관리자는 `apt`이다.

```bash
# 패키지 검색
apt search nginx

# 설치
sudo apt-get install -y nginx

# 설치된 패키지 확인
dpkg -l | grep nginx

# 패키지 제거
sudo apt-get remove nginx

# 불필요한 의존성 제거
sudo apt-get autoremove
```

Homebrew와의 가장 큰 차이는 **`sudo`가 요구된다는 점**이다. Homebrew는 사용자 공간에 설치하는 반면, apt는 시스템 경로(`/usr/bin`, `/etc`)에 직접 설치하기 때문에 관리자 권한이 필요하다.

### bash 쉘 주요 패턴

프로젝트 진행 중 실제로 활용한 bash 패턴들을 정리하였다.

**heredoc — 여러 줄 텍스트를 파일에 직접 작성:**
```bash
# 텍스트 편집기가 설치되지 않은 환경에서 .env 파일 생성
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://zmlldljddwcjvbnumwfi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
EOF
```
`<< 'EOF'`에서 따옴표가 중요하다. 따옴표를 생략하면 `$변수`가 먼저 해석되어 환경변수 값이 의도치 않게 치환된다.

**파이프라인 — 명령어 결과를 다음 명령어로 전달:**
```bash
# kubectl 최신 버전 번호를 curl로 조회하여 경로에 즉시 사용
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"

# 로그에서 에러 항목만 필터링
kubectl logs frontend-pod | grep -i error
```

**eval — 다른 명령어의 출력을 현재 쉘 세션에 적용:**
```bash
eval $(minikube docker-env)
# minikube docker-env가 출력하는 export 구문들을 현재 쉘에 즉시 적용
# 이후 docker 명령이 minikube 내부 daemon을 가리키게 됨
```
`minikube docker-env`를 단독으로 실행하면 `export DOCKER_HOST=...` 형태의 텍스트가 출력된다. `eval`은 해당 텍스트를 쉘 명령으로 그대로 실행시키는 역할을 한다.

**파일 퍼미션:**
```bash
# 실행 권한 부여 (kubectl, minikube 설치 시 적용)
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
# -o root : 소유자를 root로 지정
# -g root : 그룹을 root로 지정
# -m 0755 : 권한을 rwxr-xr-x로 설정 (소유자 읽기/쓰기/실행, 나머지 읽기/실행)
```

### VS Code Remote SSH 개발 환경

OrbStack과 VS Code Remote SSH를 조합한 개발 흐름은 다음과 같다.

```
macOS VS Code → SSH → OrbStack Linux → 파일 수정
                                         ↓
                                        HMR
                                         ↓
                               macOS 브라우저 자동 반영
```

Vite HMR(Hot Module Replacement)이 Linux 환경에서도 정상적으로 동작하였다. 단, inotify 파일 감시 한도가 기본값으로 설정된 경우 Vite가 파일 변경을 감지하지 못하는 문제가 발생할 수 있어 아래와 같이 조정하였다.

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 2주차 — Vite

> **소프트웨어 2/8:** Vite — 프론트엔드 빌드 도구 및 개발 서버  
> 컨테이너에 담을 "결과물"을 만들어내는 단계. 이후 모든 배포의 입력이 된다.

### Vite의 역할

Khunnect 프론트엔드는 **React 19 + TypeScript** 기반이며, 빌드 도구로 **Vite 8**을 사용하였다. Vite는 두 가지 역할을 한다.

```
개발 시  — 개발 서버 + HMR(Hot Module Replacement)
           파일 저장 시 변경된 모듈만 즉시 교체 → 브라우저 즉시 반영
프로덕션 — 번들러
           TypeScript 컴파일 + 모듈 묶음 + 최적화 → /dist 정적 파일 생성
```

Vite 8은 기존 esbuild/Rollup 조합에서 **Rolldown**(Rust 기반 번들러)으로 전환되어 빌드 속도가 개선되었다. OrbStack Linux Machine에서 개발 서버 콜드 스타트는 약 541ms로 측정되었다.

```bash
cd frontend && npm run dev     # 개발 서버 — http://localhost:5173
cd frontend && npm run build   # 타입 체크 + 프로덕션 빌드 → dist/
```

`npm run build`는 `tsc -b && vite build`로 구성되어, **타입 오류가 있으면 빌드가 중단**된다. 이는 타입 안정성을 배포 이전 단계에서 강제하는 안전장치 역할을 한다.

### 빌드 최적화 — 벤더 청크 분리

단일 번들로 출력할 경우 라이브러리와 애플리케이션 코드가 한 파일에 묶여, 앱 코드만 수정해도 사용자가 전체 번들을 다시 내려받아야 한다. 이를 방지하기 위해 `vite.config.ts`의 `manualChunks`로 자주 바뀌지 않는 라이브러리를 별도 청크로 분리하였다.

```ts
// vite.config.ts — Rolldown은 manualChunks를 함수 형태로만 허용
manualChunks: (id: string) => {
  if (id.includes('node_modules/react')) return 'vendor-react'
  if (id.includes('@tanstack/react-router')) return 'vendor-router'
  if (id.includes('@tanstack/react-query')) return 'vendor-query'
  if (id.includes('@supabase')) return 'vendor-supabase'
}
```

> ⚠️ Vite 8(Rolldown)에서 `manualChunks`를 객체 형태로 작성하면 타입 오류가 발생한다. 반드시 함수 형태로 작성해야 한다.

라이브러리는 한 번 캐시되면 앱 코드를 수정해도 다시 받지 않으므로, 재배포 시 사용자가 내려받는 용량이 최소화된다.

### 코드 스플리팅 — 페이지 지연 로딩

모든 페이지 컴포넌트를 `React.lazy()`로 동적 import하고 `Suspense`로 감싸, 첫 진입 시 필요한 페이지만 로드되도록 하였다.

```tsx
const LandingPage = React.lazy(() => import('../pages/LandingPage'))
// 사용자가 해당 라우트에 진입할 때 비로소 청크를 내려받음
```

**빌드 결과:**
```
✓ 234 modules transformed
✓ 19 chunks — 최대 청크 195.90 kB (vendor-supabase)
✓ TypeScript 오류 0 / 경고 0
```

페이지별·벤더별로 청크가 분리되어, 초기 로딩에 불필요한 코드가 포함되지 않는다.

## 3주차 — Docker

> **소프트웨어 3/8:** Docker — 애플리케이션 컨테이너화 도구  
> Vite가 만든 정적 결과물을 어디서나 동일하게 실행되는 이미지로 패키징한다.

### Docker 개요

Docker는 애플리케이션과 그 실행 환경을 **이미지(Image)** 라는 단위로 패키징하는 컨테이너 도구이다.

```
이미지 (Image)       — 실행 환경의 스냅샷. 읽기 전용.
컨테이너 (Container) — 이미지를 기반으로 실행된 인스턴스. 종료 시 변경 사항은 사라짐.
레지스트리 (Registry) — 이미지를 저장하고 배포하는 저장소 (Docker Hub 등)
```

이미지는 클래스(Class), 컨테이너는 인스턴스(Instance)에 비유할 수 있다.

**OrbStack에서의 Docker 소켓 공유:**  
OrbStack Linux Machine 내에서 `docker ps`를 실행하면 별도 설치 없이 즉시 동작한다. 이는 OrbStack이 macOS의 Docker 소켓(`/var/run/docker.sock`)을 Linux Machine 내부로 공유하기 때문이다.

```bash
docker ps         # 즉시 동작
docker images     # 이미지 목록 확인
which docker      # /usr/bin/docker
```

### 멀티스테이지 빌드 적용

Khunnect 프론트엔드를 Docker 이미지로 패키징하는 과정에서 **멀티스테이지 빌드**를 적용하였다.

단일 스테이지로 이미지를 구성할 경우 Node.js 런타임과 node_modules가 모두 포함되어 이미지 크기가 불필요하게 커진다. 멀티스테이지 빌드는 빌드 환경과 실행 환경을 분리하여 이 문제를 해소한다.

```dockerfile
# frontend/Dockerfile

# ── Stage 1: 빌드 ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일만 먼저 복사하여 레이어 캐시를 활용
# package.json이 변경되지 않으면 npm ci를 재실행하지 않음
COPY package*.json ./
RUN npm ci

# 소스 복사 후 빌드 실행
COPY . .
RUN npm run build
# → /app/dist 에 정적 파일 생성

# ── Stage 2: 서빙 ──────────────────────────────────────
FROM nginx:alpine

# 빌더 스테이지의 /app/dist 만 복사
# Node.js, node_modules는 최종 이미지에 포함되지 않음
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**빌드 결과:**
```bash
docker build -t khunnect-frontend:latest ./frontend
docker images khunnect-frontend
# REPOSITORY            TAG       IMAGE ID       SIZE
# khunnect-frontend     latest    a1b2c3d4e5f6   94.1MB
```

Node.js와 node_modules를 포함하였을 경우 600MB 이상이 되었을 이미지가 nginx만 포함함으로써 **94.1MB**로 축소되었다.

**실행 확인:**
```bash
docker run -p 3000:80 khunnect-frontend:latest
curl -I http://localhost:3000
# HTTP/1.1 200 OK
```

### 레이어 캐시 전략

Dockerfile의 각 명령은 하나의 레이어를 구성한다. 변경이 발생한 레이어부터 이하 모든 레이어가 재실행되므로, 변경 빈도가 낮은 명령을 상단에 배치하는 것이 빌드 속도 최적화에 중요하다.

```dockerfile
# ❌ 비효율적인 순서
COPY . .          # 소스 변경 시 이 레이어부터 재실행
RUN npm ci        # 소스만 변경되어도 npm ci가 재실행됨

# ✅ 캐시를 활용하는 순서
COPY package*.json ./   # package.json 변경 시에만 아래 레이어 재실행
RUN npm ci              # 대부분의 경우 캐시 활용
COPY . .                # 소스 변경이 npm ci에 영향을 주지 않음
```

소스 파일만 수정하고 재빌드 시 다음과 같이 캐시가 활용됨을 확인할 수 있다.
```
Step 4/7 : RUN npm ci
 ---> Using cache
Step 5/7 : COPY . .
 ---> ...
```

## 4주차 — nginx

> **소프트웨어 4/8:** nginx — 고성능 웹 서버  
> Docker 멀티스테이지 빌드의 최종 스테이지로서, Vite가 생성한 정적 파일을 사용자에게 서빙한다.

### nginx의 역할

3주차 멀티스테이지 빌드의 2단계에서 `nginx:alpine` 이미지를 사용하였다. Vite가 생성한 `/dist`의 정적 파일을 nginx가 HTTP로 서빙한다.

```dockerfile
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- `/usr/share/nginx/html` — nginx의 기본 정적 파일 루트. 여기에 빌드 결과를 복사
- `daemon off;` — nginx를 포그라운드로 실행. 컨테이너는 메인 프로세스가 종료되면 함께 종료되므로, 데몬화하지 않고 포그라운드로 띄워야 한다

### 왜 nginx인가

React 앱을 서빙하는 방법은 여러 가지가 있으나(예: Node.js `serve` 패키지), 정적 파일 서빙에는 nginx가 적합하다.

| 방식 | 특징 |
|------|------|
| Node.js `serve` | Node 런타임 상주 필요, 메모리 사용 큼 |
| **nginx** | C 기반 경량 서버, 정적 파일 서빙에 최적화, 메모리 사용 적음 |

특히 `nginx:alpine`은 Alpine Linux 기반으로 이미지가 작아, 최종 이미지를 **94.1MB**로 유지하는 데 기여하였다. Node 런타임을 포함했다면 600MB 이상이 되었을 것이다.

### SPA 클라이언트 라우팅 고려사항

Khunnect는 TanStack Router의 클라이언트 사이드 라우팅을 사용한다. 이 경우 `/explore`와 같은 하위 경로로 **직접 접근하거나 새로고침**하면, nginx 기본 설정은 해당 경로의 실제 파일을 찾지 못해 404를 반환한다. 실제 파일은 `index.html` 하나뿐이고 라우팅은 브라우저에서 처리되기 때문이다.

이를 해소하려면 존재하지 않는 경로를 `index.html`로 폴백하는 설정이 필요하다.

```nginx
# 적용 예정 — nginx.conf
location / {
    try_files $uri $uri/ /index.html;
}
```

> 현재 이미지는 nginx 기본 설정을 사용하므로, 위 `try_files` 폴백 적용은 후속 개선 과제로 식별해 두었다.

### 일관된 서빙 계층

동일한 nginx 이미지가 **로컬 Docker → Kubernetes → 시놀로지** 전 배포 단계에서 동일하게 동작하였다. 컨테이너 내부 포트(80)는 환경마다 다른 외부 포트로 매핑되었다.

| 환경 | 외부 포트 매핑 |
|------|----------------|
| 로컬 Docker | `3000:80` |
| Kubernetes (NodePort) | `30080 → 80` |
| 시놀로지 | `8080:80` |

서빙 계층이 환경과 무관하게 동일하다는 점이 컨테이너 기반 배포의 핵심 이점임을 확인하였다.

```bash
curl -I http://localhost:3000
# HTTP/1.1 200 OK
# Server: nginx/1.31.1
```

## 5주차 — Kubernetes

> **소프트웨어 5/8:** Kubernetes (minikube) — 컨테이너 오케스트레이션 도구  
> 단일 컨테이너 실행을 넘어, 선언적 정의로 컨테이너를 관리·복구하는 단계이다.

### Kubernetes 도입 배경

Docker만으로도 컨테이너를 실행할 수 있다. 그러나 단독 운용 시에는 컨테이너가 종료되었을 때 수동으로 재시작해야 하며, 다수의 서버에 분산 배포하기 어렵다는 한계가 있다.

```
Docker 단독 운용:
  - 컨테이너를 개별적으로 수동 실행
  - 컨테이너 종료 시 수동 재시작 필요
  - 다수 서버 분산 배포 어려움

Kubernetes 적용 시:
  - 원하는 상태를 YAML로 선언적 정의
  - 컨테이너 종료 시 자동 재시작
  - 다수 노드에 자동 분산 배포
  - 롤링 업데이트 및 롤백 지원
```

본 과제에서는 로컬 환경에서 minikube를 통해 Kubernetes를 경험하였다.

### minikube 설치 — ARM64 아키텍처 주의

초기 설치 과정에서 아키텍처 불일치 문제가 발생하였다.

```bash
# ❌ 잘못된 설치 — x86_64(amd64) 바이너리 사용
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start
# OrbStack ERROR: Dynamic loader not found: /lib64/ld-linux-x86-64.so.2
```

OrbStack Linux Machine은 **ARM64(aarch64)** 아키텍처로 동작한다. amd64 바이너리는 ARM64 환경에서 실행이 불가능하다.

```bash
# 아키텍처 확인
uname -m
# aarch64

# ✅ ARM64 바이너리로 재설치
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-arm64
sudo install minikube-linux-arm64 /usr/local/bin/minikube
minikube version
# minikube version: v1.38.1
```

kubectl 역시 동일하게 ARM64 바이너리를 사용해야 한다.
```bash
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
# Client Version: v1.36.1
```

### Kubernetes 핵심 개념

```
Pod        — 컨테이너를 감싸는 가장 작은 배포 단위. 동일 Pod 내 컨테이너는 localhost로 통신.
Deployment — Pod를 관리하는 컨트롤러. 지정된 replicas 수를 유지하며, Pod 종료 시 자동 재생성.
Service    — Pod에 대한 네트워크 엔드포인트. Pod IP는 변동될 수 있으나 Service IP는 고정.
```

```
외부 요청
    ↓
Service (NodePort: 30080)
    ↓
Deployment
    ↓
Pod (컨테이너 실행 중)
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
  replicas: 1                    # Pod 1개 유지
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
          imagePullPolicy: Never  # 외부 레지스트리 대신 로컬 이미지 사용
          ports:
            - containerPort: 80
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
      nodePort: 30080            # 외부 접근 포트 (30000~32767 범위)
```

### ImagePullBackOff 문제 해결

배포 과정에서 두 번째 주요 문제가 발생하였다.

```bash
# ❌ eval 없이 빌드한 경우
docker build -t khunnect-frontend:latest ./frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl get pods
# NAME                       READY   STATUS             RESTARTS
# frontend-66d67df987-kmdgm  0/1     ImagePullBackOff   0
```

`ImagePullBackOff`는 Kubernetes가 지정된 이미지를 찾지 못할 때 발생하는 오류이다.  
원인은 minikube가 호스트와 **별개의 Docker daemon**을 사용하기 때문이다.

```
호스트 Docker daemon     ← eval 없이 빌드 시 이미지가 여기에 저장됨
         ≠
minikube Docker daemon   ← kubectl이 이미지를 여기서 탐색함
```

해결 방법은 `eval $(minikube docker-env)`를 통해 현재 쉘 세션의 Docker 명령이 minikube 내부 daemon을 가리키도록 전환하는 것이다.

```bash
eval $(minikube docker-env)
docker build -t khunnect-frontend:latest ./frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl get pods
# NAME                       READY   STATUS    RESTARTS
# frontend-66d67df987-kmdgm  1/1     Running   0        ✅
```

### 배포 결과 확인

```bash
kubectl get services
# NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
# frontend-service   NodePort    10.100.172.220   <none>        80:30080/TCP   0s

minikube service frontend-service --url
# http://192.168.49.2:30080

curl -I http://192.168.49.2:30080
# HTTP/1.1 200 OK
# Server: nginx/1.31.1
```

Kubernetes 클러스터 위에서 nginx가 React 앱을 정상적으로 서빙하고 있음을 확인하였다.

## 6주차 — Supabase

> **소프트웨어 6/8:** Supabase — PostgreSQL 기반 서버리스 백엔드(BaaS)  
> 별도 API 서버 없이 인증·DB·접근제어를 프론트엔드에서 직접 활용하는 단계이다.

### Supabase 도입 배경

별도의 Express/Node.js 백엔드 서버를 구축하는 방식은 프로토타입 단계에서 학습 부담이 크다. Supabase는 PostgreSQL 데이터베이스, 인증(Auth), 파일 저장소, RLS(Row Level Security)를 하나의 서비스로 제공하여 별도 API 서버 없이 프론트엔드에서 직접 DB를 활용할 수 있다.

```
일반적인 풀스택 구성:
React → Express API 서버 → PostgreSQL

Supabase 적용 시:
React → Supabase JS SDK → PostgreSQL
                          (Auth 내장, RLS로 접근 제어)
```

### 클라이언트 초기화

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

환경변수는 `frontend/.env` 파일에서 관리하며, Vite는 `VITE_` 접두사가 붙은 변수만 클라이언트에 노출한다.

> ⚠️ `service_role` 키는 RLS를 무시하고 전체 데이터에 접근할 수 있는 관리자 키로,  
> 프론트엔드 코드에 절대 포함시켜서는 안 된다.

### DB 스키마 설계

```
colleges (단과대학)
  └── departments (학과, has_tracks 여부)
        └── tracks (트랙 — 소프트웨어융합학과는 4개 트랙)

auth.users (Supabase Auth 내장)
  └── profiles (id, name, email, role: student|alumni)
        └── user_majors (입학년도, 졸업년도, 전공 유형)

course_catalog (과목 카탈로그 — 학과별 전공기초/필수/선택)
  └── checked_courses (사용자가 체크한 과목 — UNIQUE 제약)

curriculum_requirements (졸업 요건 학점 — 학과별)
bookmarks (선배 북마크 — Phase 3)
```

### RLS(Row Level Security) 설계

RLS는 PostgreSQL의 기능으로, **행(Row) 단위로 접근 권한을 제어**한다. 프론트엔드에서 DB에 직접 접근하더라도 본인 데이터만 읽고 쓸 수 있도록 보장한다.

```sql
-- profiles: 본인 데이터만 조회 및 수정 가능
CREATE POLICY "own profile select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "own profile update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- checked_courses: 본인 데이터만 INSERT/DELETE 가능
CREATE POLICY "own checked courses" ON checked_courses
  FOR ALL USING (auth.uid() = user_id);

-- course_catalog: 인증 없이도 누구나 조회 가능
CREATE POLICY "public read catalog" ON course_catalog
  FOR SELECT USING (true);
```

`auth.uid()`는 현재 로그인한 사용자의 UUID를 반환하는 Supabase 내장 함수이다. 이를 활용함으로써 애플리케이션 코드 레벨에서 별도의 권한 체크 로직을 작성하지 않아도 된다.

### 낙관적 업데이트 패턴

커리큘럼 페이지에서 과목 체크박스를 클릭하면 Supabase에 즉시 저장된다. DB 응답을 기다리는 방식은 UI가 멈춘 것처럼 보이는 문제가 발생하므로, **낙관적 업데이트(Optimistic Update)** 패턴을 적용하였다.

```typescript
const toggleCourse = (courseId: string, isChecked: boolean) => {
  // 1. UI를 먼저 즉시 업데이트 (낙관적 처리)
  queryClient.setQueryData<string[]>(['checked_courses', user?.id], (prev = []) =>
    isChecked
      ? prev.filter(id => id !== courseId)  // 체크 해제
      : [...prev, courseId]                  // 체크
  )

  // 2. 백그라운드에서 DB에 반영
  if (isChecked) {
    supabase.from('checked_courses')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId)
  } else {
    supabase.from('checked_courses')
      .insert({ user_id: user.id, course_id: courseId })
  }
}
```

UI가 먼저 변경되고 DB는 백그라운드에서 동기화되므로, 사용자 입장에서 응답이 즉각적으로 느껴진다.

### 중첩 JOIN 쿼리

Supabase JS SDK는 PostgreSQL의 외래 키 관계를 활용하여 JOIN을 간결하게 표현한다.

```typescript
// user_majors → departments 조인 (학과명 조회)
const { data } = await supabase
  .from('user_majors')
  .select('admission_year, departments(name)')
  .eq('user_id', userId)
  .eq('type', 'major')
  .single()

// checked_courses → course_catalog 조인 (수강 완료 과목 상세 조회)
const { data } = await supabase
  .from('checked_courses')
  .select('course_catalog(id, name, code, credits, type)')
  .eq('user_id', userId)
```

SQL로 표현하면 여러 줄에 걸쳐야 하는 JOIN 쿼리가 한 줄로 간결하게 처리된다.

## 7주차 — Synology DSM

> **소프트웨어 7/8:** Synology DSM (DiskStation Manager) — Linux 기반 NAS 운영체제  
> 가상 환경을 넘어, 보유 중인 실물 NAS를 자가 배포 서버로 운영하는 단계이다.

### 시놀로지 NAS와 Linux

시놀로지(Synology) NAS에는 **DSM(DiskStation Manager)** 이라는 운영체제가 탑재되어 있다. DSM은 Linux 커널 기반으로 구성되어 있으며, SSH로 접속하면 Linux 환경을 그대로 활용할 수 있다.

```bash
uname -a
# Linux [장비명] 3.10.108 #72806 SMP Mon Jul 21 23:11:43 CST 2025 x86_64 GNU/Linux synology_braswell_216+II
```

| 항목 | 값 |
|------|-----|
| 커널 버전 | 3.10.108 |
| 아키텍처 | x86_64 |
| 플랫폼 | synology_braswell_216+II |

여기서 주목할 점은 아키텍처가 **x86_64**라는 것이다. 개발 환경인 OrbStack Linux Machine이 ARM64였던 것과 달리 시놀로지는 x86_64이며, 이 차이는 이후 Docker 이미지 빌드 시 핵심적인 고려사항이 되었다.

### 하드웨어 스펙 확인 — 배포 서버 적합성 검증

배포 서버로 활용하기에 앞서 하드웨어 사양을 점검하였다.

```bash
cat /proc/cpuinfo | grep "model name" | head -1   # Intel Celeron N3060
nproc                                              # 2
free -h                                            # 총 7.7GB / 여유 6.3GB
df -h                                              # 3.5TB 중 2.5TB 여유
```

| 항목 | 실측값 |
|------|--------|
| CPU | Intel Celeron N3060 듀얼코어 1.6GHz |
| RAM | 7.7GB (여유 6.3GB) |
| 디스크 | 2.5TB 여유 |

정적 파일을 nginx로 서빙하는 프론트엔드(이미지 94MB)를 운용하기에 충분하고도 남는 사양임을 확인하였다. 다만 빌드 부하와 운영 안정성을 고려하여, 실제 빌드는 클라우드(GitHub Actions)에서 수행하고 시놀로지는 완성된 이미지의 실행만 담당하는 구조를 지향하기로 하였다.

### SSH 보안 강화

서버를 네트워크에 노출하기에 앞서, SSH 접속 보안을 다단계로 강화하였다. 서버 운영에서 SSH는 가장 빈번한 공격 대상이므로, 다음 네 개 계층을 순차적으로 적용하였다.

**1계층 — 포트 변경:**  
SSH 기본 포트(22)는 전 세계 자동화 봇의 상시 스캔 대상이다. DSM 제어판 → 터미널 및 SNMP에서 SSH 포트를 비표준 포트로 변경하여 자동 스캔의 대부분을 회피하였다.

**2계층 — 키 인증 전환:**  
비밀번호 인증은 무차별 대입(brute force) 공격에 취약하다. ed25519 키 쌍을 생성하여 공개 키를 시놀로지에 등록하였다.

```bash
# 맥북에서 키 생성
ssh-keygen -t ed25519 -C "synology"

# 공개 키를 시놀로지에 등록
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p [포트번호] [계정명]@[내부IP]
```

키를 등록한 뒤에도 접속 시 계속 비밀번호를 요구하는 문제가 발생하였다. 원인은 홈 디렉토리와 `.ssh` 디렉토리의 권한이 느슨할 경우 SSH 서버가 보안상 키 인증을 거부하기 때문이었다. 권한을 조정하여 해결하였다.

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 755 ~        # 홈 디렉토리의 group/other 쓰기 권한 제거
```

**3계층 — 비밀번호 로그인 비활성화:**  
키 인증이 정상 동작함을 확인한 뒤, 비밀번호 인증을 완전히 비활성화하여 무차별 대입 공격을 원천 차단하였다.

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo synosystemctl restart sshd
```

검증 결과 키 인증은 비밀번호 없이 정상 접속되었고, 비밀번호를 강제하는 접속 시도(`-o PreferredAuthentications=password`)는 `Permission denied (publickey)`로 차단됨을 확인하였다.

> ⚠️ 비밀번호 비활성화 작업 시에는 기존 SSH 세션을 유지한 채 별도 창에서 접속을 검증해야 한다. 키 인증에 문제가 생기더라도 살아있는 세션에서 즉시 롤백할 수 있기 때문이다.

**4계층 — 방화벽 및 자동 차단:**  
DSM 방화벽으로 SSH 접근 범위를 제한하였다. 방화벽 규칙은 위에서 아래로 검사되어 먼저 일치하는 규칙이 적용되므로 규칙 순서가 중요하다. 내부 네트워크 서브넷을 허용 규칙으로 등록하고, SSH 포트를 전역 개방하던 불필요한 규칙을 제거하여 외부 도달 범위를 축소하였다. 아울러 보호 기능의 자동 차단을 활성화하여, 단시간 내 반복적으로 로그인에 실패한 IP가 자동 차단되도록 설정하였다.

> 방화벽이 활성화된 상태에서 허용 규칙이 없으면 같은 네트워크에서도 `Operation timed out`이 발생한다. 초기 접속 실패의 원인이 바로 이 방화벽 규칙 누락이었다.

### Container Manager로 Docker 운용

시놀로지에서 Docker는 **Container Manager** 패키지(구 Docker, DSM 7.2부터 명칭 변경)를 통해 제공된다. DSM 패키지 센터에서 설치한 후 동작을 확인하였다.

```bash
sudo docker --version        # Docker version 24.0.2
sudo docker run hello-world  # 정상 동작
```

hello-world 실행 로그에 표시된 `(amd64)`를 통해 시놀로지가 x86_64 아키텍처임을 재확인하였다. 이는 맥북(ARM64)에서 빌드한 이미지를 그대로 실행할 수 없으며, amd64 타겟으로 빌드해야 함을 의미한다.

### 첫 배포 — 코드 전송과 이미지 빌드

시놀로지에 git이 설치되어 있지 않아, 맥북의 코드를 직접 전송하는 방식을 택하였다. 처음에는 rsync를 시도하였으나 macOS 기본 rsync 구현(openrsync)의 `-e` 옵션 처리 문제로 인증 단계에서 실패하여, 이미 검증된 SSH 통로를 그대로 활용하는 **tar 파이프 방식**으로 우회하였다.

```bash
# 맥북에서 — frontend 폴더를 압축하여 SSH로 전송, 시놀로지에서 해제
cd /path/to/khunnect
tar czf - --exclude='node_modules' --exclude='dist' --exclude='.git' frontend \
  | ssh -p [포트번호] [계정명]@[내부IP] \
    'rm -rf khunnect-frontend && mkdir -p khunnect-frontend && tar xzf - -C khunnect-frontend --strip-components=1'
```

전송 후에는 macOS가 동봉하는 메타데이터 파일(`._*`, `.DS_Store`)을 정리하였다. 이 파일들을 방치하면 `._App.tsx`와 같은 항목이 빌드 시 TypeScript 컴파일러에 잡혀 오류를 유발할 수 있다.

```bash
ssh -p [포트번호] [계정명]@[내부IP] \
  'cd khunnect-frontend && { find . -name "._*" -delete; find . -name ".DS_Store" -delete; }'
```

이후 시놀로지에서 직접 이미지를 빌드하였다. 시놀로지가 x86_64 네이티브이므로 크로스 컴파일 문제 없이 빌드가 진행되었으며, `.env`는 `COPY . .` 단계에서 함께 복사되어 빌드 시 Supabase 환경변수가 주입되었다.

```bash
# 시놀로지에서
cd khunnect-frontend
sudo docker build -t khunnect-frontend:latest .   # tsc + vite build 정상 완료

sudo docker run -d --name khunnect -p 8080:80 --restart unless-stopped khunnect-frontend:latest
curl -I http://localhost:8080   # HTTP/1.1 200 OK (nginx/1.31.1)
```

`--restart unless-stopped` 옵션으로 시놀로지 재부팅 시에도 컨테이너가 자동 재시작되도록 하였다. 맥북 브라우저에서 `http://[내부IP]:8080`으로 접속하여 khunnect 랜딩 페이지가 정상 출력됨을 확인함으로써 첫 자가 서버 배포를 완료하였다.

이 과정에서 curl로는 정상 접속되나 브라우저에서는 `ERR_ADDRESS_UNREACHABLE`이 발생하는 문제가 있었다. 원인은 로컬에 설치된 보안 프로그램의 프록시가 내부 IP 접근을 가로챈 것으로, curl은 시스템 프록시를 경유하지 않아 정상 동작한 반면 브라우저는 프록시 설정을 따랐기 때문이었다. 이는 자가 서버 운영 시 접속 실패의 원인이 서버가 아닌 클라이언트 측 네트워크 설정에 있을 수 있음을 보여주는 사례였다.

### 외부 노출 — HTTPS (계획)

현재는 내부망(`http://[내부IP]:8080`)에서만 접속 가능하다. 외부에서 도메인으로 접근하기 위한 단계는 DSM 기능을 활용하여 다음과 같이 계획한다.

1. **고정 내부 IP** — 공유기 DHCP에서 시놀로지 MAC에 IP 고정 (재부팅 후에도 내부 IP 유지)
2. **DDNS** — DSM → 외부 액세스 → DDNS에서 `[DDNS도메인].synology.me` 발급. 공인 IP가 변동되어도 고정 도메인 유지
3. **포트포워딩** — 공유기에서 외부 443 포트를 시놀로지로 포워딩 (웹 서비스 전용. SSH 포트는 개방하지 않음)
4. **역방향 프록시** — DSM → 로그인 포털 → 고급 → 역방향 프록시
5. **Let's Encrypt 인증서** — DSM → 보안 → 인증서에서 DDNS 도메인 기준 무료 인증서 발급 및 자동 갱신

| 역방향 프록시 | 값 |
|------|-----|
| 소스 | HTTPS / `[DDNS도메인].synology.me` / 443 |
| 대상 | HTTP / localhost / 8080 |

위 구성을 완료하면 외부에서 `https://[DDNS도메인].synology.me`로 khunnect에 접근할 수 있으며, 앞서 발생한 브라우저 HTTPS 강제 전환 문제 또한 정식 인증서 적용으로 자연히 해소된다.

## 8주차 — GitHub Actions

> **소프트웨어 8/8:** GitHub Actions — CI/CD 자동화 플랫폼  
> push 한 번으로 빌드 검증과 배포를 잇는 단계. CI(빌드 검증)는 구축 완료, CD(자동 배포)는 계획 단계이다.

### CI — 빌드 검증 (구축 완료)

프로젝트 초기부터 운영 중인 CI 워크플로우는 코드 push 또는 PR 시 빌드 가능 여부를 자동 검증한다.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

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
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Type check & Build
        run: cd frontend && npm run build
      - name: Docker build
        run: docker build -t khunnect-frontend:latest ./frontend
```

main 브랜치 push 또는 PR 생성 시 세 단계가 순차 실행된다.

1. `npm ci` — lock 파일 기반 의존성 재현 설치
2. `npm run build` — TypeScript 컴파일 및 Vite 번들링 (타입 오류 시 중단)
3. `docker build` — 이미지 빌드 가능 여부 검증

이로써 빌드가 깨진 코드가 main에 병합되는 것을 사전에 차단한다.

### CD — 자동 배포 (계획)

> ⚠️ 이하 자동 배포는 계획 단계이며, 구현 완료 후 실측 결과로 갱신될 예정이다.

#### 배포 자동화 아키텍처 — outbound 방식

가정용 서버는 공유기 뒤에 위치하여 외부에서 직접 접근할 수 없다. 따라서 **시놀로지가 능동적으로 바깥에 접속하여 변경 사항을 가져오는(outbound)** 구조로 설계한다. 이 방식은 인바운드 포트를 추가로 개방하지 않으므로 7주차에서 강화한 SSH 보안을 그대로 유지한다.

```
맥북에서 git push (main)
    ↓
GitHub Actions (클라우드)
  - amd64 이미지 빌드
  - GitHub Container Registry(ghcr.io)에 push
    ↓
시놀로지의 Watchtower
  - ghcr.io를 주기적으로 확인 (outbound 연결)
  - 새 이미지 발견 시 pull → 컨테이너 자동 교체
    ↓
새 버전 라이브
```

빌드는 클라우드에서 수행되어 시놀로지 부하가 발생하지 않으며, 레지스트리에 이미지 이력이 축적되어 롤백이 용이하다. 이는 "빌드는 클라우드, 시놀로지는 실행만"이라는 운영 원칙에 부합한다.

### GitHub Actions 워크플로우 — 빌드 & 레지스트리 push

이미지를 클라우드에서 빌드하여 ghcr.io에 push하는 워크플로우를 구성할 계획이다. 빌드 시 주입되는 Supabase 환경변수는 GitHub Secrets로 관리한다.

**GitHub Secrets 등록** (Settings → Secrets and variables → Actions):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — 빌드 시점에 주입

```yaml
# .github/workflows/deploy.yml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write          # ghcr.io push 권한
    steps:
      - uses: actions/checkout@v4

      - name: Log in to ghcr.io
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push (amd64)
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          platforms: linux/amd64    # 시놀로지(x86_64) 실행용 타겟 명시
          push: true
          tags: ghcr.io/[사용자]/khunnect-frontend:latest
```

> `platforms: linux/amd64`를 명시하여, ARM64 개발 환경과 무관하게 시놀로지(x86_64)에서 실행 가능한 이미지를 생성한다.

### Watchtower로 자동 갱신

시놀로지에는 레지스트리의 새 이미지를 감지하여 컨테이너를 자동 교체하는 **Watchtower**를 상시 실행한다.

```bash
# 시놀로지에서 실행
sudo docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  khunnect
```

- `--interval 300` — 5분 주기로 레지스트리 확인
- 감시 대상을 `khunnect` 컨테이너로 한정
- 새 이미지 발견 시 자동 pull 후 동일 설정으로 컨테이너 재생성

이로써 맥북에서 `git push`만 수행하면, 클라우드 빌드 → 레지스트리 push → 시놀로지 자동 pull로 이어지는 무인 배포가 완성된다.

## 맺음말 — 트러블슈팅과 회고

### 트러블슈팅 사례 정리

과제 진행 중 발생한 주요 오류와 해결 방법을 정리하였다.

| 오류 | 원인 | 해결 방법 |
|------|------|-----------|
| `Dynamic loader not found: /lib64/ld-linux-x86-64.so.2` | ARM64 환경에 amd64 바이너리 설치 | ARM64 바이너리로 재설치 |
| `ImagePullBackOff` | minikube daemon이 아닌 호스트 daemon에 이미지를 빌드 | `eval $(minikube docker-env)` 실행 후 재빌드 |
| `position: sticky` 미작동 | 조상 요소에 `overflow: hidden` 속성 존재 | sticky 요소를 overflow 컨텍스트 외부로 이동 |
| Vite HMR 파일 감지 실패 | inotify watch 한도 초과 | `fs.inotify.max_user_watches=524288` 설정 |
| RLS 오류 시 빈 결과 반환 | RLS가 권한 없는 접근을 오류 대신 빈 결과로 처리 | Supabase 대시보드 → Logs에서 RLS 정책 검토 |
| heredoc 내 환경변수 치환 | `<< EOF` 사용 시 `$변수`가 즉시 해석됨 | `<< 'EOF'`로 변경하여 변수 해석 방지 |
| SSH `Operation timed out` (시놀로지) | DSM 방화벽에 SSH 포트 허용 규칙 부재 | 방화벽 프로파일에 해당 포트 허용 규칙 추가 |
| 키 등록 후에도 비밀번호 요구 | 홈/`.ssh` 디렉토리 권한이 느슨하여 SSH가 키 거부 | `chmod 700 ~/.ssh`, `600 authorized_keys`, `755 ~` |
| rsync `Permission denied` | macOS 기본 rsync(openrsync)의 `-e` 옵션 처리 문제 | tar 파이프(`tar czf - … \| ssh …`)로 우회 |
| 빌드 시 `._*.tsx` 컴파일 오류 | macOS tar의 AppleDouble 메타데이터 동봉 | 빌드 전 `find . -name "._*" -delete`로 정리 |
| curl은 되나 브라우저 `ERR_ADDRESS_UNREACHABLE` | 로컬 보안 프로그램 프록시가 내부 IP 접근 가로챔 (curl은 프록시 미경유) | 프록시/VPN 해제 또는 예외 처리 (`scutil --proxy` 확인) |

### Linux 개발 환경 총평

한 달간 OrbStack Linux Machine을 주 개발 환경으로 운용한 결과를 평가하면 다음과 같다.

**긍정적 측면:**
- 실제 서버 환경과 유사한 경험 — Docker, Kubernetes, 패키지 관리를 Linux 기준으로 습득하였다.
- OrbStack의 완성도 — 별도 설정 없이 파일 공유, 포트포워딩, Docker가 모두 정상 동작하였다.
- ARM64 아키텍처 경험 — 아키텍처에 따른 바이너리 선택의 중요성을 직접 체감하였다.
- 쉘 활용 능력 향상 — heredoc, eval, 파이프라인 등을 실제 문제 해결에 적용하였다.

**한계 및 아쉬운 점:**
- GUI 애플리케이션 실행 불가 — 브라우저 등 GUI가 필요한 작업은 macOS 환경으로 전환해야 한다.
- ARM64 생태계 제약 — 일부 도구가 ARM64를 미지원하거나 지원이 늦는 경우가 있다.
- 학습 비용 — macOS에서 당연하게 동작하던 환경이 Linux에서 작동하지 않을 때 원인을 파악하는 데 추가적인 시간이 소요되었다.

### 자가 서버 운영 경험

과제 후반부에서는 가상 개발 환경을 넘어, 실물 시놀로지 NAS를 배포 서버로 운영하였다. 이 과정에서 개발 환경만으로는 경험하기 어려운 실제 서버 운영의 과제들을 마주하였다.

- **보안의 실재성** — 개발 환경에서는 고려할 필요가 없던 SSH 무차별 대입 공격, 포트 노출, 인증 방식 등을 직접 다루었다. 포트 변경 → 키 인증 → 비밀번호 비활성화 → 방화벽으로 이어지는 다계층 방어를 구성하며, 보안이 단일 설정이 아니라 여러 계층의 누적임을 체감하였다.
- **아키텍처의 차이** — 개발 환경(ARM64)과 서버(x86_64)의 아키텍처 차이가 이미지 빌드 전략에 직접적인 영향을 미쳤다. 5주차 minikube에서 겪은 아키텍처 문제가 실제 배포 맥락에서 다시 반복된 사례였다.
- **환경 차이로 인한 변수** — git 미설치, macOS 메타데이터 파일 동봉, 로컬 보안 프로그램의 프록시 간섭 등 사전에 예상하기 어려운 변수들이 배포 과정에서 드러났다. 이를 진단하고 우회하는 과정 자체가 실서버 운영의 핵심 역량임을 알게 되었다.

가상 환경이 "리눅스를 배우는 공간"이었다면, 시놀로지는 "리눅스로 무언가를 운영하는 공간"이었다. 두 경험의 결합이 본 과제의 학습 밀도를 높였다고 평가한다.

### 기술 스택 선택 회고

| 기술 | 선택 이유 | 평가 |
|------|-----------|------|
| OrbStack | UTM 대비 뛰어난 macOS 연동성 | 만족. macOS 개발자가 Linux 환경을 경험하기에 최적의 도구이다. |
| Vite | 빠른 빌드 + HMR | Vite 8(Rolldown)으로 빌드가 빠르고, 벤더 청크 분리로 재배포 효율을 확보하였다. |
| Docker + 멀티스테이지 빌드 | 이미지 경량화 목적 | 600MB+ → 94MB로 축소. 레이어 캐시 전략이 빌드 속도에 큰 영향을 미친다. |
| nginx | 정적 파일 서빙 | 경량 이미지로 일관된 서빙 계층을 제공. SPA 라우팅 폴백은 후속 과제로 식별하였다. |
| Kubernetes (minikube) | 실제 운영 환경 경험 | Pod, Deployment, Service 개념을 습득하였으나 아직 표면적 수준이다. |
| Supabase | Auth + DB + RLS 통합 제공 | 소규모 프로젝트 프로토타이핑에 최적이다. |
| 시놀로지 NAS (DSM) | 보유 중인 실물 서버 활용 | DSM이 Linux 기반이라 본 과제와 학습 연속성이 높았다. SSH 보안 강화와 첫 자가 서버 배포까지 완료하였다. |
| GitHub Actions | CI 빌드 검증 자동화 | push 시 타입 체크·빌드·이미지 빌드 검증을 자동 수행한다. 시놀로지 배포 자동화(8주차 CD)는 계획 단계이다. |

### 남은 개발 로드맵

```
Phase 3  커리큘럼 탐색/필터 + 북마크 기능
Phase 4  커피챗 신청 시스템
Phase 5  실시간 채팅 (Supabase Realtime)
Phase 6  프로덕션 배포
         - Kubernetes Ingress + TLS 설정
         - 모니터링 구성 (Prometheus + Grafana)
         - 시놀로지 역방향 프록시 정식 연결
```

### 향후 심화 학습 계획

1. **Ingress + TLS** — NodePort 방식에서 Ingress Controller를 통한 실제 도메인 연결로 전환
2. **시놀로지 모니터링** — Portainer 또는 Grafana를 활용한 컨테이너 상태 시각화
3. **CI/CD 고도화** — 테스트 자동화 및 스테이징 환경 분리
4. **Kubernetes 심화** — ConfigMap, Secret, PersistentVolume 개념 학습 및 적용
5. **Linux 네트워킹** — iptables 및 방화벽 규칙의 코드 기반 관리

## 부록 — 자주 사용하는 명령어

### OrbStack

```bash
orb                    # Linux Machine 진입
orb shell ubuntu       # ubuntu 머신 진입
orb list               # 머신 목록 및 상태 확인
```

### 개발 서버

```bash
cd frontend && npm run dev    # http://localhost:5173
cd frontend && npm run build  # 타입 체크 및 빌드
```

### Docker

```bash
docker build -t khunnect-frontend:latest ./frontend
docker run -p 3000:80 khunnect-frontend:latest
docker images                # 이미지 목록
docker ps                    # 실행 중인 컨테이너 목록
docker logs <컨테이너명>      # 로그 확인
docker stop <컨테이너명>      # 컨테이너 정지
docker rm <컨테이너명>        # 컨테이너 삭제
```

### Kubernetes (minikube)

```bash
minikube start --driver=docker
eval $(minikube docker-env)                            # 반드시 먼저 실행
docker build -t khunnect-frontend:latest ./frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl get pods
kubectl get services
kubectl logs <pod명>
minikube service frontend-service --url
```

### 시놀로지

```bash
ssh -p [포트번호] [계정명]@[내부IP]                      # SSH 접속 (키 인증)
sudo docker ps                                          # 컨테이너 상태 확인
sudo docker logs khunnect --tail 50                     # 최근 50줄 로그 확인
sudo docker pull ghcr.io/[사용자]/khunnect-frontend     # 레지스트리에서 pull
```

### Git

```bash
git add .
git commit -m "커밋 메시지"
git push origin main          # push 시 GitHub Actions 자동 실행
```
