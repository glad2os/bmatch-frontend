<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import {playerKey} from './playerColors.js';

    // Seats as shown in the player list ({type, userId, username, color, left}).
    export let players = [];
    // The server's gameOver payload: {reason, debug, pairs: [{player, pairs}], winners: [{type, id}]}.
    export let result = {};
    // The signed-in user's id, or null for guests.
    export let profileId = null;

    const TOTAL_PAIRS = 50;
    const dispatch = createEventDispatcher();
    let primaryButton;

    onMount(() => primaryButton?.focus());

    $: pairsByKey = Object.fromEntries((result.pairs ?? []).map(entry => [playerKey(entry.player.type, entry.player.id), entry.pairs]));
    $: winnerKeys = new Set((result.winners ?? []).map(winner => playerKey(winner.type, winner.id)));
    $: rows = rank(players.map(player => ({
        ...player,
        key: playerKey(player.type, player.userId),
        pairs: pairsByKey[playerKey(player.type, player.userId)] ?? 0,
        you: player.type !== 'Bot' && profileId !== null && player.userId === profileId
    })));
    $: me = rows.find(row => row.you);
    $: abandoned = result.reason === 'abandoned';
    $: title = abandoned ? 'Game over'
        : !me ? 'Game over'
            : winnerKeys.has(me.key) ? (winnerKeys.size > 1 ? 'Shared victory!' : 'Victory!')
                : `${ordinal(me.place)} place`;
    $: subtitle = abandoned ? 'Everyone left the game'
        : `All ${TOTAL_PAIRS} pairs found${me ? ` · you found ${me.pairs}` : ''}`;

    // Equal pair counts share a place: 1, 2, 2, 4.
    function rank(list) {
        const sorted = [...list].sort((a, b) => b.pairs - a.pairs);
        return sorted.map((row, index) => ({
            ...row,
            place: sorted.findIndex(other => other.pairs === row.pairs) + 1
        }));
    }

    function ordinal(place) {
        return {1: '1st', 2: '2nd', 3: '3rd'}[place] ?? `${place}th`;
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') dispatch('close');
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="results-overlay" role="presentation">
    <div class="results-dialog" class:won={me && winnerKeys.has(me.key)} role="dialog" aria-modal="true"
         aria-labelledby="results-title">
        <header class="results-header">
            {#if me && winnerKeys.has(me.key)}
                <svg class="results-crown" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 18h18l-1.5-10-5 4L12 5l-2.5 7-5-4L3 18zm0 2h18v1.5H3z"/>
                </svg>
            {/if}
            <h2 id="results-title">{title}</h2>
            <p>{subtitle}</p>
            {#if result.debug}
                <span class="results-tag">Debug game · not rated</span>
            {/if}
        </header>

        <ol class="results-list">
            {#each rows as row (row.key)}
                <li class:you={row.you} class:winner={winnerKeys.has(row.key)} style="--player-color: {row.color};">
                    <span class="results-place">{row.place}</span>
                    <span class="results-swatch" aria-hidden="true"></span>
                    <span class="results-name">
                        {row.username}
                        {#if row.you}<em>you</em>{/if}
                        {#if row.left}<em class="muted">left</em>{/if}
                    </span>
                    <span class="results-bar" aria-hidden="true">
                        <span style="width: {Math.round(row.pairs / TOTAL_PAIRS * 100)}%;"></span>
                    </span>
                    <span class="results-pairs">{row.pairs} <small>{row.pairs === 1 ? 'pair' : 'pairs'}</small></span>
                </li>
            {/each}
        </ol>

        <footer class="results-actions">
            <button type="button" class="results-secondary" on:click={() => dispatch('close')}>View board</button>
            {#if profileId !== null}
                <a class="results-secondary" href="/me">My profile</a>
            {/if}
            <button type="button" class="results-primary" bind:this={primaryButton} on:click={() => dispatch('home')}>
                Back to lobby
            </button>
        </footer>
    </div>
</div>
