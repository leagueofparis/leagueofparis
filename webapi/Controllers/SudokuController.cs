using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SudokuController : ControllerBase
    {
        [HttpGet("today")]
		public IActionResult GetTodayPuzzle()
		{
			var today = DateTime.UtcNow.Date;
			var puzzle = ""; //_db.DailyPuzzles.FirstOrDefault(p => p.Date == today);

			if (puzzle == null)
			{
				// // Generate a new one
				// var generator = new SudokuGenerator(); // JS logic rewritten in C#
				// var (puzzleBoard, solutionBoard) = generator.Generate("medium");

				// puzzle = new DailyPuzzle {
				//     Date = today,
				//     PuzzleJson = JsonConvert.SerializeObject(puzzleBoard),
				//     SolutionJson = JsonConvert.SerializeObject(solutionBoard)
				// };
				// _db.DailyPuzzles.Add(puzzle);
				// _db.SaveChanges();
			}

			return Ok(new {
				// puzzle = JsonConvert.DeserializeObject<int?[][]>(puzzle.PuzzleJson),
				// solution = JsonConvert.DeserializeObject<int[][]>(puzzle.SolutionJson)
			});
		}
    }
}