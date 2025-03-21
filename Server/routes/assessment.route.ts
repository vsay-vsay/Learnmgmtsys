import express from "express";
import { getAllQuizzes, createQuiz } from "../controllers/assessment.controller";

const router = express.Router();

// Route to get all quizzes
router.get("/", getAllQuizzes);

// Route to create a new quiz
router.post("/", createQuiz);

export default router;
