import { useEffect, useState } from "react";
import { ToggleTheme } from "../utilities/ToggleTheme";
import { FaSun, FaMoon, FaTh } from "react-icons/fa";
import SignInButton from "./SignInButton"; // Adjust the path as necessary
import ParisLogo from "../../public/images/paris.png"; // Adjust the path as necessary

export default function HeaderButtons({ onSignIn }) {
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
				{/* <h2>About Me</h2>
				<h2>Portfolio</h2>
				<h2>Games</h2> */}
			</div>
			<div className="flex gap-2 items-center">
				{/* <button
					onClick={() => redirectUrl("sudoku")}
					className="p-0 cursor-pointer"
					title="Play Sudoku"
				>
					<FaTh size={24} />
				</button> */}

				<button
					onClick={handleToggleTheme}
					className="p-0 cursor-pointer"
					title="Toggle Theme"
				>
					{theme === "parislight" ? <FaMoon size={24} /> : <FaSun size={24} />}
				</button>

				{/* <SignInButton /> */}
			</div>
		</div>
	);
}
