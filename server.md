# 시놀로지 서버 운용 기록

**장비**: Synology DS216+II  
**OS**: DSM 7.x (Linux 커널 3.10.108, x86_64)  
**플랫폼**: synology_braswell_216+II  
**시작일**: 2026년  

> ⚠️ IP, 포트, 계정명 등 민감 정보는 `[내부IP]`, `[포트번호]`, `[계정명]` 으로 마스킹

---

## 목차

1. [초기 보안 설정](#1-초기-보안-설정)
2. [SSH 접속](#2-ssh-접속)
3. [SSH 키 인증](#3-ssh-키-인증)
4. [Container Manager (Docker)](#4-container-manager-docker)
5. [네트워크 설정](#5-네트워크-설정)
6. [배포 파이프라인](#6-배포-파이프라인)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 초기 보안 설정

### 1-1. SSH 활성화 및 포트 변경 ✅

**DSM → 제어판 → 터미널 및 SNMP → 터미널 탭**

- SSH 서비스 활성화 체크
- 기본 포트 22 → 커스텀 포트로 변경

> 기본 22번 포트는 전 세계 자동화 봇의 스캔 대상이다.  
> 포트 번호를 변경하는 것만으로 자동화 공격의 대부분을 차단할 수 있다.

### 1-2. 방화벽 SSH 포트 허용 ✅

**DSM → 제어판 → 보안 → 방화벽 → 프로파일 탭 → 편집**

규칙 추가:

| 항목 | 값 |
|------|-----|
| 포트 | [포트번호] |
| 프로토콜 | TCP |
| 소스 IP | 모두 (추후 내부 네트워크로 제한 예정) |
| 작업 | 허용 |

> 방화벽이 활성화된 상태에서 허용 규칙을 추가하지 않으면  
> 같은 네트워크에서도 `Operation timed out` 오류가 발생한다.

### 1-3. 비밀번호 로그인 비활성화 ✅

키 인증이 정상 동작하는 것을 확인한 뒤, 비밀번호 로그인을 비활성화하여 무차별 대입 공격을 원천 차단하였다.

```bash
# 설정 파일 백업
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# 비밀번호 인증 비활성화
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# 확인
sudo grep PasswordAuthentication /etc/ssh/sshd_config
# → PasswordAuthentication no

# SSH 재시작 (기존 세션은 유지됨)
sudo synosystemctl restart sshd
```

검증 결과:

| 접속 방식 | 결과 |
|-----------|------|
| 키 인증 | ✅ 비밀번호 없이 접속 |
| 비밀번호 강제 (`-o PreferredAuthentications=password`) | ✅ `Permission denied (publickey)` — 차단 확인 |

> ⚠️ 작업 시 기존 SSH 세션을 닫지 말 것.
> 설정 변경 후 **새 창**에서 접속 테스트를 하고, 문제가 생기면 살아있는 기존 세션에서 즉시 롤백한다.
> 최악의 경우에도 DSM 웹 페이지에서 비밀번호 로그인을 다시 켤 수 있어 완전히 잠기지는 않는다.

### 1-4. 방화벽 규칙 정리 ✅

**DSM → 제어판 → 보안 → 방화벽 → 프로파일 → 편집**

방화벽 규칙은 위에서 아래로 순서대로 검사하고, 먼저 일치하는 규칙이 적용된다.
일치하는 규칙이 없으면 기본 거부(deny)된다.

최종 규칙 구성:

| 순서 | 포트 | 소스 IP | 작업 | 비고 |
|------|------|---------|------|------|
| 1 | 관리 UI 등 | 모두 | 허용 | DSM 서비스 |
| 2 | 모두 | 대한민국 | 허용 | 국내 IP 접근 허용 |
| 3 | 모두 | `[내부대역].1 ~ [내부대역].255` | 허용 | 내부망 전체 허용 |

**제거한 규칙:** `[포트번호](SSH) / TCP / 소스 모두 / 허용`
→ SSH 포트를 전 세계에 개방하던 규칙. 내부망(3번)·국내(2번)에서 이미 SSH 접근이 커버되므로 중복이었고,
한국 밖 해외 스캔만 유입시켜 불필요. 삭제하여 SSH 도달 범위를 **내부망 + 국내**로 축소하였다.

> 외부에서 SSH 접속이 필요해지면 포트를 직접 개방하지 말고 VPN을 경유하는 것이 정석.

### 1-5. 자동 차단 활성화 ✅

**DSM → 제어판 → 보안 → 보호 → 자동 차단**

| 항목 | 값 |
|------|-----|
| 자동 차단 | 활성화 |
| 로그인 실패 허용 | 5회 / 5분 |
| 효과 | 단시간 반복 로그인 실패 IP 자동 차단 (2차 방어선) |

---

## 2. SSH 접속

### 2-1. 최초 접속 ✅

```bash
ssh [계정명]@[내부IP] -p [포트번호]
# 처음 접속 시 fingerprint 확인 메시지 → yes 입력
# 비밀번호 입력 (입력 시 화면에 표시 안 됨 — 정상)
```

### 2-2. 시스템 정보 확인 ✅

```bash
uname -a
# Linux [장비명] 3.10.108 #72806 SMP Mon Jul 21 23:11:43 CST 2025 x86_64 GNU/Linux synology_braswell_216+II
```

| 항목 | 값 |
|------|-----|
| 커널 버전 | 3.10.108 |
| 아키텍처 | x86_64 |
| 빌드 날짜 | 2025년 7월 21일 |
| 플랫폼 | synology_braswell_216+II |

### 2-3. 하드웨어 스펙 (배포 서버 적합성 검증) ✅

```bash
cat /proc/cpuinfo | grep "model name" | head -1
nproc
free -h
df -h
```

| 항목 | 실측값 | 평가 |
|------|--------|------|
| CPU | Intel Celeron N3060 듀얼코어 1.6GHz (버스트 2.48GHz) | 정적 서빙 충분 |
| 코어 | 2 | ✅ |
| RAM | 총 7.7GB / 여유 6.3GB | ✅ 넉넉 |
| Swap | 6.6GB | ✅ |
| 디스크 | 3.5TB 중 2.5TB 여유 (29% 사용) | ✅ |

**결론:** khunnect 프론트엔드(nginx 정적 서빙, 이미지 94MB) 배포에 차고 넘치는 스펙.
여유 RAM 6.3GB로 컨테이너 다중 실행, 추가 서비스 확장도 여유.

**운영 권장 구조:** 스펙은 충분하나, 빌드는 GitHub Actions(클라우드)에서 수행하고
시놀로지는 완성된 이미지 실행만 담당. 이유는 성능이 아니라 운영 안정성:
- 빌드 중 CPU 점유로 인한 서비스 응답 저하 방지
- 빌드 실패 시에도 기존 컨테이너 무영향 (배포 안정성)
- push만으로 자동 배포 → 서버 직접 접근 불필요

---

## 3. SSH 키 인증

### 3-1. 맥북에서 키 생성 ✅

```bash
ssh-keygen -t ed25519 -C "synology"
# 저장 위치: ~/.ssh/id_ed25519 (기본값)
# passphrase: 설정 (선택)
```

생성되는 파일:
- `~/.ssh/id_ed25519` — 개인 키 (절대 외부 노출 금지)
- `~/.ssh/id_ed25519.pub` — 공개 키 (시놀로지에 등록할 것)

### 3-2. 공개 키 시놀로지에 등록 (진행 중)

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p [포트번호] [계정명]@[내부IP]
```

### 3-3. 키 인증 접속 확인 (예정)

```bash
# 비밀번호 없이 바로 접속되면 성공
ssh [계정명]@[내부IP] -p [포트번호]
```

### 3-4. 비밀번호 로그인 비활성화 ✅

키 인증 확인 후 비밀번호 로그인을 비활성화하였다. (상세 절차는 [1-3](#1-3-비밀번호-로그인-비활성화-) 참고)

---

## 4. Container Manager (Docker)

### 4-1. 설치 및 동작 확인 ✅

DSM → 패키지 센터 → **Container Manager** 설치 (구 Docker, DSM 7.2부터 명칭 변경).

```bash
sudo docker --version       # Docker version 24.0.2
sudo docker run hello-world # 정상 동작 확인 (amd64 이미지 pull)
```

> hello-world 출력의 `(amd64)` 로 시놀로지가 x86_64 아키텍처임을 재확인.
> 맥북(ARM64)에서 빌드한 이미지는 그대로 실행 불가 → amd64 타겟 빌드 필요.

### 4-2. 코드 전송 (rsync 실패 → tar+ssh) ✅

git 미설치 환경이라 맥북에서 직접 코드를 전송. rsync는 macOS 기본 구현(openrsync)의
`-e` 옵션 처리 문제로 인증 단계에서 실패하여, ssh 파이프 방식으로 우회하였다.

```bash
# 맥북에서 실행 (ssh 키 인증 통로로 tar 스트림 전송)
cd /path/to/khunnect
tar czf - --exclude='node_modules' --exclude='dist' --exclude='.git' frontend \
  | ssh -p [포트번호] [계정명]@[내부IP] \
    'rm -rf khunnect-frontend && mkdir -p khunnect-frontend && tar xzf - -C khunnect-frontend --strip-components=1'

# macOS가 동봉한 메타데이터 파일(._*, .DS_Store) 정리
ssh -p [포트번호] [계정명]@[내부IP] \
  'cd khunnect-frontend && { find . -name "._*" -delete; find . -name ".DS_Store" -delete; }'
```

> ⚠️ macOS `tar`는 `._파일명`(AppleDouble) 메타데이터를 동봉한다.
> `._*.tsx` 가 빌드 시 `tsc`에 잡히면 컴파일 오류를 유발하므로 빌드 전 반드시 정리.

### 4-3. 이미지 빌드 & 컨테이너 실행 ✅

시놀로지에서 직접 빌드(amd64 네이티브). `.env`는 `COPY . .`로 포함되어 빌드 시 주입됨.

```bash
# 시놀로지에서
cd khunnect-frontend
sudo docker build -t khunnect-frontend:latest .   # tsc + vite build, 정상 완료

sudo docker run -d --name khunnect -p 8080:80 --restart unless-stopped khunnect-frontend:latest
sudo docker ps           # Up, 0.0.0.0:8080->80/tcp 확인
curl -I http://localhost:8080   # HTTP/1.1 200 OK (nginx/1.31.1)
```

| 옵션 | 의미 |
|------|------|
| `-d` | 백그라운드 실행 |
| `-p 8080:80` | 시놀로지 8080 → 컨테이너 80 (nginx) |
| `--restart unless-stopped` | 재부팅 시 자동 재시작 |

**접속 확인:** 맥북 브라우저 `http://[내부IP]:8080` → khunnect 랜딩 페이지 정상 출력 ✅

### 4-4. 진행 예정

- [ ] 프라이빗 레지스트리 구성 (또는 GitHub Actions 레지스트리 경유)
- [ ] HTTPS 적용 (역방향 프록시 + Let's Encrypt)

---

## 5. 네트워크 설정

> 진행 예정

- [ ] 고정 내부 IP 할당 (공유기 DHCP → MAC 주소 기반 고정)
- [ ] DDNS 설정 (`xxx.synology.me`)
- [ ] 포트포워딩 설정 (공유기 → 시놀로지)
- [ ] 역방향 프록시 설정
- [ ] Let's Encrypt 인증서 발급

---

## 6. 배포 파이프라인

> 진행 예정

```
코드 push (main 브랜치)
    ↓
GitHub Actions 실행
    ↓
Docker 이미지 빌드
    ↓
시놀로지 레지스트리에 push
    ↓
SSH로 시놀로지 접속 → 컨테이너 재시작
```

---

## 7. 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| `Operation timed out` | DSM 방화벽이 SSH 포트 차단 | 방화벽 프로파일에 SSH 포트 허용 규칙 추가 |
| 시놀로지 IP 오인식 | 예시 IP를 그대로 사용 | DSM → 제어판 → 네트워크에서 실제 IP 확인 |
| 비밀번호 입력 후 무반응 | 보안상 입력 내용이 화면에 표시되지 않음 | 그대로 입력 후 엔터 |
| rsync `Permission denied` | ① 시놀로지 안에서 실행(자기 자신 접속) ② macOS openrsync `-e` 처리 문제 | 맥북에서 실행 + tar+ssh 파이프로 우회 |
| 빌드 시 `._*.tsx` 오류 (가능성) | macOS tar의 AppleDouble 메타데이터 동봉 | 빌드 전 `find . -name "._*" -delete` |
| curl은 되는데 브라우저 `ERR_ADDRESS_UNREACHABLE` | 로컬 보안 프로그램(ASTx 등)의 프록시가 내부 IP 접근 가로챔. curl은 프록시 미경유 | 프록시/VPN 해제 또는 예외 처리 (`scutil --proxy`로 확인) |
| 브라우저가 `https`로 강제 전환 | HTTPS-First 정책 | 주소에 `http://` 명시, 시크릿 창 사용 (근본 해결: HTTPS 인증서 적용) |

---

## 현재 상태

```
✅ SSH 활성화 (커스텀 포트)
✅ 방화벽 SSH 포트 허용
✅ SSH 최초 접속 성공
✅ SSH 키 생성 (ed25519)
✅ 공개 키 시놀로지 등록
✅ 키 인증 접속 확인
✅ 비밀번호 로그인 비활성화
✅ 방화벽 소스 IP 내부 네트워크 제한
✅ 자동 차단 활성화
✅ 하드웨어 스펙 검증 (배포 서버 적합)
✅ Container Manager 설치 + Docker 동작 확인
✅ 코드 전송 (tar+ssh)
✅ 이미지 빌드 (시놀로지 amd64 네이티브)
✅ 컨테이너 실행 + 브라우저 접속 (http://[내부IP]:8080) ← 첫 배포 완료
⬜ 고정 내부 IP / DDNS / 포트포워딩
⬜ HTTPS (역방향 프록시 + Let's Encrypt)
⬜ GitHub Actions 자동 배포 파이프라인
```
