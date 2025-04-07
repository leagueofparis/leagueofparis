// src/hooks/useSudokuStorage.js
import { useState, useEffect } from "react";

/**
 * Normalizes a candidate cell so that it is always an array of length 9.
 * If the cell is a Set, it converts it into an array of length 9,
 * placing the number if it exists or an empty string if not.
 * If the cell is already an array, it ensures it has exactly 9 items.
 *
 * @param {Set|Array} cell - The candidate cell to normalize.
 * @returns {Array} - An array of length 9.
 */
function normalizeCandidateCell(cell) {
	if (cell instanceof Set) {
		// Convert the Set into an array of length 9.
		return Array.from({ length: 9 }, (_, i) => (cell.has(i + 1) ? i + 1 : ""));
	}
	if (Array.isArray(cell)) {
		// Ensure the array has exactly 9 items.
		const newCell = [...cell];
		while (newCell.length < 9) {
			newCell.push("");
		}
		return newCell.slice(0, 9);
	}
	return cell;
}

/**
 * Serializes the state before saving it to localStorage.
 * Specifically, it normalizes each candidate cell so empty strings are preserved.
 *
 * @param {Object} state - The current Sudoku state.
 * @returns {Object} - The state with normalized candidates.
 */
function serializeState(state) {
	return {
		...state,
		candidates: state.candidates.map((row) =>
			row.map((cell) => normalizeCandidateCell(cell))
		),
	};
}

/**
 * Deserializes the state loaded from localStorage.
 * It normalizes the candidates so that each candidate cell is an array of length 9.
 *
 * @param {Object} data - The parsed state data.
 * @param {Object} initialState - The fallback initial state.
 * @returns {Object} - The normalized state.
 */
function deserializeState(data, initialState) {
	if (data && data.candidates) {
		data.candidates = data.candidates.map((row) =>
			row.map((cell) => normalizeCandidateCell(cell))
		);
	}
	return data || initialState;
}

/**
 * Custom hook for managing persistence of the Sudoku state.
 *
 * @param {Object} initialState - The initial state for the Sudoku game.
 * @returns {[Object, Function]} - Returns the current state and a function to update it.
 */
export default function useSudokuStorage(initialState) {
	const [state, setState] = useState(() => {
		const stored = localStorage.getItem("sudokuData");
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				return deserializeState(parsed, initialState);
			} catch (err) {
				console.warn("Failed to parse stored sudokuData:", err);
			}
		}
		return initialState;
	});

	useEffect(() => {
		const dataToSave = serializeState(state);
		localStorage.setItem("sudokuData", JSON.stringify(dataToSave));
	}, [state]);

	return [state, setState];
}
