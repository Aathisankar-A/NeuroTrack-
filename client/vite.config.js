import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Ensures assets resolve correctly when deployed to a sub-path or CDN
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        port: 5173,
        // Dev-only proxy: forwards /api requests to the local Express server.
        // In production, axios uses VITE_API_BASE_URL (set in Vercel env vars).
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
