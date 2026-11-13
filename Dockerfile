# Imagem do frontend: site estático servido por nginx (sem root), que também faz o papel do vercel.json
# (repassa /auth e /forum-api para a API pela rede interna do Docker e cai no index.html nas demais rotas).
#
# As variáveis VITE_* entram no JavaScript na hora do build; por isso são ARG, não variáveis de execução.
#   docker build --build-arg VITE_SSO_ENABLED=true --build-arg VITE_FIREBASE_API_KEY=... -t forum-helper-frontend .

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SSO_ENABLED=true
ARG VITE_FIREBASE_API_KEY=
ENV VITE_SSO_ENABLED=$VITE_SSO_ENABLED \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
RUN npm run build

# nginx-unprivileged: roda como usuário comum e escuta na 8080, então o container não precisa de nenhuma capability.
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY proxy-api.inc /etc/nginx/conf.d/proxy-api.inc
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
