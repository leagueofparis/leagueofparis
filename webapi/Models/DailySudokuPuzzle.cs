using System.ComponentModel.DataAnnotations;

public class DailySudokuPuzzle
{
	[Key]
	public Guid Id { get; set; }
	public DateOnly Date { get; set; }
	public string Puzzle { get; set; } = string.Empty;
	public string Solution { get; set; } = string.Empty;
	public Difficulty Difficulty { get; set; }
	public float AverageTime { get; set; }
	public int SolveCount { get; set; }
}