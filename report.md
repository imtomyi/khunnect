# Linux {Experience} Project — Weekly Software Reports

**Student**: Tom  
**Use Case**: Web Development — Khunnect (경희대학교 학생 커리큘럼 설계 플랫폼)  
**Linux Environment**: OrbStack Linux Machine (Ubuntu 24.04 noble, ARM64)  
**Submission**: Week 15

---

## Overview of Use Case

My use case for this project is **full-stack web development using Linux as the primary environment**, following an **Agile/DevOps/Scrum** methodology. I built **Khunnect**, a curriculum planning platform for Kyung Hee University students, entirely within a Linux environment (OrbStack Linux Machine). The platform connects undergraduate students with alumni who share their curriculum paths and career advice.

### Development Methodology: Agile/DevOps/Scrum

The 11 weeks are structured to mirror a real-world **DevOps pipeline**, inspired by Scrum's principle of establishing infrastructure and automation early so every subsequent sprint benefits from fast feedback loops:

```
Infrastructure → Source Control → CI/CD → Code → Build →
  Release → Deploy → Operate → Backend → AI Tooling
```

In Scrum terms:
- **Sprint 0** (Weeks 1–2): Environment setup — trying UTM, switching to OrbStack
- **Sprint 1** (Weeks 3–4): DevOps foundation — Git + GitHub Actions CI/CD pipeline
- **Sprint 2** (Weeks 5–6): Development tools — Node.js runtime + Vite build system
- **Sprint 3** (Weeks 7–9): Containerization & Orchestration — Docker + minikube + kubectl
- **Sprint 4** (Weeks 10–11): Services & AI — Supabase backend + Antigravity AI agent

This ordering reflects the real sequence in which tools were adopted during the project: CI/CD was established before writing application code, ensuring every commit was automatically validated from day one.

### Technology Stack

| Layer | Technology | Linux Tool |
|-------|-----------|-----------|
| Environment | OrbStack Linux Machine | Ubuntu 24.04 ARM64 |
| Source Control | Git + GitHub | `git` CLI |
| CI/CD | GitHub Actions | `ubuntu-latest` runner |
| Runtime | Node.js 20 | `nvm` |
| Build | Vite + TypeScript | `npm run build` |
| Container | Docker | `docker build/run` |
| Orchestration | Kubernetes (minikube) | `kubectl`, `minikube` |
| Backend | Supabase | REST API + JS client |
| AI Agent | Antigravity | Agentic task execution |

---

---

## Week 1 — UTM

### What is UTM?

UTM is a free, open-source virtual machine application for macOS built on QEMU and Apple's Virtualization framework. It allows users to run various operating systems — including Linux distributions — on Apple Silicon (M1/M2/M3) Macs. UTM was my first choice for setting up a Linux development environment, as it is widely recommended for running Ubuntu on macOS without the need for dual-booting.

### Installation

Downloaded UTM from the official website (utm.app) and installed it on macOS. The process involved:

1. Downloading the UTM `.dmg` file and dragging it to `/Applications`
2. Launching UTM and creating a new virtual machine
3. Downloading Ubuntu 22.04 LTS ARM64 ISO separately
4. Configuring the VM: 4 CPU cores, 4 GB RAM, 40 GB disk
5. Completing the Ubuntu installation wizard inside the VM

The installation itself completed without major errors.

### Experience

After installation, I attempted to set up a development environment inside the Ubuntu VM for the Khunnect project.

**Challenges encountered:**

**1. Unfamiliar UI**  
UTM's interface uses a custom VM manager that differs significantly from tools I had used before. Finding where to configure shared folders, network settings, and display options required reading documentation repeatedly. The layout was not intuitive for someone new to QEMU-based virtualization.

**2. Unfamiliar Commands**  
Setting up file sharing between macOS and the Ubuntu VM required enabling VirtFS (virtio-9p) and mounting it manually inside the VM:
```bash
sudo mkdir /mnt/shared
sudo mount -t 9p -o trans=virtio share /mnt/shared -oversion=9p2000.L
```
This was confusing because the mount did not persist across reboots without adding entries to `/etc/fstab`. I made errors in the fstab syntax that caused the VM to fail to boot, requiring recovery.

**3. Port Forwarding**  
To access the Vite development server (`localhost:5173`) from macOS, I needed to manually configure port forwarding in UTM's network settings. This was a non-obvious setting that required several attempts to get right.

