import React from "react";
import {
	FaTwitch,
	FaCoffee,
	FaHeart,
	FaCrown,
	FaStar,
	FaGem,
} from "react-icons/fa";

const Support = () => {
	const twitchChannel = "leagueofparis";
	const kofiLink = "https://ko-fi.com/leagueofparis";

	const freeEmotes = [
		{ name: "parisLogo", image: "free/parisLogo.png" },
		{ name: "parisRaid", image: "free/parisRaid.png" },
	];

	const tier1Emotes = [
		{ name: "paris7", image: "tier1/paris7.png" },
		{ name: "parisBedge", image: "tier1/parisBedge.png" },
		{ name: "parisBlush", image: "tier1/parisBlush.png" },
		{ name: "parisJustAGirl", image: "tier1/parisJustAGirl.png" },
		{ name: "parisLiver", image: "tier1/parisLiver.png" },
		{ name: "parisMadge", image: "tier1/parisMadge.png" },
		{ name: "parisOK", image: "tier1/parisOK.png" },
		{ name: "parisPeeBreak", image: "tier1/parisPeeBreak.png" },
		{ name: "parisSadge", image: "tier1/parisSadge.png" },
		{ name: "parisScared", image: "tier1/parisScared.png" },
		{ name: "parisWillow", image: "tier1/parisWillow.png" },
	];

	const subscriptionTiers = [
		{
			name: "Tier 1",
			price: "$5.99/month",
			description: "Basic subscription with emotes and badges",
			icon: <FaHeart className="text-red-500" />,
			features: ["Ad-free streams", "Subscription badge in Discord"],
			emotes: tier1Emotes,
		},
		{
			name: "Tier 2",
			price: "$9.99/month",
			description: "Enhanced subscription with more perks",
			icon: <FaStar className="text-yellow-500" />,

			features: [
				"Ad-free streams",
				"Subscription badge in Discord",
				"Friends on all applicable platforms",
			],
			emotes: tier1Emotes,
		},
		{
			name: "Tier 3",
			price: "$24.99/month",
			description: "Premium subscription with maximum benefits",
			icon: <FaCrown className="text-purple-500" />,
			features: [
				"Ad-free streams",
				"Subscription badge in Discord",
				"Friends on all applicable platforms",
				"Penpal with Paris Program (opt in to receive a handwritten letter by Paris each month)",
			],
			emotes: tier1Emotes,
		},
	];

	const subBadges = [
		{ months: 1, label: "1 Month", image: "1month.png" },
		{ months: 2, label: "2 Months", image: "2month.png" },
		{ months: 3, label: "3 Months", image: "3month.png" },
		{ months: 6, label: "6 Months", image: "6month.png" },
		{ months: 9, label: "9 Months", image: "9month.png" },
		{ months: 12, label: "1 Year", image: "1year.png" },
	];

	return (
		<div className="w-[90%] max-w-6xl mx-auto mt-10 space-y-8">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">Support League of Paris</h1>
				<p className="text-lg text-base-content/80 max-w-2xl mx-auto">
					Thank you for considering supporting my content! Every bit of support
					helps me continue creating and streaming.
				</p>
			</div>

			{/* Twitch Subscription Section */}
			<div className="bg-base-200 rounded-lg p-6 shadow-lg">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
					<div className="flex items-center gap-3">
						<FaTwitch className="text-4xl text-purple-500" />
						<div>
							<h2 className="text-2xl font-bold text-primary">Twitch</h2>
							<p className="text-primary/70">
								Subscribe to get exclusive emotes, badges, and perks!
							</p>
						</div>
					</div>
					<a
						href={`https://twitch.tv/${twitchChannel}`}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-accent gap-2 hover:bg-accent/80 text-white"
					>
						<FaTwitch />
						Follow on Twitch
					</a>
				</div>

				{/* Sub badges and emotes */}
				<div className="mb-6 flex gap-6 justify-start items-center">
					<div className="">
						<h3 className="text-lg font-semibold mb-3 text-primary">
							Sub Badges
						</h3>
						<div className="flex flex-wrap gap-3">
							{subBadges.map((badge, index) => (
								<div key={index} className="flex flex-col items-center gap-2">
									<img
										src={`/images/subbadges/${badge.image}`}
										alt={badge.label}
										className="w-6 h-6 md:w-8 md:h-8"
									/>
									<span className="text-sm font-medium text-primary">
										{badge.label}
									</span>
								</div>
							))}
						</div>
					</div>
					<div className="">
						<h3 className="text-lg font-semibold mb-3 text-primary">
							Free Emotes
						</h3>
						<div className="flex flex-wrap gap-3">
							{freeEmotes.map((emote, index) => (
								<div key={index} className="flex flex-col items-center gap-2">
									<img
										src={`/images/emotes/${emote.image}`}
										alt={emote.name}
										className="w-6 h-6 md:w-8 md:h-8"
									/>
									<span className="text-sm font-medium text-primary">
										{emote.name}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Subscription Tiers */}
				<div className="grid md:grid-cols-3 gap-6 mb-6">
					{subscriptionTiers.map((tier, index) => (
						<div
							key={index}
							className="bg-base-300 rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-all flex flex-col"
						>
							<div className="flex items-center gap-2 mb-3">
								{tier.icon}
								<h3 className="text-xl font-bold">{tier.name}</h3>
							</div>
							<p className="text-2xl font-bold text-base-content mb-2">
								{tier.price}
							</p>
							<p className="text-sm text-base-content/70 mb-3">
								{tier.description}
							</p>
							<ul className="space-y-1 mb-4">
								{tier.features.map((feature, idx) => (
									<li key={idx} className="text-sm flex items-center gap-2">
										<FaGem className="text-xs text-accent min-w-4 min-h-4" />
										{feature}
									</li>
								))}
							</ul>

							{/* Emotes for this tier */}
							<div className="mb-4">
								<p className="text-sm font-semibold mb-2 text-base-content/80">
									Emotes included:
								</p>
								<div className="flex flex-wrap gap-2">
									{tier.emotes.map((emote, index) => (
										<div
											key={index}
											className="flex flex-col items-center gap-2"
										>
											<img
												src={`/images/emotes/${emote.image}`}
												alt={emote.name}
												className="w-6 h-6 md:w-8 md:h-8"
											/>
										</div>
									))}
								</div>
							</div>

							{/* Button aligned to bottom */}
							<div className="mt-auto pt-4">
								<a
									href={`https://twitch.tv/${twitchChannel}/subscribe?tier=${index + 1}`}
									target="_blank"
									rel="noopener noreferrer"
									className="btn w-full btn-accent hover:bg-accent/80 text-white"
								>
									Subscribe {tier.name}
								</a>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Ko-fi Section */}
			<div className="bg-base-200 rounded-lg p-6 shadow-lg">
				<div className="flex items-center gap-3 mb-6">
					<FaCoffee className="text-4xl text-orange-500" />
					<div>
						<h2 className="text-2xl font-bold text-primary">
							Donate Monetarily
						</h2>
						<p className="text-primary/70">
							One-time support to help keep the streams going!
						</p>
					</div>
				</div>

				<div className="bg-base-300 rounded-lg p-6 text-center">
					<div className="max-w-md mx-auto">
						<h3 className="text-xl font-bold mb-3">Support League of Paris</h3>
						<p className="text-base-content/70 mb-6">
							Each donation goes directly to me without cuts taken. These
							donations are used to directly support all streams and content
							creation. Your support means the world to me!
						</p>
						<a
							href={kofiLink}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-accent btn-lg gap-2"
						>
							<FaCoffee />
							Donate
						</a>
					</div>
				</div>
			</div>

			{/* Other Ways to Support */}
			<div className="bg-base-200 rounded-lg p-6 shadow-lg">
				<h2 className="text-2xl font-bold mb-6 text-primary">
					Other Ways to Support
				</h2>
				<div className="grid md:grid-cols-2 gap-6">
					<div className="bg-base-300 rounded-lg p-4">
						<h3 className="text-lg font-bold mb-2">Watch & Engage</h3>
						<p className="text-base-content/70 mb-3">
							Simply watching the stream and engaging in chat helps a lot! Your
							presence and interaction make the community better.
						</p>
						<ul className="text-sm space-y-1">
							<li>• Watch live streams</li>
							<li>• Chat and interact</li>
							<li>• Follow on social media</li>
						</ul>
					</div>
					<div className="bg-base-300 rounded-lg p-4">
						<h3 className="text-lg font-bold mb-2">Spread the Word</h3>
						<p className="text-base-content/70 mb-3">
							Help grow the community by sharing my content and introducing
							others to the stream!
						</p>
						<ul className="text-sm space-y-1">
							<li>• Share stream clips</li>
							<li>• Join the Discord community</li>
							<li>• Help Paris find collaborators</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Thank You Message */}
			<div className="text-center bg-base-300 rounded-lg p-8 text-base-content">
				<h2 className="text-3xl font-bold mb-4 text-base-content">
					Thank You! 💕
				</h2>
				<p className="text-lg text-base-content">
					Whether you subscribe, donate, or just watch and chat - every bit of
					support helps me continue doing what I love. You are all amazing and I
					am so grateful for this community!
				</p>
			</div>
		</div>
	);
};

export default Support;
