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
}) {
	const getHighlightType = (row, col, value) => {
		let type = "";

		if (isPrefilled(row, col, value)) type = "prefilled";

		if (!selectedCell) {
			type = type === "prefilled" ? type : null;
		} else {
			if (isComplete) return type === "prefilled" ? type : null;

			const [selRow, selCol] = selectedCell;
			const selectedValue = board[selRow][selCol];

			if (row === selRow && col === selCol) return "selected";
			if (value !== "" && value === selectedValue && selectedValue !== "")
				return "number";
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
		return value !== "" && prefilled[row][col] === value;
	};

	const getCellColor = (row, col, value) => {
		if (isPrefilled(row, col, value)) return "text-black";

		value = value.toString();
		if (value !== "" && solution[row][col].toString() === value) {
			return "text-[#DC15E6]";
		}

		return "text-black";
	};

	return (
		<div
			className={`grid grid-cols-9 border-5 ${paused ? "pointer-events-none" : ""}`}
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
							candidates={candidates[rowIndex][colIndex]}
						/>
					);
				})
			)}
		</div>
	);
}
