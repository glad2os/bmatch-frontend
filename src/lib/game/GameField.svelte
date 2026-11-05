<script>
    import sourceImgSrc from '../../assets/item.png';
    import {UNKNOWN_OWNER_COLOR} from './playerColors.js';

    export let openBubbles = [];
    export let isYourTurn = false;
    // Player key -> colour; opened bubbles glow in the colour of the player who opened them.
    export let playerColors = {};
    // Outline colour on hover: the viewer's own seat colour (white for spectators).
    export let hoverColor = '#FFFFFF';

    import { createEventDispatcher, onDestroy } from 'svelte';
    const dispatch = createEventDispatcher();

    // A bubble whose picture changes (opened or closed) flips: it narrows to an edge, swaps the picture
    // and widens again. Bulk changes (joining or reconnecting) are applied at once.
    const FLIP_MS = 320;
    const MAX_ANIMATED_CHANGES = 4;
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let shownSrc = Array(100).fill(sourceImgSrc);
    // The picture each bubble is heading to (shownSrc lags behind it during a flip).
    const shownTarget = Array(100).fill(sourceImgSrc);
    let flipping = Array(100).fill(false);
    const flipTimers = Array(100).fill(null);

    let items = Array(100).fill(undefined).map((_, i) => ({
        id: `item${i}`,
        src: sourceImgSrc,
        selected: false
    }));

    $: {
        items = items.map((item, i) => {
            let foundBubble = openBubbles.find(bubble => bubble.id === `item${i}`);
            return {
                id: `item${i}`,
                src: foundBubble ? foundBubble.src : sourceImgSrc,
                selected: false,
                highlighted: !!foundBubble,
                // "pending": opened this turn, "matched": part of a found pair.
                state: foundBubble ? (foundBubble.matched ? 'matched' : 'pending') : null,
                ownerColor: foundBubble ? (playerColors[foundBubble.owner] ?? UNKNOWN_OWNER_COLOR) : null
            };
        });
        syncShown(items);
    }

    function syncShown(targets) {
        const changed = targets.map((item, i) => i).filter(i => targets[i].src !== shownTarget[i]);
        if (!changed.length) return;
        const animate = !reducedMotion && changed.length <= MAX_ANIMATED_CHANGES;
        for (const i of changed) {
            shownTarget[i] = targets[i].src;
            if (animate) flip(i, targets[i].src);
            else showNow(i, targets[i].src);
        }
    }

    function showNow(i, src) {
        clearTimeout(flipTimers[i]);
        shownSrc[i] = src;
        flipping[i] = false;
        shownSrc = shownSrc;
        flipping = flipping;
    }

    function flip(i, src) {
        clearTimeout(flipTimers[i]);
        new Image().src = src; // start loading the new picture before it is swapped in
        flipping[i] = true;
        flipping = flipping;
        flipTimers[i] = setTimeout(() => {
            shownSrc[i] = src;
            shownSrc = shownSrc;
            flipTimers[i] = setTimeout(() => {
                flipping[i] = false;
                flipping = flipping;
            }, FLIP_MS / 2);
        }, FLIP_MS / 2);
    }

    onDestroy(() => flipTimers.forEach(timer => clearTimeout(timer)));


    function handleClick(item) {
        if (!isYourTurn) return;

        if(item.src === sourceImgSrc) {
            dispatch('bubbleClicked', item.id.replace('item', ''));
        }
    }

    function preventDefault(event) {
        event.preventDefault();
    }

    // "hovered" outlines the other bubble of an opened pair together with the one under the cursor.
    function updateStyle(elementId, animation, hovered) {
        const elem = document.getElementById(elementId);
        if (!elem) return;

        elem.style.animation = animation;
        elem.classList.toggle('hovered', hovered);
    }


    function handleMouseOver(event) {
        const targetSrc = event.currentTarget.src;

        const duplicateItems = getDuplicateItems(targetSrc);
        if (duplicateItems.length > 1) {
            duplicateItems.forEach(item => {
                updateStyle(item.id, 'sinusoidalHover 2s infinite', true);
            });
        } else {
            updateStyle(event.currentTarget.id, 'sinusoidalHover 2s infinite', false);
        }
    }

    function handleMouseOut(event) {
        const targetSrc = event.currentTarget.src;
        const currentTargetId = event.currentTarget.id;

        const duplicateItems = getDuplicateItems(targetSrc);
        if (duplicateItems.length > 1) {
            duplicateItems.forEach(item => {
                updateStyle(item.id, 'sinusoidalLeave 1s forwards', false);
                setTimeout(() => {
                    updateStyle(item.id, '', false);
                }, 1000);
            });
        } else {
            updateStyle(currentTargetId, 'sinusoidalLeave 1s forwards', false);
            setTimeout(() => {
                updateStyle(currentTargetId, '', false);
            }, 1000);
        }
    }

    function getRelativePath(fullPath) {
        const index = fullPath.indexOf('/bubbles/');
        return (index !== -1) ? fullPath.slice(index) : fullPath;
    }

    function getDuplicateItems(targetSrc) {
        const relativeTargetSrc = getRelativePath(targetSrc);
        return items.filter(item => item.src === relativeTargetSrc);
    }

</script>

<div class="game-container" style="--hover-color: {hoverColor};">
    {#each items as item, index}
        <img
                src={shownSrc[index]}
                draggable="false"
                class="item"
                class:flipping={flipping[index]}
                class:opened={item.state}
                class:pending={item.state === 'pending'}
                class:matched={item.state === 'matched'}
                id={item.id}
                alt="Game item"
                style="--translateY: {Math.floor(index / 10) * -26.5}%;{item.ownerColor ? ` --owner-color: ${item.ownerColor};` : ''}"
                on:click={() => handleClick(item)}
                on:mouseout={handleMouseOut}
                on:mouseover={handleMouseOver}
        />
    {/each}
</div>