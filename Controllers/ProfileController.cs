﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

using TestBaza.Models;
using TestBaza.Repositories;

namespace TestBaza.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly ITestsRepository _testsRepo;
        private readonly UserManager<User> _userManager;

        public ProfileController(
            ITestsRepository testsRepo,
            UserManager<User> userManager
            )
        {
            _testsRepo = testsRepo;
            _userManager = userManager;
        }

        [Route("/profile")]
        public async Task<IActionResult> Get()
        {
            User user = await _userManager.GetUserAsync(User);
            return View(viewName: "main");
        }
        [HttpGet("/profile/user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            User user = await _userManager.GetUserAsync(User);
            return Ok(new { result = user.ToJsonModel() });
        }
        [HttpGet("/profile/tests-user{id}")]
        public async Task<IActionResult> GetUserTests([FromRoute] string id)
        {
            User user = await _userManager.GetUserAsync(User);
            User creator = await _userManager.FindByIdAsync(id);

            if (creator is null) return NotFound();

            if (!user.Equals(creator)) return Forbid();

            if (!user.Tests.Any()) return NoContent();

            IEnumerable<TestSummary> summaries = creator.Tests.Select(t => t.ToSummary());
            return Ok(new { result = summaries });
        }

        [Authorize]
        [HttpPost("/profile/update-user")]
        public async Task<IActionResult> UpdateUser([FromForm] UpdateUserRequestModel model)
        {
            if (ModelState.IsValid)
            {
                User user = await _userManager.GetUserAsync(User);
                user.UserName = model.UserName;
                if (user.Email != model.Email) user.EmailConfirmed = false;
                user.Email = model.Email;
                IdentityResult result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
                if (result.Succeeded)
                {
                    return Ok();
                }
                else return BadRequest();
            }
            else return BadRequest(new { errors = ModelState });
        }
    }
}