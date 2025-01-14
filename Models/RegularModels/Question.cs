﻿using TestBaza.Models.DTOs;
using TestBaza.Models.JsonModels;

// ReSharper disable ValueParameterNotUsed
// ReSharper disable UnusedMember.Global
namespace TestBaza.Models.RegularModels;

public class Question
{
    public int QuestionId { get; set; }

    public int Number { get; set; }
    public string? Value { get; set; }
    public string? Hint { get; set; }
    public bool HintEnabled { get; set; }
    public string? ImageRoute { get; set; }

    public bool HasImage
    {
        get => !string.IsNullOrEmpty(ImageRoute) && !string.IsNullOrEmpty(ImagePhysicalPath);
        set { }
    }
    public string? ImagePhysicalPath { get; set; }
    public string? Answer { get; set; }
    public IEnumerable<Answer> MultipleAnswers { get; set; } = new List<Answer>();
    public int CorrectAnswerNumber { get; set; }
    public AnswerType AnswerType { get; set; } = AnswerType.HasToBeTyped;

    public int TestId { get; set; }
    public Test? Test { get; set; }

    public override bool Equals(object? obj)
    {
        if (obj is Question q)
            return q.QuestionId == QuestionId
                   && q.Value == Value
                   && q.Answer == Answer;
        return false;
    }

    //ReSharper disable once NonReadonlyMemberInGetHashCode
    public override int GetHashCode()
    {
        return QuestionId.GetHashCode();
    }

    public QuestionJsonModel ToJsonModel(bool includeAnswers = true)
    {
        return new QuestionJsonModel
        {
            QuestionId = QuestionId,
            Number = Number,
            Value = Value,
            ImageRoute = ImageRoute,
            HasImage = HasImage,
            Hint = Hint,
            HintEnabled = HintEnabled,
            Answer = includeAnswers ? Answer : string.Empty,
            Answers = MultipleAnswers.Select(a => a.ToJsonModel()),
            CorrectAnswerNumber = includeAnswers ? CorrectAnswerNumber : -1,
            AnswerType = (int) AnswerType
        };
    }

    public void Update(UpdateQuestionDto dto)
    {
        Value = dto.Value;
        Hint = dto.Hint;
        HintEnabled = dto.HintEnabled;
        Answer = dto.Answer;
        dto.Answers?.ToList().ForEach(a =>
        {
            var answer = MultipleAnswers.FirstOrDefault(ans => ans.AnswerId == a.AnswerId);
            if (answer is null) return;
            answer.Value = a.Value;
        });
        AnswerType = dto.AnswerType;
        CorrectAnswerNumber = dto.CorrectAnswerNumber;
    }

    public async void UpdateImage(IFormFile? image, IWebHostEnvironment environment)
    {
        if (image is null) return;
        
        if (HasImage)
        {
            if(File.Exists(ImagePhysicalPath)) File.Delete(ImagePhysicalPath);

            await using var stream = new FileStream(ImagePhysicalPath!, FileMode.Create);
            await image.CopyToAsync(stream);
        }
        else
        {
            var fileRoute = Guid.NewGuid().ToString()[..7] + image.FileName;
            
            var imageLink = $"/images/questions/{fileRoute}";
            
            var pathToImage = Path.Combine(
                environment.WebRootPath,
                "images",
                "questions",
                fileRoute
            );
            
            ImageRoute = imageLink;
            ImagePhysicalPath = pathToImage;
            
            await using var stream = new FileStream(pathToImage, FileMode.Create);
            await image.CopyToAsync(stream);
        }
    }

    public void DeleteImage()
    {
        if (!File.Exists(ImagePhysicalPath)) return;
        
        File.Delete(ImagePhysicalPath);

        ImagePhysicalPath = null;
        ImageRoute = null;
    }
}