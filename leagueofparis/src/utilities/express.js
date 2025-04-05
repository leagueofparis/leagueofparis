import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cookieParser());

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

// Example protected route
app.get("/protected", authenticateUser, (req, res) => {
	res.json({ message: `Hello, ${req.user.email}` });
});

// Optional: OAuth redirect handler (if using Supabase magic links or OAuth)
app.get("/auth/callback", async (req, res) => {
	console.log(req);
	const code = req.query.code;
	const next = req.query.next ?? "/";
	console.log(code, next);
	// You can handle this client-side, or use `supabase-js` to exchange the code if needed
	res.redirect(303, `/${next.slice(1)}`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
