import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useUser } from "../../contexts/UserContext";
import AnswerForm from "../../components/parisdle/AnswerForm";
import StatsCard from "../../components/parisdle/StatsCard";

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
		<div className="w-1/3 mx-auto grid gap-6">
			<div className="card bg-base-200 shadow">
				<div className="card-body">
					<h2 className="card-title text-primary">
						Today’s Question{" "}
						<span className="text-secondary">({formateDateDisplay()})</span>
					</h2>
					{!question && (
						<div className="alert alert-warning">
							No question scheduled for today yet. Check back later!
						</div>
					)}
					{question && (
						<>
							<p className="text-lg text-primary">{question.question}</p>
							{submission ? (
								<div
									className={`alert ${submission.is_correct ? "alert-success" : "alert-error"} mt-4`}
								>
									You answered: <b>{submission.submitted_answer}</b>. Result:{" "}
									{submission.is_correct ? "Correct!" : "Incorrect."}
								</div>
							) : user ? (
								<AnswerForm
									user={user}
									question={question}
									onSubmitted={onSubmitted}
								/>
							) : (
								<div className="alert alert-info mt-4">
									Please sign in to submit your answer.
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<StatsCard user={user} />
		</div>
	);
}

export default Parisdle;
