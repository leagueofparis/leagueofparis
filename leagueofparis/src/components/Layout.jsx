import HeaderButtons from "./HeaderButtons";
import { useEffect, useState } from "react";
import { supabase } from "../utilities/supabase";

export default function Layout({ children }) {
	async function signIn() {
		console.log("sign");
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "discord",
			options: {
				redirectTo: "http://localhost:3001/auth/callback",
			},
		});
		console.log(data);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="text-right flex justify-end items-center">
				<HeaderButtons onSignIn={signIn} />
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
