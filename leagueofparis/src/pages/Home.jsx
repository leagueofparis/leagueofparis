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
	FaCoffee,
} from "react-icons/fa";
import TwitchEmbed from "../components/TwitchEmbed";
import WillowWednesday from "../components/WillowWednesday";
import { Link } from "react-router-dom";
import Schedule from "../components/Schedule";
import ImageCarousel from "../components/ImageCarousel";
import AboutMe from "../components/AboutMe";
import { getAnnouncements } from "../supabaseClient";

function Home() {
	const [mobile, setMobile] = useState(false);
	const [announcements, setAnnouncements] = useState([]);
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

	var iconClasses = "transform hover:scale-110 transition-all duration-300";
	//text-teal-400 hover:text-teal-100
	return (
		<div
			id="link-container"
			className="flex items-center flex-col rounded-3xl p-4"
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
				<a
					href="https://ko-fi.com/leagueofparis"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaCoffee size={36} className={iconClasses} />
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
						<AboutMe />
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
					<div className="flex flex-row items-center justify-center gap-4 w-full">
						<div className="w-1/2">
							<WillowWednesday />
						</div>
						<div className="w-1/2">
							<AboutMe />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Home;
