import React from "react";

const AboutMe = () => {
	const birthday = new Date("2000-10-31");
	//calculate age with full dates
	const age =
		new Date().getFullYear() -
		birthday.getFullYear() -
		(new Date().getMonth() < birthday.getMonth() ||
		(new Date().getMonth() === birthday.getMonth() &&
			new Date().getDate() < birthday.getDate())
			? 1
			: 0);

	return (
		<div className="bg-base-200 rounded-lg shadow-md p-6 w-full max-w-[667px] flex flex-col gap-4 items-center">
			<h2 className="text-2xl font-bold mb-2">About Me</h2>
			<p className="text-base text-center">
				Hi there! My name is Paris and I am a brand new streamer who jumped into
				the world of gaming and content creation in January of 2025.
			</p>
			<p className="text-base text-center">
				While I may be new to streaming, and gaming in general, I have already
				fallen in love with it. I mainly play League of Legends, but
				occasionally dabble in Minecraft (creative only, because survival is
				scary), Repo, and intense Mario Kart games on Wii against my brothers…
				which probably shaped most of my competitiveness and my trust issues.
			</p>
			<p className="text-base text-center">
				I work full time for a non profit during the days, and at night gaming
				and streaming have become my favorite way to turn off my brain… by
				getting destroyed on the rift.
			</p>
			<p className="text-base text-center">
				I am incredibly grateful for the amazing community that’s already
				forming. I cannot wait to keep growing, learning, and ranking up both in
				game and in life with you all by my side! So, thanks for being here 🙂
			</p>
		</div>
	);
};

export default AboutMe;
