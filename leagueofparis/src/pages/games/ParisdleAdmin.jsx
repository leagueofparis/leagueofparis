import React from "react";
import { supabase } from "../../supabaseClient";
import QuestionForm from "../../components/parisdle/QuestionForm";

function formatDateInput(d) {
	const dd = new Date(d);
	const y = dd.getFullYear();
	const m = String(dd.getMonth() + 1).padStart(2, "0");
	const da = String(dd.getDate(), 10).padStart(2, "0");
	return `${y}-${m}-${da}`;
}

export default function ParisdleAdmin() {
	const [questions, setQuestions] = React.useState([]);
	const [suggestions, setSuggestions] = React.useState([]);
	const [loading, setLoading] = React.useState(true);

	const load = async () => {
		setLoading(true);
		const { data: qs } = await supabase
			.from("questions")
			.select("*")
			.order("scheduled_for", { ascending: true });
		const { data: sug } = await supabase
			.from("suggestions")
			.select("*")
			.order("created_at", { ascending: false });
		setQuestions(qs || []);
		setSuggestions(sug || []);
		setLoading(false);
	};

	React.useEffect(() => {
		load();
	}, []);

	const approveSuggestion = async (s) => {
		const nextDate = await nextAvailableDate();
		const payload = {
			question: s.question,
			type: s.type,
			options: s.options,
			acceptable_answers: s.acceptable_answers,
			correct_answer: s.correct_answer,
			scheduled_for: nextDate,
			approved: true,
		};
		const { error } = await supabase.from("questions").insert(payload);
		if (error) return alert(error.message);
		await supabase
			.from("suggestions")
			.update({ reviewed: true, notes: "Approved and scheduled." })
			.eq("id", s.id);
		load();
	};

	const nextAvailableDate = async () => {
		const { data } = await supabase
			.from("questions")
			.select("scheduled_for")
			.order("scheduled_for", { ascending: true });
		const taken = new Set((data || []).map((r) => r.scheduled_for));
		let d = new Date();
		for (let i = 0; i < 3650; i++) {
			const key = formatDateInput(d);
			if (!taken.has(key)) return key;
			d.setDate(d.getDate() + 1);
		}
		return formatDateInput(new Date());
	};

	if (loading) return <div className="loading loading-spinner loading-lg" />;

	return (
		<div className="min-h-screen bg-base-100 p-4">
			<div className="max-w-6xl mx-auto space-y-10 md:space-y-12">
				{/* Create Question */}
				<div className="card bg-base-200 shadow-2xl border border-base-300/40">
					<div className="card-body">
						<div className="flex items-center gap-3 mb-1">
							<div className="w-2 h-8 bg-primary rounded-box" />
							<h2 className="card-title text-2xl tracking-wide text-primary">
								Create / Schedule Question
							</h2>
						</div>
						<p className="text-sm text-base-content/70 mb-3">
							Create a new question and pick its publish date
						</p>

						<div className="bg-base-100/70 rounded-box p-5 md:p-6 border border-base-300/30">
							{/* Note: ensure inputs in QuestionForm have focus rings */}
							<QuestionForm onSaved={load} />
						</div>
					</div>
				</div>

				{/* Scheduled Questions */}
				<div className="card bg-base-200 shadow-2xl border border-base-300/40">
					<div className="card-body">
						<div className="flex items-center gap-3 mb-1">
							<div className="w-2 h-8 bg-secondary rounded-box" />
							<h2 className="card-title text-2xl tracking-wide text-secondary">
								Scheduled Questions
							</h2>
						</div>
						<p className="text-sm text-base-content/70 mb-3">
							Upcoming and past scheduled items
						</p>

						<div className="overflow-x-auto rounded-box border border-base-300/40">
							<table className="table">
								<thead className="bg-base-300 text-base-content sticky top-0 z-10 [&_th]:!py-3">
									<tr>
										<th className="font-semibold">Date</th>
										<th className="font-semibold">Question</th>
										<th className="font-semibold">Type</th>
										<th className="font-semibold">Approved</th>
									</tr>
								</thead>
								<tbody className="[&_tr:nth-child(even)]:bg-base-100/30 [&_td]:!py-3">
									{questions.map((q) => (
										<tr
											key={q.id}
											className="hover:bg-base-100/50 transition-colors"
										>
											<td className="font-semibold text-primary">
												{q.scheduled_for}
											</td>
											<td
												className="max-w-[38rem] truncate text-primary"
												title={q.question}
											>
												{q.question}
											</td>
											<td>
												<span className="badge badge-accent font-medium capitalize">
													{q.type}
												</span>
											</td>
											<td>
												{q.approved ? (
													<span className="badge badge-success gap-1">Yes</span>
												) : (
													<span className="badge badge-warning gap-1">
														Pending
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Suggestions */}
				<div className="card bg-base-200 shadow-2xl border border-base-300/40">
					<div className="card-body">
						<div className="flex items-center gap-3 mb-1">
							<div className="w-2 h-8 bg-accent rounded-box" />
							<h2 className="card-title text-2xl tracking-wide text-accent">
								Community Suggestions
							</h2>
						</div>
						<p className="text-sm text-base-content/70 mb-3">
							Review and promote community-submitted ideas
						</p>

						{suggestions.length === 0 ? (
							<div className="alert alert-error">
								<div>
									<div className="font-medium">No suggestions yet</div>
									<div className="text-sm opacity-80">
										Community suggestions will appear here.
									</div>
								</div>
							</div>
						) : (
							<div className="grid gap-4">
								{suggestions.map((s) => (
									<div
										key={s.id}
										className="bg-base-100/70 border border-base-300/40 rounded-box p-4 md:p-5 hover:shadow-lg hover:bg-base-100/80 transition-all"
									>
										<div className="font-semibold text-primary mb-1">
											{s.question}
										</div>
										<div className="flex items-center gap-2 mb-3">
											<span className="badge badge-neutral text-xs">
												{s.type}
											</span>
											{s.reviewed && (
												<span className="badge badge-info text-xs">
													Reviewed
												</span>
											)}
											<span className="ml-auto text-xs text-base-content/60">
												{s.created_at
													? new Date(s.created_at).toLocaleDateString()
													: ""}
											</span>
										</div>

										{s.type === "multiple_choice" && (
											<div className="rounded-box p-3 mb-3 border border-base-300/30 bg-base-200/60">
												<p className="text-xs font-medium text-base-content/70 mb-2">
													Options:
												</p>
												<ul className="space-y-1">
													{(s.options || []).map((o, i) => (
														<li
															key={i}
															className="text-sm flex items-center gap-2"
														>
															<div className="w-1.5 h-1.5 bg-primary rounded-full" />
															{o}
														</li>
													))}
												</ul>
											</div>
										)}

										{s.type === "text" && (
											<div className="rounded-box p-3 mb-3 border border-base-300/30 bg-base-200/60">
												<p className="text-xs font-medium text-base-content/70 mb-1">
													Accepted answers:
												</p>
												<p className="text-sm">
													{(s.acceptable_answers || []).join(", ")}
												</p>
											</div>
										)}

										<div className="flex gap-2 pt-1">
											{!s.reviewed ? (
												<>
													<button
														className="btn btn-sm btn-success gap-2"
														onClick={() => approveSuggestion(s)}
													>
														Approve & Schedule
													</button>
													<button
														className="btn btn-sm btn-error btn-outline gap-2"
														onClick={async () => {
															await supabase
																.from("suggestions")
																.update({ reviewed: true, notes: "Rejected" })
																.eq("id", s.id);
															load();
														}}
													>
														Reject
													</button>
												</>
											) : (
												<span className="badge badge-outline badge-lg">
													Reviewed
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
