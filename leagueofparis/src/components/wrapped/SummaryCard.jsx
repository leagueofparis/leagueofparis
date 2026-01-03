import React from "react";
import { motion } from "motion/react";
import WrappedBackground from "./WrappedBackground";

// Extract display value - handles leaderboards and stats lists
const getDisplayValue = (stat) => {
	if (stat.stat_type === "leaderboard" || stat.stat_type === "stats_list") {
		const entries = stat.leaderboard_data || [];
		if (entries.length > 0) {
			return entries[0]?.value || `${entries.length} items`;
		}
		return stat.value;
	}
	return stat.value;
};

const StatRow = ({ stat, delay }) => {
	const value = getDisplayValue(stat);
	
	return (
		<motion.div
			className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0"
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{
				delay: delay,
				type: "spring",
				stiffness: 100,
				damping: 15,
			}}
		>
			<span className="text-white/70 text-sm md:text-base font-medium uppercase tracking-wide">
				{stat.title}
			</span>
			<span className="text-white text-xl md:text-2xl font-black">
				{value}
			</span>
		</motion.div>
	);
};

const SummaryCard = ({ stats, index = 0, className = "", collectionTitle = "2025 Wrapped", onRestart, onHome }) => {
	// Take up to 6 stats for the summary
	let highlightStats = stats.slice(0, 6);
	highlightStats.push({
		title: "Loving Communities Formed",
		value: "1",
	});
	
	// Extract year from collection title or default
	const year = collectionTitle?.match(/\d{4}/)?.[0] || "2025";

	return (
		<WrappedBackground colorIndex={index} className={className}>
			<div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
				{/* Shareable Card Container */}
				<motion.div
					className="w-full max-w-md bg-black/20 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
					initial={{ opacity: 0, scale: 0.9, y: 30 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{
						type: "spring",
						stiffness: 100,
						damping: 15,
					}}
				>
					{/* Header */}
					<div className="p-6 md:p-8 text-center border-b border-white/10">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
								Your Year in Review
							</p>
							<h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-lg">
								{year}
							</h1>
							<p className="text-white/50 text-xs mt-2 uppercase tracking-wider">
								Wrapped
							</p>
						</motion.div>
					</div>

					{/* Stats List */}
					<div className="p-6 md:p-8">
						{highlightStats.map((stat, idx) => (
							<StatRow
								key={idx}
								stat={stat}
								delay={0.3 + idx * 0.1}
							/>
						))}
					</div>
				</motion.div>

				{/* Decorative Text */}
				<motion.p
					className="mt-8 text-white/80 text-md text-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1 }}
				>
					Thanks for an amazing year! 🎉
				</motion.p>

				{/* Action Buttons */}
				<motion.div
					className="mt-6 flex items-center justify-center gap-3"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.2 }}
				>
					{onRestart && (
						<button
							onClick={onRestart}
							className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
						>
							↺ Start Over
						</button>
					)}
					{onHome && (
						<button
							onClick={onHome}
							className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-200 active:scale-95 cursor-pointer"
						>
							Go Home
						</button>
					)}
				</motion.div>
			</div>
		</WrappedBackground>
	);
};

export default SummaryCard;