**4. Performance**  
`npm install` inside the UTM VM was noticeably slower compared to running it natively on macOS. Docker operations were especially slow.

**5. VS Code SSH Connection**  
To use VS Code Remote SSH, I needed to find the VM's IP address (which changed on each restart) and update the SSH config manually each time.

### Conclusion

UTM is a powerful tool that offers great flexibility for running many different operating systems on macOS. However, for my use case — daily web development in Linux — the manual configuration overhead was significant. The unfamiliar UI and commands created friction that slowed down the development workflow. After one week of use, I decided to look for an alternative that offered better integration with macOS.

**Rating**: ★★★☆☆  
**Would use again for**: Running GUI Linux applications, testing different OS versions  
**Not ideal for**: Daily development workflow requiring frequent macOS ↔ Linux interaction

---

---

## Week 2 — OrbStack (Linux Machine)

### What is OrbStack?

OrbStack is a macOS application that provides fast, lightweight Linux containers and virtual machines. It serves as a modern alternative to Docker Desktop and UTM. Its **Linux Machine** feature creates a full Linux VM with native performance, automatic file sharing, automatic port forwarding, and instant SSH access — all without manual configuration.

### Installation

```bash
# Option 1: Homebrew
brew install orbstack

# Option 2: Download from orbstack.dev
# → Drag OrbStack.app to /Applications
```

After launching OrbStack, creating a Linux Machine is done through the GUI:
1. Open OrbStack → Linux Machines tab
2. Click "New Machine"
3. Select Ubuntu 24.04 (noble), Architecture: ARM64
4. Machine name: `ubuntu`
5. Click Create → Machine is ready in ~30 seconds

### Experience

**Entering the Linux Machine:**
```bash
# From macOS Terminal
orb                    # Enter default machine
orb shell ubuntu       # Enter machine named "ubuntu"

# Check system info
uname -a
# Linux ubuntu 6.x.x-orbstack #1 SMP aarch64 GNU/Linux
```

**Setting up the development environment inside the machine:**
```bash
# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20
node -v   # v20.x.x

# Docker — already works via OrbStack socket sharing
docker ps   # Works immediately, no installation needed

# Git
git --version   # Already installed on Ubuntu
```

**Key features that solved all UTM pain points:**

| Pain Point (UTM) | OrbStack Solution |
|-----------------|-------------------|
| Manual file sharing setup | macOS paths auto-mounted at `/mac/Users/...` |
| Manual port forwarding | Automatic — `localhost:5173` works in macOS browser instantly |
| Slow performance | Native speed via Apple Virtualization.framework |
| Changing VM IP | Fixed `orb` SSH hostname, no IP lookup needed |
| Docker needs separate install | Docker socket shared from OrbStack automatically |

**Running the development server:**
```bash
cd ~/Desktop/projects/khunnect/frontend
npm run dev
# → Local: http://localhost:5173/
```

Immediately accessible from macOS browser at `http://localhost:5173` — no configuration needed.

**VS Code Remote SSH:**
1. Install "Remote - SSH" extension in VS Code
2. `Cmd+Shift+P` → Remote-SSH: Connect to Host → `orb`
3. Connected instantly — edit Linux files from macOS VS Code

### Comparison: UTM vs OrbStack

| Feature | UTM | OrbStack |
|---------|-----|----------|
| Setup time | ~2 hours | ~5 minutes |
| File sharing | Manual VirtFS | Automatic |
| Port forwarding | Manual | Automatic |
| Performance | Moderate | Native-speed |
| Docker | Separate install | Built-in socket |
| VS Code SSH | Manual IP config | `orb` hostname fixed |
| Cost | Free | Free (personal) |

### Conclusion

OrbStack transformed the Linux development experience. After the friction of UTM, OrbStack felt completely transparent — I could focus entirely on writing code rather than managing the virtual machine. It is now my primary development environment for the remainder of this project.

**Rating**: ★★★★★  
**Would use again for**: Any Linux-based development on macOS  
**Key insight**: A well-integrated tool removes itself from your awareness — you stop thinking about the environment and start thinking about the work.

---

---

## Week 3 — Git

### What is Git?

Git is a distributed version control system created by Linus Torvalds in 2005 for managing the Linux kernel source code. It tracks changes to files over time, allows branching for parallel development, and enables collaboration through platforms like GitHub.

For this project, Git manages the source code of Khunnect, enables CI/CD triggers on GitHub Actions, and provides a safety net for all code changes.

