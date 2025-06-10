import { useEffect } from "react";

const TwitchEmbed = ({
	width = "355px",
	height = 200,
	id = "twitch-embed",
}) => {
	useEffect(() => {
		// Clean up any previous embed
		const container = document.getElementById(id);
		if (container) {
			container.innerHTML = "";
		}

		// Only add the script if it doesn't exist
		if (!window.Twitch || !window.Twitch.Embed) {
			if (!document.getElementById("twitch-embed-script")) {
				const script = document.createElement("script");
				script.id = "twitch-embed-script";
				script.src = "https://embed.twitch.tv/embed/v1.js";
				script.onload = () => {
					new window.Twitch.Embed(id, {
						width,
						height,
						channel: "leagueofparis",
						layout: "video",
						autoplay: false,
						muted: true,
					});
				};
				document.body.appendChild(script);
			} else {
				// If script exists but Twitch is not loaded yet, wait for it
				document.getElementById("twitch-embed-script").onload = () => {
					new window.Twitch.Embed(id, {
						width,
						height,
						channel: "leagueofparis",
						layout: "video",
						autoplay: false,
						muted: true,
					});
				};
			}
		} else {
			// If Twitch is already loaded, just create the embed
			new window.Twitch.Embed(id, {
				width,
				height,
				channel: "leagueofparis",
				layout: "video",
				autoplay: false,
				muted: true,
			});
		}

		// Cleanup only the container on unmount
		return () => {
			const container = document.getElementById(id);
			if (container) container.innerHTML = "";
		};
	}, [width, height, id]);

	return <div id={id} />;
};

export default TwitchEmbed;
