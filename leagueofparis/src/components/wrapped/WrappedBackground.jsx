import React from "react";
import { motion } from "motion/react";

// Vibrant accent colors for each slide
export const accentColors = [
	{ name: "pink", primary: "#FF2D92", secondary: "#FF6B9D" },
	{ name: "purple", primary: "#9B5DE5", secondary: "#C77DFF" },
	{ name: "cyan", primary: "#00F5D4", secondary: "#00BBF9" },
	{ name: "orange", primary: "#FF6B35", secondary: "#F7931E" },
	{ name: "lime", primary: "#C1FF00", secondary: "#A8E000" },
	{ name: "coral", primary: "#FF6B6B", secondary: "#EE5A5A" },
	{ name: "blue", primary: "#4361EE", secondary: "#3A86FF" },
	{ name: "gold", primary: "#FFD700", secondary: "#FFA500" },
];

const WrappedBackground = ({ 
	colorIndex = 0, 
	children, 
	className = "",
	showGrain = true 
}) => {
	const color = accentColors[colorIndex % accentColors.length];

	return (
		<div className={`min-h-screen w-full relative overflow-hidden ${className}`}
			style={{
				background: `linear-gradient(135deg, ${color.primary}dd 0%, ${color.secondary}cc 50%, ${color.primary}bb 100%)`
			}}
		>
			{/* Subtle grain overlay */}
			{showGrain && (
				<div 
					className="absolute inset-0 opacity-[0.04] pointer-events-none z-10"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
					}}
				/>
			)}

			{/* Main large blob - top right */}
			<motion.div
				className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-white/30"
				animate={{
					x: [0, 30, -20, 0],
					y: [0, -20, 30, 0],
					scale: [1, 1.1, 0.95, 1],
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Secondary blob - bottom left */}
			<motion.div
				className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none bg-black/10"
				animate={{
					x: [0, -25, 35, 0],
					y: [0, 40, -20, 0],
					scale: [1, 0.9, 1.05, 1],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 2,
				}}
			/>

			{/* Accent blob - center area floating */}
			<motion.div
				className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none bg-white/20"
				animate={{
					x: [0, 60, -40, 0],
					y: [-50, 30, -30, -50],
					scale: [0.8, 1, 0.9, 0.8],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 1,
				}}
			/>

			{/* Small accent shapes */}
			<motion.div
				className="absolute top-20 left-20 w-4 h-4 rounded-full pointer-events-none bg-white"
				animate={{
					opacity: [0.4, 0.8, 0.4],
					scale: [1, 1.5, 1],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="absolute bottom-32 right-24 w-3 h-3 rounded-full pointer-events-none bg-white"
				animate={{
					opacity: [0.3, 0.6, 0.3],
					scale: [1, 1.3, 1],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 1,
				}}
			/>
			<motion.div
				className="absolute top-1/3 right-16 w-2 h-2 rounded-full pointer-events-none bg-white"
				animate={{
					opacity: [0.3, 0.7, 0.3],
					y: [0, -10, 0],
				}}
				transition={{
					duration: 2.5,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.5,
				}}
			/>

			{/* Content */}
			<div className="relative z-20 min-h-screen">
				{children}
			</div>
		</div>
	);
};

export default WrappedBackground;

