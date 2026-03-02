/**
 * Application-wide constants.
 */

// Gemini model to use for all AI features
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Burnout risk thresholds
export const BURNOUT_RISK = {
    HIGH_THRESHOLD: 75,
    MEDIUM_THRESHOLD: 40,
};

// Productivity score weights
export const SCORING = {
    FOCUS_WEIGHT: 0.5,       // per minute of deep focus
    TASK_WEIGHT: 30,          // for 100% task completion rate
    STREAK_WEIGHT: 2,         // per day of streak (capped at 10)
    STREAK_CAP: 10,           // max streak days counted
    DISTRACTION_PENALTY: 2,   // per distraction count
    MAX_SCORE: 100,
};

// Session status values
export const SESSION_STATUS = {
    SCHEDULED: 'scheduled',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    MISSED: 'missed',
};

// Task difficulty levels
export const TASK_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
};

// User roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
};

// XP multiplier for daily score
export const XP_PER_SCORE_POINT = 2;
