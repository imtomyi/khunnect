# khunnect 배포 가이드

khunnect는 **정적 SPA(nginx가 서빙) + Supabase(BaaS)** 구조다.
CD가 `VITE_*` 값을 빌드 타임에 이미지 안에 **구워서** 넣으므로,
어느 호스트든 **이미지만 돌리면** 동작한다(런타임 환경변수 불필요).

이미지: `ghcr.io/imtomyi/khunnect-frontend:latest`
내부 포트: `80` (nginx, `nginx.conf`의 `try_files`로 SPA 라우팅)

```
main push ─▶ GitHub Actions(deploy.yml) ─▶ ghcr.io 이미지 갱신
                                              │
                        ┌─────────────────────┴─────────────────────┐
                   [지금] Render                              [나중] Oracle Cloud VM
                   이미지만 pull·서빙                      compose + Watchtower(자동 갱신) + K8s
```

---

## 지금: Render (관리형, 카드 불필요, ~10분)

우리 ghcr 이미지를 Render가 대신 돌린다. compose/Watchtower/K8s는 안 쓰지만,
`main`에 push하면 이미지가 갱신되고 Render가 재배포한다(Auto-Deploy on).

### 사전 준비 (1회, GitHub UI)
1. https://github.com/users/imtomyi/packages/container/khunnect-frontend/settings
2. **Danger Zone → Change visibility → Public** 으로 전환
   (이미지 속 anon 키는 원래 공개용. service_role 키는 들어있지 않음)

### Render 배포
1. https://render.com 가입 (GitHub 계정으로, 카드 X)
2. **New → Web Service → Deploy an existing image from a registry**
3. Image URL: `ghcr.io/imtomyi/khunnect-frontend:latest`
4. Region 아무거나 / Instance Type: **Free**
5. **Advanced → Health Check Path**: `/`  ·  **Port**: `80`
6. Create Web Service → 몇 분 뒤 `https://khunnect.onrender.com` 발급

> ⚠️ Free 티어는 15분 무접속 시 휴면 → 첫 접속 시 ~30초 콜드스타트.
> 데모/포트폴리오용으론 충분. 상시 가동이 필요하면 아래 Oracle로 이전.

### 이미지 갱신 반영
- Render 대시보드 → **Manual Deploy → Deploy latest reference**, 또는
- Settings에서 **Auto-Deploy** 켜두면 이미지 push 시 자동(webhook 필요할 수 있음)

---

## 나중: Oracle Cloud Always Free VM (풀 세트, 시놀로지 대체)

우리가 만든 `docker-compose.yml`(khunnect + Watchtower 자동 갱신)을 **그대로** 올린다.

> ⚠️ **아키텍처 주의**: 현재 CD 이미지는 `linux/amd64` 단일이다(`deploy.yml` platforms).
> - Oracle **AMD** Always Free(2× VM.Standard.E2.1.Micro, 각 1GB)를 쓰면 그대로 동작.
> - Oracle **ARM** Always Free(VM.Standard.A1.Flex, 최대 4 OCPU/24GB — 성능 훨씬 좋음)를
>   쓰려면 **가기 전에** CD를 멀티아치로 바꿔야 한다. `deploy.yml`의 platforms 한 줄만 수정:
>   ```yaml
>   platforms: linux/amd64,linux/arm64
>   ```
>   push하면 arm64 포함 매니페스트가 ghcr에 올라가고, ARM VM에서 자동으로 맞는 아치를 pull한다.
> 권장: 성능 좋은 **ARM A1** + 위 멀티아치 한 줄 수정.

### 1. VM 생성
1. https://cloud.oracle.com 가입 (카드 인증 필요, 과금 X — Always Free 리소스만 사용)
2. **Compute → Instances → Create**
   - Image: **Ubuntu 22.04** (또는 24.04)
   - Shape: **VM.Standard.A1.Flex** (Ampere/ARM) · OCPU 2~4 / RAM 12~24GB (Always Free 범위)
   - SSH 키: 기존 `~/.ssh/id_ed25519.pub` 등록
3. **Networking → VCN의 Security List**에 인그레스 규칙 추가: TCP **80**, **443** (0.0.0.0/0)

### 2. Docker 설치 (SSH 접속 후)
```bash
ssh ubuntu@<VM_PUBLIC_IP>
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && exit   # 재접속으로 그룹 반영
```

### 3. compose 배포
```bash
ssh ubuntu@<VM_PUBLIC_IP>
mkdir -p ~/khunnect && cd ~/khunnect
# 이 저장소의 deploy/docker-compose.yml 내용을 붙여넣기 (또는 scp)
docker compose up -d
curl -I http://localhost:8080     # 200 확인
```
- 이미지가 public이면 인증 불필요.
- private 유지 시: `docker login ghcr.io`(PAT, `read:packages`) 후
  compose의 watchtower에 `~/.docker/config.json` 마운트(파일 하단 주석 참고).

### 4. 포트/HTTPS
- compose가 `8080:80`이므로 `http://<VM_IP>:8080` 접속.
- 80/443로 서비스 + HTTPS(Let's Encrypt) 원하면 앞단에 **Caddy** 한 컨테이너 추가가 가장 쉽다:
  ```
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ["80:80","443:443"]
    command: caddy reverse-proxy --from <도메인> --to khunnect:80
    volumes: ["caddy_data:/data"]
  ```
  DNS(도메인 또는 무료 DuckDNS/Cloudflare)를 VM IP로 향하게 하면 Caddy가 인증서 자동 발급.

### 5. (선택) K8s 실습까지
```bash
curl -sfL https://get.k3s.io | sh -      # 경량 K8s
sudo k3s kubectl apply -f k8s/frontend-deployment.yaml
```
`k8s/frontend-deployment.yaml`의 이미지를 `ghcr.io/imtomyi/khunnect-frontend:latest`로 맞출 것.

---

## Render → Oracle 이전 시 체크리스트
- [ ] Oracle VM 생성 + 80/443 인그레스 오픈
- [ ] Docker 설치
- [ ] `deploy/docker-compose.yml` 업로드 후 `docker compose up -d`
- [ ] 도메인/HTTPS(Caddy) 연결
- [ ] Render 서비스 정지(또는 삭제)
- [ ] (원하면) k3s로 K8s 배포까지
