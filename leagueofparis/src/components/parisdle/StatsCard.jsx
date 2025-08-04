import React from "react";
import { supabase } from "../../supabaseClient";

export default function StatsCard({ user }) {
	const [stats, setStats] = React.useState(null);

	React.useEffect(() => {
		const load = async () => {
			if (!user) {
				setStats(null);
				return;
			}
			const { data } = await supabase
				.from("user_stats")
				.select("*")
				.eq("user_id", user.id)
				.maybeSingle();
			setStats(data || { total_attempts: 0, total_correct: 0, accuracy: null });
		};
		load();
	}, [user]);

	return (
		<div className="card bg-base-200">
			<div className="card-body">
				<h3 className="card-title text-primary">Your Stats</h3>
				{!user ? (
					<div className="text-sm opacity-70 text-primary">
						Sign in to track your stats.
					</div>
				) : (
					<div className="stats stats-vertical lg:stats-horizontal shadow">
						<div className="stat">
							<div className="stat-title text-primary">Attempts</div>
							<div className="stat-value text-secondary">
								{stats?.total_attempts ?? 0}
							</div>
						</div>
						<div className="stat">
							<div className="stat-title text-primary">Correct</div>
							<div className="stat-value text-secondary">
								{stats?.total_correct ?? 0}
							</div>
						</div>
						<div className="stat">
							<div className="stat-title text-primary">Accuracy</div>
							<div className="stat-value text-secondary">
								{stats?.accuracy != null
									? `${Math.round(stats.accuracy * 100)}%`
									: "-"}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
