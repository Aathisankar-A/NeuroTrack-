import api from './axios';

export const getDailyScore = () => api.get('/analytics/daily');
export const getWeeklyScores = () => api.get('/analytics/weekly');
export const getSubjectEfficiency = () => api.get('/analytics/subjects');
export const getBurnoutRisk = () => api.get('/analytics/burnout');
export const getStreak = () => api.get('/analytics/streak');
