using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UtilitiesController : ControllerBase
    {
        [HttpGet("ping")]
        public ActionResult Ping()
        {
            return Ok("Pong");
        }
    }
}