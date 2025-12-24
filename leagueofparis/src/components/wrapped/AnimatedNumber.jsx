import React, { useState, useEffect, useRef } from "react";

const AnimatedNumber = ({ value, duration = 2000, className = "" }) => {
	const [displayValue, setDisplayValue] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const animationRef = useRef(null);

	useEffect(() => {
		// Extract numeric value from string
		const numericValue = parseFloat(value?.toString().replace(/[^0-9.-]/g, "") || 0);
		
		if (isNaN(numericValue)) {
			// If not a number, just display the original value
			setDisplayValue(value);
			return;
		}

		setIsAnimating(true);
		const startValue = 0;
		const endValue = numericValue;
		const startTime = Date.now();

		const animate = () => {
			const now = Date.now();
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function (ease-out)
			const easeOut = 1 - Math.pow(1 - progress, 3);

			const currentValue = startValue + (endValue - startValue) * easeOut;
			setDisplayValue(Math.floor(currentValue));

			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate);
			} else {
				setDisplayValue(endValue);
				setIsAnimating(false);
			}
		};

		animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [value, duration]);

	// Format number with commas
	const formatNumber = (num) => {
		if (typeof num === "string" && isNaN(parseFloat(num))) {
			return num; // Return original if not numeric
		}
		return num.toLocaleString("en-US");
	};

	// If the original value contains non-numeric characters, preserve them
	const formatValue = () => {
		if (typeof value === "string" && isNaN(parseFloat(value.replace(/[^0-9.-]/g, "")))) {
			return value;
		}
		const numericPart = formatNumber(displayValue);
		// Try to preserve any suffix/prefix from original value
		if (typeof value === "string") {
			const match = value.match(/([^0-9]*)([\d,]+)([^0-9]*)/);
			if (match) {
				return match[1] + numericPart + match[3];
			}
		}
		return numericPart;
	};

	return (
		<span className={className} data-animating={isAnimating}>
			{formatValue()}
		</span>
	);
};

export default AnimatedNumber;

