// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
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
import WillowWednesday from "../components/WillowWednesday";
import { Link } from "react-router-dom";
import Schedule from "../components/Schedule";
import ImageCarousel from "../components/ImageCarousel";
import AboutMe from "../components/AboutMe";
import YoutubeEmbed from "../components/YoutubeEmbed";
import { getAnnouncements, getFeaturedVideo } from "../supabaseClient";
import confetti from "canvas-confetti";

function Home() {
	const [mobile, setMobile] = useState(false);
	const [announcements, setAnnouncements] = useState([]);
	const [featuredVideo, setFeaturedVideo] = useState(null);
	useEffect(() => {
		function handleResize() {
			setMobile(window.innerWidth <= 768);
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		const fetchAnnouncements = async () => {
			const announcements = await getAnnouncements();
			setAnnouncements(announcements);
		};
		fetchAnnouncements();
	}, []);

	useEffect(() => {
		const fetchFeaturedVideo = async () => {
			const featuredVideo = await getFeaturedVideo();
			setFeaturedVideo(featuredVideo);
		};
		fetchFeaturedVideo();
	}, []);

	useEffect(() => {
		const today = new Date();
		const month = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
		const day = today.getDate();

		// Check if today is October 31st (10/31)
		if (month === 10 && day === 31) {
			// Birthday party colors - bright festive colors
			const birthdayColors = [
				"#FF69B4", // Hot pink
				"#FF1493", // Deep pink
				"#00CED1", // Dark turquoise
				"#32CD32", // Lime green
				"#FFD700", // Gold
				"#FF6347", // Tomato
				"#9370DB", // Medium purple
				"#00BFFF", // Deep sky blue
				"#FF8C00", // Dark orange
				"#FF00FF", // Magenta
			];

			// Trigger snow effect
			const duration = 60000; // 60 seconds
			const end = Date.now() + duration;

			const interval = setInterval(() => {
				if (Date.now() > end) {
					clearInterval(interval);
					return;
				}

				// Randomly select a color from the birthday colors array
				const randomColor =
					birthdayColors[
						Math.floor(Math.random() * birthdayColors.length)
					];

				// Snow effect - particles falling from random positions at the top
				confetti({
					particleCount: 1,
					startVelocity: 0,
					ticks: 200,
					origin: {
						x: Math.random(),
						y: Math.random() - 0.2, // Start slightly above the viewport
					},
					colors: [randomColor],
					shapes: ["circle"],
					gravity: 0.3,
					drift: 0.5,
					scalar: 1.2,
				});
			}, 50); // Spawn snowflakes more frequently for continuous effect

			// Cleanup function to clear interval if component unmounts
			return () => clearInterval(interval);
		}
	}, []);

	var iconClasses = "transform hover:scale-110 transition-all duration-300";
	//text-teal-400 hover:text-teal-100

	const isDev =
		import.meta.env.VITE_ENV === "development" ||
		window.location.hostname === "localhost" ||
		window.location.hostname.includes("dev.leagueofparis.com");

	// Check if today is October 31st for birthday message
	const today = new Date();
	const isBirthday = today.getMonth() + 1 === 10 && today.getDate() === 31;

	return (
		<div
			id="link-container"
			className="flex items-center flex-col rounded-3xl p-4"
		>
			<img src={MainImage} className="w-36 rounded-full"></img>
			<h1 className="text-4xl font-bold whitespace-nowrap">League of Paris</h1>
			{isBirthday && (
				<div className="my-4">
					<h2
						className="text-3xl md:text-4xl font-bold text-center birthday-text"
						style={{
							backgroundImage:
								"linear-gradient(90deg, #FF69B4, #FF1493, #00CED1, #32CD32, #FFD700, #FF6347, #9370DB, #00BFFF, #FF8C00, #FF00FF, #FF69B4, #FF1493, #00CED1, #32CD32, #FFD700, #FF6347, #9370DB, #00BFFF, #FF8C00, #FF00FF)",
							backgroundSize: "200% 100%",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							color: "transparent",
						}}
					>
						🎉 Happy Birthday Paris! 🎉
					</h2>
				</div>
			)}
			<div className="flex space-x-4 py-4">
				<a
					href="https://twitch.tv/leagueofparis"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaTwitch size={36} className={iconClasses} />
				</a>
				<a
					href="https://discord.gg/dRPfRWQCCk"
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
					href="https://open.spotify.com/user/314airciex5pec7d25uvgjwog5n4?si=GkxnTBLiT_G_wLFsPHB0cw"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaSpotify size={36} className={iconClasses} />
				</a>
			</div>
			{announcements.length > 0 && (
				<div className="flex flex-col items-center justify-center gap-4 w-full mb-4">
					<div className="bg-base-200 rounded-lg min-w-[300px] pl-2">
						{announcements.map((announcement, index) => (
							<div key={index} className="text-base-content">
								<span className="label-text">Announcement: </span>
								<label className="label">
									{new Date(announcement.created_at).toLocaleDateString(
										"en-US",
										{
											month: "short",
											day: "numeric",
										}
									)}
								</label>
								<div className="text-3xl font-bold ">
									{announcement.content}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
			{mobile && (
				<div className="flex flex-col items-center justify-center gap-4 w-full">
					<div>
						<TwitchEmbed
							width="355px"
							height={200}
							key="mobile-twitch-embed"
							className="rounded-lg overflow-hidden"
						/>
					</div>
					<div>
						<Schedule />
					</div>
					<div className="w-full">
						<WillowWednesday />
					</div>
					<div className="w-full">
						<div className="flex flex-col items-center justify-center gap-4 w-full">
							{featuredVideo && <YoutubeEmbed videoId={featuredVideo?.value} />}
							<AboutMe />
						</div>
					</div>
				</div>
			)}
			{!mobile && (
				<div className="flex flex-col items-center justify-center gap-4 max-w-[975px]">
					<div className="flex flex-row items-center justify-center gap-4 w-full">
						<TwitchEmbed
							width="667px"
							height={375}
							key="desktop-twitch-embed"
							className="rounded-lg overflow-hidden"
						/>
						<Schedule />
					</div>
					<div className="flex flex-row items-start justify-center gap-4 w-full">
						<div className="w-1/2">
							<WillowWednesday />
						</div>
						<div className="w-1/2 flex flex-col items-center justify-center gap-4">
							{featuredVideo && <YoutubeEmbed videoId={featuredVideo?.value} />}
							<AboutMe />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Home;
