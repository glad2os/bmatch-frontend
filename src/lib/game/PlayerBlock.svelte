<script>
    export let id;
    export let username = '';
    export let mmr = '';
    export let isActive = false;
    export let img;
    export let latency = '';
    export let color = '';
    export let type = '';
    // Bots only: progress (0..100) towards a guaranteed find of a pair, sent by the server.
    export let findProgress = null;
    // Players who left the game keep their seat but are greyed out.
    export let left = false;
</script>

<div class="player-block" class:active={isActive} class:left style="--player-color: {color};">
    <div class="id {isActive ? 'active' : 'inactive'}">
        {id}
    </div>
    <div class="info">
        <div class="left">
            <div class="img" style='background-image: url("{img.guestSvg}")'></div>
        </div>
        <div class="right">
            <div class="nickname">{username}</div>
            <div class="mmr">{mmr} MMR</div>
        </div>
        <div class="latency-block">
            {#if left}
                <div class="left-label">Left</div>
            {:else if type === 'Bot' && findProgress != null}
                <div class="chance" title="Progress towards a guaranteed pair: the closer to 100%, the more likely the bot finds one">
                    <div class="chance-value">{findProgress}%</div>
                    <div class="chance-bar"><span style="width: {findProgress}%;"></span></div>
                </div>
            {:else}
                <div class="latency">{latency}</div>
            {/if}
        </div>
    </div>
</div>
