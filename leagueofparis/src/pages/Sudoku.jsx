import React, { useState, useRef, useEffect } from "react";
import Board from "../components/sudoku/Board";
import NumberBox from "../components/sudoku/NumberBox";

const initialPuzzle = [
	[5, 3, "", "", 7, "", "", "", ""],
	[6, "", "", 1, 9, 5, "", "", ""],
	["", 9, 8, "", "", "", "", 6, ""],
	[8, "", "", "", 6, "", "", "", 3],
	[4, "", "", 8, "", 3, "", "", 1],
	[7, "", "", "", 2, "", "", "", 6],
	["", 6, "", "", "", "", 2, 8, ""],
	["", "", "", 4, 1, 9, "", "", 5],
	["", "", "", "", 8, "", "", 7, 9],
];

const solution = [
	[5, 3, 4, 6, 7, 8, 9, 1, 2],
	[6, 7, 2, 1, 9, 5, 3, 4, 8],
	[1, 9, 8, 3, 4, 2, 5, 6, 7],
	[8, 5, 9, 7, 6, 1, 4, 2, 3],
	[4, 2, 6, 8, 5, 3, 7, 9, 1],
	[7, 1, 3, 9, 2, 4, 8, 5, 6],
	[9, 6, 1, 5, 3, 7, 2, 8, 4],
	[2, 8, 7, 4, 1, 9, 6, 3, 5],
	[3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export default function Sudoku() {
	const [board, setBoard] = useState(initialPuzzle);
	const [selectedCell, setSelectedCell] = useState(null);
	const cellRefs = useRef({});
	const [numsComplete, setNumsComplete] = useState([]);
	const [userLocked, setUserLocked] = useState(() =>
		initialPuzzle.map((row) => row.map((cell) => cell !== ""))
	);

	useEffect(() => {
		if (selectedCell) {
			const [row, col] = selectedCell;
			const key = `${row}-${col}`;
			const cell = cellRefs.current[key];
			if (cell && cell.current) {
				cell.current.focus();
			}
		}
	}, [selectedCell]);

	useEffect;

	const [elapsedTime, setElapsedTime] = useState(() => {
		const saved = localStorage.getItem("sudoku-timer-start");
		return saved ? Date.now() - parseInt(saved, 10) : 0;
	});

	const [timerRunning, setTimerRunning] = useState(true);

	useEffect(() => {
		if (!timerRunning) return;

		const interval = setInterval(() => {
			const start = parseInt(localStorage.getItem("sudoku-timer-start"), 10);
			if (start) {
				setElapsedTime(Date.now() - start);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [timerRunning]);

	useEffect(() => {
		if (!localStorage.getItem("sudoku-timer-start")) {
			localStorage.setItem("sudoku-timer-start", Date.now().toString());
		}
	}, []);

	const resetTimer = () => {
		localStorage.setItem("sudoku-timer-start", Date.now().toString());
		setElapsedTime(0);
	};

	const handleCellClick = (row, col) => {
		setSelectedCell([row, col]);
	};

	const handleCellFocus = (row, col) => {
		setSelectedCell([row, col]);
	};

	const handleKeyDown = (e, row, col, value) => {
		const key = e.key;
		if (!selectedCell) return;

		if (e.keyCode >= 37 && e.keyCode <= 40) {
			switch (e.keyCode) {
				case 37:
					setSelectedCell([row, Math.max(col - 1, 0)]);
					break;
				case 38:
					setSelectedCell([Math.max(row - 1, 0), col]);
					break;
				case 39:
					setSelectedCell([row, Math.min(col + 1, 8)]);
					break;
				case 40:
					setSelectedCell([Math.min(row + 1, 8), col]);
					break;
			}
		}

		handleInput(key);
	};

	const handleInput = (value) => {
		const [row, col] = selectedCell;
		if (isLocked(row, col)) return;
		if (value >= "1" && value <= "9") {
			const correct = solution[row][col].toString() === value;

			const newBoard = board.map((r, rIdx) =>
				r.map((c, cIdx) => (rIdx === row && cIdx === col ? value : c))
			);

			const newUserLocked = userLocked.map((r, rIdx) =>
				r.map((locked, cIdx) =>
					rIdx === row && cIdx === col ? correct || locked : locked
				)
			);

			setBoard(newBoard);
			setUserLocked(newUserLocked);

			const flatBoard = newBoard.flat();
			const numCount = flatBoard.filter(
				(num) => parseInt(num) === parseInt(value)
			).length;

			console.log(value + " count: " + numCount);

			if (numCount === 9) {
				setNumsComplete([...numsComplete, parseInt(value)]);
			}
		} else if (value === "Backspace" || value === "Delete" || value === "0") {
			const newBoard = board.map((r, rIdx) =>
				r.map((c, cIdx) => (rIdx === row && cIdx === col ? "" : c))
			);
			setBoard(newBoard);
		}
	};

	const handleNumberClick = (number) => {
		if (numsComplete?.includes(number)) return false;

		handleInput(number.toString());
	};

	const isLocked = (row, col) => {
		return userLocked[row][col];
	};

	const seconds = Math.floor(elapsedTime / 1000) % 60;
	const minutes = Math.floor(elapsedTime / 1000 / 60);

	return (
		<div className="flex flex-col md:flex-row items-center justify-center min-h-screen overflow-hidden">
			<div className="flex flex-col items-center justify-center">
				<p className="text-2xl font-mono pb-4">
					{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
				</p>
				<div className="flex flex-col items-center justify-center p-8">
					<Board
						board={board}
						selectedCell={selectedCell}
						prefilled={initialPuzzle}
						solution={solution}
						onCellClick={handleCellClick}
						onCellFocus={handleCellFocus}
						onCellKeyDown={handleKeyDown}
						cellRefs={cellRefs}
					/>
				</div>
			</div>
			<NumberBox
				numsComplete={numsComplete}
				onNumberClick={handleNumberClick}
			/>
		</div>
	);
}
