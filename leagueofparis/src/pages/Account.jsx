import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser, discordLogin, twitchLogin } from "../contexts/UserContext";
import { FaDiscord, FaTwitch } from "react-icons/fa";

export default function Account() {
	const navigate = useNavigate();

	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				navigate("/login");
			}
		};
		checkSession();
	}, [navigate]);

    const { user, profile } = useUser();

    const availableProviders = ["discord", "twitch"];


    const [identities, setIdentities] = useState(null);

    useEffect(() => {
        const getIdentities = async () => {
            const { data, error } = await supabase.auth.getUserIdentities();
            console.log(data, "data");
            console.log(error, "error");
            if (error) {
                console.error(error);
            } else {
                setIdentities(data.identities);
            }
        };
        getIdentities();
    }, [user]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/login");
	};

    const handleDisconnectDiscord = async () => {
        console.log(identities, "identities");
        const discordIdentity = identities.find(
            identity => identity.provider === 'discord'
        );

        const { error } = await supabase.auth.unlinkIdentity(discordIdentity);
        if (error) {
            console.error(error);
        } else {
            window.location.reload();
        }
    };

    const handleDisconnectTwitch = async () => {
        console.log(identities, "identities");
        const twitchIdentity = identities.find(
            identity => identity.provider === 'twitch'
        );

        const { error } = await supabase.auth.unlinkIdentity(twitchIdentity);
        if (error) {
            console.error(error);
        } else {
            window.location.reload();
        }
    };  

	return (
		<div className="flex items-center justify-center bg-base-100">
			<div className="card w-full max-w-sm bg-base-200 shadow-xl">
				<div className="card-body">
                <h2 className="text-2xl font-bold mb-2 text-base-content bg-base-300 rounded-lg p-2 w-full text-center">
					Account
				</h2>
                <div className="flex flex-col gap-2 text-primary">
                    {availableProviders.map((provider) => {
                        const identity = identities?.find(identity => identity.provider === provider);
                        return identity ? (
                            <div key={provider} className="flex flex-row gap-2 items-center justify-center">
                                {provider === "discord" ? <FaDiscord className="w-5 h-5" /> : <FaTwitch className="w-5 h-5" />}
                                <p>
                                    {identity.identity_data.full_name}
                                </p>
                                <a
                                    onClick={provider === "discord" ? handleDisconnectDiscord : handleDisconnectTwitch}
                                    className="text-red-700 hover:text-red-700 cursor-pointer"
                                >
                                    Disconnect
                                </a>
                            </div>
                        ) : (
                            <div key={provider} className="flex flex-row gap-2 items-center justify-between">
                                {provider === "discord" ? <FaDiscord className="w-5 h-5" /> : <FaTwitch className="w-5 h-5" />}
                                <p>{provider === "discord" ? "Discord" : "Twitch"}</p>
                                <a
                                    onClick={provider === "discord" ? discordLogin : twitchLogin}
                                    className="cursor-pointer"
                                >
                                    Connect
                                </a>
                            </div>
                        );
                    })}
                </div>
				<button
						onClick={handleLogout}
						className="btn btn-secondary w-full flex items-center justify-center gap-2"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}