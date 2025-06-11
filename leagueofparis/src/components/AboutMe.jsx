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
		<div className="bg-base-200 rounded-lg shadow-md p-6 w-full max-w-[667px] flex flex-col items-center">
			<h2 className="text-2xl font-bold mb-2">About Me</h2>
			<p className="text-base text-center">
				Hi there :) My name is Paris and I am new to streaming! If you are
				reading this, thanks for checking out my page. I hope that you follow
				and say hello during my next stream!
			</p>
			<div className="mt-4 text-base w-full">
				<span className="font-semibold">About Me:</span>
				<ul className="list-disc list-inside ml-4">
					<li>
						<span className="font-semibold">Birthday:</span> October 31st{" "}
						<span className="italic">#Halloween</span>
					</li>
					<li>
						<span className="font-semibold">Age:</span> {age}
					</li>
					<li>
						<span className="font-semibold">Favorite Food:</span> Chocolate
					</li>
					<li>
						<span className="font-semibold">Hobbies:</span> I like to read and
						do DIY crafts
					</li>
				</ul>
				<span className="font-semibold block mt-2">About Gaming:</span>
				<ul className="list-disc list-inside ml-4">
					<li>
						<span className="font-semibold">What Games?</span> I only play
						League (send help)
					</li>
					<li>
						<span className="font-semibold">Do You Duo?</span> I am currently
						trying to SoloQ ranked but was generously gifted an alt account
						where I will begin duoing soon!
					</li>
					<li>
						<span className="font-semibold">Are You Good?</span> Some days yes,
						most days no (but I always try!)
					</li>
				</ul>
			</div>
		</div>
	);
};

export default AboutMe;
