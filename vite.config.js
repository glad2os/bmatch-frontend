import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    preview: {
        host: '0.0.0.0',
        port: 5173
    },
})
