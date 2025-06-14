import { useState, useEffect } from "react";

const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Function to check if window width is mobile size
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth <= 768); // 768px is a common breakpoint for mobile
		};

		// Check on initial load
		checkIsMobile();

		// Add event listener for window resize
		window.addEventListener("resize", checkIsMobile);

		// Cleanup event listener
		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);

	return isMobile;
};

export default useIsMobile;
