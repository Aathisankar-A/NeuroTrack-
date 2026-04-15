import Duel from '../models/Duel.js';
import User from '../models/User.js';

class DuelService {
    static async createDuel(challengerId, opponentId, duration) {
        return await Duel.create({
            challenger: challengerId,
            opponent: opponentId,
            duration
        });
    }

    static async acceptDuel(duelId) {
        return await Duel.findByIdAndUpdate(duelId, { status: 'active' }, { new: true });
    }

    static async completeDuel(duelId, challengerScore, opponentScore) {
        const duel = await Duel.findById(duelId);
        if (!duel) throw new Error('Duel not found');

        let winnerId = null;
        if (challengerScore > opponentScore) winnerId = duel.challenger;
        else if (opponentScore > challengerScore) winnerId = duel.opponent;

        duel.status = 'completed';
        duel.results = { challengerScore, opponentScore };
        duel.winner = winnerId;
        await duel.save();

        if (winnerId) {
            await User.findByIdAndUpdate(winnerId, { $inc: { neuroCoins: 50, xp: 100 } });
        }

        return duel;
    }
}

export default DuelService;
