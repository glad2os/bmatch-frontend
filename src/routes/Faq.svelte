<script>
    import "../styles/page.scss";
    import NavigationMenu from "../lib/navigation/NavigationMenu.svelte";
</script>

<svelte:head>
    <title>Bubble Match: How to play</title>
</svelte:head>

<NavigationMenu/>
<div class="wrapper rules faq">

    <h1>How to play Bubble Match</h1>

    <div class="rules">
        <div class="block">
            <h2>1. The goal</h2>
            <ul>
                <li>Bubble Match is a memory game for up to 4 players: people and bots.</li>
                <li>The board has 100 bubbles that hide 50 pairs of pictures.</li>
                <li>Find more pairs than your opponents. The game ends when all 50 pairs are found.</li>
            </ul>
        </div>

        <div class="block">
            <h2>2. Starting a game</h2>
            <ul>
                <li>Press "Start game" on the home page or "Create a lobby" in the menu to open your lobby.</li>
                <li>Use "Copy link" to invite friends: anyone with the link joins your lobby.</li>
                <li>The lobby creator (Admin) can add bots to fill empty seats.</li>
                <li>When all 4 seats are taken, the Admin presses "Start game".</li>
            </ul>
        </div>

        <div class="block">
            <h2>3. Your turn</h2>
            <ul>
                <li>Open two bubbles, one after another.</li>
                <li>Same picture: the pair is yours, it stays open and you move again.</li>
                <li>Different pictures: both bubbles close after 2 seconds and the turn passes to the next player.</li>
                <li>You have 30 seconds per turn. If the time runs out, the turn passes.</li>
            </ul>
        </div>

        <div class="block">
            <h2>4. Colours</h2>
            <ul>
                <li>Every seat has its own colour: 1 blue, 2 amber, 3 green, 4 violet.</li>
                <li>The player whose turn it is has a filled, glowing block in the player list.</li>
                <li>Bubbles opened in the current turn pulse in the colour of the player who opened them.</li>
                <li>Found pairs are dimmed and keep a thin outline in the colour of the player who found them.
                    Hover over one to see it and its pair at full brightness.</li>
                <li>The outline under your cursor is in your own colour.</li>
            </ul>
        </div>

        <div class="block">
            <h2>5. Bots</h2>
            <ul>
                <li>Bots open bubbles on their own and usually guess at random.</li>
                <li>The percentage next to a bot is its progress towards a guaranteed find. It grows with every
                    bot turn without a deliberate find.</li>
                <li>At 100% the bot will find a pair. Most finds happen near the top of the bar, but a lucky
                    guess can come earlier.</li>
            </ul>
        </div>

        <div class="block">
            <h2>6. Winning</h2>
            <ul>
                <li>When the last pair is found, the player with the most pairs wins. Equal scores share the win.</li>
                <li>Completed games are saved, so they can be replayed and analysed later.</li>
            </ul>
        </div>

        <div class="block">
            <h2>7. Pause and leaving</h2>
            <ul>
                <li>Press F9 to pause or resume the game. The turn timer stops while the game is paused.
                    Each player can pause once every 5 minutes.</li>
                <li>Press Tab or write "GG, WP" in the chat to leave the game early. You will be asked to
                    confirm. After leaving you can only watch that game.</li>
                <li>If every player leaves, or nobody moves for 5 minutes, the game is closed and not saved.</li>
                <li>Closed the page by accident? Open your lobby again and press "Return to game".</li>
            </ul>
        </div>

        <div class="block">
            <h2>8. Chat</h2>
            <ul>
                <li>Open the chat with the icon above the player list.</li>
                <li>Only players of the game can write; messages are up to 64 characters.</li>
                <li>Pressing Enter on an empty message sends "GG, WP", which asks whether you want to leave.</li>
            </ul>
        </div>
    </div>

</div>
