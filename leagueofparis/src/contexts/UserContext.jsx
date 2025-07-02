import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const UserContext = createContext();

export function UserProvider({ children }) {
	const [user, setUser] = useState(null);
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				const { data, error } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single();

				if (error && error.code === "PGRST116") {
					const { data: newProfile, error: insertError } = await supabase
						.from("profiles")
						.insert({
							id: user.id,
							username: user.user_metadata.full_name,
						})
						.select()
						.single();

					if (insertError) {
						console.error("Profile insertion error:", insertError);
					} else {
						setProfile(newProfile);
					}
				} else if (error) {
					console.error("Profile fetch error:", error);
				} else {
					setProfile(data);
				}
			}

			setLoading(false);
		};

		loadUser();

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);

				if (session?.user) {
					supabase
						.from("profiles")
						.select("*")
						.eq("id", session.user.id)
						.single()
						.then(({ data, error }) => {
							if (error) console.error("Profile fetch error:", error);
							else setProfile(data);
						});
				} else {
					setProfile(null);
				}
			}
		);

		return () => listener?.subscription?.unsubscribe();
	}, []);

	return (
		<UserContext.Provider value={{ user, profile, loading }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	return useContext(UserContext);
}

export async function discordLogin() {
	return supabase.auth.signInWithOAuth({
		provider: "discord",
		options: {
			redirectTo: `${import.meta.env.VITE_FRONTEND_URL || window.location.origin}`,
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
	});
}

export async function twitchLogin() {
	return supabase.auth.signInWithOAuth({
		provider: "twitch",
		options: {
			redirectTo: `${import.meta.env.VITE_FRONTEND_URL || window.location.origin}`,
		},
	});
}

