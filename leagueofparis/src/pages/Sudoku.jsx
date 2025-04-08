import React, { useState, useRef, useEffect, use } from "react";
import Modal from "../components/Modal";
import Board from "../components/sudoku/Board";
import HeaderButtons from "../components/HeaderButtons";
import NumberBox from "../components/sudoku/NumberBox";
import { FaPause, FaPlay, FaRegSmile, FaPencilAlt } from "react-icons/fa";
import Toggle from "../components/Toggle";
import useSudokuStorage from "../hooks/useSudokuStorage";

const placeholderBoard = Array(9)
	.fill()
	.map(() => Array(9).fill(""));
const placeholderCandidates = Array(9)
	.fill()
	.map(() =>
		Array(9)
			.fill()
			.map(() => new Set())
	);

const defaultInitialState = {
	prefilled: placeholderBoard,
	board: placeholderBoard,
	solution: placeholderBoard,
	selectedCell: null,
	elapsedTime: 0,
	candidateMode: false,
	candidates: placeholderCandidates,
	timerRunning: true,
	difficulty: "easy",
	date: null,
};

function getDateOnly(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function Sudoku() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sudokuState, setSudokuState] = useSudokuStorage(defaultInitialState);
	const {
		prefilled,
		board,
		solution,
		selectedCell,
		elapsedTime,
		candidateMode,
		candidates,
		timerRunning,
		difficulty,
		date,
	} = sudokuState;

	const [numsComplete, setNumsComplete] = useState([]);
	const [userLocked, setUserLocked] = useState(
		placeholderBoard.map((row) =>
			row.map((cell) => cell !== null && cell !== "")
		)
	);
	const [isComplete, setIsComplete] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const cellRefs = useRef({});
	const selectedCellRef = useRef(null);
	const hasFetched = useRef(false);

	useEffect(() => {
		const fetchPuzzle = async () => {
			if (hasFetched.current) return;
			hasFetched.current = true;
			try {
				// Check localStorage for existing puzzle
				const storedData = JSON.parse(localStorage.getItem("sudokuData"));
				const today = getDateOnly(new Date()).toISOString();
				if (
					storedData &&
					storedData.date === today &&
					storedData.difficulty === sudokuState.difficulty
				) {
					console.log("Using stored puzzle from localStorage");
					// Use stored puzzle and solution
					setSudokuState((prev) => ({
						...prev,
						board: storedData.board,
						timerRunning: true,
					}));
					setUserLocked(
						storedData.board.map((row) =>
							row.map((cell) => cell !== null && cell !== "")
						)
					);
					setLoading(false);
					return;
				}

				// Fetch new puzzle from API
				const response = await fetch(
					`https://leagueofparis-webapi.onrender.com/api/sudoku/today/${sudokuState.difficulty}`
				);
				if (!response.ok) throw new Error("Failed to fetch puzzle");
				const data = await response.json();

				console.log("Fetched new puzzle from API", data);
				// Convert prefilled cells to strings
				const puzzleAsStrings = data.puzzle.map((row) =>
					row.map((cell) => (cell !== null ? cell.toString() : ""))
				);

				// Save puzzle and solution to localStorage
				const newPuzzleData = {
					board: puzzleAsStrings,
					solution: data.solution,
					date: today,
					difficulty: sudokuState.difficulty,
				};

				console.log("Saving puzzle to localStorage", newPuzzleData);

				setSudokuState(() => ({
					...defaultInitialState, // Start with defaultInitialState
					prefilled: puzzleAsStrings,
					board: puzzleAsStrings,
					solution: data.solution,
					difficulty: sudokuState.difficulty,
					date: today,
					timerRunning: true,
				}));

				localStorage.setItem("sudokuData", sudokuState);

				setUserLocked(
					data.puzzle.map((row) =>
						row.map((cell) => cell !== null && cell !== "")
					)
				);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchPuzzle();
	}, [sudokuState.difficulty]);

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

	useEffect(() => {
		const handleVisibilityChange = () => {
			setSudokuState((prev) => ({
				...prev,
				timerRunning: !document.hidden,
			}));
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	useEffect(() => {
		const handleGlobalKeys = (e) => {
			if (e.keyCode === 32) {
				setSudokuState((prev) => ({
					...prev,
					timerRunning: !prev.timerRunning,
				}));
			}
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
				}
			}
		};
		document.addEventListener("keydown", handleGlobalKeys);
		return () => document.removeEventListener("keydown", handleGlobalKeys);
	}, [selectedCell]);

	const handleInput = (value) => {
		if (!timerRunning || !selectedCell || !solution) return;
		const [row, col] = selectedCell;
		if (userLocked[row][col]) return;
		if (value >= "1" && value <= "9") {
			console.log("handleInput", value);
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
			if (numCount === 9) setNumsComplete([...numsComplete, parseInt(value)]);
			const totalNumCount = flatBoard.filter(
				(num) => num !== "" && Number(num)
			).length;
			if (totalNumCount === 81) win();
		} else if (["Backspace", "Delete", "0"].includes(value)) {
			const newBoard = board.map((r, rIdx) =>
				r.map((c, cIdx) => (rIdx === row && cIdx === col ? "" : c))
			);
			setSudokuState((prev) => ({ ...prev, board: newBoard }));
		}
	};

	const handleKeyDown = (e) => {
		if (!selectedCell) return;
		handleInput(e.key);
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
						currentSet.has(val) ? currentSet.delete(val) : currentSet.add(val);
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

	const handleCellClick = (row, col) => {
		if (!timerRunning) return;
		setSudokuState((prev) => ({ ...prev, selectedCell: [row, col] }));
	};

	const handleCellFocus = (row, col) => {
		if (!timerRunning) return;
		setSudokuState((prev) => ({ ...prev, selectedCell: [row, col] }));
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
		if (numsComplete.includes(number)) return;
		candidateMode
			? handleCandidateInput(number.toString())
			: handleInput(number.toString());
	};

	const win = () => {
		setSudokuState((prev) => ({
			...prev,
			board: solution,
			selectedCell: null,
		}));
		setIsComplete(true);
		setSudokuState((prev) => ({ ...prev, timerRunning: false }));
		setIsModalOpen(true);
	};

	const reset = () => {
		// Reset to the initial state from localStorage
		const storedData = JSON.parse(localStorage.getItem("sudokuData"));
		if (storedData) {
			setSudokuState((prev) => ({
				...prev,
				board: storedData.board,
				selectedCell: null,
				elapsedTime: 0,
				timerRunning: true,
			}));
			setUserLocked(
				storedData.board.map((row) =>
					row.map((cell) => cell !== null && cell !== "")
				)
			);
			setNumsComplete([]);
			setIsComplete(false);
			setIsModalOpen(false);
		}
	};

	const toggleCandidateMode = () => {
		setSudokuState((prev) => ({ ...prev, candidateMode: !prev.candidateMode }));
	};

	const seconds = elapsedTime % 60;
	const minutes = Math.floor(elapsedTime / 60);

	if (loading || !solution) return <div>Loading puzzle...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="flex items-center flex-col min-h-screen overflow-hidden">
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
							prefilled={prefilled} // Assume initial cells
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
							className="bg-secondary text-base-100 px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
							onClick={win}
						>
							Win
						</button>
						<button
							className="bg-primary text-accent px-4 py-2 rounded cursor-pointer font-bold text-xl max-w-[16rem]"
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
