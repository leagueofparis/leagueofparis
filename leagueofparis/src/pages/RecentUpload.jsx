import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function RecentImage({ folder, title }) {
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

	return (
		<div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto my-6">
			<div className="card-body items-center">
				<h2 className="card-title text-lg font-bold mb-2">{title}</h2>
				{loading && (
					<span className="loading loading-spinner loading-md"></span>
				)}
				{error && <div className="text-error mb-2">{error}</div>}
				{imageUrl && (
					<>
						<img
							src={imageUrl}
							alt={fileName}
							className="rounded-lg max-h-96 object-contain mb-2"
						/>
						<div className="text-xs text-base-content/60">{fileName}</div>
					</>
				)}
			</div>
		</div>
	);
}

export default function RecentUpload() {
	return (
		<div className="min-h-screen py-10 px-2">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-extrabold mb-2 text-base-content">
					Most Recent Uploads
				</h1>
				<p className="mb-8 text-base-content/70 text-lg">
					Displays the most recently uploaded image from each folder.
				</p>
				<div className="flex flex-col md:flex-row gap-8 justify-center">
					<RecentImage folder="schedules" title="Recent Schedule Upload" />
					<RecentImage
						folder="willow-wednesdays"
						title="Recent Willow Wednesday Upload"
					/>
				</div>
			</div>
		</div>
	);
}
