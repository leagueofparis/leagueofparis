import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DevSchedule from "../../public/images/Stream_Schedule.png";

export default function Schedule({ folder = "schedules", className = "" }) {
	const [imageUrl, setImageUrl] = useState(null);
	const [fileName, setFileName] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Development mode check
	const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";

	useEffect(() => {
		async function fetchRecentImage() {
			setLoading(true);
			setError(null);
			setImageUrl(null);
			setFileName(null);

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
				setError("Failed to list files: " + error.message);
				setLoading(false);
				return;
			}

			if (!data || data.length === 0) {
				if (isDev) {
					console.warn(`[DEV] No files found in folder: ${folder}`);
				}
				setError("No files found in this folder.");
				setLoading(false);
				return;
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

			setFileName(recent.name);
			const url = supabase.storage
				.from("willow")
				.getPublicUrl(`${folder}/${recent.name}`).data.publicUrl;
			setImageUrl(url);
			setLoading(false);
		}
		fetchRecentImage();
	}, [folder, isDev]);

	if (loading)
		return (
			<div className={className}>
				<span className="loading loading-spinner loading-md"></span>
				{isDev && (
					<div className="text-xs text-gray-500 mt-2">
						Loading from {folder}...
					</div>
				)}
			</div>
		);

	if (error)
		return (
			<div className={className}>
				<div className="text-error">{error}</div>
				{isDev && (
					<div className="text-xs text-gray-500 mt-2">
						Debug info: folder={folder}, isDev={isDev.toString()}
					</div>
				)}
			</div>
		);

	if (!imageUrl) return null;

	return (
		<div className={className}>
			{isDev ? (
				<img
					src={DevSchedule}
					alt={fileName}
					className="rounded-lg max-h-[375px] object-contain"
				/>
			) : (
				<img
					src={imageUrl}
					alt={fileName}
					className="rounded-lg max-h-[375px] object-contain"
				/>
			)}
		</div>
	);
}
