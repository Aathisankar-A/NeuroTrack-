import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, authenticated } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let newSocket;
        if (authenticated && user) {
            newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
                withCredentials: true
            });

            newSocket.emit('join', user.id);
            setSocket(newSocket);

            console.log('🔌 Socket Connected');
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
                console.log('🔌 Socket Disconnected');
            }
        };
    }, [authenticated, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
