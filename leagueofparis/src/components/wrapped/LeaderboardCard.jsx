import React from "react";
import { motion } from "motion/react";
import WrappedBackground from "./WrappedBackground";

// Medal styles for top 3
const getRankStyle = (rank) => {
	switch (rank) {
		case 1:
			return {
				bg: "bg-gradient-to-r from-yellow-300 to-amber-400",
				text: "text-yellow-900",
				medal: "🥇",
			};
		case 2:
			return {
				bg: "bg-gradient-to-r from-gray-200 to-slate-300",
				text: "text-gray-700",
				medal: "🥈",
			};
		case 3:
			return {
				bg: "bg-gradient-to-r from-amber-500 to-orange-500",
				text: "text-amber-50",
				medal: "🥉",
			};
		default:
			return {
				bg: "bg-white/25",
				text: "text-white",
				medal: null,
			};
	}
};

const LeaderboardEntry = ({ entry, rank, index, compact }) => {
	const rankStyle = getRankStyle(rank);
	
	// Varied entrance animations
	const animationType = index % 3;

	return (
		<motion.div
			className={`flex items-center gap-3 md:gap-4 ${compact ? 'py-2.5 px-4' : 'py-3 px-5'} rounded-2xl ${rankStyle.bg} backdrop-blur-sm shadow-lg`}
			initial={
				animationType === 0 
					? { opacity: 0, x: -50, scale: 0.9 }
					: animationType === 1
					? { opacity: 0, y: 30, scale: 0.95 }
					: { opacity: 0, scale: 0.7, rotate: -5 }
			}
			animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
			transition={{
				delay: index * 0.08 + 0.2,
				type: "spring",
				stiffness: 100,
				damping: 12,
			}}
		>
			{/* Rank */}
			<div className={`flex-shrink-0 w-10 md:w-12 text-center font-bold ${compact ? 'text-lg' : 'text-xl md:text-2xl'} ${rankStyle.text}`}>
				{rankStyle.medal || `#${rank}`}
			</div>

			{/* Image (optional) */}
			{entry.image_url && (
				<motion.div
					className="flex-shrink-0"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: index * 0.08 + 0.3, type: "spring" }}
				>
					<img
						src={entry.image_url}
						alt={entry.name}
						className={`${compact ? 'w-8 h-8' : 'w-10 h-10 md:w-12 md:h-12'} rounded-lg object-contain bg-black/10`}
						onError={(e) => {
							e.target.style.display = "none";
						}}
					/>
				</motion.div>
			)}

			{/* Name */}
			<div className={`flex-grow font-semibold ${compact ? 'text-base' : 'text-base md:text-lg'} truncate ${rankStyle.text}`}>
				{entry.name}
			</div>

			{/* Value */}
			<div className={`flex-shrink-0 font-bold ${compact ? 'text-base' : 'text-lg md:text-xl'} ${rankStyle.text}`}>
				{entry.value}
			</div>
		</motion.div>
	);
};

const LeaderboardCard = ({ stat, index = 0, className = "" }) => {
	const entries = stat.leaderboard_data || [];
	// Use compact mode if more than 5 entries
	const compact = entries.length > 5;

	return (
		<WrappedBackground colorIndex={index} className={className}>
			<div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
				<motion.div
					className="max-w-2xl w-full space-y-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					{/* Title with pop animation */}
					<motion.h2
						initial={{ opacity: 0, scale: 0.8, y: -20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{
							type: "spring",
							stiffness: 120,
							damping: 10,
						}}
						className={`${compact ? 'text-3xl md:text-4xl' : 'text-3xl md:text-5xl'} font-black text-white text-center drop-shadow-lg`}
					>
						{stat.title}
					</motion.h2>

					{/* Description */}
					{stat.description && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className={`${compact ? 'text-base' : 'text-base md:text-lg'} text-white/90 text-center drop-shadow`}
							dangerouslySetInnerHTML={{ __html: stat.description }}
						/>
					)}

					{/* Leaderboard Entries */}
					<div className={`${compact ? 'space-y-2' : 'space-y-3'} pt-2`}>
						{entries.length > 0 ? (
							entries.map((entry, idx) => (
								<LeaderboardEntry
									key={idx}
									entry={entry}
									rank={idx + 1}
									index={idx}
									compact={compact}
								/>
							))
						) : (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-white/70 text-center text-lg"
							>
								No entries in this leaderboard
							</motion.p>
						)}
					</div>
				</motion.div>
			</div>
		</WrappedBackground>
	);
};

export default LeaderboardCard;
