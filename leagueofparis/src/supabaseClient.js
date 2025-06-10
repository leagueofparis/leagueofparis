import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucket = "willow";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(image, folder) {
	const fileExtension = image.name.split(".").pop();
	const fileName = `${Date.now()}.${fileExtension}`;
	const filePath = `${folder}/${fileName}`;

	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(filePath, image, {
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
	const firstDay = new Date(date.getFullYear(), 0, 1);
	const dayOfYear = (date - firstDay + 86400000) / 86400000;
	const week = Math.ceil((dayOfYear + firstDay.getDay()) / 7);
	return `${date.getFullYear()}-W${week}`;
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
		.list("willow-wednesdays", { limit: 100 });

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
