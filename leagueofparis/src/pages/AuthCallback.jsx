import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthCallback() {
	const navigate = useNavigate();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");

		console.log(token);
		if (token) {
			// Store the token in localStorage
			localStorage.setItem("jwtToken", token);
			// Redirect to home page or dashboard
			navigate("/");
		} else {
			// Handle error case
			navigate("/login");
		}
	}, [navigate]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="loading loading-spinner loading-lg"></div>
		</div>
	);
}

export default AuthCallback;
