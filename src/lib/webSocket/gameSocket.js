import { io } from 'socket.io-client';

import config from '../utils/config.js';  // Обновите путь, если путь к config.js отличается

export function initializeGameSocket(
    {
        onPlayerListUpdated,
        systemMessage,
        gameAction,
        timeRequested,
        isPaused,
        openBubble,
        closeBubbles,
        getCurrentPlayer,
        onGameOver,
        onUserExist,
        userAlreadyInGame,
        onReceiveMessage,
        onPing
    }) {

    let wsUrl = config.wsGameUrl;

    const socket = io.connect(`${wsUrl}/`);

    socket.on('playerList', playerList => {
        onPlayerListUpdated(playerList);
    });

    socket.on('receiveMessage', (data) => {
        onReceiveMessage(data)
    });

    socket.on('userExist', (data) => {
        onUserExist(data);
    });

    socket.on('timeRequested', data => {
        timeRequested(data);
    })

    socket.on('systemMessage', message => {
        systemMessage(message);
    });

    socket.on('userAlreadyInGame', message => {
        userAlreadyInGame(message);
    })

    socket.on('gameAction', action => {
        gameAction(action);
    });

    socket.on('currentPlayer', data => {
        getCurrentPlayer(data);
    });

    socket.on('openBubble', data => {
        openBubble(data);
    });

    socket.on('isPaused', data => {
        isPaused(data);
    })
    socket.on('closeBubbles', data => {
        closeBubbles(data);
    });

    socket.on('gameOver', data => {
        onGameOver(data);
    })

    let pingInterval;
    let pongTimeout;
    let onPong;
    function clearPong() {
        clearTimeout(pongTimeout);
        if (onPong) socket.off('pong', onPong);
        onPong = null;
    }
    socket.on('connect', () => {
        clearInterval(pingInterval);
        pingInterval = setInterval(() => {
            clearPong();
            const start = Date.now();
            onPong = () => {
                onPing(Date.now() - start);
                clearPong();
            };
            socket.on('pong', onPong);
            pongTimeout = setTimeout(clearPong, 1000);
            socket.emit('ping');
        }, 1000);
    });
    socket.on('disconnect', () => {
        clearInterval(pingInterval);
        clearPong();
    });

    return socket;
}

export function joinGame(socket, data) {
    socket.emit('join', data);
}
