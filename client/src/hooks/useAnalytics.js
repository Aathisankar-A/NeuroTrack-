import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook for fetching analytics data.
 */
const useAnalytics = () => {
    const [overview, setOverview] = useState(null);
    const [weeklyTrend, setWeeklyTrend] = useState([]);
    const [burnoutRisk, setBurnoutRisk] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/analytics/overview');
            setOverview(res.data.data);
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch analytics overview');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWeeklyTrend = useCallback(async () => {
        try {
            const res = await api.get('/analytics/weekly');
            setWeeklyTrend(res.data.data || []);
            return res.data.data || [];
        } catch (err) {
            console.error('Failed to fetch weekly trend', err);
            return [];
        }
    }, []);

    const fetchBurnoutRisk = useCallback(async () => {
        try {
            const res = await api.get('/analytics/burnout');
            setBurnoutRisk(res.data.data);
            return res.data.data;
        } catch (err) {
            console.error('Failed to fetch burnout risk', err);
            return null;
        }
    }, []);

    return {
        overview,
        weeklyTrend,
        burnoutRisk,
        loading,
        error,
        fetchOverview,
        fetchWeeklyTrend,
        fetchBurnoutRisk,
    };
};

export default useAnalytics;
