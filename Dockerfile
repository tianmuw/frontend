# frontend/Dockerfile

# 1. 使用 Node.js 18 镜像
FROM node:18-alpine

# 2. 设置工作目录
WORKDIR /app

# 3. 复制依赖文件并安装
COPY package*.json ./
RUN npm install

# 4. 复制项目代码
COPY . .

# 5. (关键) 接收构建时的环境变量
# 我们需要在构建时知道后端在哪里，以便 Next.js 静态化某些页面
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 6. 构建 Next.js 应用
RUN npm run build

# 7. 暴露端口
EXPOSE 3000

# 8. 启动 Next.js
CMD ["npm", "start"]