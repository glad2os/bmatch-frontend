<script>
    import {createEventDispatcher, onMount} from 'svelte';

    export let message = '';
    export let confirmLabel = 'Exit';
    export let cancelLabel = 'Stay';

    const dispatch = createEventDispatcher();
    let cancelButton;

    // Focus the safe choice so an accidental Enter does not confirm.
    onMount(() => cancelButton?.focus());

    function handleKeydown(event) {
        if (event.key === 'Escape') dispatch('cancel');
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="confirm-overlay" role="presentation" on:click|self={() => dispatch('cancel')}>
    <div class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-message">
        <p id="confirm-message">{message}</p>
        <div class="confirm-actions">
            <button type="button" class="confirm-cancel" bind:this={cancelButton} on:click={() => dispatch('cancel')}>
                {cancelLabel}
            </button>
            <button type="button" class="confirm-ok" on:click={() => dispatch('confirm')}>
                {confirmLabel}
            </button>
        </div>
    </div>
</div>
