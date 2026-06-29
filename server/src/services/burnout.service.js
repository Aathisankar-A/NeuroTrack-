import Session from '../models/Session.js';
import ProductivityScore from '../models/ProductivityScore.js';
import BurnoutLog from '../models/BurnoutLog.js';

class BurnoutService {
    /**
     * Evaluates burnout risk for a user based on last 7 days.
     * Factors: Energy Decline, High Session Frequency, Productivity Drop, High Workload.
     */
    static async evaluateBurnoutRisk(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

        // 1. Data Aggregation
        const recentSessions = await Session.find({
            userId,
            startedAt: { $gte: sevenDaysAgo },
            status: { $in: ['completed', 'stopped early', 'abandoned'] }
        }).sort({ startedAt: 1 });

        const recentScores = await ProductivityScore.find({
            userId,
            date: { $gte: sevenDaysAgo },
        }).sort({ date: 1 });

        // 2. Factors Analysis

        // A. Energy Trend Analysis (Last 3 days vs previous 4 days)
        const midPoint = new Date();
        midPoint.setDate(midPoint.getDate() - 3);
        midPoint.setUTCHours(0, 0, 0, 0);

        const firstHalfEnergy = recentSessions
            .filter(s => s.startedAt < midPoint)
            .reduce((sum, s) => sum + s.energyLevel, 0) / (recentSessions.filter(s => s.startedAt < midPoint).length || 1);

        const secondHalfEnergy = recentSessions
            .filter(s => s.startedAt >= midPoint)
            .reduce((sum, s) => sum + s.energyLevel, 0) / (recentSessions.filter(s => s.startedAt >= midPoint).length || 1);

        const energyDecline = secondHalfEnergy < firstHalfEnergy * 0.8 || secondHalfEnergy < 4;

        // B. Workload Intensity (Sessions per day & Total Duration)
        const totalDuration = recentSessions.reduce((sum, s) => {
            const actual = s.actualDuration !== undefined ? s.actualDuration : (s.status === 'completed' ? s.duration : 0);
            return sum + actual;
        }, 0);
        const avgDailyDuration = totalDuration / 7;
        const sessionsPerDay = recentSessions.length / 7;

        const highWorkload = avgDailyDuration > 240 || sessionsPerDay > 6; // > 4 hours/day or > 6 sessions/day

        // C. Productivity Volatility / Drop
        const scores = recentScores.map(s => s.score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
        const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;

        const productivityDrop = latestScore < avgScore * 0.7 && avgScore > 40;

        // 3. Multi-Factor Weighted Scoring
        let riskScore = 0;
        if (energyDecline) riskScore += 45;
        if (highWorkload) riskScore += 30;
        if (productivityDrop) riskScore += 25;

        let riskLevel = 'Low';
        if (riskScore >= 75) riskLevel = 'High';
        else if (riskScore >= 40) riskLevel = 'Medium';

        // 4. Persistence & Logging — upsert one record per user per day
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const log = await BurnoutLog.findOneAndUpdate(
            { userId, evaluatedAt: { $gte: todayStart } },
            {
                riskLevel,
                riskScore,
                factors: {
                    energyDecline,
                    highWorkload,
                    productivityDrop,
                },
                evaluatedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        return log;
    }
}

export default BurnoutService;
