import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`📡 New Socket Connection: ${socket.id}`);

        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`👤 User joined room: ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};
