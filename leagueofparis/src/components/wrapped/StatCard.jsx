import React from "react";
import AnimatedNumber from "./AnimatedNumber";
import { motion } from "motion/react";

// Helper function to detect if URL is a Twitch clip
const isTwitchClip = (url) => {
	if (!url) return false;
	return url.toLowerCase().includes("twitch.tv") && url.toLowerCase().includes("/clip/");
};

// Get Twitch embed URL
const getTwitchEmbedUrl = (rawUrl) => {
	if (!rawUrl) return null;

	try {
		const url = new URL(rawUrl);
		const parts = url.pathname.split("/");
		const clipIndex = parts.indexOf("clip");
		if (clipIndex === -1 || !parts[clipIndex + 1]) return null;

		const clipId = parts[clipIndex + 1];
		const parent =
			typeof window !== "undefined" ? window.location.hostname : "localhost";

		return `https://clips.twitch.tv/embed?clip=${clipId}&parent=${parent}`;
	} catch {
		return null;
	}
};

// Color schemes for different stat cards
const colorSchemes = [
	"from-purple-500 via-pink-500 to-red-500",
	"from-blue-500 via-cyan-500 to-teal-500",
	"from-green-500 via-emerald-500 to-teal-500",
	"from-yellow-500 via-orange-500 to-red-500",
	"from-indigo-500 via-purple-500 to-pink-500",
	"from-teal-500 via-blue-500 to-indigo-500",
	"from-rose-500 via-pink-500 to-purple-500",
	"from-amber-500 via-yellow-500 to-orange-500",
];

const StatCard = ({ stat, index = 0, className = "" }) => {
	const colorScheme = colorSchemes[index % colorSchemes.length];
	const isNumeric = !isNaN(parseFloat(stat.value?.toString().replace(/[^0-9.-]/g, "")));

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 50 },
		visible: { 
			opacity: 1, 
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 15
			}
		},
	};

	const mediaVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: { 
			opacity: 1, 
			scale: 1,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 15,
				delay: 0.6
			}
		},
	};

	return (
		<div
			className={`min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br ${colorScheme} ${className} overflow-hidden relative`}
		>
			{/* Animated Background Elements */}
			<motion.div 
				className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
				animate={{ 
					backgroundPosition: ["0% 0%", "100% 100%"],
					backgroundSize: ["100% 100%", "200% 200%"]
				}}
				transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
			/>
			
			{/* Floating Bubbles/Particles Effect */}
			<motion.div 
				className="absolute -top-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"
				animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
				transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
			/>
			<motion.div 
				className="absolute top-1/2 -right-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"
				animate={{ x: [0, -50, 0], y: [0, 100, 0] }}
				transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
			/>

			<motion.div 
				className="max-w-4xl w-full text-center space-y-6 relative z-10"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Title */}
				<motion.h2 
					variants={itemVariants}
					className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
				>
					{stat.title}
				</motion.h2>

				{/* Value - Animated if numeric */}
				<motion.div variants={itemVariants} className="py-8">
					{isNumeric ? (
						<AnimatedNumber
							value={stat.value}
							duration={2000}
							className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white drop-shadow-2xl"
						/>
					) : (
						<div className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white drop-shadow-2xl">
							{stat.value}
						</div>
					)}
				</motion.div>

				{/* Description */}
				{stat.description && (
					<motion.p 
						variants={itemVariants}
						className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-2xl mx-auto font-medium"
					>
						{stat.description}
					</motion.p>
				)}

				{/* Media */}
				{stat.media_url && (
					<motion.div 
						variants={mediaVariants}
						className="mt-8 w-full max-w-3xl mx-auto"
					>
						{stat.media_type === "image" || !stat.media_type ? (
							<motion.img
								src={stat.media_url}
								alt={stat.title}
								className="w-full rounded-2xl shadow-2xl object-contain max-h-96 bg-white/10 backdrop-blur-sm border-2 border-white/20"
								onError={(e) => {
									e.target.style.display = "none";
								}}
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300 }}
							/>
						) : isTwitchClip(stat.media_url) ? (
							<div className="w-full aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black/20 backdrop-blur-sm border-2 border-white/20">
								<iframe
									src={getTwitchEmbedUrl(stat.media_url)}
									width="100%"
									height="100%"
									allowFullScreen
									className="rounded-2xl"
									title={`${stat.title} - Twitch Clip`}
								/>
							</div>
						) : (
							<video
								src={stat.media_url}
								controls
								className="w-full rounded-2xl shadow-2xl max-h-96 bg-black/20 backdrop-blur-sm border-2 border-white/20"
							/>
						)}
					</motion.div>
				)}
			</motion.div>
		</div>
	);
};

export default StatCard;
