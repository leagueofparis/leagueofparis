import React, { useRef, useEffect } from "react";
import Board from "../components/sudoku/Board";
import NumberBox from "../components/sudoku/NumberBox";
import GameControls from "../components/sudoku/GameControls";
import CompletionModal from "../components/sudoku/CompletionModal";
import useSudokuPuzzle from "../hooks/useSudokuPuzzle";
import useSudokuTimer from "../hooks/useSudokuTimer";

export default function Sudoku() {
	const {
		loading,
		error,
		board,
		solution,
		selectedCell,
		candidateMode,
		candidates,
		solve_count,
		average_time,
		completed,
		hintsUsed,
		numsComplete,
		isModalOpen,
		setIsModalOpen,
		handleInput,
		handleCandidateInput,
		useHint,
		reset,
		toggleCandidateMode,
		setSudokuState,
		win,
	} = useSudokuPuzzle();

	const { elapsedTime, timerRunning, toggleTimer, resetTimer, stopTimer } =
		useSudokuTimer(0, true);

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

	useEffect(() => {
		const handleGlobalKeys = (e) => {
			if (e.keyCode === 32) {
				toggleTimer();
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
	}, [selectedCell, toggleTimer]);

	const handleKeyDown = (e) => {
		if (!selectedCell) return;
		handleInput(e.key);
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

	const handleWin = async () => {
		stopTimer();
		await win();
	};

	const handleReset = () => {
		reset();
		resetTimer();
	};

	if (loading || !solution) return <div>Loading puzzle...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="flex items-center flex-col min-h-screen overflow-hidden bg-base-100">
			<div className="flex flex-col md:flex-row items-center justify-center overflow-hidden">
				<div className="flex flex-col items-center justify-center">
					<div className="flex flex-col items-center justify-center p-8 pt-2 pb-4">
						<Board
							board={board}
							selectedCell={selectedCell}
							prefilled={board}
							solution={solution}
							onCellClick={handleCellClick}
							onCellFocus={handleCellFocus}
							onCellKeyDown={handleKeyDown}
							cellRefs={cellRefs}
							paused={!timerRunning}
							candidates={candidates}
							isComplete={completed}
							candidateMode={candidateMode}
							onCandidateCellClick={handleCandidateCellClick}
						/>
					</div>
				</div>
				<div className="flex flex-col justify-center items-center">
					<GameControls
						elapsedTime={elapsedTime}
						timerRunning={timerRunning}
						solve_count={solve_count}
						average_time={average_time}
						hintsUsed={hintsUsed}
						completed={completed}
						onToggleTimer={toggleTimer}
						onWin={handleWin}
						onReset={handleReset}
						onHint={useHint}
						candidateMode={candidateMode}
						onToggleCandidateMode={toggleCandidateMode}
					/>
					<NumberBox
						numsComplete={numsComplete}
						onNumberClick={handleNumberClick}
						candidateMode={candidateMode}
					/>
				</div>
				<CompletionModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					elapsedTime={elapsedTime}
				/>
			</div>
		</div>
	);
}
