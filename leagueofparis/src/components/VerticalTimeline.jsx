import React, { useEffect, useRef, useState } from "react";

const useElementOnScreen = (options) => {
	const containerRef = useRef(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			const [entry] = entries;
			if (entry.isIntersecting) {
				setIsVisible(true);
				observer.unobserve(entry.target);
			}
		}, options);

		if (containerRef.current) observer.observe(containerRef.current);

		return () => {
			if (containerRef.current) observer.unobserve(containerRef.current);
		};
	}, [containerRef, options]);

	return [containerRef, isVisible];
};

// Floating heart decoration component
const FloatingHeart = ({ style, delay = 0, size = "sm" }) => {
	const sizeClasses = {
		xs: "w-2 h-2",
		sm: "w-3 h-3",
		md: "w-4 h-4",
		lg: "w-5 h-5"
	};
	
	return (
		<div 
			className={`absolute ${sizeClasses[size]} opacity-40 pointer-events-none`}
			style={{ 
				...style,
				animation: `timeline-float 3s ease-in-out infinite`,
				animationDelay: `${delay}s`
			}}
		>
			<svg viewBox="0 0 24 24" fill="currentColor" className="text-secondary w-full h-full">
				<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
			</svg>
		</div>
	);
};

// Decorative dot for the timeline
const TimelineDot = ({ className = "" }) => (
	<div className={`w-2 h-2 rounded-full bg-secondary/50 ${className}`} />
);

// Small heart for timeline decoration
const TimelineHeart = ({ className = "", size = 12 }) => (
	<svg 
		viewBox="0 0 24 24" 
		fill="currentColor" 
		className={`text-secondary/60 ${className}`}
		style={{ width: size, height: size }}
	>
		<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
	</svg>
);

// Curved connector SVG for desktop
const CurvedConnector = ({ isLeft, isVisible }) => {
	const pathD = isLeft 
		? "M 0 20 Q 20 20, 30 10 Q 40 0, 50 0"
		: "M 50 20 Q 30 20, 20 10 Q 10 0, 0 0";
	
	return (
		<svg 
			className={`absolute top-[35px] w-[50px] h-[25px] overflow-visible transition-all duration-[1500ms] delay-300 ${
				isVisible ? "opacity-100" : "opacity-0"
			} ${isLeft ? "right-[30px]" : "left-[30px]"}`}
			viewBox="0 0 50 25"
			fill="none"
		>
			<path 
				d={pathD}
				stroke="currentColor" 
				strokeWidth="2"
				strokeDasharray="4 4"
				className="text-secondary/60"
				style={{
					strokeDashoffset: isVisible ? 0 : 100,
					transition: "stroke-dashoffset 1.5s ease-out 0.3s"
				}}
			/>
			{/* Decorative dot at the end */}
			<circle 
				cx={isLeft ? 50 : 0} 
				cy={isLeft ? 0 : 0} 
				r="4" 
				className="fill-secondary/80"
				style={{
					transform: isVisible ? "scale(1)" : "scale(0)",
					transformOrigin: "center",
					transition: "transform 0.5s ease-out 0.8s"
				}}
			/>
		</svg>
	);
};

// Simple, clean date badge
const DateBadge = ({ children, isVisible, size = "lg" }) => {
	const sizeConfig = {
		lg: "w-20 h-20",
		md: "w-16 h-16"
	};
	
	return (
		<div 
			className={`relative ${sizeConfig[size]} rounded-full flex items-center justify-center bg-primary text-primary-content shadow-lg transition-transform duration-[1000ms] delay-500 ${
				isVisible ? "scale-100" : "scale-0"
			}`}
			style={{
				boxShadow: "0 0 0 4px var(--color-base-100), 0 0 0 6px var(--color-secondary)"
			}}
		>
			<div className="font-bold">
				{children}
			</div>
		</div>
	);
};

