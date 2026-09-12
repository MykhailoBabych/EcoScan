import { getRandomQuestions, QUESTIONS_PER_QUIZ, QUIZ_QUESTIONS } from "../quiz";

describe("quiz questions", () => {
  it("has unique ids", () => {
    const ids = QUIZ_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has four distinct options and a valid answer for every question", () => {
    for (const question of QUIZ_QUESTIONS) {
      expect(new Set(question.options).size).toBe(4);
      expect(question.options[question.correctIndex]).toBeTruthy();
    }
  });

  it("has enough questions for a full quiz", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(QUESTIONS_PER_QUIZ);
  });
});

describe("getRandomQuestions", () => {
  it("returns the requested number of distinct questions", () => {
    const questions = getRandomQuestions();
    expect(questions).toHaveLength(QUESTIONS_PER_QUIZ);
    expect(new Set(questions.map((question) => question.id)).size).toBe(QUESTIONS_PER_QUIZ);
  });

  it("does not reorder the source list", () => {
    const before = QUIZ_QUESTIONS.map((question) => question.id);
    getRandomQuestions(10);
    expect(QUIZ_QUESTIONS.map((question) => question.id)).toEqual(before);
  });
});
