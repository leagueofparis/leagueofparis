using System;
using System.Collections.Generic;

public enum Difficulty
{
	Easy,
	Medium,
	Hard,
	Expert
}

public class SudokuGenerator
{
	private static readonly Random _random = new();

	public (int[,], int[,]) Generate(Difficulty difficulty)
	{
		int[,] board = new int[9, 9];
		FillBoard(board);

		// Copy the full board as the solution
		int[,] solution = (int[,])board.Clone();

		// Remove cells to create puzzle
		int clues = difficulty switch
		{
			Difficulty.Easy => 40,
			Difficulty.Medium => 34,
			Difficulty.Hard => 28,
			Difficulty.Expert => 24,
			_ => 40
		};

		int[,] puzzle = RemoveCells((int[,])board.Clone(), 81 - clues);

		return (puzzle, solution);
	}

	private void FillBoard(int[,] board)
	{
		SolveBoard(board);
	}

	private bool SolveBoard(int[,] board)
	{
		for (int row = 0; row < 9; row++)
		{
			for (int col = 0; col < 9; col++)
			{
				if (board[row, col] == 0)
				{
					var numbers = GetShuffledNumbers();
					foreach (int num in numbers)
					{
						if (IsSafe(board, row, col, num))
						{
							board[row, col] = num;
							if (SolveBoard(board)) return true;
							board[row, col] = 0;
						}
					}
					return false;
				}
			}
		}
		return true;
	}

	private int[] GetShuffledNumbers()
	{
		var nums = new List<int>() { 1, 2, 3, 4, 5, 6, 7, 8, 9 };
		for (int i = nums.Count - 1; i > 0; i--)
		{
			int j = _random.Next(i + 1);
			(nums[i], nums[j]) = (nums[j], nums[i]);
		}
		return nums.ToArray();
	}

	private bool IsSafe(int[,] board, int row, int col, int num)
	{
		for (int x = 0; x < 9; x++)
		{
			if (board[row, x] == num || board[x, col] == num)
				return false;
		}

		int startRow = row - row % 3;
		int startCol = col - col % 3;

		for (int i = 0; i < 3; i++)
		{
			for (int j = 0; j < 3; j++)
			{
				if (board[startRow + i, startCol + j] == num)
					return false;
			}
		}

		return true;
	}

	private int[,] RemoveCells(int[,] board, int cellsToRemove)
	{
		while (cellsToRemove > 0)
		{
			int row = _random.Next(0, 9);
			int col = _random.Next(0, 9);

			if (board[row, col] != 0)
			{
				board[row, col] = 0;
				cellsToRemove--;
			}
		}
		return board;
	}
}
