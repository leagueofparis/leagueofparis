import { useEffect, useState } from "react";
import { ToggleTheme } from "../utilities/ToggleTheme";
import { FaSun, FaMoon, FaHamburger } from "react-icons/fa";
import SignInButton from "./SignInButton"; // Adjust the path as necessary
import ParisLogo from "../../public/images/paris.png"; // Adjust the path as necessary
import { useUser } from "../contexts/UserContext";
import ProfileButton from "./ProfileButton";
import { useDevice } from "../contexts/DeviceContext";

export default function HeaderButtons({ onSignIn, onSignOut }) {
	const [theme, setTheme] = useState("parislight");
	const { user, profile, loading } = useUser();
	const { isMobile } = useDevice();
	const [drawerOpen, setDrawerOpen] = useState(false);

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
		setDrawerOpen(false);
	};

	const navClass = `text-[24px] relative group transition-all duration-300 ease-in-out hover:text-primary ${isMobile ? "w-8" : "w-24"} text-center`;

	const navItems = [
		{ path: "/", label: "Home", isMobile: true },
		{ path: "/about", label: "About" },
		{ path: "/gallery", label: "Gallery" },
		{
			path: "/uploads",
			label: "Uploads",
			requiredRole: "admin",
		},
		{ path: "/support", label: "Support" },
		{ path: "/contact", label: "Contact" },
	];

	return (
		<div className="flex items-center justify-between w-full">
			<div className="flex items-center gap-4">
				<button>
					<img
						src={ParisLogo}
						alt="League of Paris Logo"
						className="h-16 w-16 rounded-full cursor-pointer pt-2"
						onClick={() => redirectUrl("")}
					/>
				</button>
				{!isMobile && (
					<div className="flex items-center justify-center gap-4">
						{!loading &&
							navItems.map((item) => {
								if (item.isMobile) {
									return null;
								}
								if (item.requiredRole && profile?.role === item.requiredRole) {
									return (
										<div
											className="tooltip tooltip-bottom"
											data-tip={item.label}
										>
											<a
												key={item.path}
												href={item.path}
												className={navClass}
												title={item.label}
											>
												{item.label}
												<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
											</a>
										</div>
									);
								} else if (!item.requiredRole) {
									return (
										<div
											className="tooltip tooltip-bottom"
											data-tip={item.label}
										>
											<a
												key={item.path}
												href={item.path}
												className={navClass}
												title={item.label}
											>
												{item.label}
												<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
											</a>
										</div>
									);
								}
								return null;
							})}
					</div>
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
				{!loading && isMobile && (
					<>
						<div className="drawer drawer-end">
							<input
								id="my-drawer"
								type="checkbox"
								className="drawer-toggle"
								checked={drawerOpen}
								onChange={(e) => setDrawerOpen(e.target.checked)}
							/>
							<div className="drawer-content">
								<label
									htmlFor="my-drawer"
									className="btn btn-ghost drawer-button"
								>
									<FaHamburger size={24} />
								</label>
							</div>
							<div className="drawer-side z-50">
								<label
									htmlFor="my-drawer"
									aria-label="close sidebar"
									className="drawer-overlay"
								></label>
								<ul className="menu p-4 w-60 text-xl min-h-full bg-base-200 text-base-content">
									{navItems.map((item) => {
										if (
											item.requiredRole &&
											profile?.role === item.requiredRole
										) {
											return (
												<li key={item.path}>
													<a
														onClick={() => redirectUrl(item.path.slice(1))}
														className="flex items-center gap-2"
													>
														{item.icon}
														{item.label}
													</a>
												</li>
											);
										} else if (!item.requiredRole) {
											return (
												<li key={item.path}>
													<a
														onClick={() => redirectUrl(item.path.slice(1))}
														className="flex items-center gap-2"
													>
														{item.icon}
														{item.label}
													</a>
												</li>
											);
										}
										return null;
									})}
								</ul>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
