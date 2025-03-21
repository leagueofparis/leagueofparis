// tailwind.config.mjs or tailwind.config.js (if package.json has "type": "module")
export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["light", "dark", "cupcake"],
	},
};
