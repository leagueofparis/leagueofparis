import React, { useEffect, useState } from "react";
import {
	VerticalTimeline,
	VerticalTimelineElement,
} from "../components/VerticalTimeline";
import { getMilestones } from "../supabaseClient";

// Helper function to detect media type from URL
const detectMediaType = (url) => {
	if (!url) return null;

	const urlLower = url.toLowerCase();

	// Image formats
	if (
		urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) ||
		urlLower.includes("image")
	) {
		return "image";
	}

	// Audio formats
	if (urlLower.match(/\.(mp3|wav|ogg|m4a)$/i) || urlLower.includes("audio")) {
		return "audio";
	}

	// Twitch
	if (urlLower.includes("twitch.tv")) {
		return "twitch";
	}

	// Discord
	if (urlLower.includes("discord")) {
		return "discord";
	}

	// YouTube
	if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
		return "youtube";
	}

	// Video formats
	if (urlLower.match(/\.(mp4|webm|ogg)$/i) || urlLower.includes("video")) {
		return "video";
	}

	return "link";
};
const getTwitchEmbedUrl = (rawUrl) => {
	console.log(rawUrl, "rawUrl");
	if (!rawUrl) return null;
  
	try {
	  const url = new URL(rawUrl);
  
	  // Clip pattern always appears after "/clip/"
	  // Example:
	  // https://www.twitch.tv/username/clip/ClipID?filter=clips&range=all
	  const parts = url.pathname.split("/");
  
	  const clipIndex = parts.indexOf("clip");
	  if (clipIndex === -1 || !parts[clipIndex + 1]) return null;
  
	  const clipId = parts[clipIndex + 1];
  
	  // Twitch requires parent=yourdomain
	  const parent = typeof window !== "undefined"
		? window.location.hostname
		: "localhost";
  
	  return `https://clips.twitch.tv/embed?clip=${clipId}&parent=${parent}`;
	} catch {
	  return null;
	}
  }
// Extract YouTube video ID from URL
const extractYouTubeId = (url) => {
	const match = url.match(
		/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
	);
	return match ? match[1] : null;
};

// Media embed components
const ImageEmbed = ({ url, title }) => (
	<div className="w-full my-4">
		<img
			src={url}
			alt={title}
			className="w-full rounded-lg shadow-lg max-h-96 object-contain bg-base-300"
			onError={(e) => {
				e.target.style.display = "none";
			}}
		/>
	</div>
);

const AudioEmbed = ({ url, title }) => (
	<div className="w-full my-4">
		<audio controls className="w-full">
			<source src={url} type="audio/mpeg" />
			<source src={url} type="audio/wav" />
			<source src={url} type="audio/ogg" />
			Your browser does not support the audio element.
		</audio>
	</div>
);

const TwitchClipEmbed = ({ url }) => {

	return (
		<div className="w-full my-4 aspect-video">
			<iframe
				src={getTwitchEmbedUrl(url)}
				width="100%"
				height="100%"
				allowFullScreen
				className="rounded-lg shadow-lg"
				title="Twitch embed"
			></iframe>
		</div>
	);
};

const YouTubeEmbed = ({ url }) => {
	const videoId = extractYouTubeId(url);

	if (!videoId) return null;

	return (
		<div className="w-full my-4 aspect-video">
			<iframe
				src={`https://www.youtube.com/embed/${videoId}`}
				width="100%"
				height="100%"
				allowFullScreen
				className="rounded-lg shadow-lg"
				title="YouTube video"
			></iframe>
		</div>
	);
};

const VideoEmbed = ({ url, title }) => (
	<div className="w-full my-4">
		<video controls className="w-full rounded-lg shadow-lg max-h-96">
			<source src={url} type="video/mp4" />
			<source src={url} type="video/webm" />
			<source src={url} type="video/ogg" />
			Your browser does not support the video tag.
		</video>
	</div>
);

const DiscordEmbed = ({ url }) => (
	<div className="w-full my-4">
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="btn btn-primary w-full"
		>
			<svg
				className="w-5 h-5 mr-2"
				fill="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
			</svg>
			Join Our Discord!
		</a>
	</div>
);

