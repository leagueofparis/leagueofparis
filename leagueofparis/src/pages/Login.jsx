import React, { useState } from "react";

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
				localStorage.setItem("jwtToken", data.token);
				setMessage("Login successful!");
				// Optionally, redirect to a protected route or update your app state here.
			} else {
				setError("Invalid credentials. Please try again.");
			}
		} catch (err) {
			setError("An error occurred: " + err.message);
		}
	};

	return (
		<div style={{ maxWidth: 400, margin: "2rem auto" }}>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "1rem" }}>
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						style={{ width: "100%", padding: "0.5rem" }}
						required
					/>
				</div>
				<div style={{ marginBottom: "1rem" }}>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={{ width: "100%", padding: "0.5rem" }}
						required
					/>
				</div>
				<button type="submit" style={{ padding: "0.5rem 1rem" }}>
					Login
				</button>
			</form>
			{error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
			{message && (
				<p style={{ color: "green", marginTop: "1rem" }}>{message}</p>
			)}
		</div>
	);
}

export default Login;
