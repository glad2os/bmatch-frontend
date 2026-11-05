<script>
    import NavigationMenu from "../lib/navigation/NavigationMenu.svelte";
    import ProfileCard from "../lib/profile/ProfileCard.svelte";
    import {apiPublicProfile} from "../lib/utils/getProfile.js";
    import {onMount} from "svelte";

    // Public, shareable profile: /profile/<user id>.
    export let user_id;

    let profile = null;
    let notFound = false;

    onMount(async () => {
        const {ok, data} = await apiPublicProfile(user_id);
        if (ok) profile = data;
        else notFound = true;
    });
</script>

<svelte:head>
    <title>Bubble Match: {profile ? profile.username : 'Profile'}</title>
</svelte:head>

<NavigationMenu/>
<div class="wrapper profile-page">
    {#if profile}
        <ProfileCard {profile}/>
    {:else if notFound}
        <p class="profile-loading">Profile not found</p>
    {:else}
        <p class="profile-loading">Loading…</p>
    {/if}
</div>
