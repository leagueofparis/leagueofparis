import HeaderButtons from "./HeaderButtons";

export default function Layout({ children }) {
	async function signIn() {
		// console.log("sign");
		// const { data, error } = await supabase.auth.signInWithOAuth({
		// 	provider: "discord",
		// 	options: {
		// 		redirectTo: "http://localhost:3001/auth/callback",
		// 	},
		// });
		// console.log(data);
	}

	return (
		<div className="min-h-screen flex flex-col overflow-x-hidden">
			<header className="w-full">
				<div className="flex justify-between items-center w-full px-4">
					<HeaderButtons onSignIn={signIn} />
				</div>
			</header>
			<main className="flex-grow">{children}</main>
			<footer className="text-center">
				<p>
					&copy; {new Date().getFullYear()} League of Paris. All rights
					reserved.
				</p>
			</footer>
		</div>
	);
}
