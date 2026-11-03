<script>
    import NavItem from "./NavItem.svelte";
    import {getCookie} from "../utils/cookies.js";
    import {getProfile} from "../utils/getProfile.js";
    import {onMount} from "svelte";
    import {generateRange} from "../utils/mmr.js";
    import guestSvg from "../../assets/guest.svg";

    let signInVisible = true;
    let user = "GUEST";
    let mmr = 0;
    let profileImg = guestSvg;

    let lobbylink = "/login";


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
            <div class="nickname-block">
                <div class="info">
                    <div class="user">{user}</div>
                    <div class="mmr">{mmr} MMR</div>
                </div>
                <div class="img" style='background-image: url("{profileImg}")'>

                </div>
            </div>

        {/if}
    </div>
</div>

<style>
    @import "../../styles/logo.scss";
</style>
