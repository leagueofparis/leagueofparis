import { useEffect, useState } from "react";
import { ToggleTheme } from "../utilities/ToggleTheme";
import { FaSun, FaMoon, FaTh } from "react-icons/fa";
import SignInButton from "./SignInButton"; // Adjust the path as necessary
import ParisLogo from "../../public/images/paris.png"; // Adjust the path as necessary
import { isAuthenticated, getToken, isInRole } from "../utilities/auth";
import { jwtDecode } from "jwt-decode";
import { getDiscordAvatar } from "../utilities/discord";

export default function HeaderButtons({ onSignIn, onSignOut }) {
	const [theme, setTheme] = useState("parislight");

	useEffect(() => {
		// Detect initial theme from localStorage or classList
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			setTheme(storedTheme);
		}
	}, []);

	const handleToggleTheme = () => {
		ToggleTheme(); // Call your existing toggle logic
		setTheme((prev) => (prev === "parislight" ? "parisdark" : "parislight"));
	};

	const redirectUrl = (page) => {
		document.location.href = "/" + page;
	};

	useEffect(() => {
		const token = getToken();
		if (token) {
			const decoded = jwtDecode(token);
			console.log(decoded);
		}
	}, []);

	const navClass = "text-lg hover:text-primary hover:underline";
	const navClassActive = "text-primary underline underline-offset-4";

	const isActive = (path) => {
		return window.location.pathname === path;
	};

	const navItems = [
		{ path: "/about", label: "About" },
		{ path: "/gallery", label: "Gallery" },
		{ path: "/uploads", label: "Uploads", requiredRole: "admin" },
		{ path: "/contact", label: "Contact" },
	];

	return (
		<div className="flex items-center justify-between w-full">
			<div className="flex items-center gap-4">
				<button>
					<img
						src={ParisLogo} // Adjust the path as necessary
						alt="League of Paris Logo"
						className="h-16 w-16 rounded-full cursor-pointer pt-2"
						onClick={() => redirectUrl("")} // Redirect to home page
					/>
				</button>
				{navItems.map((item) =>
					item.requiredRole ? (
						isInRole(item.requiredRole) && (
							<a href={item.path} className={navClass}>
								{item.label}
							</a>
						)
					) : (
						<a href={item.path} className={navClass}>
							{item.label}
						</a>
					)
				)}
			</div>
			<div className="flex gap-2 items-center">
				<button
					onClick={handleToggleTheme}
					className="p-0 cursor-pointer"
					title="Toggle Theme"
				>
					{theme === "parislight" ? <FaMoon size={24} /> : <FaSun size={24} />}
				</button>

				{!isAuthenticated() && (
					<SignInButton onSignIn={onSignIn} onSignOut={onSignOut} />
				)}
				{isAuthenticated() && (
					<button>
						<img
							src={getDiscordAvatar()}
							className="h-10 w-10 rounded-full cursor-pointer"
							alt="League of Paris Logo"
						/>
					</button>
				)}
			</div>
		</div>
	);
}
