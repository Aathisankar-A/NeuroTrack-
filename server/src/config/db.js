import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Force Node.js to use Google DNS for reliable SRV record resolution
// (required for mongodb+srv:// on some networks/ISPs)
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,  // 30s — Atlas free tier can be slow to wake
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // Print a more actionable hint based on the error type
        if (error.message.includes('ECONNREFUSED')) {
            console.error('   → Connection refused. Check if the cluster is running.');
        } else if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
            console.error('   → Authentication failed. Check MONGO_URI username/password in .env');
        } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.error('   → IP not whitelisted. Add your IP in Atlas → Network Access.');
        } else if (error.message.includes('ETIMEOUT') || error.message.includes('timed out')) {
            console.error('   → Connection timed out. Check your internet connection or Atlas cluster status.');
        }
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB Error: ${err.message}`);
});
