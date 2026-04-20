import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import useAuth from './useAuth';

export const useRoom = (roomId) => {
    const socket = useSocket();
    const { user } = useAuth();
    
    const [participants, setParticipants] = useState([]);
    const [timer, setTimer] = useState({ status: 'idle', duration: 25, startedAt: null });
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        if (!socket || !roomId || !user) return;

        // Join room
        socket.emit('room:join', { roomId, userId: user.id });

        // Listen for new participants
        socket.on('room:participant:joined', ({ userId }) => {
            setParticipants(prev => [...prev.filter(p => p.id !== userId), { id: userId, status: 'focused' }]);
        });

        // Listen for participants leaving
        socket.on('room:participant:left', ({ userId }) => {
            setParticipants(prev => prev.filter(p => p.id !== userId));
        });

        // Timer Sync
        socket.on('room:timer:sync', (timerState) => {
            setTimer(timerState);
        });

        // Participant status updates
        socket.on('room:participant:status:update', ({ userId, status }) => {
            setParticipants(prev => prev.map(p => p.id === userId ? { ...p, status } : p));
        });

        // Reactions
        socket.on('room:reaction:received', (reaction) => {
            setReactions(prev => [...prev, reaction]);
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r !== reaction));
            }, 3000);
        });

        return () => {
            socket.emit('room:leave', { roomId, userId: user.id });
            socket.off('room:participant:joined');
            socket.off('room:participant:left');
            socket.off('room:timer:sync');
            socket.off('room:participant:status:update');
            socket.off('room:reaction:received');
        };
    }, [socket, roomId, user]);

    const startTimer = useCallback((duration) => {
        if (socket) socket.emit('room:timer:start', { roomId, duration });
    }, [socket, roomId]);

    const pauseTimer = useCallback(() => {
        if (socket) socket.emit('room:timer:pause', { roomId });
    }, [socket, roomId]);

    const sendStatus = useCallback((status) => {
        if (socket && user) socket.emit('room:participant:status', { roomId, userId: user.id, status });
    }, [socket, roomId, user]);

    const sendReaction = useCallback((type) => {
        if (socket && user) socket.emit('room:reaction', { roomId, userId: user.id, type });
    }, [socket, roomId, user]);

    return {
        participants,
        timer,
        reactions,
        startTimer,
        pauseTimer,
        sendStatus,
        sendReaction
    };
};
