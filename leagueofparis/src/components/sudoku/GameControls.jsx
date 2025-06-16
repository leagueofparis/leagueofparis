import React from "react";
import { FaPause, FaPlay, FaCheck, FaPencilAlt } from "react-icons/fa";
import Toggle from "../Toggle";

export default function GameControls({
	elapsedTime,
	timerRunning,
	solve_count,
	average_time,
	hintsUsed,
	completed,
	onToggleTimer,
	onWin,
	onReset,
	onHint,
	candidateMode,
	onToggleCandidateMode,
}) {
	const formatTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
		} else if (minutes > 0) {
			return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
		} else {
			return `${remainingSeconds}s`;
		}
	};

	const seconds = elapsedTime % 60;
	const minutes = Math.floor(elapsedTime / 60);

	return (
		<div className="flex flex-col justify-center items-center">
			<div className="flex justify-center items-center">
				<p className="text-2xl font-mono text-base-content">
					{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
				</p>
				<button
					onClick={onToggleTimer}
					className="px-4 cursor-pointer text-base-content hover:text-accent transition-colors"
					disabled={completed}
				>
					{completed ? (
						<FaCheck className="text-success pointer-events-none" />
					) : timerRunning ? (
						<FaPause />
					) : (
						<FaPlay />
					)}
				</button>
			</div>
			<div className="flex flex-col justify-center items-center">
				<p className="text-2xl font-mono text-base-content">
					Solve count: {solve_count}
				</p>
				<p className="text-2xl font-mono text-base-content">
					Average time: {formatTime(average_time)}
				</p>
				<p className="text-2xl font-mono text-base-content">
					Hints used: {hintsUsed}
				</p>
			</div>
			<div className="flex gap-1 justify-center items-center">
				<button
					className="btn btn-success text-success-content px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
					onClick={onWin}
				>
					Win
				</button>
				<button
					className="btn btn-neutral text-neutral-content px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
					onClick={onReset}
				>
					Reset
				</button>
				<button
					className="btn btn-warning text-warning-content px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
					onClick={onHint}
					disabled={completed}
				>
					Hint
				</button>
				<Toggle isOn={candidateMode} onToggle={onToggleCandidateMode} />
				<FaPencilAlt className="text-base-content" />
			</div>
		</div>
	);
}
