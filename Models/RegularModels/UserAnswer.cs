﻿using Microsoft.EntityFrameworkCore;

namespace TestBaza.Models
{
    public class UserAnswer
    {
        public int UserAnswerId { get; set; }

        public string? Value { get; set; }
        public int QuestionNumber { get; set; }
        private bool _isCorrect;

        [BackingField(nameof(_isCorrect))]
        public bool IsCorrect
        {
            get
            {
                Test test = Attempt!.PassingInfo!.Test!;

                if (test.AreAnswersManuallyChecked) return _isCorrect;

                Question? question = test.Questions.SingleOrDefault(q => q.Number == QuestionNumber);

                string? correctAnswer = question?.AnswerType == AnswerType.HasToBeTyped
                    ? question?.Answer
                    : question?.CorrectAnswerNumber + "";

                return correctAnswer?.Trim().ToLower() == Value?.Trim().ToLower();
            }
            set 
            { 
                if(!Attempt?.PassingInfo?.Test?.AreAnswersManuallyChecked ?? false) return;
                _isCorrect = value;
            }
        }
        public int AttemptId { get; set; }
        public Attempt? Attempt { get; set; }

        public UserAnswerJsonModel ToJsonModel()
        {
            return new UserAnswerJsonModel
            {
                Value = Value,
                IsCorrect = IsCorrect,
                QuestionNumber = QuestionNumber
            };
        }
    }
}