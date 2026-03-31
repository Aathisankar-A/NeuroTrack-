import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * BurnoutIndicator — displays a user's current burnout risk level
 * with appropriate color coding and icon.
 *
 * Props:
 *   riskLevel: 'Low' | 'Medium' | 'High'
 *   riskScore: number (0–100)
 *   compact: boolean — if true, renders a smaller inline badge
 */
const BurnoutIndicator = ({ riskLevel = 'Low', riskScore = 0, compact = false }) => {
    const config = {
        Low: {
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-100 dark:border-green-900/30',
            label: 'Low Risk',
            description: 'Your energy and productivity levels look healthy.',
        },
        Medium: {
            icon: AlertCircle,
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-100 dark:border-yellow-900/30',
            label: 'Medium Risk',
            description: 'Signs of fatigue detected. Consider taking breaks.',
        },
        High: {
            icon: AlertTriangle,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-100 dark:border-red-900/30',
            label: 'High Risk',
            description: 'Burnout indicators are elevated. Rest is recommended.',
        },
    };

    const { icon: Icon, color, bg, border, label, description } = config[riskLevel] || config.Low;

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${bg} ${color} border ${border}`}>
                <Icon size={12} />
                {label}
            </span>
        );
    }

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${bg} ${border}`}>
            <div className={`p-2 rounded-lg ${bg} ${color} shrink-0`}>
                <Icon size={20} />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${color}`}>{label}</span>
                    {riskScore > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                            Score: {riskScore}/100
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
};

export default BurnoutIndicator;
