export function ToggleTheme() {
	const currentTheme = document.documentElement.getAttribute("data-theme");

	const newTheme = currentTheme === "valentine" ? "dark" : "valentine";

	document.documentElement.setAttribute("data-theme", newTheme);
	localStorage.setItem("theme", newTheme); // Save the new theme to localStorage
}
