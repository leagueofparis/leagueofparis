import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			// Change '/api' to match the path you use for your API requests
			"/api": {
				target: "http://localhost:5159", // Replace with your API's port
				changeOrigin: true,
				secure: false,
				// Optional: rewrite the path if your API doesn't have '/api' prefix
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
		host: true,
		port: 3000,
	},
});
