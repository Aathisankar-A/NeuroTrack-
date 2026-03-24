import api from './axios';

export const generateQuestions = (data) => api.post('/ai/questions', data);
export const generatePlan = (data) => api.post('/ai/plan', data);
