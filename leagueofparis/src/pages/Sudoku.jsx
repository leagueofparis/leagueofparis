import React, { useState } from "react";
import Board from "../components/sudoku/Board";

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

	const handleCellClick = (row, col) => {
		setSelectedCell([row, col]);
	};

	const handleCellFocus = (row, col) => {
		setSelectedCell([row, col]);
	};

	return (
		<div className="flex items-center justify-center min-h-screen overflow-hidden">
			<div className="flex flex-col items-center justify-center min-h-screen p-8 scale-[1.1]">
				<Board
					board={board}
					selectedCell={selectedCell}
					prefilled={initialPuzzle}
					onCellClick={handleCellClick}
					onCellFocus={handleCellFocus}
				/>
			</div>
		</div>
	);
}