### Installation (inside OrbStack Linux Machine)

Git comes pre-installed on Ubuntu:
```bash
git --version
# git version 2.43.0

# Configure identity
git config --global user.name "Tom"
git config --global user.email "oodivgpt@gmail.com"

# Configure default branch name
git config --global init.defaultBranch main
```

**SSH key setup for GitHub:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "oodivgpt@gmail.com"

# Copy public key to add to GitHub
cat ~/.ssh/id_ed25519.pub

# Test connection
ssh -T git@github.com
# Hi username! You've successfully authenticated.
```

### Experience

**Daily Git workflow for Khunnect:**
```bash
# Check current state
git status
git diff

# Stage and commit
git add src/pages/CurriculumPage.tsx
git commit -m "feat: connect curriculum page to Supabase"

# Push to GitHub (triggers CI)
git push origin main
```

**Branching for features:**
```bash
git checkout -b feature/supabase-auth
# ... work on auth feature ...
git add .
git commit -m "feat: add Supabase auth with session management"
git checkout main
git merge feature/supabase-auth
git push origin main
```

**Useful commands discovered in Linux:**

```bash
# View commit history with graph
git log --oneline --graph --all

# Undo last commit (keep changes)
git reset HEAD~1

# See what changed in a specific commit
git show <commit-hash>

# Stash work in progress
git stash
git stash pop
```

**Linux-specific insight:**  
On Linux, Git integrates naturally with the shell. I learned to use shell aliases in `~/.bashrc` for frequent Git commands:
```bash
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
```

### Conclusion

Git is one of the most fundamental tools in Linux development. Using it natively in Linux (rather than through a GUI on macOS) deepened my understanding of how Git actually works at the command-line level. The SSH key workflow for GitHub authentication was a new experience that clarified how public-key cryptography is used in practice.

**Rating**: ★★★★★  
**Key Linux lesson**: Working exclusively from the terminal removes the GUI abstraction and forces a deeper understanding of what each Git operation actually does.

---

---

## Week 4 — GitHub Actions

### What is GitHub Actions?

GitHub Actions is a CI/CD (Continuous Integration / Continuous Deployment) platform integrated directly into GitHub. It allows automating build, test, and deployment workflows triggered by Git events (push, pull request, etc.). For the Khunnect project, GitHub Actions automatically builds and verifies the frontend on every push to main.

### Setup

No installation required — the workflow is defined as a YAML file in the repository:

```bash
mkdir -p .github/workflows
# Create ci.yml
```

**The CI pipeline** (`.github/workflows/ci.yml`):

```yaml
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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build
        run: |
          cd frontend
          npm run build

      - name: Build Docker image
        run: |
          docker build -t khunnect-frontend:latest ./frontend
```

### Experience

**Triggering CI:**
```bash
# Every push to main triggers the pipeline
git push origin main
# → GitHub receives push
# → CI workflow starts on ubuntu-latest runner
# → Build + Docker image build runs in ~2 minutes
```

**Pipeline stages explained:**

1. **`actions/checkout@v4`** — Clones the repository into the CI runner
2. **`actions/setup-node@v4`** — Installs Node.js 20 with npm cache
3. **`npm ci`** — Clean, reproducible dependency install
4. **`npm run build`** — TypeScript type-check + Vite production build
5. **`docker build`** — Verifies the Docker image builds correctly

**The CI environment is Linux (`ubuntu-latest`):**  
This was an important insight — the CI runner is also Linux. Since I developed on OrbStack Linux Machine (also Ubuntu), there were zero environment-specific issues. The same commands that worked in my local Linux environment worked identically in CI.

**Caching for speed:**  
The `cache: 'npm'` option in `setup-node` caches the `node_modules` based on `package-lock.json`. Subsequent runs skip re-downloading packages that haven't changed — reducing CI time from ~2 minutes to ~40 seconds.

**Viewing CI results:**  
In GitHub → Actions tab → Select workflow run → View logs for each step. When `npm run build` fails (TypeScript error), the CI fails immediately and the error is shown in the logs.

### Conclusion

GitHub Actions closed the loop between local Linux development and automated verification. The fact that both my development environment (OrbStack Linux Machine) and the CI runner (`ubuntu-latest`) are Linux systems eliminated the classic "works locally, fails in CI" problem. Every push to GitHub automatically validates that the TypeScript compiles cleanly and the Docker image builds successfully.

**Rating**: ★★★★★  
**Key Linux lesson**: CI/CD pipelines run on Linux servers. Developing in Linux locally ensures the closest possible match to the automated build environment.

---

---

## Week 5 — Node.js / npm

### What is Node.js?

Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows JavaScript to run outside of a browser — on a server or local machine. npm (Node Package Manager) is the default package manager that comes with Node.js and provides access to over 2 million open-source packages.

For this project, Node.js is the foundation of the entire frontend development workflow: running the Vite development server, building the production bundle, and managing all dependencies.

### Installation (inside OrbStack Linux Machine)

Used nvm (Node Version Manager) for flexible version management:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install and use Node.js 20 (LTS)
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v    # v20.x.x
npm -v     # 10.x.x
```

