export function ToggleTheme() {
	const currentTheme = document.documentElement.getAttribute("data-theme");

	var themes = ["paris", "valentine"];

	var rand = Math.floor(Math.random() * themes.length);

	document.documentElement.setAttribute(
		"data-theme",
		currentTheme === themes[rand]
			? themes[(rand + 1) % themes.length]
			: themes[rand]
	);

	document
		.getElementById("link-container")
		.setAttribute(
			"data-theme",
			document.documentElement.getAttribute("data-theme")
		);
}
