<script>
    import {Router, Route} from "svelte-routing";
    import Home from "./routes/Home.svelte";
    import Game from "./routes/Game.svelte";
    import Login from "./routes/Login.svelte";
    import Signup from "./routes/Signup.svelte";
    import Health from "./routes/Health.svelte";
    import FAQ from "./routes/Faq.svelte";
    import Rules from "./routes/Rules.svelte";
    import NewLobby from "./routes/NewLobby.svelte";
    import Profile from "./routes/Profile.svelte";
    import Me from "./routes/Me.svelte";
    import NotFound from "./routes/NotFound.svelte";
</script>

<Router>
    <Route path="/" component={Home}/>
    <Route path="/game/:room" component={Game}/>
    <Route path="/faq" component={FAQ}/>
    <Route path="/rules" component={Rules}/>
    <Route path="/login" component={Login}/>
    <Route path="/signup" component={Signup}/>
    <Route path="/health" component={Health}/>
    <Route path="/create-lobby/:room" component={NewLobby}/>
    <Route path="/me" component={Me}/>
    <Route path="/profile/:user_id" component={Profile}/>
    <Route path="/*" let:params>
        <NotFound />
    </Route>
</Router>
