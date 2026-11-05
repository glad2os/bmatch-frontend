<script>
    import "../../styles/profile.scss";
    import guestSvg from "../../assets/guest.svg";
    import Pentagon from "./Pentagon.svelte";
    import {PROFILE_BACKGROUNDS, profileBackground} from "./backgrounds.js";
    import {apiChangePassword, apiPlayerStats, apiUpdateProfile} from "../utils/getProfile.js";
    import {onMount} from "svelte";
    import {getCookie} from "../utils/cookies.js";

    // Own profile (editable, from /api/user/profile) or a public one (/api/user/public/:id).
    export let profile;
    export let editable = false;

    const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,50}$/;
    const LINK_PATTERN = /^https?:\/\/\S+$/;
    const MAX_LINKS = 5;

    let editing = false;
    let draft = null;
    let newLink = '';
    let saving = false;
    let error = '';
    let notice = '';

    let passwordOpen = false;
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let passwordError = '';
    let passwordNotice = '';

    // Game analytics averages (null until loaded or when the player has no analysed games).
    let stats = null;
    onMount(async () => {
        if (profile?.id == null) return;
        const {ok, data} = await apiPlayerStats(profile.id);
        if (ok && data?.games > 0) stats = data;
    });
    $: signedDelta = stats?.lastMmrDelta == null ? null : (stats.lastMmrDelta > 0 ? `+${stats.lastMmrDelta}` : `${stats.lastMmrDelta}`);

    $: shownBackground = editing ? draft.background : profile.background;
    $: links = (profile.links ?? []).filter(link => LINK_PATTERN.test(link));

    function startEdit() {
        draft = {
            username: profile.username,
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            birthday: profile.birthday ?? '',
            links: [...(profile.links ?? [])],
            background: profile.background ?? 'default'
        };
        newLink = '';
        error = notice = '';
        editing = true;
    }

    function addLink() {
        const link = newLink.trim();
        if (!LINK_PATTERN.test(link)) {
            error = 'A link must start with http:// or https://';
            return;
        }
        if (draft.links.length >= MAX_LINKS) {
            error = `Up to ${MAX_LINKS} links`;
            return;
        }
        draft.links = [...draft.links, link];
        newLink = '';
        error = '';
    }

    function removeLink(index) {
        draft.links = draft.links.filter((_, i) => i !== index);
    }

    async function save() {
        if (!USERNAME_PATTERN.test(draft.username)) {
            error = 'Username: 3-50 letters, digits, "_", "." or "-"';
            return;
        }
        saving = true;
        error = notice = '';
        const usernameChanged = draft.username !== profile.username;
        const {ok, data} = await apiUpdateProfile(getCookie('token'), {
            ...draft,
            firstName: draft.firstName.trim() || null,
            lastName: draft.lastName.trim() || null,
            birthday: draft.birthday || null
        });
        saving = false;
        if (!ok) {
            error = data?.message ?? 'Could not save the profile';
            return;
        }
        profile = data;
        editing = false;
        // The navigation menu and lobby links use the username; reload so they pick up the new one.
        if (usernameChanged) {
            window.location.reload();
            return;
        }
        notice = 'Profile saved';
    }

    async function changePassword() {
        passwordError = passwordNotice = '';
        if (newPassword.length < 6 || newPassword.length > 72) {
            passwordError = 'The new password must be 6-72 characters';
            return;
        }
        if (newPassword !== confirmPassword) {
            passwordError = 'The passwords do not match';
            return;
        }
        const {ok, data} = await apiChangePassword(getCookie('token'), currentPassword, newPassword);
        if (!ok) {
            passwordError = data?.message ?? 'Could not change the password';
            return;
        }
        currentPassword = newPassword = confirmPassword = '';
        passwordOpen = false;
        passwordNotice = 'Password changed';
    }

    async function share() {
        const url = `${window.location.origin}/profile/${profile.id}`;
        try {
            await navigator.clipboard.writeText(url);
            notice = 'Profile link copied';
        } catch {
            notice = url;
        }
    }

    function linkLabel(link) {
        try {
            const url = new URL(link);
            return url.host + (url.pathname === '/' ? '' : url.pathname);
        } catch {
            return link;
        }
    }
</script>

