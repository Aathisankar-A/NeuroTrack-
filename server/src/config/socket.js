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
            console.log(`👤 User joined personal room: ${userId}`);
        });

        // Room Events
        socket.on('room:join', ({ roomId, userId }) => {
            socket.join(roomId);
            console.log(`👥 User ${userId} joined study room: ${roomId}`);
            socket.to(roomId).emit('room:participant:joined', { userId });
        });

        socket.on('room:leave', ({ roomId, userId }) => {
            socket.leave(roomId);
            console.log(`👋 User ${userId} left study room: ${roomId}`);
            socket.to(roomId).emit('room:participant:left', { userId });
        });

        // Timer Sync
        socket.on('room:timer:start', ({ roomId, duration }) => {
            io.to(roomId).emit('room:timer:sync', { status: 'running', duration, startedAt: Date.now() });
        });

        socket.on('room:timer:pause', ({ roomId }) => {
            io.to(roomId).emit('room:timer:sync', { status: 'paused' });
        });

        // Participant Status
        socket.on('room:participant:status', ({ roomId, userId, status }) => {
            socket.to(roomId).emit('room:participant:status:update', { userId, status });
        });

        // Interactive Reactions
        socket.on('room:reaction', ({ roomId, userId, type }) => {
            socket.to(roomId).emit('room:reaction:received', { userId, type });
        });

        // Chat Events
        socket.on('chat:message', (messageData) => {
            // messageData should contain { roomId, sender, content, type, createdAt }
            io.to(messageData.roomId).emit('chat:message:received', messageData);
        });

        socket.on('chat:typing', ({ roomId, name }) => {
            socket.to(roomId).volatile.emit('chat:typing:received', { name });
        });

        // Whiteboard Events
        socket.on('whiteboard:draw', ({ roomId, strokeData }) => {
            socket.to(roomId).emit('whiteboard:draw:received', strokeData);
        });

        socket.on('whiteboard:clear', ({ roomId }) => {
            socket.to(roomId).emit('whiteboard:clear:received');
        });

        // Notes Events
        socket.on('notes:update', ({ roomId, content }) => {
            socket.to(roomId).emit('notes:update:received', content);
        });

        // Cursor Tracking
        socket.on('cursor:move', ({ roomId, userId, name, x, y }) => {
            socket.to(roomId).volatile.emit('cursor:move:received', { userId, name, x, y });
        });

        // WebRTC Signaling
        socket.on('webrtc:offer', ({ to, from, offer }) => {
            io.to(to).emit('webrtc:offer:received', { from, offer });
        });

        socket.on('webrtc:answer', ({ to, from, answer }) => {
            io.to(to).emit('webrtc:answer:received', { from, answer });
        });

        socket.on('webrtc:ice-candidate', ({ to, from, candidate }) => {
            io.to(to).emit('webrtc:ice-candidate:received', { from, candidate });
        });

        socket.on('webrtc:join-media', ({ roomId, userId }) => {
            socket.to(roomId).emit('webrtc:user-joined-media', { userId });
        });

        socket.on('webrtc:leave-media', ({ roomId, userId }) => {
            socket.to(roomId).emit('webrtc:user-left-media', { userId });
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
