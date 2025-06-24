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
			price: "$4.99/month",
			description: "Basic subscription with emotes and badges",
			icon: <FaHeart className="text-red-500" />,
			features: [
				"Ad-free streams",
				"Chat during Subscriber-Only mode",
				"Not affected by chat slow-mode",
			],
			emotes: tier1Emotes,
		},
		{
			name: "Tier 2",
			price: "$9.99/month",
			description: "Enhanced subscription with more perks",
			icon: <FaStar className="text-yellow-500" />,
			features: [
				"5 Sub emotes",
				"Animated sub badge",
				"Priority chat",
				"Exclusive content",
			],
			emotes: tier1Emotes,
		},
		{
			name: "Tier 3",
			price: "$24.99/month",
			description: "Premium subscription with maximum benefits",
			icon: <FaCrown className="text-purple-500" />,
			features: [
				"All sub emotes",
				"Animated badge",
				"VIP status",
				"Personal shoutouts",
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
							<h2 className="text-2xl font-bold">Twitch</h2>
							<p className="text-base-content/70">
								Subscribe to get exclusive emotes, badges, and perks!
							</p>
						</div>
					</div>
					<a
						href={`https://twitch.tv/${twitchChannel}`}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-secondary btn-lg gap-2 bg-purple-600 hover:bg-purple-700 text-white"
					>
						<FaTwitch />
						Follow on Twitch
					</a>
				</div>

				{/* Sub badges and emotes */}
				<div className="mb-6 flex gap-6 justify-start items-center">
					<div className="">
						<h3 className="text-lg font-semibold mb-3">Sub Badges</h3>
						<div className="flex flex-wrap gap-3">
							{subBadges.map((badge, index) => (
								<div key={index} className="flex flex-col items-center gap-2">
									<img
										src={`/images/subbadges/${badge.image}`}
										alt={badge.label}
										className="w-6 h-6 md:w-8 md:h-8"
									/>
									<span className="text-sm font-medium">{badge.label}</span>
								</div>
							))}
						</div>
					</div>
					<div className="">
						<h3 className="text-lg font-semibold mb-3">Free Emotes</h3>
						<div className="flex flex-wrap gap-3">
							{freeEmotes.map((emote, index) => (
								<div key={index} className="flex flex-col items-center gap-2">
									<img
										src={`/images/emotes/${emote.image}`}
										alt={emote.name}
										className="w-6 h-6 md:w-8 md:h-8"
									/>
									<span className="text-sm font-medium">{emote.name}</span>
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
							className="bg-base-100 rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-all flex flex-col"
						>
							<div className="flex items-center gap-2 mb-3">
								{tier.icon}
								<h3 className="text-xl font-bold">{tier.name}</h3>
							</div>
							<p className="text-2xl font-bold text-primary mb-2">
								{tier.price}
							</p>
							<p className="text-sm text-base-content/70 mb-3">
								{tier.description}
							</p>
							<ul className="space-y-1 mb-4">
								{tier.features.map((feature, idx) => (
									<li key={idx} className="text-sm flex items-center gap-2">
										<FaGem className="text-xs text-accent" />
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
									className="btn w-full bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700 text-white"
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
						<h2 className="text-2xl font-bold">Buy Me a Coffee</h2>
						<p className="text-base-content/70">
							One-time support to help keep the streams going!
						</p>
					</div>
				</div>

				<div className="bg-base-100 rounded-lg p-6 text-center">
					<div className="max-w-md mx-auto">
						<h3 className="text-xl font-bold mb-3">Support the Stream</h3>
						<p className="text-base-content/70 mb-6">
							Every coffee helps me continue creating content and improving the
							stream quality. Your support means the world to me! 💕
						</p>
						<a
							href={kofiLink}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-warning btn-lg gap-2"
						>
							<FaCoffee />
							Buy Me a Coffee
						</a>
					</div>
				</div>
			</div>

			{/* Other Ways to Support */}
			<div className="bg-base-200 rounded-lg p-6 shadow-lg">
				<h2 className="text-2xl font-bold mb-6">Other Ways to Support</h2>
				<div className="grid md:grid-cols-2 gap-6">
					<div className="bg-base-100 rounded-lg p-4">
						<h3 className="text-lg font-bold mb-2">Watch & Engage</h3>
						<p className="text-base-content/70 mb-3">
							Simply watching the stream and engaging in chat helps a lot! Your
							presence and interaction make the community better.
						</p>
						<ul className="text-sm space-y-1">
							<li>• Watch live streams</li>
							<li>• Chat and interact</li>
							<li>• Share with friends</li>
							<li>• Follow on social media</li>
						</ul>
					</div>
					<div className="bg-base-100 rounded-lg p-4">
						<h3 className="text-lg font-bold mb-2">Spread the Word</h3>
						<p className="text-base-content/70 mb-3">
							Help grow the community by sharing my content and introducing
							others to the stream!
						</p>
						<ul className="text-sm space-y-1">
							<li>• Share stream clips</li>
							<li>• Recommend to friends</li>
							<li>• Leave positive reviews</li>
							<li>• Join the Discord community</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Thank You Message */}
			<div className="text-center bg-gradient-to-r from-primary to-accent rounded-lg p-8 text-primary-content">
				<h2 className="text-3xl font-bold mb-4">Thank You! 💕</h2>
				<p className="text-lg">
					Whether you subscribe, donate, or just watch and chat - every bit of
					support helps me continue doing what I love. You're all amazing and
					I'm so grateful for this community!
				</p>
			</div>
		</div>
	);
};

export default Support;
