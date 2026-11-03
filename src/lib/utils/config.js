const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8002',
  wsGameUrl: import.meta.env.VITE_WS_GAME_URL || 'ws://localhost:8005',
  wsLobbyUrl: import.meta.env.VITE_WS_LOBBY_URL || 'ws://localhost:8004'
};

export default config;
