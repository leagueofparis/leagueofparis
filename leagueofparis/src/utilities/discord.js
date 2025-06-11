import { jwtDecode } from "jwt-decode";
import { getToken } from "./auth";

// Get Discord user info from the JWT token
export function getDiscordUser() {
	const token = getToken();
	if (!token) return null;
	try {
		const decoded = jwtDecode(token);
		console.log(decoded, "decoded");
		// Your backend should include these claims in the JWT:
		// { sub, username, discord_id, ... }
		return {
			id: decoded.discord_id,
			username: decoded.username,
			avatar: decoded.avatar,

			// add more fields as needed
		};
	} catch (e) {
		return null;
	}
}

export function getDiscordAvatar() {
	const user = getDiscordUser();
	if (!user) return null;
	console.log(user, "user");
	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

// Build the Discord OAuth2 login URL
export function getDiscordLoginUrl() {
	const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
	const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;
	const scope = "identify email";
	return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
		redirectUri
	)}&response_type=code&scope=${encodeURIComponent(scope)}`;
}

// Check if the user is authenticated with Discord
export function isDiscordAuthenticated() {
	return !!getDiscordUser();
}
