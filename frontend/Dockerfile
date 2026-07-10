FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Supabase 환경변수는 빌드 컨텍스트의 .env 파일에서 주입된다.
# (로컬: 개발자의 frontend/.env / CI: 워크플로우가 secrets로 생성)
RUN npm run build

FROM nginx:alpine
# SPA 라우팅 + 캐시/압축 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]