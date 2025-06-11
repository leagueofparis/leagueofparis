using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;

namespace webapi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UtilitiesController : ControllerBase
    {
		[EnableCors("AllowReactApp")]
        [HttpGet("ping")]
        public ActionResult Ping()
        {
            return Ok("Pong");
        }
    }
}