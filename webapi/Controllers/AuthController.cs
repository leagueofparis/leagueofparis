using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace webapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
		private readonly IConfiguration _configuration;
		public AuthController(IConfiguration configuration)
		{
			_configuration = configuration;
		}

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // Here, validate the user's credentials (this example uses a hardcoded check)
            if (model.Username == "testuser" && model.Password == "password")
            {
				var jwtSecret = _configuration["JWT_SECRET"];
				if (string.IsNullOrEmpty(jwtSecret))
				{
					throw new Exception("JWT_SECRET environment variable is required");
				}

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, model.Username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: "http://localhost:5159",
                    audience: "http://localhost:5159/api",
                    claims: claims,
                    expires: DateTime.Now.AddHours(1),
                    signingCredentials: creds);

				Console.WriteLine("User logged in: " + model.Username);
                return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
            }

            return Unauthorized();
        }
    }

    public class LoginModel
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}
