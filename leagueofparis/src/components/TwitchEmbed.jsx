import { useEffect } from "react";

const TwitchEmbed = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.id = "twitch-embed-script";
		script.src = "https://embed.twitch.tv/embed/v1.js";
		script.addEventListener("load", () => {
			new window.Twitch.Embed("twitch-embed", {
				width: "355px",
				height: 200,
				channel: "leagueofparis",
				layout: "video",
				autoplay: false,
				muted: true,
			});
		});
		if (document.getElementById("twitch-embed-script")) return;
		document.body.appendChild(script);
	}, []);

	return (
		<div>
			<div id="twitch-embed" />
		</div>
	);
};

export default TwitchEmbed;
