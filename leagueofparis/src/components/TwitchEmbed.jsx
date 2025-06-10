import { useEffect } from "react";

const TwitchEmbed = ({
	width = "355px",
	height = 200,
	id = "twitch-embed",
	className = "",
}) => {
	useEffect(() => {
		// Clean up any previous embed
		const container = document.getElementById(id);
		if (container) {
			container.innerHTML = "";
		}

		// Function to add classes to the iframe
		const addClassesToIframe = () => {
			const iframe = container?.querySelector("iframe");
			if (iframe) {
				iframe.classList.add(...className.split(" "));
			}
		};

		// Create a MutationObserver to watch for the iframe
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes.length) {
					addClassesToIframe();
				}
			});
		});

		// Start observing the container
		if (container) {
			observer.observe(container, { childList: true, subtree: true });
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

		// Cleanup
		return () => {
			observer.disconnect();
			const container = document.getElementById(id);
			if (container) container.innerHTML = "";
		};
	}, [width, height, id, className]);

	return <div id={id} className={className} />;
};

export default TwitchEmbed;
