/**
 * Utility functions for formatting values across the app.
 */

/**
 * Format minutes into a human-readable duration string.
 * e.g. 90 → "1h 30m", 45 → "45m"
 */
export const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

/**
 * Format a date string or Date object to a readable short date.
 * e.g. "2024-05-22" → "May 22"
 */
export const formatShortDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Format a date string or Date object to a full readable date.
 * e.g. "2024-05-22" → "Wednesday, May 22, 2024"
 */
export const formatFullDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Format a number as a percentage string.
 * e.g. 0.75 → "75%"
 */
export const formatPercent = (value, decimals = 0) => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format seconds into MM:SS or HH:MM:SS.
 * e.g. 3661 → "1:01:01"
 */
export const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate a string to a max length with ellipsis.
 */
export const truncate = (str, maxLength = 50) => {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
};
