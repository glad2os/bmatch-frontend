FROM node:18.17.1

WORKDIR /usr/src/app
COPY . .

ARG VITE_API_URL=http://localhost:8002
ARG VITE_WS_GAME_URL=ws://localhost:8005
ARG VITE_WS_LOBBY_URL=ws://localhost:8004
ENV VITE_API_URL=$VITE_API_URL VITE_WS_GAME_URL=$VITE_WS_GAME_URL VITE_WS_LOBBY_URL=$VITE_WS_LOBBY_URL

RUN npm install && npm run build

CMD ["npm", "start"]
