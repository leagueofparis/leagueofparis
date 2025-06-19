import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function useSudokuPuzzle() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sudokuState, setSudokuState] = useState({
		board: null,
		solution: null,
		selectedCell: null,
		candidateMode: false,
		candidates: {},
		solve_count: 0,
		average_time: 0,
		completed: false,
		hintsUsed: 0,
		numsComplete: [],
		isModalOpen: false,
	});

	const {
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
	} = sudokuState;

	const fetchPuzzle = async () => {
		try {
			setLoading(true);
			setError(null);

			// Check local storage first
			const storedPuzzle = localStorage.getItem("currentPuzzle");
			const storedData = storedPuzzle ? JSON.parse(storedPuzzle) : null;
			const now = new Date();
			const isStoredPuzzleValid =
				storedData &&
				storedData.timestamp &&
				now - new Date(storedData.timestamp) < 24 * 60 * 60 * 1000;

			let puzzleData;
			if (isStoredPuzzleValid) {
				puzzleData = storedData;
			} else {
				const response = await fetch(
					"https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value,solution,difficulty}}}"
				);
				const data = await response.json();
				puzzleData = {
					board: data.newboard.grids[0].value,
					solution: data.newboard.grids[0].solution,
					difficulty: data.newboard.grids[0].difficulty,
					timestamp: now.toISOString(),
				};
			}

			// Get authenticated user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			let profileId = null;

			if (user) {
				// Get user's profile
				const { data: profile, error: profileError } = await supabase
					.from("profiles")
					.select("id")
					.eq("auth_id", user.id)
					.single();

				if (profileError) {
					console.error("Error fetching profile:", profileError);
				} else {
					profileId = profile.id;
				}
			}

			// Check if user has already completed this puzzle
			let isCompleted = false;
			if (profileId) {
				const { data: solve, error: solveError } = await supabase
					.from("sudokusolves")
					.select("*")
					.eq("profile_id", profileId)
					.eq("sudoku_id", puzzleData.board.join(""))
					.single();

				if (solveError && solveError.code !== "PGRST116") {
					console.error("Error checking solve status:", solveError);
				} else if (solve) {
					isCompleted = true;
				}
			}

			setSudokuState((prev) => ({
				...prev,
				board: puzzleData.board,
				solution: puzzleData.solution,
				completed: isCompleted,
				selectedCell: null,
				candidateMode: false,
				candidates: {},
				hintsUsed: 0,
				numsComplete: [],
				isModalOpen: isCompleted,
			}));

			// Save to local storage
			localStorage.setItem(
				"currentPuzzle",
				JSON.stringify({
					...puzzleData,
					completed: isCompleted,
					hintsUsed: 0,
				})
			);
		} catch (err) {
			console.error("Error fetching puzzle:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPuzzle();
	}, []);

	const handleInput = (value) => {
		if (!selectedCell || completed) return;
		const [row, col] = selectedCell;
		const newBoard = [...board];
		newBoard[row][col] = parseInt(value) || 0;
		setSudokuState((prev) => ({ ...prev, board: newBoard }));
		checkWin(newBoard);
	};

	const handleCandidateInput = (value) => {
		if (!selectedCell || completed) return;
		const [row, col] = selectedCell;
		const key = `${row}-${col}`;
		const currentCandidates = candidates[key] || [];
		const valueNum = parseInt(value);

		let newCandidates;
		if (currentCandidates.includes(valueNum)) {
			newCandidates = currentCandidates.filter((num) => num !== valueNum);
		} else {
			newCandidates = [...currentCandidates, valueNum].sort((a, b) => a - b);
		}

		setSudokuState((prev) => ({
			...prev,
			candidates: { ...prev.candidates, [key]: newCandidates },
		}));
	};

	const useHint = () => {
		if (!selectedCell || completed) return;
		const [row, col] = selectedCell;
		const newBoard = [...board];
		newBoard[row][col] = solution[row][col];
		setSudokuState((prev) => ({
			...prev,
			board: newBoard,
			hintsUsed: prev.hintsUsed + 1,
		}));
		checkWin(newBoard);
	};

	const checkWin = (currentBoard) => {
		const isComplete = currentBoard.every((row, i) =>
			row.every((cell, j) => cell === solution[i][j])
		);
		if (isComplete) {
			win();
		}
	};

	const win = async () => {
		try {
			// Get authenticated user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			let profileId = null;

			if (user) {
				// Get user's profile
				const { data: profile, error: profileError } = await supabase
					.from("profiles")
					.select("id")
					.eq("auth_id", user.id)
					.single();

				if (profileError) {
					console.error("Error fetching profile:", profileError);
				} else {
					profileId = profile.id;
				}
			}

			// Insert into sudokusolves table
			const { error: solveError } = await supabase.from("sudokusolves").insert({
				profile_id: profileId,
				sudoku_id: board.join(""),
				elapsed_time: 0, // This will be updated by the timer
				hints_used: hintsUsed,
			});

			if (solveError) {
				console.error("Error recording solve:", solveError);
			}

			// Update solve count and average time
			const { data: stats, error: statsError } = await supabase
				.from("sudokusolves")
				.select("elapsed_time")
				.eq("profile_id", profileId);

			if (statsError) {
				console.error("Error fetching stats:", statsError);
			} else {
				const solveCount = stats.length;
				const totalTime = stats.reduce(
					(sum, solve) => sum + solve.elapsed_time,
					0
				);
				const avgTime = solveCount > 0 ? Math.floor(totalTime / solveCount) : 0;

				setSudokuState((prev) => ({
					...prev,
					solve_count: solveCount,
					average_time: avgTime,
					completed: true,
					isModalOpen: true,
				}));
			}

			// Update local storage
			const storedPuzzle = localStorage.getItem("currentPuzzle");
			if (storedPuzzle) {
				const puzzleData = JSON.parse(storedPuzzle);
				localStorage.setItem(
					"currentPuzzle",
					JSON.stringify({
						...puzzleData,
						completed: true,
						hintsUsed,
					})
				);
			}
		} catch (error) {
			console.error("Error in win handler:", error);
		}
	};

	const reset = () => {
		fetchPuzzle();
	};

	const toggleCandidateMode = () => {
		setSudokuState((prev) => ({
			...prev,
			candidateMode: !prev.candidateMode,
		}));
	};

	return {
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
		setIsModalOpen: (isOpen) =>
			setSudokuState((prev) => ({ ...prev, isModalOpen: isOpen })),
		handleInput,
		handleCandidateInput,
		useHint,
		reset,
		toggleCandidateMode,
		setSudokuState,
		win,
	};
}
