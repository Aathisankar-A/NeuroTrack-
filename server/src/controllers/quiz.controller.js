import QuizService from '../services/quiz.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

class QuizController {
    /**
     * Generate new quiz block
     * POST /api/quiz/generate
     * body: { topic, difficulty, numQuestions }
     */
    static generate = asyncHandler(async (req, res) => {
        const { topic, difficulty, numQuestions, useResources, resourceIds } = req.body;
        const quiz = await QuizService.generate(topic, difficulty, numQuestions, useResources, resourceIds);
        
        res.json(ApiResponse.success(quiz, 'Quiz generated successfully'));
    });

    /**
     * Evaluate submitted quiz block
     * POST /api/quiz/evaluate
     * body: { quizData, userAnswers }
     */
    static evaluate = asyncHandler(async (req, res) => {
        const { quizData, userAnswers } = req.body;
        const result = await QuizService.evaluate(quizData, userAnswers);

        res.json(ApiResponse.success(result, 'Quiz evaluated successfully'));
    });
}

export default QuizController;
