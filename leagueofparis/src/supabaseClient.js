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

	if (!response) {
		throw new Error("Upload failed");
	}

	return response;
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