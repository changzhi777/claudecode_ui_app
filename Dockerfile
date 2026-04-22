# 开发环境 Dockerfile
FROM node:20-alpine AS development

# 安装 pnpm
RUN npm install -g pnpm@8

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5173 3000

# 启动开发服务器
CMD ["pnpm", "dev"]

---

# 生产环境 Dockerfile
FROM node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm@8

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

---

# 生产运行环境
FROM nginx:alpine AS production

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
