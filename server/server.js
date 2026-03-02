import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/config/socket.js';

/**
 * Server Entry Point.
 */
const startServer = async () => {
    // Connect to DB first
    await connectDB();

    const server = app.listen(env.PORT, () => {
        console.log(`
      🚀 NeuroTrack Server running in ${env.NODE_ENV} mode
      📡 Port: ${env.PORT}
      🏠 URL: http://localhost:${env.PORT}
    `);
    });

    // Initialize Socket.io
    initSocket(server);

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
        console.error(`❌ Unhandled Rejection: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
};

startServer();
