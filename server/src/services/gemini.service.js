import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from '../config/env.js';
import ApiResponse from '../utils/apiResponse.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

class GeminiService {
    /**
     * Generates personalized cognitive insights based on user data.
     */
    static async getPerformanceInsights(userDataSummary) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an AI Cognitive Performance Coach for the NeuroTrack app.
        Analyze the following user data from the last 7 days and provide 3 actionable insights.
        
        Data Summary:
        ${JSON.stringify(userDataSummary, null, 2)}
        
        Return the response in JSON format:
        {
          "headline": "A short summary of the overall trend",
          "insights": [
             { "title": "...", "description": "...", "impact": "High/Medium/Low" }
          ],
          "recommendation": "One major thing to change tomorrow",
          "burnoutPrevention": {
            "title": "Burnout Prevention",
            "description": "Specific advice to avoid fatigue",
            "metric": "Energy Stability Score",
            "value": 0-100
          },
          "adaptivePlan": {
            "title": "Learning Adaptive Plan",
            "description": "Specific adjustment for learning efficiency",
            "metric": "Learning Success Rate",
            "value": 0-100
          }
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Basic JSON extraction (Gemini sometimes adds markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini API Error:", err);
            return { headline: "AI unavailable", insights: [], recommendation: "Keep tracking to see insights soon." };
        }
    }
    /**
     * Analyzes productivity data with strict formatting
     */
    static async analyzeProductivity(data) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an AI Cognitive Performance Coach.
        Analyze the following user data from the last 7 days.
        
        Data:
        ${JSON.stringify(data, null, 2)}
        
