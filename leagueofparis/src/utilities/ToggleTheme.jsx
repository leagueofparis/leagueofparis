export function ToggleTheme() {
	const currentTheme = document.documentElement.getAttribute("data-theme");

	const newTheme = currentTheme === "parislight" ? "parisdark" : "parislight";

	document.documentElement.setAttribute("data-theme", newTheme);
}
