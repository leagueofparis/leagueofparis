using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private static readonly string[] exampleUsers = ["user1", "user2"];

        // GET api/users
        [HttpGet]
        public ActionResult Get()
        {
            return Ok(exampleUsers);
        }
    }
}