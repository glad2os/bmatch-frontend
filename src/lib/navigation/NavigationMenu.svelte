<script>
    import "../../styles/logo.scss";
    import NavItem from "./NavItem.svelte";
    import {getCookie} from "../utils/cookies.js";
    import {getProfile} from "../utils/getProfile.js";
    import {onMount} from "svelte";
    import {Link} from "svelte-routing";
    import {generateRange} from "../utils/mmr.js";
    import guestSvg from "../../assets/guest.svg";

    let signInVisible = true;
    let user = "GUEST";
    let mmr = 0;
    let profileImg = guestSvg;

    let lobbylink = "/login";

    // Profile dropdown: Profile Settings now, Friend List and Matches later.
    let menuOpen = false;
    let menuRoot;

    function closeMenuOnOutsideClick(event) {
        if (menuOpen && menuRoot && !menuRoot.contains(event.target)) menuOpen = false;
    }

    function closeMenuOnEscape(event) {
        if (event.key === 'Escape') menuOpen = false;
    }


    async function loadProfile() {
        const token = getCookie('token');
        if (token !== null) {
            let profile = await getProfile(token);
            if (!profile) return;
            user = profile.username;
            mmr = profile.mmr;
            signInVisible = false;
            const roomNumber = `${profile.username}#${generateRange(profile.mmr)}`;
            lobbylink = `/create-lobby/${encodeURIComponent(roomNumber)}`
        }
    }



    onMount(() => {
        if (getCookie('token') !== null) {
            loadProfile();
        }
    });

</script>

<svelte:window on:click={closeMenuOnOutsideClick} on:keydown={closeMenuOnEscape}/>

<div class="navigationMenu">
    <div class="left">
        <div class="logo">

        </div>
        <NavItem to="/" label="Home"/>
        <NavItem to="/faq" label="How to play"/>
        <NavItem to="{lobbylink}" label="Create a lobby"/>
        <NavItem to="/rules" label="Rules"/>
    </div>
    <div class="right">
        {#if signInVisible}
            <NavItem to="/login" label="Sign in"/>
        {:else}
            <div class="profile-menu" bind:this={menuRoot}>
                <button type="button" class="nickname-block" aria-haspopup="menu" aria-expanded={menuOpen}
                        on:click={() => menuOpen = !menuOpen}>
                    <div class="info">
                        <div class="user">{user}</div>
                        <div class="mmr">{mmr} MMR</div>
                    </div>
                    <div class="img" style='background-image: url("{profileImg}")'></div>
                </button>
                {#if menuOpen}
                    <div class="profile-dropdown" role="menu">
                        <Link to="/me" class="profile-dropdown-item">Profile Settings</Link>
                        <span class="profile-dropdown-item disabled" role="menuitem" aria-disabled="true">
                            Friend List <em>soon</em>
                        </span>
                        <span class="profile-dropdown-item disabled" role="menuitem" aria-disabled="true">
                            Matches <em>soon</em>
                        </span>
                    </div>
                {/if}
            </div>

        {/if}
    </div>
</div>
