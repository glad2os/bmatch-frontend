<script>
    import { onMount, onDestroy } from 'svelte';
    import { getProfile } from "../utils/getProfile.js";
    import { getCookie } from "../utils/cookies.js";

    export let chatVisible;
    export let toggleChat;
    export let socket;

    let minutes = 0;
    let seconds = 0;
    let messageContent = '';
    let roomId = '';
    export let totalSeconds;

    export let messages = [];

    let currentUser = 'GUEST';
    let destroyed = false;
    let sendCooldown;
    let chatContainer;
    let countdownInterval;

    function handleMouseClick(event) {
        if (event.altKey && event.button === 0) {
            const timeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            messages = [...messages, {username: "SELF-MESSAGE", content: timeLeft}];
        }
    }

    onMount(async () => {
        const token = getCookie('token');
        const profile = token ? await getProfile(token) : null;
        if (destroyed) return;
        currentUser = profile?.username || 'GUEST';

        const path = window.location.pathname;
        const segments = path.split('/');
        roomId = segments[segments.length - 1];

        document.addEventListener('mousedown', handleMouseClick);

    });
    onDestroy(() => {
        destroyed = true;
        document.removeEventListener('mousedown', handleMouseClick);
        clearInterval(countdownInterval);
        clearTimeout(sendCooldown);
    });

    $: if (typeof totalSeconds !== 'undefined') {
        seconds = totalSeconds
    }

    $: if (messages.length) {
        scrollToBottom();
    }

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    let canSend = true;

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            messageContent = event.target.value;

            if (!canSend || !socket) return;

            if (messageContent.length < 1) {
                messageContent = "GG, WP";
            }

            event.target.value = '';

            socket.emit('chatMessage', {
                message: messageContent,
                gameUUID: roomId,
                username: currentUser,
                token: getCookie('token')
            });

            canSend = false;

            sendCooldown = setTimeout(() => {
                canSend = true;
            }, 1000);
        }
    }
</script>

<div class="header">
    <div class="switch"
         on:click={toggleChat}
         role="button"
         tabindex="0"
         aria-label="Toggle chat"
         on:keydown={() => {}}>
        <div class={chatVisible ? 'game-icon' : 'chat-icon'}></div>
    </div>
    <div class="timer">
        Time left: {(minutes || 0).toString().padStart(2, '0')}:{(seconds || 0).toString().padStart(2, '0')}
    </div>
</div>
<div class="chat" style="display: {chatVisible ? 'flex' : 'none'};">
    <div class="textarea" bind:this={chatContainer}>
        {#each messages as message}
            <div class="msg">
                {message.username}: {message.content}
            </div>
        {/each}
    </div>
    <div class="input">
        <input
                type="text"
                maxlength="64"
                placeholder="GG, WP"
                bind:value={messageContent}
                on:keydown={handleKeyDown}
        />
    </div>
</div>
