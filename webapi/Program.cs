using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Configuration.AddEnvironmentVariables();

var jwtSecret = builder.Configuration["JWT_SECRET"];
if (string.IsNullOrEmpty(jwtSecret))
{
	throw new Exception("JWT_SECRET environment variable is required");
}
// Add services to the container.
builder.Services.AddControllers();

// Configure CORS to allow requests from your React app (usually on localhost:3000)
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowReactApp",
		builder => builder.WithOrigins("http://localhost:3000", "https://leagueofparis.com")
						  .AllowAnyMethod()
						  .AllowAnyHeader()
						  .AllowCredentials());
});

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	var jwtConfig = builder.Configuration.GetSection("Jwt");

	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = jwtConfig["Issuer"],
		ValidAudience = jwtConfig["Audience"],
		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
	};
});


// Add Swagger for API documentation (optional)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("Supabase"), npgsqlOptions =>
	{
		npgsqlOptions.CommandTimeout(60); // Set command timeout to 60 seconds
		npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null); // Retry on failure
	})
);

var app = builder.Build();

// Use CORS policy
app.UseCors("AllowReactApp");
app.UseAuthentication();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

