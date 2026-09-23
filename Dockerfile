# ---------------------------------------------------------------- build
FROM node:22-alpine AS build

WORKDIR /app

# As dependências mudam menos do que o código: instalá-las numa camada própria
# mantém o cache de build útil entre alterações do src/.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------- runtime
# A aplicação é um SPA estático — o "back fantasma" roda no próprio navegador,
# então a imagem de produção não precisa de Node, só de um servidor de arquivos.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --spider -q http://127.0.0.1:8080/ || exit 1
