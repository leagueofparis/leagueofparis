using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace webapi.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class SudokuController : ControllerBase
	{
		private readonly AppDbContext _db;

		public SudokuController(AppDbContext db)
		{
			_db = db ?? throw new ArgumentNullException(nameof(db));
		}

		[HttpGet("today/{difficulty}")]
		public async Task<IActionResult> GetTodayPuzzle(string difficulty = "easy")
		{
			try
			{
				if (!Enum.TryParse<Difficulty>(difficulty, true, out var parsedDifficulty))
				{
					return BadRequest("Invalid difficulty");
				}

				var today = DateOnly.FromDateTime(DateTime.UtcNow);

				DailySudokuPuzzle? puzzle = await _db.DailySudokuPuzzles
					.FirstOrDefaultAsync(p => p.Date == today && p.Difficulty == parsedDifficulty);

				if (puzzle == null)
				{
					SudokuGenerator generator = new();
					var (puzzleBoard, solutionBoard) = generator.Generate(parsedDifficulty);

					puzzle = new DailySudokuPuzzle
					{
						Date = today,
						Difficulty = parsedDifficulty,
						Puzzle = JsonConvert.SerializeObject(puzzleBoard),
						Solution = JsonConvert.SerializeObject(solutionBoard)
					};

					_db.DailySudokuPuzzles.Add(puzzle);
					await _db.SaveChangesAsync();
				}

				return Ok(new
				{
					puzzle = JsonConvert.DeserializeObject<int?[][]>(puzzle.Puzzle),
					solution = JsonConvert.DeserializeObject<int[][]>(puzzle.Solution),
					difficulty,
					date = today

				});
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Sudoku error: {ex.Message}");
				return StatusCode(500, "Internal server error.");
			}
		}
	}
}