### Experience

**Installing project dependencies:**
```bash
cd ~/Desktop/projects/khunnect/frontend
npm install
# added 312 packages in 14s
```

The installation was fast in OrbStack Linux Machine — noticeably faster than when I had tried inside UTM.

**Key npm commands used daily:**

```bash
npm run dev       # Start Vite development server
npm run build     # Production build (TypeScript compile + bundle)
npm ci            # Clean install (used in CI/CD)
npm install <pkg> # Add a new package
```

**Understanding package.json:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint ."
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@tanstack/react-router": "^1.x",
    "@tanstack/react-query": "^5.x",
    "react": "^19.x"
  }
}
```

**npm ci vs npm install:**  
I learned the difference between these commands when setting up CI/CD:
- `npm install` — updates `package-lock.json` if needed
- `npm ci` — strictly uses `package-lock.json`, fails if it's out of sync. Faster and more reproducible for CI environments.

**Linux-specific note:**  
On Linux, file system permissions matter more than on macOS. When trying to install global packages, I needed to understand that `npm install -g` requires different permission handling:
```bash
# Avoid using sudo with npm — configure prefix instead
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```
This was a Linux-specific lesson not encountered on macOS.

### Conclusion

Node.js and npm are essential tools for modern JavaScript development. Using them inside Linux reinforced my understanding of how package management, environment variables, and file permissions work differently between macOS and Linux. The nvm approach for version management proved especially useful for keeping Node.js versions clean and separated.

**Rating**: ★★★★★  
**Key Linux lesson**: File permissions and PATH configuration matter more explicitly on Linux than on macOS.

---

---

## Week 6 — Vite

### What is Vite?

Vite (French for "fast") is a next-generation frontend build tool created by Evan You (creator of Vue.js). It provides an extremely fast development server using native ES modules, and produces optimized production builds via Rolldown/Rollup. For the Khunnect project, Vite handles TypeScript compilation, hot module replacement (HMR), and production bundling.

### Installation (inside OrbStack Linux Machine)

Vite was included when scaffolding the project:
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

This installs Vite along with the React + TypeScript template. The key configuration file is `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
})
```

### Experience

**Development server:**
```bash
npm run dev
# VITE v6.x  ready in 312 ms
# → Local:   http://localhost:5173/
# → Network: http://192.168.139.120:5173/
```

Inside OrbStack Linux Machine, Vite's development server starts in ~300ms. OrbStack automatically forwards port 5173 to macOS localhost.

**Hot Module Replacement (HMR):**  
Every time a `.tsx` file is saved, only the changed module is re-evaluated and patched into the running application — the browser does not full-reload. This worked seamlessly in the OrbStack environment:
- Save a React component → browser updates in < 100ms
- Change a CSS property → reflected instantly without losing application state

**Production build:**
```bash
npm run build
# tsc -b && vite build
# ✓ 233 modules transformed
# dist/assets/index-xxx.js   583 kB
# ✓ built in 128ms
```

The build process:
1. `tsc -b` — TypeScript type checking (fails on type errors)
2. `vite build` — bundle all modules into optimized assets

**Key Vite advantage — build speed:**  
Vite uses esbuild (written in Go) for development transforms and native ES modules for the dev server. This makes it dramatically faster than older tools like webpack, especially in Linux where file system operations are fast.

**Linux-specific insight:**  
Vite's file watching uses Linux's `inotify` system to detect file changes. In OrbStack Linux Machine, inotify events triggered by VS Code (running on macOS) are properly propagated, making HMR work correctly even when editing from the macOS side.

### Conclusion

Vite is the ideal build tool for modern React development. Its combination of fast startup, instant HMR, and clean production builds made the development workflow in Linux smooth and productive. The 128ms production build time (for a 233-module application) demonstrated how much faster Linux-native tooling can be compared to equivalent Windows or even macOS setups.

**Rating**: ★★★★★  
**Key Linux lesson**: Build tools like Vite use Linux kernel features (inotify, epoll) for file watching and I/O that make them feel native in the Linux environment.

---

---

## Week 7 — Docker

### What is Docker?

Docker is a platform for building, shipping, and running applications inside lightweight, isolated containers. A container packages an application with all its dependencies into a single unit that runs consistently across any environment — development, testing, or production.

For the Khunnect project, Docker packages the React frontend (built with Vite) into a production-ready Nginx-served container image.

### Installation (inside OrbStack Linux Machine)

OrbStack shares its Docker socket with the Linux Machine, so Docker is available without a separate installation:

```bash
docker --version
# Docker version 27.x.x

