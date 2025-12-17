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

export const VerticalTimeline = ({ children, className = "" }) => {
	return (
		<div className={`relative w-full max-w-5xl mx-auto ${className}`}>
			{/* Timeline line with gradient */}
			<div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/5 via-primary/30 to-primary/5 hidden md:block rounded-full" />
			<div className="absolute left-8 w-1 h-full bg-gradient-to-b from-primary/5 via-primary/30 to-primary/5 md:hidden rounded-full" />
			
			<div className="py-8">
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
					<div className={`w-5/12 ${isLeft ? "text-right pr-12" : "text-left pl-12"}`}>
						<div
							className="relative bg-base-200 border border-base-300/10 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 group"
							style={contentStyle}
						>
							{/* Glowing border effect on hover */}
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{zIndex: -1, margin: '-1px'}} />
							
							{/* Arrow */}
							<div
								className={`absolute top-8 ${
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

					{/* Center with branch line and date badge */}
					<div className="relative z-10 flex items-center justify-center w-[60px]">
						{/* Horizontal branch line */}
						<div
							className={`absolute top-[45px] h-[2px] bg-primary/30 w-[40px] transition-all duration-[1500ms] delay-300 ${
								isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
							} ${
								isLeft ? "right-[30px] origin-right" : "left-[30px] origin-left"
							}`}
						/>
						
						{/* Date badge */}
						<div
							className={`relative w-20 h-20 rounded-full flex items-center justify-center bg-primary text-primary-content border-4 border-base-100 shadow-[0_0_0_4px_rgba(var(--p),0.2)] z-20 transition-transform duration-[1000ms] delay-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
								isVisible ? "scale-100" : "scale-0"
							}`}
						>
							<div className="font-bold">
								{icon}
							</div>
						</div>
					</div>

					{/* Empty space on other side */}
					<div className="w-5/12" />
				</div>
			</div>

			{/* Mobile layout (all on right) */}
			<div className="md:hidden flex items-start pl-2">
				{/* Icon with branch */}
				<div className="relative z-10 flex-shrink-0 mr-6">
					{/* Horizontal branch line */}
					<div 
						className={`absolute top-[32px] left-[32px] w-[24px] h-[2px] bg-primary/30 transition-all duration-1000 delay-300 ${
							isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
						} origin-left`} 
					/>
					
					{/* Date badge */}
					<div
						className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-primary text-primary-content border-4 border-base-100 shadow-[0_0_0_4px_rgba(var(--p),0.2)] z-20 transition-transform duration-700 delay-100 ${
							isVisible ? "scale-100" : "scale-0"
						}`}
					>
						<div className="font-bold text-xs">
							{icon}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 pr-2">
					<div className="text-xs font-bold uppercase tracking-wider text-primary-content/80 mb-2 pl-1">
						{date}
					</div>
					<div
						className="bg-base-200 border border-base-300/10 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300"
						style={contentStyle}
					>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
