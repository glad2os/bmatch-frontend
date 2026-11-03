<script>
    import "../styles/new-lobby.scss";
    import NavigationMenu from "../lib/navigation/NavigationMenu.svelte";
    import guestSvg from "./../assets/guest.svg";
    import {getProfile} from "../lib/utils/getProfile.js";
    import {getCookie} from "../lib/utils/cookies.js";
    import {onMount, onDestroy} from "svelte";
    import {initializeLobbySocket, joinLobby, generateGame} from '../lib/webSocket/lobbySocket.js';
    import {copyToClipboard} from "./../lib/utils/uiHelpers.js";

    let socket;
    let destroyed = false;

    let players = [];
    let playerId = 1;
    let lobbyID = '';
    let isLobbyRemoved = false;
    let addBotVisible = true;
    let startGameVisible = false;

    let readyVisible = false;

    let mmr = 2000;
    let username = "Guest";
    let uuid = '';

    onMount(async () => {
        if (getCookie('token') !== null) {
            let profile = await getProfile(getCookie('token'));
            if (destroyed) return;
            if (!profile) { window.location.href = '/login'; return; }
            mmr = profile.mmr;
            username = profile.username;

            const path = window.location.pathname;
            const segments = path.split('/');
            lobbyID = decodeURIComponent(segments[segments.length - 1]);

            socket = initializeLobbySocket({
                onPlayerListUpdated: ({currentLobbyPlayers}) => {

                    players = [];

                    for (let i = 0; i < currentLobbyPlayers.length; i++) {
                        players = [...players, {
                            id: playerId,
                            username: currentLobbyPlayers[i].username,
                            mmr: currentLobbyPlayers[i].mmr,
                            type: currentLobbyPlayers[i].type,
                            ready: currentLobbyPlayers[i].ready
                        }];
                        if (players.length === 4) {
                            addBotVisible = false;
                            startGameVisible = true;
                            readyVisible = false;
                        } else {
                            addBotVisible = true;
                            startGameVisible = false;
                            readyVisible = false;
                        }
                    }
                },
                systemMessage: (data) => {
                    alert(data.message)
                },
                onLobbyRemoved: () => {
                    socket.disconnect();
                    players = [];
                    lobbyID = "Removed";
                    isLobbyRemoved = true;
                    readyVisible = false;
                    addBotVisible = false;
                },

                userExist: () => {
                    socket.disconnect();
                    players = [];
                    lobbyID = " Connected from another tab or device";
                    isLobbyRemoved = true;
                },
                gameRedirect: () => {
                    readyVisible = true;
                },

                gameUUID: (data) => {
                    uuid = data;
                    window.location.href=`/game/${data}`;
                }
            });

            joinLobby(socket, {
                id: socket.id,
                token: getCookie('token'),
                lobbyID: lobbyID
            });

        } else {
            window.location.href = '/login';
        }
    });
    onDestroy(() => {
        destroyed = true;
        socket?.disconnect();
    });


    function addBot() {
        if (players.length < 4) {
            joinLobby(socket, {
                    type: "Bot",
                    token: getCookie('token'),
                    lobbyID: lobbyID
                }
            );
        }
    }

    function requestGame() {
        if (players.length === 4) {
            generateGame(socket, {
                    token: getCookie('token'),
                }
            );
        }
    }

    function redirectGame() {
        window.location.href = '/game/' + uuid;
    }

</script>

<svelte:head>
    <title>Lobby: #{username}</title>
</svelte:head>

<NavigationMenu></NavigationMenu>
<div class="wrapper new-lobby">

    <div class="lobby-wrapper">
        <div class="header"><p>Lobby: {lobbyID}</p></div>
        <div class="user-block">
            {#each players as player}
                <div class="user">
                    <div class="left">
                        <img src="{guestSvg}" alt="">
                        <div class="user-info">
                            <p style="color: {player.ready || player.type ==='Bot' ? 'green' : ''}">{player.username}</p>
                            <p>{player.mmr} MMR</p>
                        </div>
                    </div>
                    <div class="right">
                        <p>{player.type}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="lobby-toolbox" style="display: {isLobbyRemoved ? 'none' : 'flex'}">
        <div class="button" on:click={copyToClipboard}>
            <p>Copy link</p>
        </div>

        <div class="button" on:click={addBot} style="display: {addBotVisible ? 'flex' : 'none'};">
            <p>Add bot</p>
        </div>

        <div class="button" on:click={requestGame} style="display: {startGameVisible ? 'flex' : 'none'};">
            <p>Start game</p>
        </div>

    </div>
</div>
<div class="ready" on:click={redirectGame} style="display: {readyVisible ? 'flex' : 'none'};">
    READY
</div>
