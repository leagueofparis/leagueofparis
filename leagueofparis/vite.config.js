import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			// Proxy API requests to the backend server
			"/api": {
				target: "https://dev.leagueofparis.com:3001", // Dev server backend
				changeOrigin: true,
				secure: true, // Use HTTPS for dev server
			},
			"/auth": {
				target: "https://dev.leagueofparis.com:3001",
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path.replace(/^\/auth/, "/api/auth"),
			},
		},
		host: true,
		port: 5173, // Frontend port (changed from 3001)
	},
});
