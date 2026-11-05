<script>
    import NavigationMenu from "../lib/navigation/NavigationMenu.svelte";
    import ProfileCard from "../lib/profile/ProfileCard.svelte";
    import {getCookie} from "../lib/utils/cookies.js";
    import {getProfile} from "../lib/utils/getProfile.js";
    import {onMount} from "svelte";

    let profile = null;

    onMount(async () => {
        const token = getCookie('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        // getProfile redirects to /login when the session has expired.
        profile = await getProfile(token);
    });
</script>

<svelte:head>
    <title>Bubble Match: Profile settings</title>
</svelte:head>

<NavigationMenu/>
<div class="wrapper profile-page">
    {#if profile}
        <ProfileCard {profile} editable/>
    {:else}
        <p class="profile-loading">Loading…</p>
    {/if}
</div>
