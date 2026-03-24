/**
 * Utility functions for input validation across the app.
 */

/**
 * Validate an email address format.
 */
export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password strength.
 * Returns { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters.' };
    }
    return { valid: true, message: '' };
};

/**
 * Validate that a required string field is not empty.
 */
export const isRequired = (value) => {
    return value !== null && value !== undefined && String(value).trim().length > 0;
};

/**
 * Validate a time string in HH:MM format.
 */
export const isValidTime = (time) => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

/**
 * Validate a date string in YYYY-MM-DD format.
 */
export const isValidDate = (date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
};

/**
 * Validate that a number is within a given range (inclusive).
 */
export const isInRange = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate a URL format.
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
