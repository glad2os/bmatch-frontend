<script>
    import "../../styles/game.scss";
    import PlayerBlock from './PlayerBlock.svelte';
    import Toolbox from "./Toolbox.svelte";
    import GameField from "./GameField.svelte";
    import {onMount} from "svelte";
    import {getCookie} from "../utils/cookies.js";
    import {getProfile} from "../utils/getProfile.js";
    import {initializeGameSocket, joinGame} from "./../webSocket/gameSocket.js";
    import guestSvg from "./../../assets/guest.svg";
    import {playerColor, playerKey} from "./playerColors.js";
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import GameOverDialog from "./GameOverDialog.svelte";

    let socket;
    let players = [];
    let messages = [];

    export let room;

    let openBubbles = [];
    let isYourTurn = false;

    // Who opened each bubble (bubbleId -> player key), learned from openBubble events.
    const owners = new Map();
    // Pairs already matched, as sent by the server.
    let matchedBubbles = [];
    // Bubbles opened in the current turn that are neither matched nor closed yet (bubbleId -> bubble).
    const pendingBubbles = new Map();
    // A turn that times out after one pick gets no closeBubbles event; hide such bubbles after this delay.
    const PENDING_HIDE_DELAY_MS = 2500;
    let currentPlayerKey = null;

    // A bot that took the seat of a player who left keeps that seat's colour, so the leaver's pairs keep it too.
    $: playerColors = Object.fromEntries(players.flatMap(player => [
        [playerKey(player.type, player.userId), player.color],
        ...(player.replaces ? [[playerKey(player.replaces.type, player.replaces.id), player.color]] : [])
    ]));
    // Spectators have no seat, so their hover outline stays white.
    $: hoverColor = players.find(player => player.type !== 'Bot' && player.userId === profileId)?.color ?? '#FFFFFF';

    let profileId = null;
    let destroyed = false;

    let gamePaused = false;
    // Debug mode: the server plays every turn, manual clicks are not accepted.
    let debugMode = false;

    $: gameStyle = gamePaused ? 'filter: saturate(0);' : '';


    let timerInterval;
    let totalSeconds;

    function sendOpenedBubble(bubbleId) {
        if (socket && isYourTurn) {
            socket.emit('sendOpenedBubble', {bubbleId: bubbleId, token: getCookie('token'), gameUUID: room});
        }
    }

    function toOpenBubble(bubbleData, matched) {
        const bubbleId = parseInt(bubbleData.bubbleId);
        // The server stores who opened each bubble of a found pair (openedBy), so colours survive a reconnect.
        const openedBy = bubbleData.openedBy;
        return {
            id: `item${bubbleId}`,
            src: `/bubbles/50shashek_${bubbleData.bubbleImg}.png`,
            owner: owners.get(bubbleId) ?? (openedBy ? playerKey(openedBy.type, openedBy.id) : null),
            matched
        };
    }

    function renderBubbles() {
        openBubbles = [
            ...matchedBubbles.map(bubble => toOpenBubble(bubble, true)),
            ...[...pendingBubbles.values()].map(bubble => toOpenBubble(bubble, false))
        ];
    }

    function hidePendingOf(previousPlayerKey) {
        setTimeout(() => {
            if (destroyed) return;
            for (const bubbleId of pendingBubbles.keys()) {
                if (owners.get(bubbleId) === previousPlayerKey) pendingBubbles.delete(bubbleId);
            }
            renderBubbles();
        }, PENDING_HIDE_DELAY_MS);
    }

    function startTimer(seconds) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        // The server sends the remaining time with a fractional part on join.
        totalSeconds = Math.ceil(seconds);

        timerInterval = setInterval(() => {
            if(totalSeconds > 0) totalSeconds--;

            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
    }


    onMount(async () => {

        if (getCookie('token')) {
            let profile = await getProfile(getCookie('token'));
            profileId = profile?.id ?? null;
        }

        if (destroyed) return;
        socket = initializeGameSocket({
            onPlayerListUpdated: (data) => {
                // The list is re-sent after every bot move (bots' chances change); keep the measured latency.
                const latencyByKey = Object.fromEntries(players.map(player => [playerKey(player.type, player.userId), player.latency]));
                players = data.map((player, index) => ({
                    ...player,
                    latency: latencyByKey[playerKey(player.type, player.id)] ?? '',
                    userId: player.id,
                    id: index + 1,
                    color: playerColor(index),
                    isActive: playerKey(player.type, player.id) === currentPlayerKey,
                    img: {guestSvg}
                }));
            },
            onReceiveMessage: (data) => {
                messages = [...messages, {username: data.username, content: data.message}];
            },
            systemMessage: (data) => {
                console.log(data);
            },
            onUserExist: () => {
                socket.disconnect();
                alert("Disconnected")
            },
            onPing: (latency) => {
                let currentIndex = players.findIndex(u => u.userId === profileId);
                if (currentIndex !== -1) {
                    players[currentIndex].latency = `${latency} ms`;
                }
            },
            gameAction: (data) => {
                matchedBubbles = data.openBubbles;
                matchedBubbles.forEach(bubble => pendingBubbles.delete(parseInt(bubble.bubbleId)));
                // The first pick of a turn in progress (e.g. when joining mid-turn) belongs to the sender.
                // After a miss the server already clears it, so bubbles waiting for closeBubbles stay pending.
                const requested = data.requestedBubbles;
                if (requested && !Array.isArray(requested) && requested.bubbleId != null) {
                    const bubbleId = parseInt(requested.bubbleId);
                    if (!owners.has(bubbleId) && data.sender?.type) {
                        owners.set(bubbleId, playerKey(data.sender.type, data.sender.id));
                    }
                    pendingBubbles.set(bubbleId, requested);
                }
                renderBubbles();
            },
            userAlreadyInGame: (data) => {
                alert(`You are signed in game ${data}`)
            },
            timeRequested: (data) => {
                console.log(data);
                startTimer(data);
            },
            isPaused: (data) => {
                gamePaused = data.paused;
                if (gamePaused) clearInterval(timerInterval);
            },
            openBubble: (data) => {
                // The server switches the turn only after the bubble is opened, so the opener is the current player.
                const bubbleId = parseInt(data.bubbleId);
                owners.set(bubbleId, currentPlayerKey);
                pendingBubbles.set(bubbleId, data);
                renderBubbles();
            },
            closeBubbles: (data) => {
                for (const bubbleId of [parseInt(data.firstBubbleId), parseInt(data.secondBubbleId)]) {
                    pendingBubbles.delete(bubbleId);
                    owners.delete(bubbleId);
                }
                renderBubbles();
            },
            onDebugMode: () => {
                debugMode = true;
                clearInterval(timerInterval);
            },
            onLeftGame: () => {
                goHome();
            },
            onGameOver: (data) => {
                gameResult = data ?? {};
                resultsVisible = true;
                isYourTurn = false;
                clearInterval(timerInterval);
            },
            getCurrentPlayer: (data) => {
                const nextPlayerKey = playerKey(data.type, data.id);
                if (currentPlayerKey !== null && nextPlayerKey !== currentPlayerKey) hidePendingOf(currentPlayerKey);
                currentPlayerKey = nextPlayerKey;
                const currentPlayer = players.find(player => player.userId === data.id && player.type === data.type);
                if (!currentPlayer) return;
                players = players.map(player => ({...player, isActive: player === currentPlayer}));
                isYourTurn = profileId !== null && profileId === currentPlayer.userId && currentPlayer.type !== 'Bot';
            }
        });


        joinGame(socket, {
            id: socket.id,
            token: getCookie('token'),
            gameUUID: room
        });

        document.addEventListener('keydown', handleUserPause);
        document.addEventListener('keydown', handleExitKey);
    });

    // Results screen (gameOver); "View board" hides it, a button brings it back.
    let gameResult = null;
    let resultsVisible = false;

    // Early exit: Tab or "GG, WP" in the chat asks for confirmation first.
    let exitConfirmVisible = false;
    let exitChatMessage = null;
    let leaving = false;

    $: isSeatedPlayer = players.some(player => player.type !== 'Bot' && player.userId === profileId && !player.left);

    function requestExit(chatMessage = null) {
        if (leaving) return;
        exitChatMessage = chatMessage;
        exitConfirmVisible = true;
    }

    function goHome() {
        window.location.href = '/';
    }

    function confirmExit() {
        exitConfirmVisible = false;
        // Spectators (and players who already left) just close the game page.
        if (!socket || !isSeatedPlayer) {
            goHome();
            return;
        }
        leaving = true;
        const token = getCookie('token');
        if (exitChatMessage) {
            socket.emit('chatMessage', {message: exitChatMessage, gameUUID: room, token});
        }
        socket.emit('leaveGame', {gameUUID: room, token});
        // Leave even if the confirmation (leftGame) does not arrive.
        setTimeout(goHome, 3000);
    }

    function handleExitKey(event) {
        if (event.key !== 'Tab' || exitConfirmVisible || gameResult) return;
        event.preventDefault();
        requestExit();
    }

    //user pause
    function handleUserPause(event) {
        if (event.key === "F9" || event.keyCode === 120) { // 120 это код клавиши F9
            if (socket) {
                socket.emit('userPause', {
                    id: socket.id,
                    token: getCookie('token'),
                    gameUUID: room
                });
            }
        }
    }


    import {onDestroy} from 'svelte';

    onDestroy(() => {
        destroyed = true;
        clearInterval(timerInterval);
        socket?.disconnect();
        document.removeEventListener('keydown', handleUserPause);
        document.removeEventListener('keydown', handleExitKey);
    });

    let chatVisible = false;

    function toggleChat() {
        chatVisible = !chatVisible;
    }

</script>

<div class="wrapper game" style={gameStyle}>
    <div class="bg">
        {#if debugMode}
            <div class="debug-badge" role="status">Debug · every turn is played automatically</div>
        {/if}
        <GameField {openBubbles} {playerColors} {hoverColor} on:bubbleClicked={e => sendOpenedBubble(e.detail)}
                   isYourTurn={isYourTurn && !debugMode}/>
    </div>
    <div class="toolbox">
        <Toolbox {chatVisible} {socket} {totalSeconds} {messages} toggleChat={toggleChat} {requestExit}/>
        <div class="player-wrapper" style="display: {chatVisible ? 'none' : 'flex'};">
            {#each players as player}
                <PlayerBlock {...player}/>
            {/each}
        </div>
    </div>
</div>

{#if gameResult && resultsVisible}
    <GameOverDialog {players} result={gameResult} {profileId}
                    on:close={() => resultsVisible = false}
                    on:home={goHome}/>
{:else if gameResult}
    <button type="button" class="results-reopen" on:click={() => resultsVisible = true}>Results</button>
{/if}

{#if exitConfirmVisible}
    <ConfirmDialog message="Are you sure you want to exit the game?"
                   on:confirm={confirmExit}
                   on:cancel={() => exitConfirmVisible = false}/>
{/if}
