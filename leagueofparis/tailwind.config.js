import daisyui from "daisyui";

// tailwind.config.mjs or tailwind.config.js (if package.json has "type": "module")
export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				warning: {
					100: "oklch(85% 0.25 80)",
					200: "oklch(95% 0.25 80)",
				},
			},
		},
	},

	plugins: [daisyui],
};
