import React, { useState, useEffect } from "react";
import { invokeEdgeFunction } from "../supabaseClient";

const SpotifyAuth = () => {
	const [tokens, setTokens] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	// Spotify OAuth configuration
	const CLIENT_ID = "2426e168991d4f90bc0ae1123b21115f"; // Replace with your actual client ID
	const REDIRECT_URI = window.location.origin + "/spotify-auth";
	const SCOPES = [
		"user-read-private",
		"user-read-email",
		"playlist-read-private",
		"playlist-read-collaborative",
		"user-library-read",
	];

	const handleSpotifyLogin = () => {
		setLoading(true);
		setError(null);

		const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(" "))}&show_dialog=true`;

		window.location.href = authUrl;
	};

	const exchangeCodeForTokens = async (rawCode) => {
		try {
			const code = rawCode.trim(); // ✅ Remove extra newline or whitespace

			const formData = new FormData();
			formData.append("code", code);
			const response = await invokeEdgeFunction("spotify-auth", formData);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Spotify token exchange failed:", errorData);
				throw new Error("Failed to exchange code for tokens");
			}

			const tokenData = await response.json();
			console.log("Received token data:", tokenData);
			setTokens(tokenData);
		} catch (err) {
			console.error("Token exchange error:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Check if we have a code in the URL (return from Spotify OAuth)
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const error = urlParams.get("error");

		if (error) {
			setError(`Spotify authorization error: ${error}`);
			setLoading(false);
			return;
		}

		if (code) {
			exchangeCodeForTokens(code);
		}
	}, []);

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		alert("Copied to clipboard!");
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
					<p className="mt-4 text-center text-gray-600">
						Processing Spotify authentication...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-base-100 p-4">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						Spotify Auth
					</h1>

					{!tokens && !error && (
						<button
							onClick={handleSpotifyLogin}
							className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
						>
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
							</svg>
							Sign in with Spotify
						</button>
					)}
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<h3 className="text-red-800 font-semibold mb-2">Error</h3>
						<p className="text-red-600">{error}</p>
					</div>
				)}

				{tokens && (
					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">
								Authentication Successful!
							</h2>
							<p className="text-green-600 mb-4">
								✅ Successfully authenticated with Spotify
							</p>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Access Token
							</h3>
							<div className="relative">
								<textarea
									readOnly
									value={tokens.access_token}
									className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm resize-none"
								/>
								<button
									onClick={() => copyToClipboard(tokens.access_token)}
									className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
								>
									Copy
								</button>
							</div>
							<p className="text-sm text-gray-500 mt-2">
								Expires in: {tokens.expires_in} seconds
							</p>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Refresh Token
							</h3>
							<div className="relative">
								<textarea
									readOnly
									value={tokens.refresh_token}
									className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm resize-none"
								/>
								<button
									onClick={() => copyToClipboard(tokens.refresh_token)}
									className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
								>
									Copy
								</button>
							</div>
							<p className="text-sm text-gray-500 mt-2">
								Use this token to get new access tokens when they expire
							</p>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Token Type
							</h3>
							<p className="text-lg font-mono bg-gray-50 p-3 rounded-lg border">
								{tokens.token_type}
							</p>
						</div>

						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<h3 className="text-yellow-800 font-semibold mb-2">
								⚠️ Important Notes
							</h3>
							<ul className="text-yellow-700 text-sm space-y-1">
								<li>
									• Access tokens expire after {tokens.expires_in} seconds
								</li>
								<li>
									• Refresh tokens are long-lived and should be stored securely
								</li>
								<li>
									• This is a development page - don't expose tokens in
									production
								</li>
								<li>
									• You'll need to implement a backend endpoint to exchange the
									authorization code for tokens
								</li>
							</ul>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SpotifyAuth;
