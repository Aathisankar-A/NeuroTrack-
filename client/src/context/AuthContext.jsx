import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../api/auth.api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await authApi.getMe();
                setUser(res.data.data);
                setAuthenticated(true);
            } catch (err) {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Global listener for interceptor-triggered logouts
        const handleLogout = () => {
            setUser(null);
            setAuthenticated(false);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        setUser(res.data.data.user);
        setAuthenticated(true);
        return res.data.data;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        setAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, authenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
