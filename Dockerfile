# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# (!!!) 替换 npm 源为淘宝源 (!!!)
RUN npm config set registry https://registry.npmmirror.com \
    && npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]