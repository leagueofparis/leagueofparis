// src/pages/Home.jsx
import React from "react";
import MainImage from "../../public/images/pfp.jpg";
import {
	FaInstagram,
	FaTwitch,
	FaDiscord,
	FaTiktok,
	FaYoutube,
	FaSpotify,
} from "react-icons/fa";
import TwitchEmbed from "../components/TwitchEmbed";

function Home() {
	var iconClasses = "transform hover:scale-110 transition-all duration-300";
	//text-teal-400 hover:text-teal-100
	return (
		<div
			id="link-container"
			className="flex items-center flex-col h-[90vh] rounded-3xl p-4"
		>
			<img src={MainImage} className="w-36 rounded-full"></img>
			<h1 className="text-4xl font-bold whitespace-nowrap">League of Paris</h1>
			<div className="flex space-x-4 py-4">
				<a
					href="https://twitch.tv/leagueofparis"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaTwitch size={36} className={iconClasses} />
				</a>
				<a
					href="https://discord.gg/upGPAyHqPT"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaDiscord size={36} className={iconClasses} />
				</a>
				<a
					href="https://instagram.com/leagueofparis"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaInstagram size={36} className={iconClasses} />
				</a>
				<a
					href="https://tiktok.com/@leagueofparis"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaTiktok size={36} className={iconClasses} />
				</a>
				<a
					href="https://youtube.com/@leagueofparis"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaYoutube size={36} className={iconClasses} />
				</a>
				<a
					href="https://open.spotify.com/user/3o21ubwap21drbbd11dmjdtr4?si=5c06565a676f4651"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaSpotify size={36} className={iconClasses} />
				</a>
			</div>
			{/* <ul className="mt-4 space-y-2">
				<li>
					<a
						className="hover:underline link"
						href="https://example.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						Example Link 1
					</a>
				</li>
				<li>
					<a
						className="hover:underline link"
						href="https://anotherexample.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						Example Link 2
					</a>
				</li>
			</ul> */}
			<TwitchEmbed />
		</div>
	);
}

export default Home;
