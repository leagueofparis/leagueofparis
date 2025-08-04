import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useUser } from "../../contexts/UserContext";
import AnswerForm from "../../components/parisdle/AnswerForm";
import StatsCard from "../../components/parisdle/StatsCard";
import { Link } from "react-router-dom";
import { isAdmin } from "../../utilities/auth";

function formatDateLocal(date = new Date()) {
	// Daily rotation by user's local date
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function formateDateDisplay(date = new Date()) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${m}/${d}/${y}`;
}

function Parisdle() {
	const [question, setQuestion] = useState(null);
	const [submission, setSubmission] = useState(null);
	const [loading, setLoading] = useState(true);
	const { user } = useUser();

	const today = formatDateLocal();

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				// 1) fetch today's approved question
				const { data: q, error: qe } = await supabase
					.from("questions")
					.select("*")
					.eq("scheduled_for", today)
					.eq("approved", true)
					.single();

				if (qe) {
					console.error("Error fetching question:", qe);
					setQuestion(null);
					setLoading(false);
					return;
				}
				setQuestion(q);

				// 2) if logged in, fetch user submission
				if (user) {
					const { data: sub } = await supabase
						.from("submissions")
						.select("*")
						.eq("user_id", user.id)
						.eq("question_id", q.id)
						.maybeSingle();
					setSubmission(sub || null);
				} else {
					setSubmission(null);
				}

				setLoading(false);
			} catch (error) {
				console.error("Error loading Parisdle data:", error);
				setLoading(false);
			}
		};
		load();
	}, [today, user]);

	const onSubmitted = (sub) => {
		setSubmission(sub);
	};

	if (loading) return <div className="loading loading-spinner loading-lg" />;

	if (!question) {
		return (
			<div className="text-center p-8">
				<h2 className="text-2xl font-bold mb-4">No Question Available</h2>
				<p className="text-gray-600">
					There's no Parisdle question scheduled for today, or there was an
					error loading it.
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-base-100 p-4">
			<div className="max-w-lg mx-auto space-y-4">
				<div className="card bg-base-200 shadow-lg">
					<div className="card-body p-4 sm:p-6">
						<h2 className="card-title text-primary text-xl sm:text-2xl flex-col sm:flex-row items-start sm:items-center gap-2">
							<span>Today's Question</span>
							<span className="text-secondary text-sm sm:text-base font-normal">
								({formateDateDisplay()})
							</span>
						</h2>
						{!question && (
							<div className="alert alert-warning text-sm">
								No question scheduled for today yet. Check back later!
							</div>
						)}
						{question && (
							<>
								<p className="text-base sm:text-lg text-primary leading-relaxed mt-4">
									{question.question}
								</p>
								{submission ? (
									<div
										className={`alert ${submission.is_correct ? "alert-success" : "alert-error"} mt-4 text-sm sm:text-base`}
									>
										<div>
											<strong>Your answer:</strong>{" "}
											{submission.submitted_answer}
											<br />
											<strong>Result:</strong>{" "}
											{submission.is_correct ? "Correct! 🎉" : "Incorrect 😅"}
										</div>
									</div>
								) : user ? (
									<div className="mt-4">
										<AnswerForm
											user={user}
											question={question}
											onSubmitted={onSubmitted}
										/>
									</div>
								) : (
									<div className="alert alert-info mt-4 text-sm sm:text-base">
										Please sign in to submit your answer.
									</div>
								)}
							</>
						)}
					</div>
				</div>

				<StatsCard user={user} />

				{isAdmin && (
					<div className="flex justify-end">
						<Link to="/games/parisdle/admin" className="btn btn-primary">
							Parislde Admin
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

export default Parisdle;
