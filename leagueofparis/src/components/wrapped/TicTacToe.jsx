import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// Winning combinations
const WINNING_LINES = [
	[0, 1, 2], // top row
	[3, 4, 5], // middle row
	[6, 7, 8], // bottom row
	[0, 3, 6], // left column
	[1, 4, 7], // middle column
	[2, 5, 8], // right column
	[0, 4, 8], // diagonal
	[2, 4, 6], // anti-diagonal
];

// Check for winner
const calculateWinner = (squares) => {
	for (const [a, b, c] of WINNING_LINES) {
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return { winner: squares[a], line: [a, b, c] };
		}
	}
	return null;
};

// Check if board is full (draw)
const isBoardFull = (squares) => {
	return squares.every((square) => square !== null);
};

// Medium AI Logic
const getAIMove = (squares) => {
	const emptySquares = squares
		.map((val, idx) => (val === null ? idx : null))
		.filter((val) => val !== null);

	if (emptySquares.length === 0) return null;

	// Priority 1: Win if possible
	for (const idx of emptySquares) {
		const testBoard = [...squares];
		testBoard[idx] = "O";
		if (calculateWinner(testBoard)?.winner === "O") {
			return idx;
		}
	}

	// Priority 2: Block player's winning move
	for (const idx of emptySquares) {
		const testBoard = [...squares];
		testBoard[idx] = "X";
		if (calculateWinner(testBoard)?.winner === "X") {
			return idx;
		}
	}

	// Priority 3: Take center if available
	if (squares[4] === null) {
		return 4;
	}

	// Priority 4: Take corners
	const corners = [0, 2, 6, 8].filter((idx) => squares[idx] === null);
	if (corners.length > 0) {
		return corners[Math.floor(Math.random() * corners.length)];
	}

	// Priority 5: Take edges
	const edges = [1, 3, 5, 7].filter((idx) => squares[idx] === null);
	if (edges.length > 0) {
		return edges[Math.floor(Math.random() * edges.length)];
	}

	// Fallback: random
	return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};

// X Mark Component
const XMark = ({ size = 60 }) => (
	<motion.svg
		width={size}
		height={size}
		viewBox="0 0 60 60"
		initial={{ scale: 0, rotate: -180 }}
		animate={{ scale: 1, rotate: 0 }}
		transition={{ type: "spring", stiffness: 260, damping: 20 }}
	>
		<motion.line
			x1="10"
			y1="10"
			x2="50"
			y2="50"
			stroke="url(#xGradient)"
			strokeWidth="6"
			strokeLinecap="round"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 0.3 }}
		/>
		<motion.line
			x1="50"
			y1="10"
			x2="10"
			y2="50"
			stroke="url(#xGradient)"
			strokeWidth="6"
			strokeLinecap="round"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 0.3, delay: 0.1 }}
		/>
		<defs>
			<linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#ec4899" />
				<stop offset="100%" stopColor="#8b5cf6" />
			</linearGradient>
		</defs>
	</motion.svg>
);

// O Mark Component
const OMark = ({ size = 60 }) => (
	<motion.svg
		width={size}
		height={size}
		viewBox="0 0 60 60"
		initial={{ scale: 0 }}
		animate={{ scale: 1 }}
		transition={{ type: "spring", stiffness: 260, damping: 20 }}
	>
		<motion.circle
			cx="30"
			cy="30"
			r="20"
			fill="none"
			stroke="url(#oGradient)"
			strokeWidth="6"
			strokeLinecap="round"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 0.4 }}
		/>
		<defs>
			<linearGradient id="oGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#06b6d4" />
				<stop offset="100%" stopColor="#3b82f6" />
			</linearGradient>
		</defs>
	</motion.svg>
);

