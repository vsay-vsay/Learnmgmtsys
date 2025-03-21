import { Request, Response } from "express";

// Mock data for quizzes
const quizzes = [
    { id: 1, title: "Quiz 1", questions: [] },
    { id: 2, title: "Quiz 2", questions: [] },
];

// Function to get all quizzes
export const getAllQuizzes = (req: Request, res: Response): Response => {
    return res.status(200).json({
        success: true,
        data: quizzes,
    });
};

// Function to create a new quiz
export const createQuiz = (req: Request, res: Response): Response => {
    const { title, questions } = req.body;
    const newQuiz = { id: quizzes.length + 1, title, questions };
    quizzes.push(newQuiz);

    return res.status(201).json({
        success: true,
        message: "Quiz created successfully",
        quiz: newQuiz,
    });
};
