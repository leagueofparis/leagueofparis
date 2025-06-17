import { useEffect, useState } from "react";
import { getWeeklyImageUrl } from "../supabaseClient";

export default function WeeklyImage() {
	const [currentImage, setCurrentImage] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAndSetImage = async () => {
			try {
				const imageUrl = await getWeeklyImageUrl();
				setCurrentImage(imageUrl);
				setLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load image");
				setLoading(false);
			}
		};

		fetchAndSetImage();
	}, []);

	if (loading) {
		return (
			<div className="animate-pulse bg-base-200 h-64 w-full rounded-lg"></div>
		);
	}

	if (error) {
		return <div className="text-error">Error: {error}</div>;
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			<img
				src={currentImage}
				alt="Weekly featured image"
				className="w-full h-auto rounded-b-lg object-cover max-h-[475px]"
			/>
		</div>
	);
}
