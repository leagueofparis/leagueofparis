import React from "react";
import AnimatedNumber from "./AnimatedNumber";
import LeaderboardCard from "./LeaderboardCard";
import StatsListCard from "./StatsListCard";
import WrappedBackground, { accentColors } from "./WrappedBackground";
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

const StatCard = ({ stat, index = 0, className = "" }) => {
	// Check if this is a leaderboard stat
	const isLeaderboard = stat.stat_type === "leaderboard";
	
	// Check if this is a stats list
	const isStatsList = stat.stat_type === "stats_list";
	
	// If it's a leaderboard, render the LeaderboardCard instead
	if (isLeaderboard) {
		return <LeaderboardCard stat={stat} index={index} className={className} />;
	}
	
	// If it's a stats list, render the StatsListCard instead
	if (isStatsList) {
		return <StatsListCard stat={stat} index={index} className={className} />;
	}

	const isNumeric = !isNaN(parseFloat(stat.value?.toString().replace(/[^0-9.-]/g, "")));
	const hasMedia = !!stat.media_url;
	const color = accentColors[index % accentColors.length]; // Used for media glow

	// Different animation sets based on index for variety
	const animationSet = index % 3;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.1,
			},
		},
	};

	// Varied item animations
	const itemVariants = animationSet === 0 
		? {
			hidden: { opacity: 0, y: 50, scale: 0.9 },
			visible: { 
				opacity: 1, 
				y: 0,
				scale: 1,
				transition: { type: "spring", stiffness: 100, damping: 12 }
			},
		}
		: animationSet === 1
		? {
			hidden: { opacity: 0, x: -60 },
			visible: { 
				opacity: 1, 
				x: 0,
				transition: { type: "spring", stiffness: 80, damping: 15 }
			},
		}
		: {
			hidden: { opacity: 0, scale: 0.5, rotate: -10 },
			visible: { 
				opacity: 1, 
				scale: 1,
				rotate: 0,
				transition: { type: "spring", stiffness: 120, damping: 10 }
			},
		};

	const mediaVariants = {
		hidden: { opacity: 0, scale: 0.8, y: 30 },
		visible: { 
			opacity: 1, 
			scale: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 80,
				damping: 15,
				delay: 0.3
			}
		},
	};

	// Layout with media - side by side on larger screens
	if (hasMedia) {
		return (
			<WrappedBackground colorIndex={index} className={className}>
				<div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 gap-8 lg:gap-16">
					<motion.div 
						className="flex-1 max-w-xl text-center lg:text-left space-y-6"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{/* Title */}
						<motion.p 
							variants={itemVariants}
							className="text-lg md:text-xl font-semibold tracking-wide uppercase text-white/80"
						>
							{stat.title}
						</motion.p>

						{/* Value */}
						<motion.div variants={itemVariants}>
							{isNumeric ? (
								<AnimatedNumber
									value={stat.value}
									duration={2000}
									className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-lg"
								/>
							) : (
								<div className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-lg">
									{stat.value}
								</div>
							)}
						</motion.div>

						{/* Description */}
						{stat.description && (
							<motion.div 
								variants={itemVariants}
								className="text-lg md:text-xl text-white/90 max-w-lg font-medium [&_br]:block [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_a]:underline [&_a]:text-white drop-shadow"
								dangerouslySetInnerHTML={{ __html: stat.description }}
							/>
						)}
					</motion.div>

					{/* Media */}
					<motion.div 
						variants={mediaVariants}
						initial="hidden"
						animate="visible"
						className="flex-1 max-w-xl w-full"
					>
						{stat.media_type === "image" || !stat.media_type ? (
							<motion.img
								src={stat.media_url}
								alt={stat.title}
								className="w-full rounded-3xl shadow-2xl object-contain max-h-[500px]"
								style={{ 
									boxShadow: `0 25px 50px -12px ${color.primary}40`
								}}
								onError={(e) => {
									e.target.style.display = "none";
								}}
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300 }}
							/>
						) : isTwitchClip(stat.media_url) ? (
							<div 
								className="w-full aspect-video rounded-3xl shadow-2xl overflow-hidden"
								style={{ 
									boxShadow: `0 25px 50px -12px ${color.primary}40`
								}}
							>
								<iframe
									src={getTwitchEmbedUrl(stat.media_url)}
									width="100%"
									height="100%"
									allowFullScreen
									className="rounded-3xl"
									title={`${stat.title} - Twitch Clip`}
								/>
							</div>
						) : (
							<video
								src={stat.media_url}
								controls
								className="w-full rounded-3xl shadow-2xl max-h-[500px]"
								style={{ 
									boxShadow: `0 25px 50px -12px ${color.primary}40`
								}}
							/>
						)}
					</motion.div>
				</div>
			</WrappedBackground>
		);
	}

	// Default layout - centered with big typography
	return (
		<WrappedBackground colorIndex={index} className={className}>
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<motion.div 
					className="max-w-4xl w-full text-center space-y-6"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{/* Title */}
					<motion.p 
						variants={itemVariants}
						className="text-lg md:text-2xl font-semibold tracking-wide uppercase text-white/80 drop-shadow"
					>
						{stat.title}
					</motion.p>

					{/* Value - massive */}
					<motion.div variants={itemVariants} className="py-4">
						{isNumeric ? (
							<AnimatedNumber
								value={stat.value}
								duration={2000}
								className="text-7xl md:text-9xl lg:text-[12rem] font-black text-white leading-none drop-shadow-lg"
							/>
						) : (
							<div className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight drop-shadow-lg">
								{stat.value}
							</div>
						)}
					</motion.div>

					{/* Description */}
					{stat.description && (
						<motion.div 
							variants={itemVariants}
							className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium [&_br]:block [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_a]:underline [&_a]:text-white drop-shadow"
							dangerouslySetInnerHTML={{ __html: stat.description }}
						/>
					)}
				</motion.div>
			</div>
		</WrappedBackground>
	);
};

export default StatCard;
