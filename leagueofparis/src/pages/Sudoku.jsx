import React, { useState, useRef, useEffect } from "react";
import Modal from "../components/Modal";
import Board from "../components/sudoku/Board";
import HeaderButtons from "../components/HeaderButtons";
import NumberBox from "../components/sudoku/NumberBox";
import { FaPause, FaPlay, FaRegSmile, FaPencilAlt } from "react-icons/fa";
import Toggle from "../components/Toggle";
import useSudokuStorage from "../hooks/useSudokuStorage";

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

// Create a combined initial state for persistence.
const initialSudokuState = {
	board: initialPuzzle,
	selectedCell: null,
	elapsedTime: 0,
	candidateMode: false,
	candidates: Array(9)
		.fill()
		.map(() =>
			Array(9)
				.fill()
				.map(() => new Set())
		),
	timerRunning: true,
};

export default function Sudoku() {
	// Use the custom hook to persist board, selectedCell, elapsedTime, candidateMode, and candidates.
	const [sudokuState, setSudokuState] = useSudokuStorage(initialSudokuState);
	const {
		board,
		selectedCell,
		elapsedTime,
		candidateMode,
		candidates,
		timerRunning,
	} = sudokuState;

	// Other state values that we don't need to persist.
	const [numsComplete, setNumsComplete] = useState([]);
	const [userLocked, setUserLocked] = useState(
		initialPuzzle.map((row) => row.map((cell) => cell !== ""))
	);
	const [isComplete, setIsComplete] = useState(false);
	const [puzzle, setPuzzle] = useState(null);
	const [error, setError] = useState(null);
	const cellRefs = useRef({});
	const selectedCellRef = useRef(null);

	useEffect(() => {
		selectedCellRef.current = selectedCell;
	}, [selectedCell]);

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

	// Timer effect: update elapsedTime in our persisted state.
	useEffect(() => {
		const interval = setInterval(() => {
			if (timerRunning) {
				setSudokuState((prev) => ({
					...prev,
					elapsedTime: prev.elapsedTime + 1,
				}));
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [timerRunning, setSudokuState]);

	// Pause timer when the document becomes hidden.
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				setSudokuState((prev) => ({
					...prev,
					timerRunning: false,
				}));
			} else {
				setSudokuState((prev) => ({
					...prev,
					timerRunning: true,
				}));
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	const handleCellClick = (row, col) => {
		if (!timerRunning) return;
		setSudokuState((prev) => ({ ...prev, selectedCell: [row, col] }));
	};

	const handleCellFocus = (row, col) => {
		if (!timerRunning) return;
		setSudokuState((prev) => ({ ...prev, selectedCell: [row, col] }));
	};

	useEffect(() => {
		const handleGlobalKeys = (e) => {
			if (e.keyCode == 32)
				setSudokuState((prev) => ({
					...prev,
					timerRunning: !prev.timerRunning,
				}));

			if (!selectedCell && e.keyCode >= 37 && e.keyCode <= 40) {
				e.preventDefault();
				setSudokuState((prev) => ({ ...prev, selectedCell: [0, 0] }));
				return;
			}
			if (selectedCell) {
				const [row, col] = selectedCell;
				switch (e.keyCode) {
					case 37:
						setSudokuState((prev) => ({
							...prev,
							selectedCell: [row, Math.max(col - 1, 0)],
						}));
						break;
					case 38:
						setSudokuState((prev) => ({
							...prev,
							selectedCell: [Math.max(row - 1, 0), col],
						}));
						break;
					case 39:
						setSudokuState((prev) => ({
							...prev,
							selectedCell: [row, Math.min(col + 1, 8)],
						}));
						break;
					case 40:
						setSudokuState((prev) => ({
							...prev,
							selectedCell: [Math.min(row + 1, 8), col],
						}));
						break;
					default:
						break;
				}
			}
			if (e.repeat) {
				setTimeout(() => {}, 1000);
			}
		};
		document.addEventListener("keydown", handleGlobalKeys);
		return () => document.removeEventListener("keydown", handleGlobalKeys);
	}, [selectedCell, setSudokuState]);

	useEffect(() => {});

	const handleKeyDown = (e) => {
		const key = e.key;
		if (!selectedCell) return;
		handleInput(key);
	};

	const isLocked = (row, col) => {
		return userLocked[row][col];
	};

	const handleInput = (value) => {
		if (!timerRunning || !selectedCell) return;
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
			setSudokuState((prev) => ({ ...prev, board: newBoard }));
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
			setSudokuState((prev) => ({ ...prev, board: newBoard }));
		}
	};

	const handleCandidateInput = (value) => {
		if (!selectedCell) return;
		const [rowI, colI] = selectedCell;
		setSudokuState((prev) => {
			const updatedCandidates = candidates.map((row, r) =>
				row.map((cell, c) => {
					if (r === rowI && c === colI) {
						const currentSet = new Set(cell);
						const val = parseInt(value);
						if (currentSet.has(val)) {
							currentSet.delete(val);
						} else {
							currentSet.add(val);
						}
						// Normalize: fill 9 slots with numbers or ""
						return Array.from({ length: 9 }, (_, i) =>
							currentSet.has(i + 1) ? i + 1 : ""
						);
					}
					return cell;
				})
			);
			return { ...prev, candidates: updatedCandidates };
		});
	};

	const handleCandidateCellClick = (row, col, value) => {
		const currentSelected = selectedCellRef.current;
		if (!currentSelected) {
			setSudokuState((prev) => ({ ...prev, selectedCell: [row, col] }));
			return;
		}
		const [selRow, selCol] = currentSelected;
		if (selRow === row && selCol === col) {
			handleCandidateInput(value);
		} else {
			setSudokuState((prev) => ({ ...prev, selectedCell: [row, col] }));
		}
	};

	const handleNumberClick = (number) => {
		if (numsComplete?.includes(number)) return false;
		handleInput(number.toString());
	};

	const [isModalOpen, setIsModalOpen] = useState(false);

	const win = () => {
		setSudokuState((prev) => ({
			...prev,
			board: solution,
			selectedCell: null,
		}));
		setIsComplete(true);
		setSudokuState((prev) => ({ ...prev, timerRunning: !prev.timerRunning }));
		setIsModalOpen(true);
	};

	const reset = () => {
		setIsComplete(false);
		setIsModalOpen(false);
		setSudokuState(initialSudokuState);
		setNumsComplete([]);
		setUserLocked(initialPuzzle.map((row) => row.map((cell) => cell !== "")));
	};

	const toggleCandidateMode = () => {
		setSudokuState((prev) => ({ ...prev, candidateMode: !prev.candidateMode }));
	};

	const seconds = elapsedTime % 60;
	const minutes = Math.floor(elapsedTime / 60);

	useEffect(() => {
		const fetchPuzzle = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/users`);
				if (!response.ok) throw new Error("Failed to fetch puzzle");

				const data = await response.json();
				setPuzzle(data);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchPuzzle();
	}, []);
	return (
		<div className="flex items-center flex-col min-h-screen overflow-hidden">
			<div>{puzzle}</div>
			<HeaderButtons />
			<div className="flex flex-col md:flex-row items-center justify-center overflow-hidden">
				<div className="flex flex-col items-center justify-center">
					<div className="flex justify-center items-center">
						<p className="text-2xl font-mono">
							{String(minutes).padStart(2, "0")}:
							{String(seconds).padStart(2, "0")}
						</p>
						<button
							onClick={() =>
								setSudokuState((prev) => ({
									...prev,
									timerRunning: !prev.timerRunning,
								}))
							}
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
							candidateMode={candidateMode}
							onCandidateCellClick={handleCandidateCellClick}
						/>
					</div>
				</div>
				<div className="flex flex-col justify-center items-center">
					<div className="flex gap-1 justify-center items-center">
						<button
							className="bg-blue-400 text-white px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
							onClick={win}
						>
							Win
						</button>
						<button
							className="bg-red-400 text-white px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
							onClick={reset}
						>
							Reset
						</button>
						<Toggle isOn={candidateMode} onToggle={toggleCandidateMode} />
						<FaPencilAlt />
					</div>

					<NumberBox
						numsComplete={numsComplete}
						onNumberClick={handleNumberClick}
						candidateMode={candidateMode}
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
