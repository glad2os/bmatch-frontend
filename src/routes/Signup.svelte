<script>
    import {apiSignUp, getProfile} from "../lib/utils/getProfile.js";
    import {setCookie} from "../lib/utils/cookies.js";
    import {navigate} from "svelte-routing";

    function navigateToLogin() {
        window.location.href = '/login';
    }

    let username = '';
    let email = '';
    let password = '';

    async function signup() {
        if (email.length < 6 || username.length < 3 || password.length < 6)
            return;

        let data = await apiSignUp(email, password, username);

        if (data?.statusCode === 200) {
               navigate(`/login`);
        }
    }

</script>
<div class="wrapper auth">
    <div class="signin-wrapper">
        BUBBLE MATCH
    </div>
    <div class="edits-wrapper">
        <form class="nav" on:submit|preventDefault={signup}>
            <input name="email" bind:value={email} placeholder="Gmail" type="email">
            <input name="username" bind:value={username} placeholder="Username" type="text">
            <input name="password" bind:value={password} placeholder="Password" type="password">
            <button type="submit" class="button">Create account</button>
            <div class="info">
                <div class="grey">Already have an account?</div>
                <div
                        class="red"
                        role="button"
                        tabindex="0"
                        on:click={navigateToLogin}
                        on:keydown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') navigateToLogin();
                        }}>
                    Log in
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
