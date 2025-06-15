using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace webapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
		private readonly IConfiguration _configuration;
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly HttpClient _httpClient;

		public AuthController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
		{
			_configuration = configuration;
			_httpClientFactory = httpClientFactory;
			_httpClient = _httpClientFactory.CreateClient();
		}

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // For demonstration, use hardcoded credentials. Replace with DB check in production.
            if (model.Username == "test" && model.Password == "test")
            {
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, model.Username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(1),
                    signingCredentials: creds
                );

                var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
                return Ok(new { jwtToken });
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpGet("discord/callback")]
        public async Task<IActionResult> DiscordCallback([FromQuery] string code)
        {
            try
            {
				var clientId = Environment.GetEnvironmentVariable("DISCORD_CLIENT_ID") ?? "";
				var clientSecret = Environment.GetEnvironmentVariable("DISCORD_SECRET") ?? "";
				var redirectUri = Environment.GetEnvironmentVariable("DISCORD_REDIRECT_URI") ?? "";
				var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "";
				var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "";
				Console.WriteLine(clientId);
				Console.WriteLine(clientSecret);
				Console.WriteLine(redirectUri);
                var tokenResponse = await _httpClient.PostAsync("https://discord.com/api/oauth2/token", new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["grant_type"] = "authorization_code",
                    ["code"] = code,
                    ["redirect_uri"] = redirectUri
                }));

                if (!tokenResponse.IsSuccessStatusCode)
                {
					Console.WriteLine(await tokenResponse.Content.ReadAsStringAsync());
                    return BadRequest("Failed to get Discord access token");
                }

                var tokenData = await tokenResponse.Content.ReadFromJsonAsync<DiscordTokenResponse>();
                // Get user info from Discord
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenData.AccessToken);
                var userResponse = await _httpClient.GetAsync("https://discord.com/api/users/@me");
                Console.WriteLine(await userResponse.Content.ReadAsStringAsync());
                if (!userResponse.IsSuccessStatusCode)
                {
                    return BadRequest("Failed to get Discord user info");
                }

                var userData = await userResponse.Content.ReadFromJsonAsync<DiscordUserResponse>();
				if (userData == null)
				{
					return BadRequest("Failed to get Discord user info");
				}

				var userRole = "user";
				if (userData.Id == "1288610223896006778" || userData.Id == "105858401497546752")
				{
					userRole = "admin";
				}

                // Create JWT token for the user
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, userData.Id),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("username", userData.Username),
                    new Claim("discord_id", userData.Id),
                    new Claim("email", userData.Email),
					new Claim("avatar", userData.Avatar),
					new Claim("role", userRole)
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var token = new JwtSecurityToken(
                    issuer: frontendUrl,
                    audience: frontendUrl,
                    claims: claims,
                    expires: DateTime.Now.AddHours(1),
                    signingCredentials: creds
                );

                var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
                
                // Redirect to frontend with the token
                return Redirect($"{frontendUrl}/discord/callback?token={jwtToken}");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error during Discord authentication: {ex.Message}");
            }
        }
    }

    public class LoginModel
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    public class DiscordTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }

        [JsonPropertyName("scope")]
        public string Scope { get; set; }
    }

    public class DiscordUserResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("discriminator")]
        public string Discriminator { get; set; }

        [JsonPropertyName("avatar")]
        public string Avatar { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }
    }
}
