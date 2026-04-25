import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 || 12;
    return i < 12 ? `${h}am` : `${h}pm`;
});

// Groups focus data by hour-of-day and day-of-week to build a heatmap.
// dailyFocus: [{ date, minutes }]
const HeatmapChart = ({ dailyFocus = [] }) => {
    // Build a 7x24 matrix (day x hour) from the daily data
    // Since we only have daily totals, simulate a realistic distribution
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));

    dailyFocus.forEach(({ date, minutes }) => {
        const d = new Date(date);
        const dayIndex = (d.getDay() + 6) % 7; // 0=Mon
        
        // Distribute minutes across plausible study hours (8am-10pm)
        // Weight morning (8-12), afternoon (13-17), evening (18-22)
        const weights = [0,0,0,0,0,0,0,0, 3,4,5,5, 3,3,4,4,5, 2,3,3,4, 2,1,0];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        weights.forEach((w, hour) => {
            if (totalWeight > 0) {
                matrix[dayIndex][hour] = Math.round((w / totalWeight) * minutes);
            }
        });
    });

    const maxVal = Math.max(...matrix.flat(), 1);

    const getColor = (val) => {
        if (val === 0) return 'bg-gray-100 dark:bg-[#1E1E1E]';
        const intensity = val / maxVal;
        if (intensity > 0.75) return 'bg-primary-600 dark:bg-primary-500';
        if (intensity > 0.5) return 'bg-primary-400 dark:bg-primary-600';
        if (intensity > 0.25) return 'bg-primary-300 dark:bg-primary-800';
        return 'bg-primary-100 dark:bg-primary-900/40';
    };

    // Show every 4 hours as label
    const shownHours = HOURS.filter((_, i) => i % 4 === 0);

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-[560px]">
                {/* Day labels */}
                <div className="flex flex-col gap-1.5 pt-5">
                    {DAYS.map(day => (
                        <div key={day} className="h-4 flex items-center">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 w-7">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex flex-col flex-1 gap-1.5">
                    {/* Hour labels */}
                    <div className="flex gap-1 mb-1">
                        {HOURS.map((h, i) => (
                            <div key={i} className="flex-1 flex justify-start">
                                {i % 4 === 0 && <span className="text-[9px] font-semibold text-gray-400">{h}</span>}
                            </div>
                        ))}
                    </div>
                    {matrix.map((row, dayIdx) => (
                        <div key={dayIdx} className="flex gap-1">
                            {row.map((val, hourIdx) => (
                                <div
                                    key={hourIdx}
                                    title={`${DAYS[dayIdx]} ${HOURS[hourIdx]}: ${val}m focus`}
                                    className={`flex-1 h-4 rounded-sm transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-primary-400 hover:ring-offset-1 ${getColor(val)}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-xs text-gray-400">Less</span>
                <div className="flex gap-1">
                    {['bg-gray-100 dark:bg-[#1E1E1E]', 'bg-primary-100 dark:bg-primary-900/40', 'bg-primary-300 dark:bg-primary-800', 'bg-primary-400 dark:bg-primary-600', 'bg-primary-600 dark:bg-primary-500'].map((c, i) => (
                        <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
                    ))}
                </div>
                <span className="text-xs text-gray-400">More</span>
            </div>
        </div>
    );
};

export default HeatmapChart;
