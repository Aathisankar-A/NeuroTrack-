import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook for managing session CRUD operations and state.
 */
const useSession = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSessions = useCallback(async (date) => {
        setLoading(true);
        setError(null);
        try {
            const params = date ? `?date=${date}` : '';
            const res = await api.get(`/sessions${params}`);
            const sorted = (res.data.data || []).sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
            );
            setSessions(sorted);
            return sorted;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch sessions');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createSession = useCallback(async (formData) => {
        const res = await api.post('/sessions', formData);
        return res.data.data;
    }, []);

    const startSession = useCallback(async (id) => {
        const res = await api.patch(`/sessions/${id}/start`);
        const updated = res.data.data;
        setSessions(prev => prev.map(s => s._id === id ? updated : s));
        return updated;
    }, []);

    const pauseSession = useCallback(async (id) => {
        const res = await api.patch(`/sessions/${id}/pause`);
        const updated = res.data.data;
        setSessions(prev => prev.map(s => s._id === id ? updated : s));
        return updated;
    }, []);

    const resumeSession = useCallback(async (id) => {
        const res = await api.patch(`/sessions/${id}/resume`);
        const updated = res.data.data;
        setSessions(prev => prev.map(s => s._id === id ? updated : s));
        return updated;
    }, []);

    const completeSession = useCallback(async (id, formData) => {
        const res = await api.patch(`/sessions/${id}/complete`, formData);
        const updated = res.data.data;
        setSessions(prev => prev.map(s => s._id === id ? updated : s));
        return updated;
    }, []);

    const deleteSession = useCallback(async (id) => {
        await api.delete(`/sessions/${id}`);
        setSessions(prev => prev.filter(s => s._id !== id));
    }, []);

    return {
        sessions,
        loading,
        error,
        fetchSessions,
        createSession,
        startSession,
        pauseSession,
        resumeSession,
        completeSession,
        deleteSession,
        setSessions,
    };
};

export default useSession;
