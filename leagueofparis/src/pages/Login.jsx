import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaDiscord, FaTwitch } from "react-icons/fa";
import { discordLogin, twitchLogin } from "../contexts/UserContext";

function Login() {
	const navigate = useNavigate();

	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session) {
				console.log("Session found, redirecting to home");
				navigate("/");
			}
		};

		checkSession();
	}, [navigate]);

	function getRedirectParam() {
		const param = new URLSearchParams(window.location.search).get("redirect");
		return param?.startsWith("/") ? param : "";
	}
	

	return (
		<div className="flex items-center justify-center bg-base-100">
			<div className="card w-full max-w-sm bg-base-200 shadow-xl">
				<div className="card-body">
					<h2 className="card-title text-2xl mb-4 justify-center">Login</h2>
					<button
						onClick={discordLogin}
						className="btn btn-secondary w-full flex items-center justify-center gap-2"
					>
						<FaDiscord className="w-5 h-5" />
						Login with Discord
					</button>
					<button
						onClick={twitchLogin}
						className="btn btn-secondary w-full flex items-center justify-center gap-2"
					>
						<FaTwitch className="w-5 h-5" />
						Login with Twitch
					</button>
				</div>
			</div>
		</div>
	);
}

export default Login;