// Timeline start flourish
const TimelineStartFlourish = () => (
	<div className="absolute left-1/2 -translate-x-1/2 -top-2 hidden md:flex flex-col items-center">
		<TimelineHeart size={24} className="text-secondary animate-pulse" />
		<div className="w-px h-4 bg-gradient-to-b from-secondary/60 to-transparent" />
	</div>
);

// Timeline end flourish
const TimelineEndFlourish = () => (
	<div className="absolute left-1/2 -translate-x-1/2 -bottom-2 hidden md:flex flex-col items-center">
		<div className="w-px h-4 bg-gradient-to-t from-secondary/60 to-transparent" />
		<div className="text-xs text-secondary/60 font-medium tracking-wider mt-1">to be continued...</div>
		<div className="flex gap-1 mt-1">
			<TimelineDot />
			<TimelineDot />
			<TimelineDot />
		</div>
	</div>
);

// Mobile start flourish
const MobileTimelineStartFlourish = () => (
	<div className="absolute left-8 -translate-x-1/2 -top-2 md:hidden flex flex-col items-center">
		<TimelineHeart size={18} className="text-secondary animate-pulse" />
		<div className="w-px h-3 bg-gradient-to-b from-secondary/60 to-transparent" />
	</div>
);

// Mobile end flourish
const MobileTimelineEndFlourish = () => (
	<div className="absolute left-8 -translate-x-1/2 -bottom-2 md:hidden flex flex-col items-center">
		<div className="w-px h-3 bg-gradient-to-t from-secondary/60 to-transparent" />
		<div className="flex gap-1 mt-1">
			<TimelineDot className="w-1.5 h-1.5" />
			<TimelineDot className="w-1.5 h-1.5" />
			<TimelineDot className="w-1.5 h-1.5" />
		</div>
	</div>
);

export const VerticalTimeline = ({ children, className = "" }) => {
	return (
		<div className={`relative w-full max-w-5xl mx-auto ${className}`}>
			{/* Desktop: Prominent timeline line */}
			<div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full hidden md:block">
				{/* Main solid line with gradient */}
				<div 
					className="w-full h-full rounded-full"
					style={{
						background: `linear-gradient(
							to bottom,
							transparent 0%,
							var(--color-secondary) 5%,
							var(--color-secondary) 95%,
							transparent 100%
						)`,
						opacity: 0.7
					}}
				/>
				
				{/* Floating hearts along the timeline */}
				<FloatingHeart style={{ top: "10%", left: "-8px" }} delay={0} size="sm" />
				<FloatingHeart style={{ top: "25%", left: "6px" }} delay={0.5} size="xs" />
				<FloatingHeart style={{ top: "40%", left: "-10px" }} delay={1} size="md" />
				<FloatingHeart style={{ top: "55%", left: "8px" }} delay={1.5} size="sm" />
				<FloatingHeart style={{ top: "70%", left: "-6px" }} delay={2} size="xs" />
				<FloatingHeart style={{ top: "85%", left: "10px" }} delay={2.5} size="sm" />
			</div>
			
			{/* Mobile: Prominent timeline line */}
			<div className="absolute left-8 -translate-x-1/2 w-1 h-full md:hidden">
				<div 
					className="w-full h-full rounded-full"
					style={{
						background: `linear-gradient(
							to bottom,
							transparent 0%,
							var(--color-secondary) 5%,
							var(--color-secondary) 95%,
							transparent 100%
						)`,
						opacity: 0.7
					}}
				/>
				
				{/* Floating hearts for mobile */}
				<FloatingHeart style={{ top: "15%", left: "-6px" }} delay={0} size="xs" />
				<FloatingHeart style={{ top: "45%", left: "4px" }} delay={1} size="xs" />
				<FloatingHeart style={{ top: "75%", left: "-4px" }} delay={2} size="xs" />
			</div>
			
			{/* Timeline flourishes */}
			<TimelineStartFlourish />
			<TimelineEndFlourish />
			<MobileTimelineStartFlourish />
			<MobileTimelineEndFlourish />
			
			<div className="py-12">
				{children}
			</div>
		</div>
	);
};

