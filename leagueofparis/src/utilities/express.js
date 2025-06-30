import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

// Middleware to verify Supabase JWT
function authenticateUser(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "No token provided" });
	}

	const token = authHeader.split(" ")[1]; // Bearer <token>
	try {
		const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		console.error("JWT verification failed:", err.message);
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

// Spotify token exchange endpoint
app.post("/api/spotify/token", async (req, res) => {
	try {
		const { code, redirect_uri } = req.body;

		if (!code || !redirect_uri) {
			return res.status(400).json({ error: "Missing code or redirect_uri" });
		}

		// Spotify OAuth configuration
		const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
		const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

		if (!CLIENT_ID || !CLIENT_SECRET) {
			return res
				.status(500)
				.json({ error: "Spotify credentials not configured" });
		}

		// Exchange authorization code for tokens
		const tokenResponse = await fetch(
			"https://accounts.spotify.com/api/token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
				},
				body: new URLSearchParams({
					grant_type: "authorization_code",
					code: code,
					redirect_uri: redirect_uri,
				}),
			}
		);

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			console.error("Spotify token exchange failed:", errorData);
			return res
				.status(400)
				.json({ error: "Failed to exchange code for tokens" });
		}

		const tokenData = await tokenResponse.json();

		// Return the tokens to the client
		res.json({
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			token_type: tokenData.token_type,
			expires_in: tokenData.expires_in,
			scope: tokenData.scope,
		});
	} catch (error) {
		console.error("Error in Spotify token exchange:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Example protected route
app.get("/protected", authenticateUser, (req, res) => {
	res.json({ message: `Hello, ${req.user.email}` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