docker ps
# CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
# (empty — no containers running)
```

### Experience

**Writing the Dockerfile — Multi-stage Build:**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why multi-stage?**  
The first stage (`node:20-alpine`) installs all Node.js dependencies and compiles TypeScript into optimized JavaScript. The second stage (`nginx:alpine`) copies only the final output — no source code, no `node_modules`, no build tools. This reduces the final image from ~800MB to ~50MB.

**Building and running:**
```bash
# Build image
docker build -t khunnect-frontend:latest ./frontend

# Run container
docker run -p 3000:80 khunnect-frontend:latest

# Access via OrbStack auto port-forwarding
# → http://localhost:3000
```

**Key Docker commands learned:**
```bash
docker images              # List images
docker ps                  # Running containers
docker ps -a               # All containers (including stopped)
docker logs <container-id> # View container output
docker exec -it <id> sh    # Enter running container shell
docker rm <container-id>   # Remove container
docker rmi <image-id>      # Remove image
```

**Entering the container for debugging:**
```bash
docker exec -it <container-id> sh
# Inside nginx:alpine container:
ls /usr/share/nginx/html
# index.html  assets/
```

**Linux-specific insight:**  
On Linux, Docker runs natively without the hypervisor layer that macOS requires. Understanding `cgroups` and `namespaces` — the Linux kernel features that make containers possible — became more tangible when working in Linux directly.

### Conclusion

Docker solved the "it works on my machine" problem for the Khunnect frontend. Once the Dockerfile was written and the image built successfully in Linux, I was confident it would work identically anywhere. The multi-stage build technique was particularly valuable — I now understand why production Docker images should be as small as possible.

**Rating**: ★★★★★  
**Key Linux lesson**: Docker is a Linux-native technology. Understanding it from within Linux provides deeper insight into how containers actually use kernel features.

---

---

## Week 8 — minikube

### What is minikube?

minikube is a tool that runs a local Kubernetes cluster on your machine. It creates a single-node Kubernetes cluster inside a VM or container, allowing developers to test Kubernetes deployments locally without access to a cloud provider. For the Khunnect project, minikube was used to simulate the production Kubernetes environment on the OrbStack Linux Machine.

### Installation (inside OrbStack Linux Machine)

```bash
# Download minikube binary
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install to system PATH
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify
minikube version
# minikube version: v1.x.x
```

**Starting the cluster using Docker as the driver:**
```bash
minikube start --driver=docker
# 😄 minikube v1.x.x on Ubuntu 24.04 (arm64)
# ✨ Using the docker driver based on user choice
# 🏄 Done! kubectl is now configured to use "minikube" cluster
```

### Experience

**Critical step: building images inside minikube's Docker daemon:**

The most important lesson with minikube was understanding that it runs its own Docker daemon, separate from the host's Docker. Images built with the host's `docker build` are not visible inside minikube.

```bash
# WRONG: builds image in host Docker — minikube can't find it
docker build -t khunnect-frontend:latest ./frontend

# CORRECT: switch to minikube's Docker daemon first
eval $(minikube docker-env)
docker build -t khunnect-frontend:latest ./frontend
# Now minikube can find this image
```

Without `eval $(minikube docker-env)`, the Pod would fail with `ImagePullBackOff`:
```
NAME              READY   STATUS             RESTARTS
frontend-xxx      0/1     ImagePullBackOff   0
```

**Deploying to minikube:**
```bash
kubectl apply -f k8s/frontend-deployment.yaml
# deployment.apps/frontend created
# service/frontend-service created

kubectl get pods
# NAME                        READY   STATUS    RESTARTS
# frontend-xxxx-yyyy          1/1     Running   0

