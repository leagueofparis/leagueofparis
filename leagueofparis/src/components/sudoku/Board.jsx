import Cell from "./Cell";

export default function Board({
	board,
	selectedCell,
	prefilled,
	onCellClick,
	onCellFocus,
}) {
	const getHighlightType = (row, col, value) => {
		if (!selectedCell) return null;

		const [selRow, selCol] = selectedCell;
		const selectedValue = board[selRow][selCol];

		if (row === selRow && col === selCol) return "selected";
		if (value !== "" && value === selectedValue && selectedValue !== "")
			return "number";
		if (row === selRow || col === selCol) return "rowcol";

		return null;
	};

	return (
		<div className="grid grid-cols-9 border-4">
			{board.map((row, rowIndex) =>
				row.map((value, colIndex) => {
					const highlightType = getHighlightType(rowIndex, colIndex, value);
					return (
						<Cell
							key={`${rowIndex}-${colIndex}`}
							value={value}
							row={rowIndex}
							col={colIndex}
							isPrefilled={prefilled[rowIndex][colIndex]}
							onClick={onCellClick}
							onFocus={onCellFocus}
							highlightType={highlightType}
						/>
					);
				})
			)}
		</div>
	);
}
