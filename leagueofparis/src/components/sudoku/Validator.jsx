export function isValid(board, row, col, value) {
	if (value === "") return true;

	for (let c = 0; c < 9; c++) {
		if (c !== col && board[row][c] === value) return false;
	}

	for (let r = 0; r < 9; r++) {
		if (r !== row && board[r][col] === value) return false;
	}

	const boxRowStart = Math.floor(row / 3) * 3;
	const boxColStart = Math.floor(col / 3) * 3;

	for (let r = boxRowStart; r < boxRowStart + 3; r++) {
		for (let c = boxColStart; c < boxColStart + 3; c++) {
			if ((row !== row || c !== col) && board[r][c] === value) return false;
		}
	}

	return true;
}
