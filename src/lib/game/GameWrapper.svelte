<script>
    import PlayerBlock from './PlayerBlock.svelte';
    import Toolbox from "./Toolbox.svelte";
    import GameField from "./GameField.svelte";
    import {onMount} from "svelte";
    import {getCookie} from "../utils/cookies.js";
    import {getProfile} from "../utils/getProfile.js";
    import {initializeGameSocket, joinGame} from "./../webSocket/gameSocket.js";
    import guestSvg from "./../../assets/guest.svg";

    let socket;
    let players = [];
    let messages = [];

    export let room;

    let openBubbles = [];
    let isYourTurn = false;

    let username = '';

    let gamePaused = false;

    $: gameStyle = gamePaused ? 'filter: saturate(0);' : '';


    let timerInterval;
    let totalSeconds;

    function sendOpenedBubble(bubbleId) {
        if (socket && isYourTurn) {
            socket.emit('sendOpenedBubble', {bubbleId: bubbleId, token: getCookie('token'), gameUUID: room});
        }
    }

    function addToOpenBubbles(bubbleData) {
        openBubbles.push({
            id: `item${parseInt(bubbleData.bubbleId)}`,
            src: `/bubbles/50shashek_${bubbleData.bubbleImg}.png`
        });
    }

    function startTimer(seconds) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        totalSeconds = seconds;

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
            username = profile.username;
        }

        socket = initializeGameSocket({
            onPlayerListUpdated: (data) => {
                players = data.map((player, index) => ({
                    ...player,
                    id: index + 1,
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
                let currentIndex = players.findIndex(u => u.username === username);
                if (currentIndex !== -1) {
                    players[currentIndex].latency = `${latency} ms`;
                }
            },
            gameAction: (data) => {
                openBubbles = [];

                function addToOpenBubbles(bubbleData) {
                    openBubbles.push({
                        id: `item${parseInt(bubbleData.bubbleId)}`,
                        src: `/bubbles/50shashek_${bubbleData.bubbleImg}.png`
                    });
                }

                if (Array.isArray(data.requestedBubbles)) {
                    if(!(data.requestedBubbles[0].bubbleImg !== data.requestedBubbles.bubbleImg)){
                        data.requestedBubbles.forEach(addToOpenBubbles);
                    }
                } else if (typeof data.requestedBubbles === 'object' && data.requestedBubbles !== null) {
                    addToOpenBubbles(data.requestedBubbles);
                }

                data.openBubbles.forEach(addToOpenBubbles);
            },
            userAlreadyInGame: (data) => {
                alert(`You are signed in game ${data}`)
            },
            timeRequested: (data) => {
                console.log(data);
                startTimer(data);
            },
            isPaused: (data) => {
                gamePaused = data.paused
            },
            openBubble: (data) => {
                addToOpenBubbles(data)
                openBubbles = [...openBubbles];
                adjustBackgroundImage();
            },
            closeBubbles: (data) => {
                openBubbles = openBubbles.filter(bubble =>
                    bubble.id !== `item${parseInt(data.firstBubbleId)}` &&
                    bubble.id !== `item${parseInt(data.secondBubbleId)}`
                );
                adjustBackgroundImage();
            },
            onGameOver: (data) => {
                alert("Game over")
            },
            getCurrentPlayer: (data) => {
                let currentPlayer = players.filter(value => {
                    return value.username === data.username
                })[0];

                for (let i = 0; i < players.length; i++) {
                    players[i].isActive = false;
                }

                players[currentPlayer.id - 1].isActive = true;
                isYourTurn = (username === currentPlayer.username);
            }
        });


        joinGame(socket, {
            id: socket.id,
            token: getCookie('token'),
            gameUUID: room
        });

        document.addEventListener('keydown', handleUserPause);

        const firstItem = document.querySelector('#item0');
        const lastItem = document.querySelector('#item99');

        const screenWidth = window.screen.width * window.devicePixelRatio;
        const screenHeight = window.screen.height * window.devicePixelRatio;


        if (firstItem && lastItem && !document.querySelector('img[src="/bg.png"]')) {
            const firstItemRect = firstItem.getBoundingClientRect();
            const lastItemRect = lastItem.getBoundingClientRect();

            const bgImage = document.createElement('img');
            bgImage.src = "/bg.png";

            bgImage.style.position = 'absolute';
            bgImage.style.left = `${firstItemRect.left - 20}px`;
            bgImage.style.top = `${firstItemRect.top + 7}px`;
            bgImage.style.width = `${(lastItemRect.right - firstItemRect.left) + 40}px`;
            bgImage.style.height = `${(lastItemRect.bottom - firstItemRect.top) + 29}px`;

            bgImage.style.zIndex = '-1';

            document.body.appendChild(bgImage);
        } else if (document.querySelector('img[src="/bg.png"]')) {
            adjustBackgroundImage();
        }

    });

    function adjustBackgroundImage() {
        const firstItem = document.querySelector('#item0');
        const lastItem = document.querySelector('#item99');
        const bgImage = document.querySelector('img[src="/bg.png"]');

        if (firstItem && lastItem && bgImage) {
            const firstItemRect = firstItem.getBoundingClientRect();
            const lastItemRect = lastItem.getBoundingClientRect();

            bgImage.style.left = `${firstItemRect.left - 20}px`;
            bgImage.style.top = `${firstItemRect.top + 7}px`;
            bgImage.style.width = `${(lastItemRect.right - firstItemRect.left) + 40}px`;
            bgImage.style.height = `${(lastItemRect.bottom - firstItemRect.top) + 29}px`;
        }
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


    window.addEventListener('resize', adjustBackgroundImage);

    import {onDestroy} from 'svelte';

    onDestroy(() => {
        window.removeEventListener('resize', adjustBackgroundImage);
        const bgImage = document.querySelector('img[src="/bg.png"]');
        if (bgImage) {
            document.body.removeChild(bgImage);
        }
        socket.disconnect();
        document.removeEventListener('keydown', handleUserPause);
    });

    let chatVisible = false;

    function toggleChat() {
        chatVisible = !chatVisible;
    }

</script>

<div class="wrapper game" style={gameStyle}>
    <div class="bg">
        <GameField {openBubbles} on:bubbleClicked={e => sendOpenedBubble(e.detail)} {isYourTurn}/>
    </div>
    <div class="toolbox">
        <Toolbox {chatVisible} {socket} {totalSeconds} {messages} toggleChat={toggleChat}/>
        <div class="player-wrapper" style="display: {chatVisible ? 'none' : 'flex'};">
            {#each players as player}
                <PlayerBlock {...player}/>
            {/each}
        </div>
    </div>
</div>


<style>
    @import "../../styles/game.scss";
</style>
