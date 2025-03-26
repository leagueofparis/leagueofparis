import React, { useState, useRef, useEffect } from "react";
import Modal from "../components/Modal";
import Board from "../components/sudoku/Board";
import HeaderButtons from "../components/HeaderButtons";
import NumberBox from "../components/sudoku/NumberBox";
import { FaPause, FaPlay, FaRegSmile } from "react-icons/fa";

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
	const [board, setBoard] = useState(() => {
		const stored = localStorage.getItem("sudoku-board");
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				console.warn("Invalid board in storage, using default");
			}
		}
		return initialPuzzle;
	});
	const [selectedCell, setSelectedCell] = useState(null);
	const cellRefs = useRef({});
	const [numsComplete, setNumsComplete] = useState([]);
	const [userLocked, setUserLocked] = useState(() =>
		initialPuzzle.map((row) => row.map((cell) => cell !== ""))
	);
	const [candidateMode, setCandidateMode] = useState(false);
	const [candidates, setCandidates] = useState(
		Array(9)
			.fill()
			.map(() =>
				Array(9)
					.fill()
					.map(() => new Set())
			)
	);
	const [isComplete, setIsComplete] = useState(false);

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
		const saved = localStorage.getItem("sudoku-timer");
		return saved ? parseInt(saved, 10) : 0;
	});

	const [timerRunning, setTimerRunning] = useState(true);

	useEffect(() => {
		if (!timerRunning) return;

		const interval = setInterval(() => {
			setElapsedTime((prev) => {
				const updated = prev + 1;
				localStorage.setItem("sudoku-timer", updated.toString());
				return updated;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [timerRunning]);

	useEffect(() => {
		if (!localStorage.getItem("sudoku-timer")) {
			localStorage.setItem("sudoku-timer", 0);
		}
	}, []);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				setTimerRunning(false);
			} else {
				setTimerRunning(true);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
	});

	const handleCellClick = (row, col) => {
		if (!timerRunning) return;

		setSelectedCell([row, col]);
	};

	const handleCellFocus = (row, col) => {
		if (!timerRunning) return;

		setSelectedCell([row, col]);
	};

	useEffect(() => {
		const handleGlobalArrowKeys = (e) => {
			if (!selectedCell && e.keyCode >= 37 && e.keyCode <= 40) {
				e.preventDefault();
				setSelectedCell([0, 0]);
				return;
			}

			if (selectedCell) {
				const [row, col] = selectedCell;
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

			if (e.repeat) {
				setTimeout({}, 1000);
			}
		};

		document.addEventListener("keydown", handleGlobalArrowKeys);
		return () => document.removeEventListener("keydown", handleGlobalArrowKeys);
	}, [selectedCell]);

	const handleKeyDown = (e) => {
		const key = e.key;
		if (!selectedCell) {
			return;
		}

		handleInput(key);
	};

	const handleInput = (value) => {
		if (!timerRunning) return;

		if (!selectedCell) return;

		const [row, col] = selectedCell;
		if (isLocked(row, col)) return;
		if (value >= "1" && value <= "9") {
			if (candidateMode) return handleCandidateInput(value);

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

			if (numCount === 9) {
				setNumsComplete([...numsComplete, parseInt(value)]);
			}

			const totalNumCount = flatBoard.filter(
				(num) => num !== "" && Number(num)
			).length;

			if (totalNumCount === 81) win();
		} else if (value === "Backspace" || value === "Delete" || value === "0") {
			const newBoard = board.map((r, rIdx) =>
				r.map((c, cIdx) => (rIdx === row && cIdx === col ? "" : c))
			);
			setBoard(newBoard);
		}
	};

	const handleCandidateInput = (value) => {
		if (!selectedCell) return;

		const [rowI, colI] = selectedCell;
		setCandidates((prev) => {
			const updated = prev.map((row, r) =>
				row.map((cell, c) =>
					r === rowI && c === colI ? new Set([...cell, value]) : cell
				)
			);
			return updated;
		});
	};

	const handleNumberClick = (number) => {
		if (numsComplete?.includes(number)) return false;

		handleInput(number.toString());
	};

	const isLocked = (row, col) => {
		return userLocked[row][col];
	};

	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const storedBoard = localStorage.getItem("sudoku-board");
		if (storedBoard) {
			setBoard(JSON.parse(storedBoard));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("sudoku-board", JSON.stringify(board));
	}, [board]);

	const win = () => {
		setBoard(solution);

		setIsComplete(true);
		setTimerRunning(false);
		setIsModalOpen(true);
	};

	const reset = () => {
		setIsComplete(false);
		setElapsedTime(0);
		setTimerRunning(true);
		setIsModalOpen(false);
		setBoard(initialPuzzle);
		setNumsComplete([]);
		setSelectedCell(null);
		setCandidates(
			Array(9)
				.fill()
				.map(() =>
					Array(9)
						.fill()
						.map(() => new Set())
				)
		);
	};

	const seconds = elapsedTime % 60;
	const minutes = Math.floor(elapsedTime / 60);

	return (
		<div className="flex items-center flex-col min-h-screen overflow-hidden">
			<HeaderButtons />
			<div className="flex flex-col md:flex-row items-center justify-center overflow-hidden">
				<div className="flex flex-col items-center justify-center">
					<div className="flex justify-center items-center">
						<p className="text-2xl font-mono">
							{String(minutes).padStart(2, "0")}:
							{String(seconds).padStart(2, "0")}
						</p>
						<button
							onClick={() => setTimerRunning((prev) => !prev)}
							className="px-4 cursor-pointer"
						>
							{timerRunning ? <FaPause /> : <FaPlay />}
						</button>
					</div>

					<div className="flex flex-col items-center justify-center p-8 pt-2 pb-4">
						<Board
							board={board}
							selectedCell={selectedCell}
							prefilled={initialPuzzle}
							solution={solution}
							onCellClick={handleCellClick}
							onCellFocus={handleCellFocus}
							onCellKeyDown={handleKeyDown}
							cellRefs={cellRefs}
							paused={!timerRunning}
							candidates={candidates}
							isComplete={isComplete}
						/>
					</div>
				</div>
				<div className="flex flex-col justify-center items-center">
					<div className="flex gap-1">
						<button
							className="bg-blue-400 text-white px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
							onClick={() => win()}
						>
							Win
						</button>
						<button
							className="bg-red-400 text-white px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
							onClick={() => reset()}
						>
							Reset
						</button>
					</div>

					<NumberBox
						numsComplete={numsComplete}
						onNumberClick={handleNumberClick}
					/>
				</div>
				<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
					<div className="flex flex-col justify-center items-center">
						<h2 className="text-4xl font-bold mb-2">Congrats!</h2>
						<p className="mb-4 text-2xl mt-8">
							You completed the puzzle in&nbsp;
							<span className="font-bold">
								{String(minutes).padStart(2, "0")}:
								{String(seconds).padStart(2, "0")}
							</span>
							.
						</p>
						<FaRegSmile className="text-[72px] mt-24" />
					</div>
				</Modal>
			</div>
		</div>
	);
}
