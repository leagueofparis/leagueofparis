import React from "react";
import { supabase } from "../../supabaseClient";

export default function QuestionForm({ onSaved }) {
	const [type, setType] = React.useState("text");
	const [question, setQuestion] = React.useState("");
	const [options, setOptions] = React.useState(["", "", "", ""]);
	const [acceptable, setAcceptable] = React.useState([""]);
	const [correct, setCorrect] = React.useState("");
	const [date, setDate] = React.useState(() =>
		new Date().toISOString().slice(0, 10)
	);
	const [approved, setApproved] = React.useState(true);
	const [saving, setSaving] = React.useState(false);
	const [error, setError] = React.useState(null);
	const acceptableInputRefs = React.useRef([]);

	const addOption = () => setOptions((o) => [...o, ""]);
	const addAcceptable = () => {
		setAcceptable((a) => {
			const newArray = [...a, ""];
			// Focus on the new input after state update
			setTimeout(() => {
				const lastIndex = newArray.length - 1;
				if (acceptableInputRefs.current[lastIndex]) {
					acceptableInputRefs.current[lastIndex].focus();
				}
			}, 0);
			return newArray;
		});
	};
	const removeAcceptable = (index) => {
		if (acceptable.length > 1) {
			setAcceptable((a) => a.filter((_, i) => i !== index));
			// Clean up refs array
			acceptableInputRefs.current = acceptableInputRefs.current.filter(
				(_, i) => i !== index
			);
		}
	};

	const save = async (e) => {
		e.preventDefault();
		setError(null);

		if (!question.trim()) return setError("Question is required.");

		let payload = {
			question,
			type,
			scheduled_for: date,
			approved,
		};

		if (type === "multiple_choice") {
			const cleaned = options.map((s) => s.trim()).filter(Boolean);
			if (cleaned.length < 2) return setError("Provide at least 2 options.");
			if (!correct.trim()) return setError("Correct answer is required.");
			if (
				!cleaned
					.map((s) => s.toLowerCase())
					.includes(correct.trim().toLowerCase())
			) {
				return setError("Correct answer must be one of the options.");
			}
			payload.options = cleaned;
			payload.correct_answer = correct.trim();
		} else if (type === "boolean") {
			if (!["true", "false"].includes(correct.trim().toLowerCase())) {
				return setError("Correct answer must be true or false.");
			}
			payload.correct_answer = correct.trim().toLowerCase();
		} else {
			const cleaned = acceptable
				.map((s) => s.trim().toLowerCase())
				.filter(Boolean);
			if (cleaned.length === 0)
				return setError("Provide at least one acceptable answer.");
			payload.acceptable_answers = cleaned;
		}

		setSaving(true);
		const { error: err } = await supabase.from("questions").insert(payload);
		setSaving(false);
		if (err) setError(err.message);
		else {
			setQuestion("");
			setOptions(["", "", "", ""]);
			setAcceptable([""]);
			setCorrect("");
			onSaved?.();
		}
	};

	return (
		<form onSubmit={save} className="grid gap-3">
			<div className="grid md:grid-cols-2 gap-3">
				<div>
					<label className="label">
						<span className="label-text text-primary">Type</span>
					</label>
					<select
						className="select select-bordered w-full"
						value={type}
						onChange={(e) => setType(e.target.value)}
					>
						<option value="text">Text</option>
						<option value="boolean">True / False</option>
						<option value="multiple_choice">Multiple Choice</option>
					</select>
				</div>
				<div>
					<label className="label">
						<span className="label-text text-primary">Scheduled Date</span>
					</label>
					<input
						type="date"
						className="input input-bordered w-full"
						value={date}
						onChange={(e) => setDate(e.target.value)}
					/>
				</div>
			</div>

			<div>
				<label className="label">
					<span className="label-text text-primary">Question</span>
				</label>
				<textarea
					className="textarea textarea-bordered w-full"
					rows={3}
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
				/>
			</div>

			{type === "multiple_choice" && (
				<div className="grid gap-2">
					<div className="font-medium text-primary">Options</div>
					{options.map((o, i) => (
						<input
							key={i}
							className="input input-bordered"
							placeholder={`Option ${i + 1}`}
							value={o}
							onChange={(e) => {
								const copy = [...options];
								copy[i] = e.target.value;
								setOptions(copy);
							}}
						/>
					))}
					<div className="flex gap-2">
						<button
							type="button"
							className="btn btn-outline btn-sm"
							onClick={addOption}
						>
							Add option
						</button>
					</div>
					<div>
						<label className="label">
							<span className="label-text text-primary">
								Correct answer (must match one option)
							</span>
						</label>
						<input
							className="input input-bordered w-full"
							value={correct}
							onChange={(e) => setCorrect(e.target.value)}
						/>
					</div>
				</div>
			)}

			{type === "boolean" && (
				<div>
					<label className="label">
						<span className="label-text text-primary">Correct answer</span>
					</label>
					<select
						className="select select-bordered"
						value={correct}
						onChange={(e) => setCorrect(e.target.value)}
					>
						<option value="">Select...</option>
						<option value="true">True</option>
						<option value="false">False</option>
					</select>
				</div>
			)}

			{type === "text" && (
				<div className="flex flex-col gap-2 ">
					<div className="font-medium mb-1">
						<span className="label-text text-primary">
							Acceptable answers (case/space-insensitive)
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{acceptable.map((a, i) => (
							<div key={i} className="flex items-center gap-2">
								<input
									ref={(el) => {
										acceptableInputRefs.current[i] = el;
									}}
									className="input input-bordered flex-1"
									placeholder={`Answer ${i + 1}`}
									value={a}
									onChange={(e) => {
										const copy = [...acceptable];
										copy[i] = e.target.value;
										setAcceptable(copy);
									}}
								/>
								{acceptable.length > 1 && (
									<button
										type="button"
										className="btn btn-sm btn-error btn-outline"
										onClick={() => removeAcceptable(i)}
										title="Remove this answer"
									>
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								)}
							</div>
						))}
						<button
							type="button"
							className="btn btn-sm btn-primary gap-2"
							onClick={addAcceptable}
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
									clipRule="evenodd"
								/>
							</svg>
							Add accepted answer
						</button>
					</div>
				</div>
			)}

			<div className="form-control">
				<label className="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						className="checkbox checkbox-primary"
						checked={approved}
						onChange={(e) => setApproved(e.target.checked)}
					/>
					<span className="label-text text-primary">
						Approved (visible to public)
					</span>
				</label>
			</div>

			{error && <div className="alert alert-error">{error}</div>}

			<div className="flex justify-end">
				<button
					className={`btn btn-primary ${saving ? "btn-disabled" : ""}`}
					disabled={saving}
				>
					{saving ? "Saving..." : "Save Question"}
				</button>
			</div>
		</form>
	);
}