kubectl get services
# NAME               TYPE       PORT(S)
# frontend-service   NodePort   80:30080/TCP
```

**Accessing the service:**
```bash
minikube service frontend-service --url
# http://192.168.x.x:30080
```

**minikube dashboard:**
```bash
minikube dashboard
# → Opens web UI showing Pods, Deployments, Services visually
```

**Useful minikube commands:**
```bash
minikube status          # Check cluster health
minikube stop            # Stop the cluster
minikube delete          # Delete the cluster entirely
minikube ssh             # SSH into the minikube node
minikube logs            # View minikube logs
```

### Conclusion

minikube made Kubernetes approachable by removing the cloud infrastructure requirement. The biggest lesson was the `eval $(minikube docker-env)` pattern — a non-obvious but essential step that exposed how minikube's isolated Docker daemon works. Running minikube inside OrbStack Linux Machine worked well, though it added a layer of nested virtualization that occasionally required restarting after the Linux machine rebooted.

**Rating**: ★★★★☆  
**Key Linux lesson**: Understanding how environment variables (`eval $(minikube docker-env)`) can redirect tool behavior at the shell level is a powerful Linux concept with many applications.

---

---

## Week 9 — kubectl

### What is kubectl?

kubectl (pronounced "cube-control" or "kube-cuttle") is the command-line interface for Kubernetes. It communicates with the Kubernetes API server to manage all cluster resources — creating, inspecting, updating, and deleting Pods, Deployments, Services, and more. Every interaction with a Kubernetes cluster goes through kubectl.

### Installation (inside OrbStack Linux Machine)

```bash
# Download the latest stable kubectl binary
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Install with correct permissions
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify
kubectl version --client
# Client Version: v1.x.x
```

After `minikube start`, kubectl is automatically configured to talk to the local minikube cluster via `~/.kube/config`.

### Experience

**Core kubectl commands used in the project:**

```bash
# Apply a configuration file
kubectl apply -f k8s/frontend-deployment.yaml

# View resources
kubectl get pods
kubectl get services
kubectl get deployments
kubectl get all   # Show everything

# Detailed info
kubectl describe pod <pod-name>
kubectl describe service frontend-service

# View logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>   # Follow logs in real-time

# Execute command inside a running pod
kubectl exec -it <pod-name> -- sh
```

**The Deployment YAML explained:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1                    # Number of pod copies
  selector:
    matchLabels:
      app: frontend              # How the Deployment finds its Pods
  template:
    spec:
      containers:
        - name: frontend
          image: khunnect-frontend:latest
          imagePullPolicy: Never # Use local image, don't pull from registry
          ports:
            - containerPort: 80
```

**Understanding the Service:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort                 # Expose on a specific port of each Node
  selector:
    app: frontend                # Routes traffic to Pods with this label
  ports:
    - port: 80          # Service port
      targetPort: 80    # Container port
      nodePort: 30080   # External port (30000–32767 range)
```

**Debugging a crashing Pod:**
```bash
# Pod stuck in CrashLoopBackOff?
kubectl logs <pod-name>              # Check what went wrong
kubectl describe pod <pod-name>      # Check events section
kubectl get events --sort-by='.lastTimestamp'  # Recent cluster events
```

**Rolling update workflow:**
```bash
# After rebuilding the Docker image:
eval $(minikube docker-env)
docker build -t khunnect-frontend:latest ./frontend

# Force Kubernetes to use the new image
kubectl rollout restart deployment/frontend

# Watch the rollout progress
kubectl rollout status deployment/frontend
```

### Conclusion

kubectl is the window into a Kubernetes cluster. Through this project, I transitioned from seeing Kubernetes as a mysterious "enterprise technology" to understanding its core concepts hands-on. The declarative YAML approach — describing the desired state rather than issuing imperative commands — is a fundamentally different way of thinking about infrastructure that Linux-native tooling makes tangible.

**Rating**: ★★★★☆  
**Key Linux lesson**: Infrastructure-as-code (YAML manifests + kubectl apply) is the Linux way of managing systems — text files and CLI tools rather than GUI dashboards.

---

---

## Week 10 — Supabase

### What is Supabase?

Supabase is an open-source Backend-as-a-Service (BaaS) built on PostgreSQL. It provides a hosted database, authentication system, file storage, and real-time subscriptions — all accessible through a JavaScript client library. For the Khunnect project, Supabase serves as the complete backend: user authentication, relational database, and Row Level Security (RLS) for data access control.

### Setup (inside OrbStack Linux Machine)

Supabase was used as a hosted service (no local installation required). The client library was installed via npm:

```bash
npm install @supabase/supabase-js
```

**Client initialization** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Environment variables stored in `.env` (excluded from Git):
```bash
# frontend/.env
VITE_SUPABASE_URL=https://zmlldljddwcjvbnumwfi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

