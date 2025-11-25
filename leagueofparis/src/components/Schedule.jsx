import React, { useEffect, useState } from "react";
import DevSchedule from "../../public/images/Stream_Schedule.png";
import { fetchRecentImage } from "../utilities/scheduleImage";

export default function Schedule({ folder = "schedules", className = "" }) {
	const [imageUrl, setImageUrl] = useState(null);
	const [fileName, setFileName] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Development mode check
	const isDev =
		import.meta.env.DEV ||
		import.meta.env.MODE === "development" ||
		window.location.hostname === "dev.leagueofparis.com";

	useEffect(() => {
		async function loadImage() {
			setLoading(true);
			setError(null);
			setImageUrl(null);
			setFileName(null);

			try {
				const result = await fetchRecentImage(folder);
				setImageUrl(result.url);
				setFileName(result.fileName);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		loadImage();
	}, [folder]);

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
