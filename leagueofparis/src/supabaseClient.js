import { createClient } from "@supabase/supabase-js";
import heic2any from "heic2any";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucket = "willow";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		flowType: "pkce",
		autoRefreshToken: true,
		detectSessionInUrl: true,
		persistSession: true,
		storageKey: "supabase.auth.token",
		storage: {
			getItem: (key) => {
				const value = localStorage.getItem(key);
				return value ? JSON.parse(value) : null;
			},
			setItem: (key, value) => {
				localStorage.setItem(key, JSON.stringify(value));
			},
			removeItem: (key) => {
				localStorage.removeItem(key);
			},
		},
	},
});

export const setSupabaseToken = (token) => {
	if (token) {
		localStorage.setItem("supabase.auth.token", JSON.stringify(token));
	} else {
		localStorage.removeItem("supabase.auth.token");
	}
};

async function convertHeicToJpeg(file) {
	// If the file is already a browser-readable image, skip conversion
	if (
		file.type === "image/jpeg" ||
		file.type === "image/png" ||
		file.type === "image/gif" ||
		file.type === "image/webp"
	) {
		return file;
	}

	// Only convert if it's actually HEIC
	if (
		file.type !== "image/heic" &&
		!file.name.toLowerCase().endsWith(".heic")
	) {
		return file;
	}

	try {
		const convertedBlob = await heic2any({
			blob: file,
			toType: "image/jpeg",
			quality: 0.9,
		});

		const convertedFile = new File(
			[convertedBlob],
			file.name.replace(/\.heic$/i, ".jpg"),
			{ type: "image/jpeg" }
		);

		return convertedFile;
	} catch (error) {
		console.error("Error converting HEIC to JPEG:", file.name, error);
		return file;
	}
}

export async function uploadImage(file, folder, key) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("folder", folder);
	formData.append("key", key);

	const response = await invokeEdgeFunction("validate-secret", formData);
	console.log("Upload response:", response);
	console.log("Upload response type:", typeof response);
	console.log("Upload response keys:", response ? Object.keys(response) : "null");

	if (!response) {
		throw new Error("Upload failed - no response");
	}

	// Handle different response formats from edge function
	if (typeof response === "string") {
		return response;
	}
	if (response.url) {
		return response.url;
	}
	if (response.publicUrl) {
		return response.publicUrl;
	}
	if (response.public_url) {
		return response.public_url;
	}
	if (response.data?.publicUrl) {
		return response.data.publicUrl;
	}
	if (response.data?.public_url) {
		return response.data.public_url;
	}
	if (response.path) {
		// If we get a path, construct the full URL
		return getImageUrl(response.path);
	}
	if (response.Key) {
		// AWS S3 style response
		return getImageUrl(response.Key);
	}
	
	// If response is an object but we couldn't find the URL, show what we got
	console.error("Unexpected upload response format:", JSON.stringify(response, null, 2));
	throw new Error(`Upload succeeded but could not get URL. Response: ${JSON.stringify(response)}`);
}

export async function getImageUrls(folder) {
	const { data, error } = await supabase.storage
		.from(bucket)
		.list(folder, { limit: 100 });
	if (error) {
		throw error;
	}
	// Return the public URL for each image
	return data.map((item) => {
		const url = supabase.storage
			.from(bucket)
			.getPublicUrl(`${folder}/${item.name}`).data.publicUrl;
		return url;
	});
}

