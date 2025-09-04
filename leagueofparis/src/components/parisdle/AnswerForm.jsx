import React from "react";
import { supabase } from "../../supabaseClient";

export default function AnswerForm({ user, question, onSubmitted }) {
	const [value, setValue] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState(null);

	const normalize = (s) => (s || "").toString().trim().toLowerCase();

	const checkCorrect = () => {
		if (question.type === "boolean") {
			const normalized = normalize(value);
			const truthy = ["true", "t", "yes", "y", "1"];
			const falsy = ["false", "f", "no", "n", "0"];
			let interpreted = null;
			if (truthy.includes(normalized)) interpreted = "true";
			if (falsy.includes(normalized)) interpreted = "false";
			const correct = normalize(question.correct_answer) === interpreted;
			return { correct, finalAnswer: interpreted ?? normalized };
		}

		if (question.type === "multiple_choice") {
			// Match against exact options or letter A/B/C
			const normalized = normalize(value);
			const opts = (question.options || []).map(normalize);
			const letters = ["a", "b", "c", "d", "e", "f", "g"];
			let final = normalized;
			// If user typed a letter, map to option
			const idxByLetter = letters.indexOf(normalized);
			if (idxByLetter >= 0 && idxByLetter < opts.length) {
				final = opts[idxByLetter];
			}
			const correct = normalize(question.correct_answer) === final;
			return { correct, finalAnswer: final };
		}

		// text
		const normalized = normalize(value);
		const accept = (question.acceptable_answers || []).map(normalize);
		const correct =
			accept.includes(normalized) ||
			accept.some((a) => normalized.length >= 3 && a.includes(normalized)) || // partial containment
			accept.some((a) => a.length >= 3 && normalized.includes(a));
		return { correct, finalAnswer: normalized };
	};

	const submit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!value) {
			setError("Please enter an answer.");
			return;
		}

		const { correct, finalAnswer } = checkCorrect();

		setLoading(true);
		const { data, error } = await supabase
			.from("submissions")
			.insert({
				user_id: user.id,
				question_id: question.id,
				submitted_answer: finalAnswer,
				is_correct: !!correct,
			})
			.select("*")
			.single();

		setLoading(false);
		if (error) {
			setError(error.message);
		} else {
			onSubmitted?.(data);
		}
	};

	return (
		<form onSubmit={submit} className="grid gap-3 mt-4">
			{question.type === "text" && (
				<input
					className="input input-bordered"
					placeholder="Type your answer"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
			)}
			{question.type === "boolean" && (
				<div className="join">
					<button
						type="button"
						className={`btn join-item ${value === "true" ? "btn-primary" : ""}`}
						onClick={() => setValue("true")}
					>
						True
					</button>
					<button
						type="button"
						className={`btn join-item ${value === "false" ? "btn-primary" : ""}`}
						onClick={() => setValue("false")}
					>
						False
					</button>
				</div>
			)}
			{question.type === "multiple_choice" && (
				<div className="grid gap-2">
					{(question.options || []).map((opt, i) => (
						<label key={i} className="label cursor-pointer justify-start gap-3">
							<input
								type="radio"
								name="mc"
								className="radio radio-primary"
								checked={value === opt}
								onChange={() => setValue(opt)}
							/>
							<span className="label-text text-primary">
								<b>{String.fromCharCode(65 + i)}.</b> {opt}
							</span>
						</label>
					))}
				</div>
			)}

			{error && <div className="alert alert-error">{error}</div>}

			<button
				className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
				disabled={loading}
			>
				{loading ? "Submitting..." : "Submit Answer"}
			</button>
		</form>
	);
}
