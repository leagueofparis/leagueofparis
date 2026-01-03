// Twitch API utilities for fetching channel statistics

const TWITCH_API_BASE = "https://api.twitch.tv/helix";
const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID || "";

/**
 * Fetch user info from Twitch API
 */
async function fetchUserInfo(channelName, accessToken) {
	const response = await fetch(
		`${TWITCH_API_BASE}/users?login=${channelName}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Client-Id": TWITCH_CLIENT_ID,
			},
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch user info: ${response.statusText}`);
	}

	const data = await response.json();
	if (!data.data || data.data.length === 0) {
		throw new Error(`User not found: ${channelName}`);
	}

	return data.data[0];
}

/**
 * Fetch follower count from Twitch API
 */
async function fetchFollowerCount(userId, accessToken) {
	const response = await fetch(
		`${TWITCH_API_BASE}/channels/followers?broadcaster_id=${userId}&first=1`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Client-Id": TWITCH_CLIENT_ID,
			},
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch follower count: ${response.statusText}`);
	}

	const data = await response.json();
	return data.total || 0;
}

/**
 * Fetch channel info from Twitch API
 */
async function fetchChannelInfo(userId, accessToken) {
	const response = await fetch(
		`${TWITCH_API_BASE}/channels?broadcaster_id=${userId}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Client-Id": TWITCH_CLIENT_ID,
			},
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch channel info: ${response.statusText}`);
	}

	const data = await response.json();
	return data.data?.[0] || null;
}

/**
 * Fetch all available Twitch stats for a channel
 * Returns an array of stat objects ready for wrapped_stats table
 */
export async function fetchAllTwitchStats(channelName, accessToken) {
	const stats = [];

	try {
		// Fetch user info
		const user = await fetchUserInfo(channelName, accessToken);
		const userId = user.id;

		// Stat: Profile info
		stats.push({
			title: "Broadcaster Type",
			value: user.broadcaster_type === "partner" 
				? "Partner" 
				: user.broadcaster_type === "affiliate" 
					? "Affiliate" 
					: "Regular",
			description: `${channelName}'s Twitch status`,
			source: "twitch",
			media_url: user.profile_image_url || null,
			media_type: user.profile_image_url ? "image" : null,
		});

		// Stat: View count (total views)
		if (user.view_count !== undefined) {
			stats.push({
				title: "Total Channel Views",
				value: user.view_count.toLocaleString(),
				description: "All-time channel views",
				source: "twitch",
				media_url: null,
				media_type: null,
			});
		}

		// Stat: Account created
		if (user.created_at) {
			const createdDate = new Date(user.created_at);
			const now = new Date();
			const years = Math.floor((now - createdDate) / (365.25 * 24 * 60 * 60 * 1000));
			stats.push({
				title: "Channel Age",
				value: `${years} years`,
				description: `Streaming since ${createdDate.getFullYear()}`,
				source: "twitch",
				media_url: null,
				media_type: null,
			});
		}

		// Fetch follower count
		try {
			const followerCount = await fetchFollowerCount(userId, accessToken);
			stats.push({
				title: "Followers",
				value: followerCount.toLocaleString(),
				description: "Total follower count",
				source: "twitch",
				media_url: null,
				media_type: null,
			});
		} catch (err) {
			console.warn("Could not fetch follower count:", err);
		}

		// Fetch channel info
		try {
			const channelInfo = await fetchChannelInfo(userId, accessToken);
			if (channelInfo) {
				if (channelInfo.game_name) {
					stats.push({
						title: "Current Category",
						value: channelInfo.game_name,
						description: "Most recent stream category",
						source: "twitch",
						media_url: null,
						media_type: null,
					});
				}
			}
		} catch (err) {
			console.warn("Could not fetch channel info:", err);
		}

	} catch (error) {
		console.error("Error fetching Twitch stats:", error);
		throw error;
	}

	return stats;
}

