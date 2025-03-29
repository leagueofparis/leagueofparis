using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options)
		: base(options) { }

	public DbSet<DailySudokuPuzzle> DailySudokuPuzzles => Set<DailySudokuPuzzle>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		var jsonConverter = new StringToJsonElementConverter();

		modelBuilder.Entity<DailySudokuPuzzle>()
			.Property(e => e.Puzzle)
			.HasConversion(jsonConverter)
			.HasColumnType("jsonb");

		modelBuilder.Entity<DailySudokuPuzzle>()
			.Property(e => e.Solution)
			.HasConversion(jsonConverter)
			.HasColumnType("jsonb");

		modelBuilder.Entity<DailySudokuPuzzle>()
			.Property(p => p.Difficulty)
			.HasConversion(
				// Converts enum to string when saving to DB
				v => v.ToString(),
				// Converts string from DB back to enum
				v => (Difficulty)Enum.Parse(typeof(Difficulty), v)
			);

		base.OnModelCreating(modelBuilder);
	}
}

public class StringToJsonElementConverter : ValueConverter<string, JsonElement>
{
	public StringToJsonElementConverter(ConverterMappingHints? mappingHints = null)
		: base(
			v => string.IsNullOrWhiteSpace(v)
					? JsonDocument.Parse("null", new JsonDocumentOptions()).RootElement
					: JsonDocument.Parse(v, new JsonDocumentOptions()).RootElement,
			v => v.GetRawText(),
			mappingHints)
	{ }
}