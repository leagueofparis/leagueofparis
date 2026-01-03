import React, { useState, useEffect, useMemo } from "react";
import StatCard from "./StatCard";
import SummaryCard from "./SummaryCard";
import { motion, AnimatePresence } from "motion/react";

const StatCarousel = ({ stats, onBack, collectionTitle }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for initial

	// Create slides array with summary at the very end
	const slides = useMemo(() => {
		if (!stats || stats.length === 0) return [];
		
		// Add all stats first, then summary at the end
		const result = stats.map((stat, i) => ({ type: "stat", stat, index: i }));
		
		// Add summary as the final slide
		if (stats.length >= 2) {
			result.push({ type: "summary", stats: stats, index: result.length });
		}
		
		return result;
	}, [stats]);

	const totalSlides = slides.length;

	useEffect(() => {
		const handleKeyPress = (e) => {
			if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
				handleNext();
			} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				handlePrev();
			} else if (e.key === "Escape" && onBack) {
				onBack();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [currentIndex, onBack]);

	const handleNext = () => {
		if (currentIndex < totalSlides - 1) {
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

	const goToSlide = (index) => {
		if (index > currentIndex) {
			setDirection(1);
		} else if (index < currentIndex) {
			setDirection(-1);
		}
		setCurrentIndex(index);
	};

	const handleRestart = () => {
		setDirection(-1);
		setCurrentIndex(0);
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

	if (!stats || stats.length === 0 || slides.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-xl text-base-content">No stats available</p>
					{onBack && (
						<button onClick={onBack} className="btn btn-primary mt-4">
							Back to Collections
						</button>
					)}
				</div>
			</div>
		);
	}

	const currentSlide = slides[currentIndex];

	const variants = {
		enter: (direction) => ({
			x: direction > 0 ? 100 : -100,
			opacity: 0,
		}),
		center: {
			zIndex: 1,
			x: 0,
			opacity: 1,
		},
		exit: (direction) => ({
			zIndex: 0,
			x: direction < 0 ? 100 : -100,
			opacity: 0,
		}),
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-black">
			{/* Story Progress Bars */}
			<div className="fixed top-0 left-0 w-full z-50 flex gap-1 p-2 pt-4">
				{slides.map((_, index) => (
					<div 
						key={index} 
						className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
						onClick={() => goToSlide(index)}
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
			<div className="fixed top-6 left-4 z-50 flex items-center">
				{onBack && (
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
				)}
				<span className={`text-white font-bold text-shadow-sm drop-shadow-md ${onBack ? 'ml-3' : ''}`}>
					{collectionTitle}
				</span>
			</div>

			{/* Animated Content */}
			<AnimatePresence initial={false} custom={direction} mode="popLayout">
				<motion.div
					key={currentIndex}
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
				transition={{
					x: { type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] },
					opacity: { duration: 0.2, ease: "easeOut" },
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
					{currentSlide.type === "summary" ? (
						<SummaryCard 
							stats={currentSlide.stats} 
							index={currentIndex} 
							collectionTitle={collectionTitle}
							onRestart={handleRestart}
							onHome={onBack}
						/>
					) : (
						<StatCard stat={currentSlide.stat} index={currentSlide.index} />
					)}
				</motion.div>
			</AnimatePresence>

			{/* Touch Areas - tap sides to navigate */}
			<div 
				className="absolute top-0 left-0 w-1/3 h-full z-40 cursor-pointer group"
				onClick={handlePrev} 
			>
				{/* Left arrow - always visible when not on first slide */}
				{currentIndex > 0 && (
					<div className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-sm group-hover:bg-black/30 transition-all duration-200 group-active:scale-90">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/60 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</div>
				)}
			</div>
			<div 
				className="absolute top-0 right-0 w-1/3 h-full z-40 cursor-pointer group"
				onClick={handleNext} 
			>
				{/* Right arrow - always visible when not on last slide */}
				{currentIndex < totalSlides - 1 && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-sm group-hover:bg-black/30 transition-all duration-200 group-active:scale-90">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/60 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</div>
				)}
			</div>

			{/* Minimal slide counter at bottom */}
			<div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
				<span className="text-white/40 text-xs font-medium">
					{currentIndex + 1} / {totalSlides}
				</span>
			</div>
		</div>
	);
};

export default StatCarousel;
