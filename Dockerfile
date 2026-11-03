FROM node:24-bookworm-slim AS build

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8002
ARG VITE_WS_GAME_URL=ws://localhost:8005
ARG VITE_WS_LOBBY_URL=ws://localhost:8004
ENV VITE_API_URL=$VITE_API_URL VITE_WS_GAME_URL=$VITE_WS_GAME_URL VITE_WS_LOBBY_URL=$VITE_WS_LOBBY_URL

RUN npm run build

# Static files only: no Node, Vite or node_modules in the runtime image.
FROM nginxinc/nginx-unprivileged:1.30-alpine

USER root
RUN apk upgrade --no-cache
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 5173
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD ["wget", "-qO-", "http://127.0.0.1:5173/"]