export const VerticalTimelineElement = ({
	children,
	date,
	icon,
	contentStyle,
	contentArrowStyle,
	className = "",
	index = 0,
}) => {
	const isLeft = index % 2 === 0;
	const [containerRef, isVisible] = useElementOnScreen({
		root: null,
		rootMargin: "0px",
		threshold: 0.1,
	});

	return (
		<div
			ref={containerRef}
			className={`relative ${className} transition-all duration-[1500ms] ease-out ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 transform"
			}`}
		>
			{/* Desktop layout (alternating) */}
			<div className="hidden md:block">
				<div className={`flex items-center ${isLeft ? "flex-row-reverse" : "flex-row"}`}>
					{/* Content */}
					<div className={`w-5/12 ${isLeft ? "text-right pr-16" : "text-left pl-16"}`}>
						<div
							className="relative bg-base-200 border border-secondary/20 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-1 transition-all duration-500 group"
							style={contentStyle}
						>
							{/* Decorative corner hearts */}
							<div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<TimelineHeart size={12} className="text-accent" />
							</div>
							<div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<TimelineHeart size={12} className="text-accent" />
							</div>
							
							{/* Glowing border effect on hover */}
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{zIndex: -1, margin: '-1px'}} />
							
							{/* Arrow */}
							<div
								className={`absolute top-10 ${
									isLeft ? "-right-[13px]" : "-left-[13px]"
								} w-0 h-0 border-t-[10px] border-b-[10px] border-transparent ${
									isLeft 
										? "border-r-[12px] border-r-base-200 rotate-180" 
										: "border-l-[12px] border-l-base-200 rotate-180"
								}`}
								style={contentArrowStyle}
							/>
							{children}
						</div>
						{/* Date below content on desktop */}
						<div className={`mt-3 text-sm font-bold tracking-wider uppercase text-primary/80 ${isLeft ? "text-right" : "text-left"}`}>
							{date}
						</div>
					</div>

					{/* Center with curved branch and clean date badge */}
					<div className="relative z-10 flex items-center justify-center w-[80px]">
						{/* Curved connector */}
						<CurvedConnector isLeft={isLeft} isVisible={isVisible} />
						
						{/* Clean date badge */}
						<DateBadge isVisible={isVisible} size="lg">
							{icon}
						</DateBadge>
					</div>

					{/* Empty space on other side */}
					<div className="w-5/12" />
				</div>
			</div>

			{/* Mobile layout (all on right) */}
			<div className="md:hidden flex items-start pl-2">
				{/* Icon with curved branch */}
				<div className="relative z-10 flex-shrink-0 mr-6">
					{/* Curved branch for mobile */}
					<svg 
						className={`absolute top-[28px] left-[30px] w-[28px] h-[16px] overflow-visible transition-all duration-1000 delay-300 ${
							isVisible ? "opacity-100" : "opacity-0"
						}`}
						viewBox="0 0 28 16"
						fill="none"
					>
						<path 
							d="M 0 8 Q 10 8, 18 4 Q 26 0, 28 0"
							stroke="currentColor" 
							strokeWidth="2"
							strokeDasharray="3 3"
							className="text-secondary/60"
						/>
						<circle cx="28" cy="0" r="3" className="fill-secondary/80" />
					</svg>
					
					{/* Clean date badge for mobile */}
					<DateBadge isVisible={isVisible} size="md">
						<div className="text-xs">
							{icon}
						</div>
					</DateBadge>
				</div>

				{/* Content */}
				<div className="flex-1 pr-2">
					<div className="text-xs font-bold uppercase tracking-wider text-primary-content/80 mb-2 pl-1">
						{date}
					</div>
					<div
						className="relative bg-base-200 border border-secondary/20 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 group"
						style={contentStyle}
					>
						{/* Decorative corner heart on hover */}
						<div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<TimelineHeart size={10} className="text-accent" />
						</div>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
