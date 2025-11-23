import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		strictPort: true,
		open: false,
		proxy: {
			// Forward API calls to the gateway during local dev
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});