// Cell Component
const Cell = ({ value, onClick, isWinning, disabled }) => (
	<motion.button
		onClick={onClick}
		disabled={disabled || value !== null}
		className={`
			w-24 h-24 md:w-28 md:h-28 
			flex items-center justify-center 
			bg-white/5 backdrop-blur-sm
			border-2 border-white/20
			rounded-xl
			transition-colors duration-200
			${!disabled && value === null ? "hover:bg-white/10 hover:border-white/40 cursor-pointer" : ""}
			${isWinning ? "bg-white/20 border-white/50" : ""}
			${disabled && value === null ? "cursor-not-allowed opacity-50" : ""}
		`}
		whileHover={!disabled && value === null ? { scale: 1.05 } : {}}
		whileTap={!disabled && value === null ? { scale: 0.95 } : {}}
	>
		<AnimatePresence mode="wait">
			{value === "X" && <XMark key="x" />}
			{value === "O" && <OMark key="o" />}
		</AnimatePresence>
	</motion.button>
);

const TicTacToe = ({ onWin }) => {
	const [board, setBoard] = useState(Array(9).fill(null));
	const [isPlayerTurn, setIsPlayerTurn] = useState(true);
	const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost, draw
	const [winningLine, setWinningLine] = useState([]);
	const [lossCount, setLossCount] = useState(0);
	const [showResult, setShowResult] = useState(false);

	// Check game status after each move
	useEffect(() => {
		const result = calculateWinner(board);
		if (result) {
			setWinningLine(result.line);
			if (result.winner === "X") {
				setGameStatus("won");
				setShowResult(true);
			} else {
				setGameStatus("lost");
				setLossCount((prev) => prev + 1);
				setShowResult(true);
			}
		} else if (isBoardFull(board)) {
			setGameStatus("draw");
			setShowResult(true);
		}
	}, [board]);

	// AI Move
	useEffect(() => {
		if (!isPlayerTurn && gameStatus === "playing") {
			const timer = setTimeout(() => {
				const aiMove = getAIMove(board);
				if (aiMove !== null) {
					const newBoard = [...board];
					newBoard[aiMove] = "O";
					setBoard(newBoard);
					setIsPlayerTurn(true);
				}
			}, 600); // Small delay for better UX

			return () => clearTimeout(timer);
		}
	}, [isPlayerTurn, gameStatus, board]);

	const handleCellClick = useCallback(
		(index) => {
			if (board[index] || !isPlayerTurn || gameStatus !== "playing") return;

			const newBoard = [...board];
			newBoard[index] = "X";
			setBoard(newBoard);
			setIsPlayerTurn(false);
		},
		[board, isPlayerTurn, gameStatus]
	);

	const resetGame = () => {
		setBoard(Array(9).fill(null));
		setIsPlayerTurn(true);
		setGameStatus("playing");
		setWinningLine([]);
		setShowResult(false);
	};

	const handleWinContinue = () => {
		// Save win to localStorage so user doesn't have to play again
		localStorage.setItem("wrapped_tictactoe_beaten", "true");
		// Small celebration delay before proceeding
		setTimeout(() => {
			onWin();
		}, 300);
	};

	const handleSkip = () => {
		onWin();
	};

	return (
		<motion.div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			{/* Animated Background */}
			<motion.div
				className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
				animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
				transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
				animate={{ x: [0, -50, 0], y: [0, -80, 0] }}
				transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
				animate={{ scale: [1, 1.2, 1] }}
				transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
			/>

			{/* Header */}
			<motion.div
				className="text-center mb-8 relative z-10"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
					Win a game of Tic Tac Toe to see your stats!
				</h1>
				<p className="text-white/70 text-lg">
					You're <span className="text-pink-400 font-bold">X</span>, I'm{" "}
					<span className="text-cyan-400 font-bold">O</span>
				</p>
				{lossCount > 0 && lossCount < 3 && (
					<motion.p
						className="text-white/50 text-sm mt-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						Attempts: {lossCount}/3
					</motion.p>
				)}
			</motion.div>

			{/* Game Board */}
			<motion.div
				className="grid grid-cols-3 gap-3 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative z-10"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ delay: 0.3, type: "spring" }}
			>
				{board.map((value, index) => (
					<Cell
						key={index}
						value={value}
						onClick={() => handleCellClick(index)}
						isWinning={winningLine.includes(index)}
						disabled={!isPlayerTurn || gameStatus !== "playing"}
					/>
				))}
			</motion.div>

			{/* Turn Indicator */}
			{gameStatus === "playing" && (
				<motion.p
					className="text-white/70 mt-6 text-lg relative z-10"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					{isPlayerTurn ? "Your turn!" : "Thinking..."}
				</motion.p>
			)}

			{/* Skip Button (after 3 losses) */}
			{lossCount >= 3 && gameStatus === "playing" && (
				<motion.button
					onClick={handleSkip}
					className="mt-6 px-6 py-2 text-white/50 hover:text-white/80 text-sm underline underline-offset-4 transition-colors relative z-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					Skip this challenge
				</motion.button>
			)}

			{/* Result Overlay */}
			<AnimatePresence>
				{showResult && (
					<motion.div
						className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							className="text-center p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 max-w-md mx-4"
							initial={{ scale: 0.5, y: 50 }}
							animate={{ scale: 1, y: 0 }}
							transition={{ type: "spring", stiffness: 200, damping: 20 }}
						>
							{gameStatus === "won" && (
								<>
									<motion.div
										className="text-6xl mb-4"
										animate={{ rotate: [0, -10, 10, -10, 0] }}
										transition={{ duration: 0.5, delay: 0.3 }}
									>
										🎉
									</motion.div>
									<h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
										You Won!
									</h2>
									<p className="text-white/70 mb-6">
										Time to see your wrapped stats!
									</p>
									<motion.button
										onClick={handleWinContinue}
										className="btn btn-lg rounded-full px-8 text-xl font-bold shadow-xl border-none bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										Show My Stats!
									</motion.button>
								</>
							)}

							{gameStatus === "lost" && (
								<>
									<motion.div
										className="text-6xl mb-4"
										animate={{ y: [0, -10, 0] }}
										transition={{ duration: 0.5, repeat: 2 }}
									>
										😅
									</motion.div>
									<h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
										I Won!
									</h2>
									<p className="text-white/70 mb-6">
										{lossCount >= 3
											? "It's okay, you can skip or try again!"
											: "Try again to unlock your stats!"}
									</p>
									<div className="flex flex-col sm:flex-row gap-3 justify-center">
										<motion.button
											onClick={resetGame}
											className="btn btn-lg rounded-full px-8 text-lg font-bold shadow-xl border-none bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											Play Again
										</motion.button>
										{lossCount >= 3 && (
											<motion.button
												onClick={handleSkip}
												className="btn btn-lg btn-ghost rounded-full px-8 text-lg font-medium text-white/70 hover:text-white hover:bg-white/10"
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												Skip
											</motion.button>
										)}
									</div>
								</>
							)}

							{gameStatus === "draw" && (
								<>
									<motion.div
										className="text-6xl mb-4"
										animate={{ rotate: [0, 180, 360] }}
										transition={{ duration: 0.8 }}
									>
										🤝
									</motion.div>
									<h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
										It's a Draw!
									</h2>
									<p className="text-white/70 mb-6">
										So close! Try again to win and unlock your stats.
									</p>
									<div className="flex flex-col sm:flex-row gap-3 justify-center">
										<motion.button
											onClick={resetGame}
											className="btn btn-lg rounded-full px-8 text-lg font-bold shadow-xl border-none bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											Play Again
										</motion.button>
										{lossCount >= 3 && (
											<motion.button
												onClick={handleSkip}
												className="btn btn-lg btn-ghost rounded-full px-8 text-lg font-medium text-white/70 hover:text-white hover:bg-white/10"
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												Skip
											</motion.button>
										)}
									</div>
								</>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default TicTacToe;

