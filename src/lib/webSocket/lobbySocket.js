import { io } from 'socket.io-client';
import config from '../utils/config.js';  // Обновите путь, если путь к config.js отличается

export function initializeLobbySocket({
    onPlayerListUpdated,
    systemMessage,
    onLobbyRemoved,
    userExist,
    gameRedirect,
    gameUUID,
    activeGame
}) {

    let wsUrl = config.wsLobbyUrl;

    const socket = io.connect(`${wsUrl}/`);

    socket.on('playerList', playerList => {
        let currentLobbyPlayers = JSON.parse(playerList.Players || '[]');
        onPlayerListUpdated({ currentLobbyPlayers: currentLobbyPlayers });
    });

    socket.on('lobbyRemoved', () => {
        onLobbyRemoved();
    })

    socket.on('userExist', () => {
        userExist();
    });

    socket.on('gameRedirect', () => {
        gameRedirect();
    });

    socket.on('systemMessage', data => {
        systemMessage(JSON.parse(data));
    });

    socket.on('gameUUID', data => {
        gameUUID(data.uuid);
    });

    // Sent instead of joining when the user is still in a running game.
    socket.on('activeGame', data => {
        activeGame(data.uuid);
    });

    return socket;
}

export function joinLobby(socket, data) {
    socket.emit('join', data);
}

export function generateGame(socket, data) {
    socket.emit('generateGame', data);
}
