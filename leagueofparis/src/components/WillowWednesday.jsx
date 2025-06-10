import React from "react";
import WeeklyImage from "./WeeklyImage";

const WillowWednesday = () => {
	return (
		<div className="w-full">
			<img
				src="/images/willow_wed_banner.jpg"
				alt="Willow Wednesday"
				className="w-full h-auto rounded-t-lg"
			/>
			<WeeklyImage />
		</div>
	);
};

export default WillowWednesday;
