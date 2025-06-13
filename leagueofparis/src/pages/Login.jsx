import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				// Sending username and password in the request body
				body: JSON.stringify({ username, password }),
			});
			console.log(response);
			if (response.ok) {
				const data = await response.json();
				// Store the token in localStorage
				localStorage.setItem("jwtToken", data.jwtToken);
				setMessage("Login successful!");
				// Optionally, redirect to a protected route or update your app state here.
			} else {
				setError("Invalid credentials. Please try again.");
			}
		} catch (err) {
			setError("An error occurred: " + err.message);
		}
	};

	const handleDiscordLogin = async () => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "discord",
			options: {
				redirectTo: window.location.origin,
			},
		});
		console.log(data, error);
	};

	return (
		<div className="flex items-center justify-center bg-base-100">
			<div className="card w-full max-w-sm bg-base-200 shadow-xl">
				<div className="card-body">
					<h2 className="card-title text-2xl mb-4 justify-center">Login</h2>
					{/* <form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="input input-bordered w-full"
							required
						/>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="input input-bordered w-full"
							required
						/>
						<button type="submit" className="btn btn-primary w-full">
							Login
						</button>
					</form>

					<div className="divider">OR</div> */}

					<button
						onClick={handleDiscordLogin}
						className="btn btn-secondary w-full flex items-center justify-center gap-2"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
						</svg>
						Login with Discord
					</button>

					{error && (
						<div className="alert alert-error mt-4 py-2 px-4">{error}</div>
					)}
					{message && (
						<div className="alert alert-success mt-4 py-2 px-4">{message}</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Login;
