import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import { motion, AnimatePresence } from "motion/react";

const StatCarousel = ({ stats, onBack, collectionTitle }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for initial

	useEffect(() => {
		const handleKeyPress = (e) => {
			if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
				handleNext();
			} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				handlePrev();
			} else if (e.key === "Escape") {
				onBack();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [currentIndex]);

	const handleNext = () => {
		if (currentIndex < stats.length - 1) {
			setDirection(1);
			setCurrentIndex(currentIndex + 1);
		}
	};

	const handlePrev = () => {
		if (currentIndex > 0) {
			setDirection(-1);
			setCurrentIndex(currentIndex - 1);
		}
	};

	const goToStat = (index) => {
		if (index > currentIndex) {
			setDirection(1);
		} else if (index < currentIndex) {
			setDirection(-1);
		}
		setCurrentIndex(index);
	};

	// Swipe handling with Framer Motion drag
	const swipeConfidenceThreshold = 10000;
	const swipePower = (offset, velocity) => {
		return Math.abs(offset) * velocity;
	};

	const paginate = (newDirection) => {
		if (newDirection > 0) {
			handleNext();
		} else {
			handlePrev();
		}
	};

	if (!stats || stats.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-xl text-base-content">No stats available</p>
					<button onClick={onBack} className="btn btn-primary mt-4">
						Back to Collections
					</button>
				</div>
			</div>
		);
	}

	const currentStat = stats[currentIndex];

	const variants = {
		enter: (direction) => ({
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
			scale: 0.8,
			rotateY: direction > 0 ? 45 : -45,
		}),
		center: {
			zIndex: 1,
			x: 0,
			opacity: 1,
			scale: 1,
			rotateY: 0,
		},
		exit: (direction) => ({
			zIndex: 0,
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
			scale: 0.8,
			rotateY: direction < 0 ? 45 : -45,
		}),
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-black">
			{/* Story Progress Bars */}
			<div className="fixed top-0 left-0 w-full z-50 flex gap-1 p-2 pt-4">
				{stats.map((_, index) => (
					<div 
						key={index} 
						className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
						onClick={() => goToStat(index)}
					>
						<motion.div 
							className="h-full bg-white"
							initial={{ width: index < currentIndex ? "100%" : "0%" }}
							animate={{ width: index < currentIndex ? "100%" : index === currentIndex ? "100%" : "0%" }}
							transition={index === currentIndex ? { duration: 5, ease: "linear" } : { duration: 0.3 }}
						/>
					</div>
				))}
			</div>

			{/* Navigation Buttons */}
			<div className="fixed top-6 left-4 z-50">
				<button
					onClick={onBack}
					className="btn btn-ghost btn-sm btn-circle bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border-none"
					title="Back to Collections"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<span className="ml-3 text-white font-bold text-shadow-sm drop-shadow-md">
					{collectionTitle}
				</span>
			</div>

			{/* Animated Content */}
			<AnimatePresence initial={false} custom={direction} mode="wait">
				<motion.div
					key={currentIndex}
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						x: { type: "spring", stiffness: 300, damping: 30 },
						opacity: { duration: 0.2 },
						scale: { duration: 0.4 },
						rotateY: { duration: 0.4 }
					}}
					className="absolute w-full h-full"
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={1}
					onDragEnd={(e, { offset, velocity }) => {
						const swipe = swipePower(offset.x, velocity.x);

						if (swipe < -swipeConfidenceThreshold) {
							paginate(1);
						} else if (swipe > swipeConfidenceThreshold) {
							paginate(-1);
						}
					}}
				>
					<StatCard stat={currentStat} index={currentIndex} />
				</motion.div>
			</AnimatePresence>

			{/* Previous/Next Touch Areas (invisible but clickable) */}
			<div 
				className="absolute top-0 left-0 w-1/4 h-full z-40 cursor-pointer hidden md:block"
				onClick={handlePrev} 
				title="Previous"
			/>
			<div 
				className="absolute top-0 right-0 w-1/4 h-full z-40 cursor-pointer hidden md:block"
				onClick={handleNext} 
				title="Next"
			/>
		</div>
	);
};

export default StatCarousel;
