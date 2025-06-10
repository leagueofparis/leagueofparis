import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Schedule({ folder = "schedules", className = "" }) {
	const [imageUrl, setImageUrl] = useState(null);
	const [fileName, setFileName] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchRecentImage() {
			setLoading(true);
			setError(null);
			setImageUrl(null);
			setFileName(null);
			const { data, error } = await supabase.storage
				.from("willow")
				.list(folder, { limit: 100 });
			if (error) {
				setError("Failed to list files: " + error.message);
				setLoading(false);
				return;
			}
			if (!data || data.length === 0) {
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
			setFileName(recent.name);
			const url = supabase.storage
				.from("willow")
				.getPublicUrl(`${folder}/${recent.name}`).data.publicUrl;
			setImageUrl(url);
			setLoading(false);
		}
		fetchRecentImage();
	}, [folder]);

	if (loading)
		return <span className="loading loading-spinner loading-md"></span>;
	if (error) return <div className="text-error">{error}</div>;
	if (!imageUrl) return null;

	return (
		<div className={className}>
			<img
				src={imageUrl}
				alt={fileName}
				className="rounded-lg max-h-[375px] object-contain"
			/>
		</div>
	);
}
