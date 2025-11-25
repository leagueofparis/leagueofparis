import React, { useEffect, useState } from "react";
import DevSchedule from "../../public/images/Stream_Schedule.png";
import { fetchRecentImage } from "../utilities/scheduleImage";

export default function SchedulePage() {
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
				const result = await fetchRecentImage("schedules");
				setImageUrl(result.url);
				setFileName(result.fileName);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		loadImage();
	}, []);

	if (loading) return null;
	if (error) return null;
	if (!imageUrl) return null;

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<img
				src={isDev ? DevSchedule : imageUrl}
				alt={fileName || "Schedule"}
				className="max-w-full max-h-[90vh] object-contain"
			/>
		</div>
	);
}

