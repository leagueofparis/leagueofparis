import React from "react";
import { motion } from "motion/react";

const HorizontalBar = ({ 
	value, 
	maxValue, 
	color = "#FF2D92",
	height = 8,
	delay = 0,
	showValue = true,
	className = "" 
}) => {
	const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

	return (
		<div className={`w-full ${className}`}>
			<div 
				className="w-full bg-white/10 rounded-full overflow-hidden"
				style={{ height: `${height}px` }}
			>
				<motion.div
					className="h-full rounded-full"
					style={{ backgroundColor: color }}
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{
						duration: 1,
						delay: delay,
						ease: [0.25, 0.46, 0.45, 0.94],
					}}
				/>
			</div>
		</div>
	);
};

export default HorizontalBar;

