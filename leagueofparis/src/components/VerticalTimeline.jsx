import React from "react";

export const VerticalTimeline = ({ children }) => {
	return (
		<div className="relative w-full max-w-5xl mx-auto">
			{/* Timeline line */}
			<div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/30 hidden md:block" />
			<div className="absolute left-8 w-0.5 h-full bg-primary/30 md:hidden" />
			
			<div className="space-y-12 py-8">
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
	// Alternate sides on desktop
	const isLeft = index % 2 === 0;

	return (
		<div className={`relative ${className}`}>
			{/* Desktop layout (alternating) */}
			<div className="hidden md:block">
				<div className={`flex items-center ${isLeft ? "flex-row-reverse" : "flex-row"}`}>
					{/* Content */}
					<div className={`w-5/12 ${isLeft ? "text-right pr-8" : "text-left pl-8"}`}>
						<div
							className="relative bg-base-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
							style={contentStyle}
						>
							{/* Arrow */}
							<div
								className={`absolute top-8 ${
									isLeft ? "-right-3" : "-left-3"
								} w-0 h-0 border-t-8 border-b-8 border-transparent ${
									isLeft ? "border-r-8 border-r-base-200" : "border-l-8 border-l-base-200"
								}`}
								style={contentArrowStyle}
							/>
							{children}
						</div>
						{/* Date below content on desktop */}
						<div className={`mt-2 text-sm font-semibold text-primary ${isLeft ? "text-right" : "text-left"}`}>
							{date}
						</div>
					</div>

					{/* Center with branch line and date badge */}
					<div className="relative z-10 flex items-center justify-center">
						{/* Horizontal branch line */}
						<div
							className={`absolute w-12 h-0.5 bg-primary/40 ${
								isLeft ? "right-1/2" : "left-1/2"
							}`}
						/>
						{/* Date badge */}
						<div
							className="relative w-20 h-20 flex items-center justify-center text-primary font-bold"
						>
							{icon}
						</div>
					</div>

					{/* Empty space on other side */}
					<div className="w-5/12" />
				</div>
			</div>

			{/* Mobile layout (all on right) */}
			<div className="md:hidden flex items-start">
				{/* Icon with branch */}
				<div className="relative z-10 flex-shrink-0 mr-4">
					{/* Horizontal branch line */}
					<div className="absolute left-1/2 w-4 h-0.5 bg-primary/40 top-1/2 -translate-y-1/2" />
					{/* Date badge */}
					<div
						className="relative w-16 h-16 flex items-center justify-center text-primary font-bold text-xs"
					>
						{icon}
					</div>
				</div>

				{/* Content */}
				<div className="flex-1">
					<div className="text-xs font-semibold text-primary mb-2">
						{date}
					</div>
					<div
						className="bg-base-200 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
						style={contentStyle}
					>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};

