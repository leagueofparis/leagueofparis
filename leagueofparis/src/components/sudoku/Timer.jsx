// Timer.jsx
import React, { useEffect } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

export default function Timer({
	elapsedTime,
	timerRunning,
	onToggleTimer,
	onTick,
}) {
	useEffect(() => {
		if (!timerRunning) return;
		const interval = setInterval(() => onTick(), 1000);
		return () => clearInterval(interval);
	}, [timerRunning, onTick]);

	const seconds = elapsedTime % 60;
	const minutes = Math.floor(elapsedTime / 60);

	return (
		<div className="flex items-center">
			<p className="text-2xl font-mono">
				{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
			</p>
			<button onClick={onToggleTimer} className="px-4 cursor-pointer">
				{timerRunning ? <FaPause /> : <FaPlay />}
			</button>
		</div>
	);
}
