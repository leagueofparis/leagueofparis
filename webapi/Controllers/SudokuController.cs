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
		private readonly ILogger<SudokuController> _logger;

		public SudokuController(AppDbContext db, ILogger<SudokuController> logger)
		{
			_db = db ?? throw new ArgumentNullException(nameof(db));
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

				_logger.LogInformation($"Fetching puzzle for {today} with difficulty {parsedDifficulty}");
				DailySudokuPuzzle? puzzle = await _db.DailySudokuPuzzles
					.FirstOrDefaultAsync(p => p.Date == today && p.Difficulty == parsedDifficulty);
				_logger.LogInformation($"Puzzle found: {puzzle != null}");
				if (puzzle == null)
				{
					SudokuGenerator generator = new();
					_logger.LogInformation($"Generating new puzzle for {today} with difficulty {parsedDifficulty}");
					var (puzzleBoard, solutionBoard) = generator.Generate(parsedDifficulty);
					_logger.LogInformation($"Puzzle generated successfully");
					puzzle = new DailySudokuPuzzle
					{
						Date = today,
						Difficulty = parsedDifficulty,
						Puzzle = JsonConvert.SerializeObject(puzzleBoard),
						Solution = JsonConvert.SerializeObject(solutionBoard)
					};

					_db.DailySudokuPuzzles.Add(puzzle);
					_logger.LogInformation($"Saving new puzzle to database for {today} with difficulty {parsedDifficulty}");
					await _db.SaveChangesAsync();
					_logger.LogInformation($"Puzzle saved successfully");
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