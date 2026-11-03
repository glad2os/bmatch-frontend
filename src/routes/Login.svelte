<script>

    import {setCookie} from "../lib/utils/cookies.js";
    import {apiLogin, getProfile} from "../lib/utils/getProfile.js";
    import {generateRange} from "../lib/utils/mmr.js";
    import {navigate} from "svelte-routing";

    let email = "";
    let password = "";

    function navigateToSignup() {
        window.location.href = '/signup';
    }

    async function login() {
        if (email.length < 6 || password.length < 6) return;

        let data = await apiLogin(email, password);

        if (data?.message) {
            setCookie('token', data.message)

            let profile = await getProfile(data.message);
            if (!profile) { navigate('/login'); return; }
            let roomNumber = `${profile.username}#${generateRange(profile.mmr)}`
            navigate(`/create-lobby/${encodeURIComponent(roomNumber)}`);
        }

    }

    function handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            navigateToSignup();
        }
    }
</script>

<div class="wrapper auth">
    <div class="signin-wrapper">
        BUBBLE MATCH
    </div>
    <div class="edits-wrapper">
        <form class="nav" on:submit|preventDefault={login}>
            <input name="email" bind:value={email} placeholder="Gmail" type="email">
            <input name="password" bind:value={password} placeholder="Password" type="password">
            <button type="submit" class="button">Sign in</button>
            <div class="info">
                <div class="grey">Still not have an account?</div>
                <div
                        class="red"
                        role="button"
                        tabindex="0"
                        on:click={navigateToSignup}
                        on:keydown={handleKeydown}>
                    Sign up
                </div>
            </div>
            <div class="privacy">
            </div>
        </form>

    </div>
</div>

<style>
    @import "../styles/auth.scss";
</style>
