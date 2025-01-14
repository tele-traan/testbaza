﻿using System.ComponentModel.DataAnnotations;

namespace TestBaza.Models.DTOs;
public class UpdateTestDto
{
public int TestId { get; set; }
[Required]
public string? TestName { get; set; }
public string? Description { get; set; }
public IFormFile? Image { get; set; }
public bool IsPrivate { get; set; }
public bool AreAnswersManuallyChecked { get; set; }
public TimeInfo TimeInfo { get; set; } = new(false, 0);
public int AllowedAttempts { get; set; }
public bool AreAttemptsLimited { get; set; }
}