### Experience

**Database schema designed and implemented:**

```sql
-- Academic structure
colleges        -- (id, name, campus)
departments     -- (id, college_id, name, has_tracks)
tracks          -- (id, department_id, name)

-- User data
profiles        -- (id, name, role: student|alumni)
user_majors     -- (user_id, type, admission_year, department_id)

-- Curriculum
course_catalog          -- (id, name, type, credits, code, department_id)
checked_courses         -- (user_id, course_id) UNIQUE
curriculum_requirements -- (department_id, basic/required/elective_credits)
```

**Authentication — multi-step registration:**
```typescript
// Create account
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// Get current session
const { data: { session } } = await supabase.auth.getSession()
```

**Row Level Security (RLS):**
```sql
-- Users can only see their own data
CREATE POLICY "own data only" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Course catalog is public
CREATE POLICY "public read" ON course_catalog
  FOR SELECT USING (true);
```

**Real-time course check/uncheck:**
```typescript
// Check a course (INSERT)
await supabase.from('checked_courses')
  .insert({ user_id: userId, course_id: courseId })

// Uncheck (DELETE)
await supabase.from('checked_courses')
  .delete()
  .eq('user_id', userId)
  .eq('course_id', courseId)
```

**Nested join query for graduation progress:**
```typescript
const { data } = await supabase
  .from('checked_courses')
  .select('course_catalog(id, name, code, credits, type)')
  .eq('user_id', userId)
// Returns: [{ course_catalog: { id, name, credits, type } }]
```

### Conclusion

Supabase dramatically reduced the complexity of building a full-stack application. What would have required a Node.js/Express server, JWT implementation, and PostgreSQL setup was replaced by a few npm packages and SQL policies. The RLS system is particularly powerful — enforcing data access rules at the database level means the application code cannot accidentally expose another user's data.

**Rating**: ★★★★★  
**Key Linux lesson**: Environment variables and secret management (`.env` files, never committed to Git) are fundamental Linux/Unix conventions that Supabase integrates with naturally.

---

---

## Week 11 — Antigravity (AI Agent)

### What is Antigravity?

