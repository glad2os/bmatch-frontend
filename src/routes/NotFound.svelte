<script>
    import "../styles/not-found.scss";
    function goHome(){
        window.location.href='/';
    }
</script>

<div class="wrapper page-missing">
    <div class="left">
        <div class="label">Something<br/>went missing</div>
        <p>You didn't break the internet, but we can’t find what you're looking for.</p>
        <div class="button" on:click={goHome}>Go Homepage</div>
    </div>
    <div class="right">
        <div class="not-found"></div>
    </div>
</div>