const LinkEmbed = ({ url, title }) => (
	<div className="w-full my-4">
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="btn btn-outline btn-primary w-full"
		>
			View Link: {title || url}
		</a>
	</div>
);

// Main media renderer
const MediaRenderer = ({ url, title, image }) => {
	// Always show image if provided
	const imageElement = image && <ImageEmbed url={image} title={title} />;

	// If no link, just show image
	if (!url) {
		return imageElement;
	}

	const mediaType = detectMediaType(url);

	let linkElement = null;
	switch (mediaType) {
		case "image":
			linkElement = <ImageEmbed url={url} title={title} />;
			break;
		case "audio":
			linkElement = <AudioEmbed url={url} title={title} />;
			break;
		case "twitch":
			linkElement = <TwitchClipEmbed url={url} />;
			break;
		case "youtube":
			linkElement = <YouTubeEmbed url={url} />;
			break;
		case "video":
			linkElement = <VideoEmbed url={url} title={title} />;
			break;
		case "discord":
			linkElement = <DiscordEmbed url={url} />;
			break;
		default:
			linkElement = <LinkEmbed url={url} title={title} />;
	}

	return (
		<>
			{imageElement}
			{linkElement}
		</>
	);
};

function Timeline() {
	const [milestones, setMilestones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const data = await getMilestones();
				setMilestones(data);
			} catch (err) {
				console.error("Error fetching milestones:", err);
				setError("Failed to load timeline. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatDateShort = (dateString) => {
		const date = new Date(dateString);
		return {
			month: date.toLocaleDateString("en-US", { month: "short" }),
			day: date.getDate(),
			year: date.getFullYear(),
		};
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<span className="loading loading-spinner loading-lg"></span>
					<p className="mt-4 text-lg text-base-content">Loading timeline...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-error">{error}</p>
				</div>
			</div>
		);
	}

	if (milestones.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-base-content/70">
						No milestones to display yet.
					</p>
				</div>
			</div>
		);
	}

	const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));

	const getSpacingClass = (currentDate, prevDate) => {
		if (!prevDate) return "mt-0";
		
		const diffTime = Math.abs(new Date(currentDate) - new Date(prevDate));
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 2) return "mt-12"; // Very close
		if (diffDays <= 7) return "mt-24"; // Close
		if (diffDays <= 30) return "mt-32"; // Medium
		return "mt-48"; // Far
	};

	return (
		<div className="min-h-screen py-10 px-2">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-extrabold mb-4 text-center text-base-content">
					Timeline
				</h1>
				<p className="text-center text-base-content/70 text-lg mb-12">
					Journey through our milestones
				</p>

				<VerticalTimeline>
					{sortedMilestones.map((milestone, index) => {
						const dateShort = formatDateShort(milestone.date);
						const prevMilestone = index > 0 ? sortedMilestones[index - 1] : null;
						const spacingClass = getSpacingClass(milestone.date, prevMilestone?.date);

						return (
							<VerticalTimelineElement
								key={milestone.id}
								index={index}
								className={spacingClass}
								date={formatDate(milestone.date)}
								icon={
									<div className="flex flex-col items-center justify-center leading-tight w-full h-full">
										<div className="text-[10px] md:text-xs font-semibold uppercase tracking-wider opacity-90">
											{dateShort.month}
										</div>
										<div className="text-xl md:text-2xl font-extrabold -my-1">
											{dateShort.day}
										</div>
										<div className="text-[10px] md:text-xs opacity-80 font-medium">
											{dateShort.year}
										</div>
									</div>
								}
							>
								<h3 className="text-xl md:text-2xl font-bold text-primary mb-2">
									{milestone.title}
								</h3>
								{milestone.description && (
									<p className="text-primary/80 mb-4 font-medium leading-relaxed">
										{milestone.description}
									</p>
								)}

								<MediaRenderer
									url={milestone.link}
									title={milestone.title}
									image={milestone.image}
								/>
							</VerticalTimelineElement>
						);
					})}
				</VerticalTimeline>
			</div>
		</div>
	);
}

export default Timeline;

