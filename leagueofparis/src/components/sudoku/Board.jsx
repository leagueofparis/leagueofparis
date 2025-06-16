/* eslint-disable no-unused-vars */
import Cell from "./Cell";
import { isValid } from "../sudoku/Validator";
import React from "react";

export default function Board({
	board,
	selectedCell,
	prefilled,
	solution,
	onCellClick,
	onCellFocus,
	onCellKeyDown,
	cellRefs,
	paused,
	candidates,
	isComplete,
	candidateMode,
	onCandidateCellClick,
}) {
	const getHighlightType = (row, col, value) => {
		let type = "";

		value = value?.toString() ?? "";

		if (isPrefilled(row, col, value)) type = "prefilled";

		if (!selectedCell) {
			type = type === "prefilled" ? type : null;
		} else {
			if (isComplete) return type === "prefilled" ? type : null;

			const [selRow, selCol] = selectedCell;
			const selectedValue = board[selRow]?.[selCol]?.toString() ?? "";

			if (row === selRow && col === selCol) return "selected";
			if (value !== "" && value === selectedValue && selectedValue !== "") {
				return "number";
			}
			if (row === selRow || col === selCol) return "rowcol";

			if (
				Math.floor(row / 3) == Math.floor(selRow / 3) &&
				Math.floor(col / 3) == Math.floor(selCol / 3)
			)
				return "rowcol";
		}

		return type;
	};

	const isPrefilled = (row, col, value) => {
		return value !== "" && prefilled[row][col].toString() === value;
	};

	const isDuplicateValue = (row, col, value) => {
		value = value?.toString() ?? "";

		if (value == "") return false;

		if (board[row].filter((x) => x == value).length > 1) return true;

		if (board.map((r) => r[col]).filter((x) => x == value).length > 1)
			return true;

		const startRow = Math.floor(row / 3) * 3;
		const startCol = Math.floor(col / 3) * 3;
		const box = [];

		for (let r = startRow; r < startRow + 3; r++) {
			for (let c = startCol; c < startCol + 3; c++) {
				box.push(board[r][c]);
			}
		}

		if (box.filter((x) => x == value).length > 1) return true;
	};

	const getCellColor = (row, col, value) => {
		value = value?.toString() ?? "";
		if (isPrefilled(row, col, value)) return "text-neutral-content";

		if (value !== "" && solution[row][col].toString() === value) {
			return "text-success";
		}

		return "text-base-content";
	};

	return (
		<div
			className={`grid grid-cols-9 border-5 border-primary ${paused ? "pointer-events-none" : ""}`}
		>
			{board.map((row, rowIndex) =>
				row.map((value, colIndex) => {
					const key = `${rowIndex}-${colIndex}`;
					if (!cellRefs.current[key]) {
						cellRefs.current[key] = React.createRef();
					}
					const highlightType = getHighlightType(rowIndex, colIndex, value);
					return (
						<Cell
							key={key}
							value={value}
							row={rowIndex}
							col={colIndex}
							color={getCellColor(rowIndex, colIndex, value)}
							onClick={onCellClick}
							onFocus={onCellFocus}
							onKeyDown={onCellKeyDown}
							highlightType={highlightType}
							cellRef={cellRefs.current[key]}
							paused={paused && !isComplete}
							candidates={[...candidates[rowIndex][colIndex]]}
							candidateMode={candidateMode}
							onCandidateCellClick={onCandidateCellClick}
							isDuplicateValue={isDuplicateValue(rowIndex, colIndex, value)}
							completed={isComplete}
						/>
					);
				})
			)}
		</div>
	);
}
