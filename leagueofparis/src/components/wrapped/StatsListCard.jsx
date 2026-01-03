import React from "react";
import { motion } from "motion/react";
import WrappedBackground from "./WrappedBackground";

const StatsListEntry = ({ entry, index, total }) => {
	// Alternate animations based on index
	const isEven = index % 2 === 0;

	return (
		<motion.div
			className="flex items-center justify-between gap-4 py-3 px-5 md:py-4 md:px-6 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg"
			initial={{ 
				opacity: 0, 
				x: isEven ? -40 : 40,
				scale: 0.9 
			}}
			animate={{ 
				opacity: 1, 
				x: 0,
				scale: 1 
			}}
			transition={{
				delay: index * 0.1 + 0.3,
				type: "spring",
				stiffness: 100,
				damping: 15,
			}}
		>
			{/* Stat Name */}
			<div className="font-semibold text-base md:text-lg text-white truncate flex-1 drop-shadow">
				{entry.name}
			</div>

			{/* Stat Value */}
			<div className="font-black text-xl md:text-2xl text-white flex-shrink-0 drop-shadow-lg">
				{entry.value}
			</div>
		</motion.div>
	);
};

const StatsListCard = ({ stat, index = 0, className = "" }) => {
	const entries = stat.leaderboard_data || [];

	return (
		<WrappedBackground colorIndex={index} className={className}>
			<div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
				<motion.div
					className="max-w-xl w-full space-y-8"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					{/* Title */}
					<motion.h2
						initial={{ opacity: 0, y: -30, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 100,
							damping: 12,
						}}
						className="text-3xl md:text-5xl font-black text-white text-center drop-shadow-lg"
					>
						{stat.title}
					</motion.h2>

					{/* Description */}
					{stat.description && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15 }}
							className="text-base md:text-lg text-white/90 text-center drop-shadow"
							dangerouslySetInnerHTML={{ __html: stat.description }}
						/>
					)}

					{/* Stats List Entries */}
					<div className="space-y-3 pt-4">
						{entries.length > 0 ? (
							entries.map((entry, idx) => (
								<StatsListEntry
									key={idx}
									entry={entry}
									index={idx}
									total={entries.length}
								/>
							))
						) : (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-white/70 text-center text-lg"
							>
								No stats in this list
							</motion.p>
						)}
					</div>
				</motion.div>
			</div>
		</WrappedBackground>
	);
};

export default StatsListCard;
