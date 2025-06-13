import { createClient } from "@supabase/supabase-js";
import heic2any from "heic2any";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucket = "willow";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const setSupabaseToken = (token) => {
	supabase.auth.setSession({
		access_token: token,
		refresh_token: "",
	});
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

export async function uploadImage(image, folder) {
	// Convert HEIC to JPEG if necessary
	const processedImage = await convertHeicToJpeg(image);

	const fileExtension = processedImage.name.split(".").pop();
	const fileName = `${Date.now()}.${fileExtension}`;
	const filePath = `${folder}/${fileName}`;

	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(filePath, processedImage, {
			upsert: true,
		});

	if (error) {
		throw error;
	}

	return data;
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

function getWeekKey(date = new Date()) {
	// Get the current date
	const currentDate = new Date(date);

	// Get the day of the week (0 = Sunday, 3 = Wednesday)
	const dayOfWeek = currentDate.getDay();

	// Calculate days to subtract to get to the most recent Wednesday
	const daysToSubtract = (dayOfWeek + 4) % 7; // +4 because we want Wednesday (3) to be 0

	// Create a new date for the most recent Wednesday
	const wednesdayDate = new Date(currentDate);
	wednesdayDate.setDate(currentDate.getDate() - daysToSubtract);

	// Get the first day of the year
	const firstDay = new Date(wednesdayDate.getFullYear(), 0, 1);

	// Calculate day of year for the Wednesday
	const dayOfYear = (wednesdayDate - firstDay + 86400000) / 86400000;

	// Calculate week number
	const week = Math.ceil((dayOfYear + firstDay.getDay()) / 7);
	return `${wednesdayDate.getFullYear()}-W${week}`;
}

function simpleHash(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 31 + str.charCodeAt(i)) % 2_147_483_647;
	}
	return hash;
}

export async function getWeeklyImageUrl() {
	// Directly list the contents of 'willow-wednesdays'
	const { data, error } = await supabase.storage
		.from(bucket)
		.list("willow-wednesdays", {
			limit: 100,
			sortBy: { column: "created_at", order: "desc" },
		});

	if (error) {
		throw new Error("Error listing willow-wednesdays: " + error.message);
	}
	if (!data || data.length === 0) {
		throw new Error("No images found in willow-wednesdays folder");
	}

	// Pick a file for the week
	const weekKey = getWeekKey();
	const index = simpleHash(weekKey) % data.length;
	const selectedFile = data[index];
	const imageUrl = supabase.storage
		.from(bucket)
		.getPublicUrl(`willow-wednesdays/${selectedFile.name}`).data.publicUrl;
	return imageUrl;
}

export async function invokeEdgeFunction(functionName, key) {
	const { data, error } = await supabase.functions.invoke(functionName, {
		body: { key: key },
	});
	if (error) {
		throw error;
	}
	return data;
}