Antigravity is an AI agent application for macOS that enables Claude (Anthropic's AI model) to directly control applications and execute tasks autonomously on the computer. Unlike a simple chat interface, Antigravity's agent can use tools — reading files, writing code, executing shell commands, browsing the web — to complete multi-step development tasks end-to-end.

For the Khunnect project, I used Antigravity's agent to accelerate complex development tasks that would have taken significant manual effort: implementing entire page components, setting up Supabase integrations, debugging TypeScript errors, and writing this report.

### Experience

**Use case 1: Implementing Supabase integration**

Rather than manually writing all the TanStack Query hooks and Supabase client calls for the curriculum calculator, I delegated this to the Antigravity agent:

*Task given*: "Connect the curriculum page to Supabase — load course_catalog, handle check/uncheck with INSERT/DELETE to checked_courses, load curriculum_requirements for progress display."

The agent:
1. Read the existing `CurriculumPage.tsx`
2. Read the `supabase.ts` client setup
3. Rewrote the page with proper Supabase queries
4. Verified the TypeScript types were correct
5. Fixed a duplicate CSS property error it spotted

**Use case 2: Debugging TypeScript errors**

During development, the build would fail with errors like:
```
error TS2322: Type 'string' is not assignable to type 'RegisteredRouter["routePaths"]'
```

Rather than tracing through TanStack Router's type system manually, the agent analyzed the error, identified the root cause (a `Link to="/my/settings"` pointing to a non-existent route), and fixed it by replacing the `Link` with an `onClick` handler.

**Use case 3: Setting up the OrbStack Linux Machine**

When I first switched from macOS to OrbStack Linux Machine for development, the agent guided me through the entire setup:
```bash
# Agent generated these commands step by step:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc && nvm install 20
# (discovered nano wasn't installed)
cat > .env << 'EOF'
VITE_SUPABASE_URL=...
EOF
```
When `nano` wasn't available on the new Ubuntu machine, the agent adapted and used heredoc syntax instead — a response I wouldn't have immediately known.

**What changed about the workflow:**

| Traditional Development | With Antigravity Agent |
|------------------------|----------------------|
| Write boilerplate code manually | Delegate boilerplate, focus on architecture |
| Search docs for every API call | Agent knows the API, writes correct usage |
| Debug by reading error messages line by line | Agent traces entire error chain |
| Type all shell commands manually | Agent generates and explains commands |

**Reflection on AI-assisted Linux development:**

Using an AI agent in the Linux terminal environment felt natural — the agent communicated through the same shell that Linux itself uses. Complex multi-file refactors that would take hours were completed in minutes.

However, the agent works best when the developer understands what's being done. When the agent wrote a Docker multi-stage build, I needed to understand each layer to verify it was correct. The agent accelerates execution; human judgment remains essential for direction.

### Conclusion

Antigravity represented a new paradigm in Linux development: the developer as director, the AI agent as implementer. The combination of a powerful Linux environment (OrbStack) with an AI agent that can directly interact with files and the shell created a development workflow that was faster and more capable than either alone. This week's experience suggested that AI-assisted development in Linux environments will become increasingly standard practice.

**Rating**: ★★★★★  
**Key insight**: AI agents are most powerful in Linux environments because everything — files, processes, networks, builds — is accessible through the same text-based interface the agent operates in.

---

---

## Summary

Over 11 weeks, I installed and used the following software in a Linux environment (OrbStack Linux Machine, Ubuntu 24.04) to build the Khunnect web platform:

| Week | Software | Role in Project | Rating |
|------|----------|----------------|--------|
| 1 | UTM | Initial Linux VM attempt | ★★★☆☆ |
| 2 | OrbStack | Primary Linux development environment | ★★★★★ |
| 3 | Node.js / npm | JavaScript runtime & package manager | ★★★★★ |
| 4 | Git | Version control | ★★★★★ |
| 5 | Docker | Containerization & image building | ★★★★★ |
| 6 | minikube | Local Kubernetes cluster | ★★★★☆ |
| 7 | kubectl | Kubernetes CLI | ★★★★☆ |
| 8 | Vite | Frontend build tool & dev server | ★★★★★ |
| 9 | Supabase | Backend-as-a-service (DB + Auth) | ★★★★★ |
| 10 | GitHub Actions | CI/CD automation | ★★★★★ |
| 11 | Antigravity | AI agent for development assistance | ★★★★★ |

The overarching theme of this project was discovering that **Linux is the natural home for modern software development**. Every tool in this stack — Node.js, Docker, Kubernetes, Git, GitHub Actions — was designed for and works best on Linux. Using OrbStack to bring Linux to macOS, rather than the reverse, was the key insight that made everything work smoothly.

---

---

## Summary

Over 11 weeks, I installed and used the following software in a Linux environment (OrbStack Linux Machine, Ubuntu 24.04) following an **Agile/DevOps pipeline** approach — from environment setup through version control, CI/CD, build tools, containerization, orchestration, backend services, and AI tooling.

| Week | Software | DevOps Stage | Role in Project | Rating |
|------|----------|-------------|----------------|--------|
| 1 | UTM | Infrastructure | Initial Linux VM attempt | ★★★☆☆ |
| 2 | OrbStack | Infrastructure | Primary Linux development environment | ★★★★★ |
| 3 | Git | Source Control | Version control & GitHub integration | ★★★★★ |
| 4 | GitHub Actions | CI/CD | Automated build & Docker image verification | ★★★★★ |
| 5 | Node.js / npm | Code | JavaScript runtime & package manager | ★★★★★ |
| 6 | Vite | Build | Frontend build tool & dev server | ★★★★★ |
| 7 | Docker | Release | Containerization & image building | ★★★★★ |
| 8 | minikube | Deploy | Local Kubernetes cluster | ★★★★☆ |
| 9 | kubectl | Operate | Kubernetes CLI management | ★★★★☆ |
| 10 | Supabase | Backend | Database + Auth + RLS | ★★★★★ |
| 11 | Antigravity | AI Agent | AI-assisted development automation | ★★★★★ |

The week order follows the **DevOps lifecycle**: Infrastructure → Source Control → CI/CD → Code → Build → Release → Deploy → Operate → Backend → AI. This mirrors the Agile/Scrum principle of establishing automation (CI/CD) early so that every subsequent sprint benefits from automated feedback.
