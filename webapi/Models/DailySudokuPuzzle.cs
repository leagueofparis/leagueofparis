using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class DailySudokuPuzzle
{
	[Key]
	[Column("id")]
	public Guid Id { get; set; }
	[Column("date")]
	public DateOnly Date { get; set; }
	[Column("puzzle")]
	public string Puzzle { get; set; } = string.Empty;
	[Column("solution")]
	public string Solution { get; set; } = string.Empty;
	[Column("difficulty")]
	public Difficulty Difficulty { get; set; }
	[Column("average_time")]
	public float AverageTime { get; set; }
	[Column("solve_count")]
	public int SolveCount { get; set; }
}