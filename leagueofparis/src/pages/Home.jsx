// src/pages/Home.jsx
import React from "react";
import MainImage from "../assets/images/8cba602f0e5daec4a16bd7a8b4046489.jpg";
import {
	FaInstagram,
	FaTwitch,
	FaDiscord,
	FaTiktok,
	FaYoutube,
	FaAdjust,
} from "react-icons/fa";

function Home() {
	var iconClasses = "transform hover:scale-110 transition-all duration-300";
	//text-teal-400 hover:text-teal-100

	const toggleTheme = () => {
		const currentTheme = document.documentElement.getAttribute("data-theme");

		var themes = ["paris", "valentine"];

		var rand = Math.floor(Math.random() * themes.length);

		document.documentElement.setAttribute(
			"data-theme",
			currentTheme === themes[rand]
				? themes[(rand + 1) % themes.length]
				: themes[rand]
		);

		document
			.getElementById("link-container")
			.setAttribute(
				"data-theme",
				document.documentElement.getAttribute("data-theme")
			);
	};

	return (
		<div
			id="link-container"
			data-theme="paris"
			className="flex items-center flex-col h-[90vh] rounded-3xl p-4"
		>
			<button onClick={toggleTheme} className="p-0 rounded ml-auto">
				<FaAdjust size={24} />
			</button>
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
			</div>
			<ul className="mt-4 space-y-2">
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
			</ul>
			{/* <iframe
				src="https://discord.com/widget?id=1328833122648981554&theme=dark"
				width="350"
				height="500"
				allowtransparency="true"
				frameborder="0"
				sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
			></iframe> */}
		</div>
	);
}

export default Home;
