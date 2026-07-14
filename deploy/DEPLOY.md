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

우리 ghcr 이미지를 Render가 대신 돌린다. compose/Watchtower/K8s는 안 쓴다.

⚠️ **자동 배포는 기본으로 안 된다.** `main` push → CD가 ghcr의 `:latest`를 덮어쓰지만,
ghcr는 Render로 webhook을 쏘지 않으므로 **Render는 새 이미지를 모른다**(같은 태그라 변화 감지 X).
갱신 반영 방법은 아래 "이미지 갱신 반영" 참고. 이걸 모르면 "push했는데 사이트가 옛날 그대로"로 오해한다.

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
6. Create Web Service → 몇 분 뒤 `https://<서비스명>-<임의문자>.onrender.com` 발급
   (이름이 이미 선점됐으면 Render가 접미사를 붙이므로 정확한 URL은 대시보드에서 확인)

> ⚠️ Free 티어는 15분 무접속 시 휴면 → 첫 접속 시 ~30초 콜드스타트.
> 데모/포트폴리오용으론 충분. 상시 가동이 필요하면 아래 Oracle로 이전.

### 이미지 갱신 반영 (main push 후 필수)
1. **수동 (가장 확실)**: Render 대시보드 → **Manual Deploy → Deploy latest reference**
2. **자동화하려면**: Render 서비스 Settings에서 **Deploy Hook** URL을 복사한 뒤,
   `.github/workflows/deploy.yml`의 push 스텝 다음에 한 스텝 추가하고
   그 URL을 repo Secret(`RENDER_DEPLOY_HOOK`)으로 등록한다:
   ```yaml
   - name: Trigger Render deploy
     run: curl -fsSL -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
   ```
   → 이러면 `main` push 한 번으로 빌드·푸시·재배포까지 완전 자동이 된다.

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
3. **Networking → VCN의 Security List**에 인그레스 규칙 추가 (0.0.0.0/0):
   - TCP **8080** — compose가 `8080:80`으로 띄우므로 직접 접속에 필요
   - TCP **80**, **443** — 나중에 Caddy로 HTTPS 붙일 때 필요
   - TCP **30080** — (선택) k3s NodePort로 접근할 경우

⚠️ **Oracle Ubuntu 이미지는 OS 자체 iptables가 기본으로 막고 있다.**
Security List만 열면 여전히 타임아웃 나므로, VM 안에서도 반드시 열어야 한다:
```bash
sudo iptables -I INPUT 6 -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 80   -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 443  -j ACCEPT
sudo netfilter-persistent save     # 재부팅 후에도 유지
```
> 이 단계를 빼먹으면 "콘솔에선 포트가 열렸는데 접속이 안 된다"로 한참 헤맨다.

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
- 80/443로 서비스 + HTTPS(Let's Encrypt) 원하면 앞단에 **Caddy** 한 컨테이너 추가가 가장 쉽다.
  `services:` 아래에 caddy를 추가하고, **파일 최상위(top-level)에 `volumes:` 선언도 반드시 함께** 넣어야 한다
  (named volume을 선언 없이 쓰면 `undefined volume caddy_data` 에러로 compose 전체가 기동 실패한다):
  ```yaml
  services:
    # ... khunnect, watchtower 기존 그대로 ...
    caddy:
      image: caddy:2
      container_name: caddy
      restart: unless-stopped
      ports: ["80:80", "443:443"]
      command: caddy reverse-proxy --from <도메인> --to khunnect:80
      volumes:
        - caddy_data:/data

  volumes:          # ← top-level. 이 3줄이 없으면 compose가 죽는다
    caddy_data:
  ```
  DNS(도메인 또는 무료 DuckDNS/Cloudflare)를 VM IP로 향하게 하면 Caddy가 인증서 자동 발급.
  Caddy는 같은 compose 네트워크에서 서비스명 `khunnect`로 컨테이너 내부 포트 80에 도달한다.

### 5. (선택) K8s 실습까지

⚠️ `k8s/frontend-deployment.yaml`은 **minikube 로컬 빌드 전용**으로 되어 있어 그대로 쓰면 안 된다:
```yaml
image: khunnect-frontend:latest   # 레지스트리 없는 로컬 태그
imagePullPolicy: Never            # ← pull 자체를 금지. 이게 핵심 함정
```
`imagePullPolicy: Never`가 남아 있으면 이미지명만 ghcr로 바꿔도 k3s가 **pull을 아예 시도하지 않아**
파드가 `ErrImageNeverPull`로 영구 실패한다. 두 줄을 **같이** 고쳐야 한다:
```yaml
image: ghcr.io/imtomyi/khunnect-frontend:latest
imagePullPolicy: Always           # (또는 이 줄을 삭제 — 기본값이 pull)
```
그 다음:
```bash
curl -sfL https://get.k3s.io | sh -      # 경량 K8s
sudo k3s kubectl apply -f k8s/frontend-deployment.yaml
sudo k3s kubectl get pods -w             # Running 확인 (ErrImageNeverPull이면 위 수정 누락)
```
Service는 `type: NodePort`, `nodePort: 30080`이므로 `http://<VM_IP>:30080`으로 접속한다.
→ 위 1-3단계의 인그레스와 iptables에 **30080도 열어야** 외부에서 보인다.
(compose와 k3s를 동시에 돌리면 포트가 겹치지 않게 주의 — 보통 둘 중 하나만 쓴다.)

---

## Render → Oracle 이전 시 체크리스트
- [ ] **ARM(A1) VM 쓸 거면 먼저** `deploy.yml` → `platforms: linux/amd64,linux/arm64`로 수정 후 push
- [ ] Oracle VM 생성
- [ ] VCN Security List 인그레스 오픈: **8080**(+ Caddy 쓰면 80·443, k3s 쓰면 30080)
- [ ] **VM 안에서 iptables도 오픈 + `netfilter-persistent save`** ← 빼먹으면 접속 안 됨
- [ ] Docker 설치
- [ ] `deploy/docker-compose.yml` 업로드 후 `docker compose up -d` → `curl -I http://localhost:8080` 200 확인
- [ ] 외부 접속 확인: `http://<VM_IP>:8080`
- [ ] (선택) 도메인/HTTPS(Caddy) 연결 — top-level `volumes:` 선언 잊지 말 것
- [ ] Render 서비스 정지(또는 삭제)
- [ ] (선택) k3s — `imagePullPolicy: Never` 제거 + 이미지 ghcr로 교체 후 apply
