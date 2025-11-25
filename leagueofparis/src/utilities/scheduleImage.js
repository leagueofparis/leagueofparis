import { supabase } from "../supabaseClient";

/**
 * Fetches the most recent image from a Supabase storage folder
 * @param {string} folder - The folder path in the storage bucket
 * @returns {Promise<{url: string, fileName: string} | null>} - The image URL and filename, or null if not found
 */
export async function fetchRecentImage(folder = "schedules") {
	// Development mode check
	const isDev =
		import.meta.env.DEV ||
		import.meta.env.MODE === "development" ||
		window.location.hostname === "dev.leagueofparis.com";

	if (isDev) {
		console.log(`[DEV] Fetching images from folder: ${folder}`);
	}

	const { data, error } = await supabase.storage
		.from("willow")
		.list(folder, { limit: 100 });

	if (error) {
		if (isDev) {
			console.error(`[DEV] Error fetching from ${folder}:`, error);
		}
		throw new Error("Failed to list files: " + error.message);
	}

	if (!data || data.length === 0) {
		if (isDev) {
			console.warn(`[DEV] No files found in folder: ${folder}`);
		}
		throw new Error("No files found in this folder.");
	}

	// Find the most recently modified file
	const sorted = [...data].sort(
		(a, b) =>
			new Date(b.updated_at || b.created_at) -
			new Date(a.updated_at || a.created_at)
	);
	const recent = sorted[0];

	if (isDev) {
		console.log(`[DEV] Selected file: ${recent.name}`);
		console.log(`[DEV] File details:`, recent);
	}

	const url = supabase.storage
		.from("willow")
		.getPublicUrl(`${folder}/${recent.name}`).data.publicUrl;

	return {
		url,
		fileName: recent.name,
	};
}

