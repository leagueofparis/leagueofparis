import React, { useState } from "react";

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
	const [correctness, setCorrectness] = useState(
		Array(9)
			.fill(null)
			.map(() => Array(9).fill(null))
	);
	const [focusedCell, setFocusedCell] = useState({
		row: null,
		col: null,
		value: "",
	});

	const handleChange = (row, col, value) => {
		if (isNaN(value) || value.length > 2) return;

		if (value > 1) {
			value = value[1];
		}

		const newBoard = board.map((r, rIdx) =>
			r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
		);
		setBoard(newBoard);

		const isCorrect = value === solution[row][col].toString();
		const newCorrectness = correctness.map((r, rIdx) =>
			r.map((cell, cIdx) => (rIdx === row && cIdx === col ? isCorrect : cell))
		);
		setCorrectness(newCorrectness);
	};

	const isPrefilled = (row, col) => initialPuzzle[row][col] !== "";
	const isCorrect = (row, col) => correctness[row][col] === true;

	const isHighlightedRowCol = (row, col) => {
		if (focusedCell.row === null || focusedCell.col === null) return false;
		const sameRow = row === focusedCell.row;
		const sameCol = col === focusedCell.col;
		return sameRow || sameCol;
	};

	const isHighlightedNumber = (number) => {
		if (focusedCell.row === null || focusedCell.col === null) return false;
		const sameValue = number === focusedCell.value && number !== "";
		return sameValue;
	};

	const isHighlightedbox = (row, col) => {
		if (focusedCell.row === null || focusedCell.col === null) return false;
		const sameBox =
			Math.floor(row / 3) === Math.floor(focusedCell.row / 3) &&
			Math.floor(col / 3) === Math.floor(focusedCell.col / 3);
		return sameBox;
	};

	return (
		<div className="flex items-center justify-center min-h-screen overflow-hidden">
			<div className="flex flex-col items-center justify-center min-h-screen p-8 scale-[1.1]">
				<div className="grid grid-cols-9 border-4">
					{board.map((row, rIdx) =>
						row.map((cell, cIdx) => (
							<input
								key={`${rIdx}-${cIdx}`}
								className={`w-20 h-20 text-center text-5xl border focus:bg-yellow-300 focus:outline-none caret-transparent select-none font-bold
				${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-b-3" : ""}
				${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? "border-r-3" : ""}
				${correctness[rIdx][cIdx] === false ? "text-red-500 border-black" : ""}
				${correctness[rIdx][cIdx] === true ? "text-blue-500 border-black" : ""}
				${isHighlightedRowCol(rIdx, cIdx) ? "bg-yellow-100" : ""}
				${isHighlightedNumber(cell) ? "bg-yellow-200" : ""}
				${isHighlightedbox(rIdx, cIdx) ? "bg-yellow-100" : ""}`}
								type="text"
								maxLength="2"
								value={cell}
								disabled={false}
								readOnly={isPrefilled(rIdx, cIdx) || isCorrect(rIdx, cIdx)}
								onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
								onFocus={() =>
									setFocusedCell({
										row: rIdx,
										col: cIdx,
										value: board[rIdx][cIdx],
									})
								}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}