export function getImageUrl(path) {
	return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function getWeeklyImageUrl() {
	// Directly list the contents of 'willow-wednesdays'
	const { data, error } = await supabase
		.from("willow-images")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	if (error) {
		throw new Error("Error listing willow-wednesdays: " + error.message);
	}
	if (!data || data.length === 0) {
		throw new Error("No images found in willow-wednesdays folder");
	}
	return getImageUrl("willow-wednesdays/" + data.file_name);
}

export async function invokeEdgeFunction(functionName, formData) {
	const { data, error } = await supabase.functions.invoke(functionName, {
		body: formData,
	});
	if (error) {
		throw error;
	}
	return data;
}

export async function getFeaturedVideo() {
	const { data, error } = await supabase
		.from("settings")
		.select("*")
		.eq("key", "featured_video")
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function getAvailableFolders() {
	const { data, error } = await supabase.storage
		.from(bucket)
		.list("", { limit: 100 });

	if (error) {
		throw error;
	}

	// Filter out files and only return folders
	return data
		.filter((item) => item.id === null) // Folders have null id
		.map((item) => item.name);
}

export async function createAnnouncement(content, key, expirationDate = null) {
	const formData = new FormData();
	formData.append("content", content);
	formData.append("key", key);
	if (expirationDate) {
		formData.append("expiration_date", expirationDate);
	}

	const response = await invokeEdgeFunction("create-announcement", formData);

	if (!response) {
		throw new Error("Failed to create announcement");
	}

	return response;
}

export async function getAnnouncements(includeExpired = false) {
	let query = supabase
		.from("announcements")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(10);

	// Only filter out expired announcements if includeExpired is false
	if (!includeExpired) {
		// Filter for announcements where expires_at is null OR expires_at is greater than or equal to current date
		query = query.or(
			`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`
		);
	}

	const { data, error } = await query;

	if (error) {
		throw error;
	}
	// Additional client-side filtering for announcements using expiration_date field
	if (!includeExpired) {
		const now = new Date();
		return data.filter((announcement) => {
			if (!announcement.expiration_date) return true;
			return new Date(announcement.expiration_date) > now;
		});
	}

	return data;
}

export async function getUsedWillowWednesdays() {
	const { data, error } = await supabase
		.from("willow-images")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(10);
	if (error) {
		throw error;
	}
	return data;
}

// Milestones CRUD functions
export async function getMilestones() {
	const { data, error } = await supabase
		.from("milestones")
		.select("*")
		.order("date", { ascending: false });
	if (error) {
		throw error;
	}
	return data;
}

export async function createMilestone(milestone) {
	const { data, error } = await supabase
		.from("milestones")
		.insert(milestone)
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function updateMilestone(id, milestone) {
	const { data, error } = await supabase
		.from("milestones")
		.update(milestone)
		.eq("id", id)
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function deleteMilestone(id) {
	const { error } = await supabase
		.from("milestones")
		.delete()
		.eq("id", id);
	if (error) {
		throw error;
	}
}

// Wrapped Collections CRUD functions
export async function getWrappedCollections(publishedOnly = false) {
	let query = supabase
		.from("wrapped_collections")
		.select("*")
		.order("year", { ascending: false });

	if (publishedOnly) {
		query = query.eq("is_published", true);
	}

	const { data, error } = await query;
	if (error) {
		throw error;
	}
	return data;
}

export async function getFeaturedWrappedCollection() {
	// First try to get explicitly featured collection
	const { data: featured, error: featuredError } = await supabase
		.from("wrapped_collections")
		.select("*")
		.eq("is_featured", true)
		.eq("is_published", true)
		.single();

	if (!featuredError && featured) {
		return featured;
	}

	// Fall back to most recent published collection
	const { data: recent, error: recentError } = await supabase
		.from("wrapped_collections")
		.select("*")
		.eq("is_published", true)
		.order("year", { ascending: false })
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	if (recentError) {
		throw recentError;
	}
	return recent;
}

export async function setFeaturedCollection(id) {
	// First, unset any existing featured collection
	const { error: unsetError } = await supabase
		.from("wrapped_collections")
		.update({ is_featured: false })
		.eq("is_featured", true);

	if (unsetError) {
		throw unsetError;
	}

	// Then set the new featured collection
	const { data, error } = await supabase
		.from("wrapped_collections")
		.update({ is_featured: true })
		.eq("id", id)
		.select()
		.single();

	if (error) {
		throw error;
	}
	return data;
}

export async function getWrappedCollection(id) {
	const { data, error } = await supabase
		.from("wrapped_collections")
		.select("*")
		.eq("id", id)
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function createWrappedCollection(collection) {
	const { data, error } = await supabase
		.from("wrapped_collections")
		.insert(collection)
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function updateWrappedCollection(id, collection) {
	const { data, error } = await supabase
		.from("wrapped_collections")
		.update(collection)
		.eq("id", id)
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function deleteWrappedCollection(id) {
	// First delete all stats for this collection
	const { error: statsError } = await supabase
		.from("wrapped_stats")
		.delete()
		.eq("wrapped_collection_id", id);
	if (statsError) {
		throw statsError;
	}

	// Then delete the collection
	const { error } = await supabase
		.from("wrapped_collections")
		.delete()
		.eq("id", id);
	if (error) {
		throw error;
	}
}

// Wrapped Stats CRUD functions
export async function getWrappedStats(collectionId) {
	const { data, error } = await supabase
		.from("wrapped_stats")
		.select("*")
		.eq("wrapped_collection_id", collectionId)
		.order("order", { ascending: true });
	if (error) {
		throw error;
	}
	return data;
}

export async function createWrappedStat(stat) {
	const { data, error } = await supabase
		.from("wrapped_stats")
		.insert(stat)
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function updateWrappedStat(id, stat) {
	const { data, error } = await supabase
		.from("wrapped_stats")
		.update(stat)
		.eq("id", id)
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function deleteWrappedStat(id) {
	const { error } = await supabase
		.from("wrapped_stats")
		.delete()
		.eq("id", id);
	if (error) {
		throw error;
	}
}

export async function reorderWrappedStats(statIds) {
	// Update the order of each stat based on its position in the array
	for (let i = 0; i < statIds.length; i++) {
		const { error } = await supabase
			.from("wrapped_stats")
			.update({ order: i })
			.eq("id", statIds[i]);
		if (error) {
			throw error;
		}
	}
}