<div class="profile-card" style="--profile-bg: {profileBackground(shownBackground)};">
    <aside class="profile-side">
        <div class="profile-side-top">
            <div class="profile-avatar" style='background-image: url("{guestSvg}");' role="img"
                 aria-label="Avatar"></div>
        </div>
        <div class="profile-side-bottom">
            <div class="profile-username">{profile.username}</div>
            <div class="profile-mmr">{profile.mmr} MMR</div>
            <Pentagon {stats}/>
            {#if stats}
                <div class="profile-stats">
                    <div>
                        Performance <strong>{stats.performance == null ? '—' : Math.round(stats.performance * 100)}</strong>
                        · {stats.debugOnly ? stats.games : stats.ratedGames} {(stats.debugOnly ? stats.games : stats.ratedGames) === 1 ? 'game' : 'games'}
                    </div>
                    {#if stats.debugOnly}
                        <div class="profile-stats-note">Debug games only · not rated</div>
                    {:else if signedDelta !== null && stats.lastRated}
                        <div>Last game <strong class:gain={stats.lastMmrDelta > 0} class:loss={stats.lastMmrDelta < 0}>{signedDelta} MMR</strong></div>
                    {/if}
                </div>
            {/if}
        </div>
    </aside>

    <section class="profile-main">
        <header class="profile-main-header">
            <h1>{editable ? 'Profile settings' : profile.username}</h1>
            <div class="profile-actions">
                <button type="button" class="profile-button secondary" on:click={share}>Share</button>
                {#if editable && !editing}
                    <button type="button" class="profile-button" on:click={startEdit}>Edit</button>
                {/if}
                {#if editing}
                    <button type="button" class="profile-button secondary" on:click={() => editing = false}
                            disabled={saving}>Cancel
                    </button>
                    <button type="button" class="profile-button" on:click={save} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                {/if}
            </div>
        </header>

        {#if error}<p class="profile-message error" role="alert">{error}</p>{/if}
        {#if notice}<p class="profile-message" role="status">{notice}</p>{/if}

        <div class="profile-fields">
            <label class="profile-field">
                <span>Username</span>
                {#if editing}
                    <input type="text" bind:value={draft.username} maxlength="50" autocomplete="username">
                {:else}
                    <strong>{profile.username}</strong>
                {/if}
            </label>
            <label class="profile-field">
                <span>First name</span>
                {#if editing}
                    <input type="text" bind:value={draft.firstName} maxlength="50" autocomplete="given-name">
                {:else}
                    <strong>{profile.firstName || '—'}</strong>
                {/if}
            </label>
            <label class="profile-field">
                <span>Second name</span>
                {#if editing}
                    <input type="text" bind:value={draft.lastName} maxlength="50" autocomplete="family-name">
                {:else}
                    <strong>{profile.lastName || '—'}</strong>
                {/if}
            </label>
            {#if editable}
                <label class="profile-field">
                    <span>Birthday</span>
                    {#if editing}
                        <input type="date" bind:value={draft.birthday} max={new Date().toISOString().slice(0, 10)}>
                    {:else}
                        <strong>{profile.birthday || '—'}</strong>
                    {/if}
                </label>
                <div class="profile-field">
                    <span>Email</span>
                    <strong>{profile.email}</strong>
                </div>
            {/if}
        </div>

        <h2>Links to your accounts</h2>
        {#if editing}
            <ul class="profile-links editing">
                {#each draft.links as link, index}
                    <li>
                        <span>{link}</span>
                        <button type="button" class="profile-button secondary small" on:click={() => removeLink(index)}>
                            Remove
                        </button>
                    </li>
                {/each}
            </ul>
            {#if draft.links.length < MAX_LINKS}
                <form class="profile-add-link" on:submit|preventDefault={addLink}>
                    <input type="url" bind:value={newLink} placeholder="https://github.com/you" maxlength="200">
                    <button type="submit" class="profile-button secondary">Add link</button>
                </form>
            {/if}
        {:else if links.length}
            <ul class="profile-links">
                {#each links as link}
                    <li><a href={link} target="_blank" rel="noopener noreferrer nofollow">{linkLabel(link)}</a></li>
                {/each}
            </ul>
        {:else}
            <p class="profile-empty">No links yet</p>
        {/if}

        {#if editing}
            <h2>Background</h2>
            <div class="profile-backgrounds" role="radiogroup" aria-label="Profile background">
                {#each Object.entries(PROFILE_BACKGROUNDS) as [key, value]}
                    <button type="button" class="profile-swatch" class:selected={draft.background === key}
                            role="radio" aria-checked={draft.background === key} aria-label={key}
                            style="background: {value};" on:click={() => draft.background = key}></button>
                {/each}
            </div>
        {/if}

        {#if editable}
            <h2>Password</h2>
            {#if passwordNotice}<p class="profile-message" role="status">{passwordNotice}</p>{/if}
            {#if passwordOpen}
                <form class="profile-password" on:submit|preventDefault={changePassword}>
                    <label class="profile-field">
                        <span>Current password</span>
                        <input type="password" bind:value={currentPassword} autocomplete="current-password" required>
                    </label>
                    <label class="profile-field">
                        <span>New password</span>
                        <input type="password" bind:value={newPassword} autocomplete="new-password" required>
                    </label>
                    <label class="profile-field">
                        <span>Repeat new password</span>
                        <input type="password" bind:value={confirmPassword} autocomplete="new-password" required>
                    </label>
                    {#if passwordError}<p class="profile-message error" role="alert">{passwordError}</p>{/if}
                    <div class="profile-actions">
                        <button type="button" class="profile-button secondary" on:click={() => passwordOpen = false}>
                            Cancel
                        </button>
                        <button type="submit" class="profile-button">Change password</button>
                    </div>
                </form>
            {:else}
                <div class="profile-password-row">
                    <strong>••••••••</strong>
                    <button type="button" class="profile-button secondary" on:click={() => passwordOpen = true}>
                        Edit password
                    </button>
                </div>
            {/if}
        {/if}
    </section>
</div>
