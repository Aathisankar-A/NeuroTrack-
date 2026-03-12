import cron from 'node-cron';
import User from '../models/User.js';
import ScoringService from '../services/scoring.service.js';
import BurnoutService from '../services/burnout.service.js';

/**
 * Weekly/Daily background jobs.
 */

// 1. Daily Scoring @ 00:10 UTC
cron.schedule('10 0 * * *', async () => {
    console.log('⏳ Running Daily Productivity Scoring Job...');
    try {
        const users = await User.find({});
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        for (const user of users) {
            await ScoringService.calculateDailyScore(user._id, yesterday);
        }
        console.log('✅ Daily Scoring Complete');
    } catch (err) {
        console.error('❌ Daily Scoring Job Failed:', err);
    }
});

// 2. Daily Burnout Risk @ 00:15 UTC
cron.schedule('15 0 * * *', async () => {
    console.log('⏳ Running Daily Burnout Risk Evaluation...');
    try {
        const users = await User.find({});
        for (const user of users) {
            await BurnoutService.evaluateBurnoutRisk(user._id);
        }
        console.log('✅ Burnout Evaluation Complete');
    } catch (err) {
        console.error('❌ Burnout Evaluation Job Failed:', err);
    }
});

console.log('⏰ Background Jobs Scheduled');