        Return the response EXACTLY in this JSON format:
        {
          "summary": "A short 1-2 sentence summary of overall performance.",
          "strengths": "1-2 sentences highlighting what they do best, such as strong subjects or session consistency.",
          "weak_areas": "1-2 sentences pointing out low focus or missed tasks.",
          "suggestions": "A practical 1-2 sentence recommendation for improvement."
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini API Error:", err);
            throw new Error("Unable to generate insights");
        }
    }

    /**
     * Generates a multiple choice quiz based on topic, difficulty, and count.
     */
    static async generateQuizContent(topic, difficulty, numQuestions, resourceContext = null) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = `You are an expert educational AI.\n`;
            if (resourceContext && resourceContext.length > 0) {
                prompt += `Formulate the quiz precisely based on the following student notes/resources provided:\n\n=== RESOURCES ===\n${resourceContext}\n================\n\n`;
            }

            prompt += `Generate exactly ${numQuestions} multiple choice questions on the topic of "${topic}".
        The difficulty level should be: ${difficulty}.
        
        Each question must have exactly 4 options and 1 correct answer.
        Return the response EXACTLY as a JSON array in the following format:
        [
          {
            "question": "Question text here",
            "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
            "answer": "Option B text"
          }
        ]
        Do not include markdown blocks or any other text, only the raw JSON array.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini Quiz API Error:", err);
            throw new Error("Unable to generate quiz. Try again.");
        }
    }

    /**
     * Evaluates quiz results and generates targeted feedback.
     */
    static async evaluateQuizAnswers(score, total, incorrectSummaries) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an expert tutor. A student just took a quiz and scored ${score}/${total}.
        Here is a summary of what they got wrong: 
        ${incorrectSummaries.length > 0 ? JSON.stringify(incorrectSummaries) : "Perfect score! No mistakes."}
        
        Provide a concise, encouraging 1-2 sentence feedback focusing on their weak areas or praising their perfect score.
        Do not output JSON, just plain text feedback.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (err) {
            console.error("Gemini Eval Error:", err);
            return "Good effort! Keep practicing to improve further.";
        }
    }

    /**
     * Generates study questions based on a topic and optional provided resources.
     */
    static async generateQuestions(topic, resourceContext = null) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = `You are an expert tutor for a student studying the topic: "${topic}".\n`;
            
            if (resourceContext && resourceContext.length > 0) {
                prompt += `The student has provided the following personal study resources/notes. Please use this context heavily when forming your questions:\n\n=== RESOURCES ===\n${resourceContext}\n================\n\n`;
            }

            prompt += `Please generate a helpful study guide in exactly this JSON format:
{
  "conceptual": [
    { "q": "deep conceptual question", "hint": "brief hint" }
  ],
  "practice": [
    { "q": "practical application question", "hint": "brief hint" }
  ]
}
Return EXACTLY valid JSON, ensuring 2 conceptual and 3 practice questions.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini Question Gen Error:", err);
            throw new Error("Unable to generate questions");
        }
    }

    /**
     * Generates a structured study plan with specific tasks and durations based on a goal.
     */
    static async generateStudyPlan(goal, durationMinutes) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an expert Study Coach AI.
        A student wants to achieve the following learning goal: "${goal}".
        They have exactly ${durationMinutes} minutes available for this study session.

        Please build a highly structured study plan for this session. Breaks should be included to prevent burnout.
        Return the response EXACTLY as a JSON array of tasks in the following format:
        [
          {
            "subject": "Topic or Subject Name",
            "description": "Specific action to take",
            "duration": 25,
            "type": "learning" // Or "practice", "break", "review"
          }
        Analyze the following user data from the last 7 days and provide 3 actionable insights.
        
        Data Summary:
        ${JSON.stringify(userDataSummary, null, 2)}
        
        Return the response in JSON format:
        {
          "headline": "A short summary of the overall trend",
          "insights": [
             { "title": "...", "description": "...", "impact": "High/Medium/Low" }
          ],
          "recommendation": "One major thing to change tomorrow",
          "burnoutPrevention": {
            "title": "Burnout Prevention",
            "description": "Specific advice to avoid fatigue",
            "metric": "Energy Stability Score",
            "value": 0-100
          },
          "adaptivePlan": {
            "title": "Learning Adaptive Plan",
            "description": "Specific adjustment for learning efficiency",
            "metric": "Learning Success Rate",
            "value": 0-100
          }
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Basic JSON extraction (Gemini sometimes adds markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini API Error:", err);
            return { headline: "AI unavailable", insights: [], recommendation: "Keep tracking to see insights soon." };
        }
    }
    /**
     * Analyzes productivity data with strict formatting
     */
    static async analyzeProductivity(data) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an AI Cognitive Performance Coach.
        Analyze the following user data from the last 7 days.
        
        Data:
        ${JSON.stringify(data, null, 2)}
        
        Return the response EXACTLY in this JSON format:
        {
          "summary": "A short 1-2 sentence summary of overall performance.",
          "strengths": "1-2 sentences highlighting what they do best, such as strong subjects or session consistency.",
          "weak_areas": "1-2 sentences pointing out low focus or missed tasks.",
          "suggestions": "A practical 1-2 sentence recommendation for improvement."
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini API Error:", err);
            throw new Error("Unable to generate insights");
        }
    }

    /**
     * Generates a multiple choice quiz based on topic, difficulty, and count.
     */
    static async generateQuizContent(topic, difficulty, numQuestions, resourceContext = null) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = `You are an expert educational AI.\n`;
            if (resourceContext && resourceContext.length > 0) {
                prompt += `Formulate the quiz precisely based on the following student notes/resources provided:\n\n=== RESOURCES ===\n${resourceContext}\n================\n\n`;
            }

            prompt += `Generate exactly ${numQuestions} multiple choice questions on the topic of "${topic}".
        The difficulty level should be: ${difficulty}.
        
        Each question must have exactly 4 options and 1 correct answer.
        Return the response EXACTLY as a JSON array in the following format:
        [
          {
            "question": "Question text here",
            "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
            "answer": "Option B text"
          }
        ]
        Do not include markdown blocks or any other text, only the raw JSON array.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini Quiz API Error:", err);
            throw new Error("Unable to generate quiz. Try again.");
        }
    }

    /**
     * Evaluates quiz results and generates targeted feedback.
     */
    static async evaluateQuizAnswers(score, total, incorrectSummaries) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an expert tutor. A student just took a quiz and scored ${score}/${total}.
        Here is a summary of what they got wrong: 
        ${incorrectSummaries.length > 0 ? JSON.stringify(incorrectSummaries) : "Perfect score! No mistakes."}
        
        Provide a concise, encouraging 1-2 sentence feedback focusing on their weak areas or praising their perfect score.
        Do not output JSON, just plain text feedback.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (err) {
            console.error("Gemini Eval Error:", err);
            return "Good effort! Keep practicing to improve further.";
        }
    }

    /**
     * Generates study questions based on a topic and optional provided resources.
     */
    static async generateQuestions(topic, resourceContext = null) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = `You are an expert tutor for a student studying the topic: "${topic}".\n`;
            
            if (resourceContext && resourceContext.length > 0) {
                prompt += `The student has provided the following personal study resources/notes. Please use this context heavily when forming your questions:\n\n=== RESOURCES ===\n${resourceContext}\n================\n\n`;
            }

            prompt += `Please generate a helpful study guide in exactly this JSON format:
{
  "conceptual": [
    { "q": "deep conceptual question", "hint": "brief hint" }
  ],
  "practice": [
    { "q": "practical application question", "hint": "brief hint" }
  ]
}
Return EXACTLY valid JSON, ensuring 2 conceptual and 3 practice questions.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini Question Gen Error:", err);
            throw new Error("Unable to generate questions");
        }
    }

    /**
     * Generates a structured study plan with specific tasks and durations based on a goal.
     */
    static async generateStudyPlan(goal, durationMinutes) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        You are an expert Study Coach AI.
        A student wants to achieve the following learning goal: "${goal}".
        They have exactly ${durationMinutes} minutes available for this study session.

        Please build a highly structured study plan for this session. Breaks should be included to prevent burnout.
        Return the response EXACTLY as a JSON array of tasks in the following format:
        [
          {
            "subject": "Topic or Subject Name",
            "description": "Specific action to take",
            "duration": 25,
            "type": "learning" // Or "practice", "break", "review"
          }
        ]
        Make sure the sum of all task durations strictly equals ${durationMinutes} minutes.
        Do not include markdown blocks or any other text, only the raw JSON array.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
        } catch (err) {
            console.error("Gemini Study Plan Gen Error:", err);
            throw new Error("Unable to generate study plan");
        }
    }

    // Room Facilitation Methods
    static async analyzeRoomChat(chatHistory, context) {
        try {
            const prompt = `
            You are a helpful AI study facilitator named "NeuroBot" present in a real-time collaborative study room.
            The current room context is: ${context}
            
            Here is the recent chat history between users:
            ${chatHistory}
            
            Analyze the chat. If they are stuck, confused, or off-topic, provide a helpful, encouraging, and brief response (max 2 sentences) to guide them or answer their implied question.
            If they are doing well and don't need help, return exactly: "NO_ACTION_NEEDED".
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            
            return text;
        } catch (error) {
            console.error('Gemini API Error (Room Chat):', error);
            return "NO_ACTION_NEEDED";
        }
    }

    static async generateTopicPrompt(topic) {
        try {
            const prompt = `Generate a thought-provoking, 1-sentence discussion question about the study topic: ${topic}. It should spark collaborative discussion.`;
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('Gemini API Error (Topic Prompt):', error);
            return "What's the most interesting thing you've learned about this topic so far?";
        }
    }
}

export default GeminiService;
