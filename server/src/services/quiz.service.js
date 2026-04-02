import GeminiService from './gemini.service.js';
import Resource from '../models/Resource.js';

class QuizService {
    /**
     * Calls Gemini to generate a structured MCQs array.
     */
    static async generate(topic, difficulty, numQuestions, useResources, resourceIds) {
        if (!topic) throw new Error("Topic is required");
        
        const count = parseInt(numQuestions) || 5;
        const validCount = Math.min(Math.max(count, 1), 10);
        const level = difficulty || "medium";

        let resourceContext = null;
        if (useResources && resourceIds && resourceIds.length > 0) {
            const resources = await Resource.find({ _id: { $in: resourceIds } });
            if (resources.length > 0) {
                resourceContext = resources.map(r => {
                    return `Title: ${r.title}\nType: ${r.type}\nContent: ${r.notes || r.url || 'None'}`;
                }).join('\n\n');
            }
        }

        return await GeminiService.generateQuizContent(topic, level, validCount, resourceContext);
    }

    /**
     * Evaluates submitted answers array against original quiz definition.
     */
    static async evaluate(quizData, userAnswers) {
        if (!quizData || !Array.isArray(quizData)) {
            throw new Error("Invalid quiz data provided for evaluation");
        }

        let score = 0;
        const total = quizData.length;
        const incorrectSummaries = [];

        quizData.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer === q.answer) {
                score++;
            } else {
                incorrectSummaries.push({
                    question: q.question,
                    your_answer: userAnswer || "Skipped",
                    correct_answer: q.answer
                });
            }
        });

        // Generate tailored Gemini feedback
        const feedback = await GeminiService.evaluateQuizAnswers(score, total, incorrectSummaries);

        return {
            score,
            total,
            feedback,
            incorrectDetails: incorrectSummaries
        };
    }
}

export default QuizService;
