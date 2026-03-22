import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './router/AppRouter';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <SocketProvider>
                        <AppRouter />
                    </SocketProvider>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
