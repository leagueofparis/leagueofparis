import React from "react";
import { motion } from "motion/react";

const DonutChart = ({ 
	value, 
	maxValue = 100, 
	size = 120, 
	strokeWidth = 12,
	color = "#FF2D92",
	trackColor = "rgba(255,255,255,0.1)",
	delay = 0,
	showCenter = true,
	centerText = "",
	className = "" 
}) => {
	const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className={`relative inline-flex items-center justify-center ${className}`}>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="transform -rotate-90"
			>
				{/* Background track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={trackColor}
					strokeWidth={strokeWidth}
				/>
				{/* Animated progress */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset }}
					transition={{
						duration: 1.5,
						delay: delay,
						ease: [0.25, 0.46, 0.45, 0.94],
					}}
				/>
			</svg>
			{/* Center content */}
			{showCenter && (
				<motion.div
					className="absolute inset-0 flex items-center justify-center"
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: delay + 0.5, duration: 0.5 }}
				>
					<span className="text-white font-bold text-lg">
						{centerText || `${Math.round(percentage)}%`}
					</span>
				</motion.div>
			)}
		</div>
	);
};

export default DonutChart;

