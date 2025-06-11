using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
		[EnableCors("AllowReactApp")]
		[AllowAnonymous]
        [HttpPost("send-to-me")]
        public async Task<ActionResult> SendToMe([FromBody] EmailRequest request)
        {
			var subject = request.Subject;
			var html = request.Html;
			Console.WriteLine("Sending email to me");
			Console.WriteLine(subject);
			Console.WriteLine(html);

			var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY");
			var client = new HttpClient();
			client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

			var payload = new
			{
				from = "League of Paris <noreply@leagueofparis.com>",
				to = "brendan612@gmail.com",
				subject = subject,
				html = html
			};

			Console.WriteLine(JsonSerializer.Serialize(payload));
			Console.WriteLine(apiKey);

			var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
			var response = await client.PostAsync("https://api.resend.com/emails", content);

			if (!response.IsSuccessStatusCode)
			{
				var error = await response.Content.ReadAsStringAsync();
				throw new Exception($"Failed to send email: {error}");
			}
			return Ok("Email sent");
		}

		public class EmailRequest
		{
			public string Subject { get; set; }
			public string Html { get; set; }
			public string CaptchaToken { get; set; }
		}
	}

	public class CaptchaRequest
	{
		public string CaptchaToken { get; set; }
		// ...other fields
	}
}