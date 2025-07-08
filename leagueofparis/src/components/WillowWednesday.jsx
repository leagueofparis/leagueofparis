import React from "react";
import WeeklyImage from "./WeeklyImage";

const WillowWednesday = () => {
	return (
		<div className="w-full">
			<img
				src="/images/willow_wed_banner.png"
				alt="Willow Wednesday"
				className="w-full h-auto rounded-t-lg cursor-pointer"
				onClick={() => {
					window.location.href = "/willow";
				}}
			/>
			<WeeklyImage />
			<p
				className="text-center text-sm text-primary-content hover:text-primary-content/80 cursor-pointer"
				onClick={() => {
					window.location.href = "/willow";
				}}
			>
				See all previous Willow Wednesdays
			</p>
		</div>
	);
};

export default WillowWednesday;
