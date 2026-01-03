import HeaderButtons from "./HeaderButtons";
import { removeToken } from "../utilities/auth";
import Snowfall from "react-snowfall";

export default function Layout({ children }) {
	const isDecember = new Date().getMonth() === 11;

	async function signIn() {
		window.location.href = `/login`;
	}

	async function signOut() {
		removeToken();
	}

	return (
		<div className="min-h-screen flex flex-col overflow-x-hidden">
			{isDecember && (
				<Snowfall
					snowflakeCount={100}
					style={{
						position: "fixed",
						width: "100vw",
						height: "100vh",
						pointerEvents: "none",
						zIndex: 1000,
					}}
				/>
			)}
			<header className="w-full">
				<div className="flex justify-between items-center w-full px-4">
					<HeaderButtons onSignIn={signIn} onSignOut={signOut} />
				</div>
			</header>
			<main className="flex-grow pb-8">{children}</main>
			<footer className="text-center mt-auto py-4">
				<p>
					&copy; {new Date().getFullYear()} League of Paris. All rights
					reserved.
				</p>
			</footer>
		</div>
	);
}
