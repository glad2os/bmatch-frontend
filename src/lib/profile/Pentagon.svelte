<script>
    // Radar chart of the player's game analytics (averages from bmatch-analytics).
    // stats: {axisKey: 0..1 or null}; without stats only the empty grid is drawn.
    export let stats = null;
    export let color = '#38BDF8';

    const AXES = [
        {key: 'memory', label: 'Memory'},
        {key: 'speed', label: 'Speed'},
        {key: 'accuracy', label: 'Accuracy'},
        {key: 'streaks', label: 'Streaks'},
        {key: 'consistency', label: 'Consistency'}
    ];
    const RADIUS = 50;

    const percent = value => value == null ? '—' : `${Math.round(value * 100)}`;

    function point(index, scale) {
        const angle = -Math.PI / 2 + index * 2 * Math.PI / AXES.length;
        return [Math.cos(angle) * RADIUS * scale, Math.sin(angle) * RADIUS * scale];
    }

    function polygon(scales) {
        return scales.map((scale, index) => point(index, scale).map(value => value.toFixed(1)).join(',')).join(' ');
    }

    const rings = [1, 2 / 3, 1 / 3].map(scale => polygon(AXES.map(() => scale)));
    $: values = stats ? polygon(AXES.map(axis => Math.max(0, Math.min(1, stats[axis.key] ?? 0)))) : null;
</script>

<figure class="pentagon">
    <svg viewBox="-96 -72 192 158" role="img"
         aria-label={stats ? 'Player statistics: ' + AXES.map(axis => `${axis.label} ${percent(stats[axis.key])}`).join(', ') : 'Player statistics'}>
        {#each rings as ring}
            <polygon points={ring} class="pentagon-ring"/>
        {/each}
        {#each AXES as axis, index}
            <line x1="0" y1="0" x2={point(index, 1)[0]} y2={point(index, 1)[1]} class="pentagon-axis"/>
            <text x={point(index, 1.28)[0]} y={point(index, 1.28)[1]} class="pentagon-label"
                  text-anchor="middle" dominant-baseline="middle">{axis.label}</text>
            {#if stats}
                <text x={point(index, 1.28)[0]} y={point(index, 1.28)[1] + 9} class="pentagon-value"
                      text-anchor="middle" dominant-baseline="middle">{percent(stats[axis.key])}</text>
            {/if}
        {/each}
        {#if values}
            <polygon points={values} class="pentagon-values" style="--stat-color: {color};"/>
        {/if}
    </svg>
    {#if !values}
        <figcaption>No stats yet</figcaption>
    {/if}
</figure>
