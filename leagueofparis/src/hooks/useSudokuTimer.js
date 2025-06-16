import { useState, useEffect } from "react";

export default function useSudokuTimer(initialTime = 0, isRunning = true) {
	const [elapsedTime, setElapsedTime] = useState(initialTime);
	const [timerRunning, setTimerRunning] = useState(isRunning);

	useEffect(() => {
		let intervalId;
		if (timerRunning) {
			intervalId = setInterval(() => {
				setElapsedTime((prev) => prev + 1);
			}, 1000);
		}
		return () => clearInterval(intervalId);
	}, [timerRunning]);

	const toggleTimer = () => setTimerRunning((prev) => !prev);
	const resetTimer = () => setElapsedTime(0);
	const stopTimer = () => setTimerRunning(false);
	const startTimer = () => setTimerRunning(true);

	return {
		elapsedTime,
		timerRunning,
		toggleTimer,
		resetTimer,
		stopTimer,
		startTimer,
	};
}
