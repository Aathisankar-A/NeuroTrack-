import React, { useState } from 'react';

// 1. Focus Trend Chart (Line Chart with smooth curves and glow)
export const FocusTrendChart = ({ data = [] }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Only render actual user data
    const points = data;

    if (!points || points.length === 0) {
        return (
            <div className="h-[200px] flex flex-col justify-center items-center text-center p-4 bg-gray-50/50 dark:bg-[#1E1E1E]/20 rounded-xl border border-dashed border-gray-100 dark:border-[#2A2A2A]">
                <p className="text-xs text-gray-400 dark:text-[#9CA3AF] font-bold">No trend data available yet</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 max-w-[200px]">Complete focus sessions to record your daily focus score.</p>
            </div>
        );
    }

    const width = 500;
    const height = 200;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = 100;
    const minVal = 0;

    const getX = (index) => padding + (index * (chartWidth / (points.length - 1)));
    const getY = (score) => padding + chartHeight - ((score - minVal) / (maxVal - minVal)) * chartHeight;

    // Create SVG Path for line
    let linePath = "";
    if (points.length > 0) {
        linePath = `M ${getX(0)} ${getY(points[0].score)}`;
        for (let i = 1; i < points.length; i++) {
            const x = getX(i);
            const y = getY(points[i].score);
            const prevX = getX(i - 1);
            const prevY = getY(points[i - 1].score);
            // Control points for smooth bezier curve
            const cpX1 = prevX + (x - prevX) / 2;
            const cpY1 = prevY;
            const cpX2 = prevX + (x - prevX) / 2;
            const cpY2 = y;
            linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
        }
    }

    // Create SVG Path for gradient fill
    const fillPath = linePath ? `${linePath} L ${getX(points.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z` : "";

    return (
        <div className="relative w-full h-full min-h-[200px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding + ratio * chartHeight;
                    return (
                        <line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="currentColor"
                            className="text-gray-100 dark:text-[#2A2A2A]"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Area under the curve */}
                {fillPath && <path d={fillPath} fill="url(#lineGrad)" />}

                {/* Smooth Curve */}
                {linePath && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="url(#strokeGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                )}

                {/* Data points & Interactive Hover regions */}
                {points.map((pt, idx) => {
                    const x = getX(idx);
                    const y = getY(pt.score);
                    const isHovered = hoveredIdx === idx;

                    return (
                        <g key={idx} className="cursor-pointer">
                            {/* Invisible larger hover target */}
                            <circle
                                cx={x}
                                cy={y}
                                r="16"
                                fill="transparent"
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            />

                            {/* Active glowing ring */}
                            {isHovered && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="8"
                                    className="fill-purple-500/20 stroke-purple-500"
                                    strokeWidth="2"
                                />
                            )}

                            {/* Inner dot */}
                            <circle
                                cx={x}
                                cy={y}
                                r="4"
                                className={`${isHovered ? 'fill-white' : 'fill-purple-600 dark:fill-purple-400'} transition-all`}
                            />

                            {/* X-Axis labels */}
                            <text
                                x={x}
                                y={height - 10}
                                textAnchor="middle"
                                className="text-[10px] font-bold fill-gray-400 dark:fill-gray-500"
                            >
                                {pt.day}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIdx !== null && (
                <div
                    className="absolute z-10 px-3 py-2 text-xs font-bold text-white bg-gray-900/90 dark:bg-black/90 rounded-lg border border-purple-500/30 backdrop-blur-sm pointer-events-none shadow-xl transition-all duration-150"
                    style={{
                        left: `${(getX(hoveredIdx) / width) * 100}%`,
                        top: `${(getY(points[hoveredIdx].score) / height) * 100 - 30}%`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider">{points[hoveredIdx].day}</p>
                    <p className="text-purple-400 font-black text-sm">{points[hoveredIdx].score}% Focus</p>
                </div>
            )}
        </div>
    );
};

// 2. Deep Work Trend (Bar Chart representing focus hours per day)
export const DeepWorkTrend = ({ data = [] }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const points = data;

    if (!points || points.length === 0) {
        return (
            <div className="h-[200px] flex flex-col justify-center items-center text-center p-4 bg-gray-50/50 dark:bg-[#1E1E1E]/20 rounded-xl border border-dashed border-gray-100 dark:border-[#2A2A2A]">
                <p className="text-xs text-gray-400 dark:text-[#9CA3AF] font-bold">No deep work data available yet</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 max-w-[200px]">Complete focus sessions to see your deep work hours trend.</p>
            </div>
        );
    }

    const width = 500;
    const height = 200;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...points.map(p => p.hours), 6);
    const getX = (index) => padding + (index * (chartWidth / points.length)) + (chartWidth / points.length) / 2;
    const getY = (val) => padding + chartHeight - (val / maxVal) * chartHeight;
    const barWidth = 24;

    return (
        <div className="relative w-full h-full min-h-[200px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A78BFA" />
                        <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                    <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C084FC" />
                        <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0, 0.5, 1].map((ratio, i) => {
                    const y = padding + ratio * chartHeight;
                    return (
                        <line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="currentColor"
                            className="text-gray-100 dark:text-[#2A2A2A]"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Bars */}
                {points.map((pt, idx) => {
                    const x = getX(idx) - barWidth / 2;
                    const y = getY(pt.hours);
                    const isHovered = hoveredIdx === idx;
                    const barHeight = height - padding - y;

                    return (
                        <g key={idx} className="cursor-pointer">
                            {/* Bar Path with rounded top corners */}
                            <path
                                d={`
                                    M ${x} ${y + 4}
                                    a 4 4 0 0 1 4 -4
                                    h ${barWidth - 8}
                                    a 4 4 0 0 1 4 4
                                    v ${barHeight - 4}
                                    h -${barWidth}
                                    Z
                                `}
                                fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                                className="transition-all duration-200"
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            />

                            {/* X-Axis Labels */}
                            <text
                                x={getX(idx)}
                                y={height - 10}
                                textAnchor="middle"
                                className="text-[10px] font-bold fill-gray-400 dark:fill-gray-500"
                            >
                                {pt.day}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIdx !== null && (
                <div
                    className="absolute z-10 px-3 py-2 text-xs font-bold text-white bg-gray-900/90 dark:bg-black/90 rounded-lg border border-purple-500/30 backdrop-blur-sm pointer-events-none shadow-xl transition-all duration-150"
                    style={{
                        left: `${(getX(hoveredIdx) / width) * 100}%`,
                        top: `${(getY(points[hoveredIdx].hours) / height) * 100 - 10}%`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider">{points[hoveredIdx].day}</p>
                    <p className="text-purple-400 font-black text-sm">{points[hoveredIdx].hours} hrs Deep</p>
                </div>
            )}
        </div>
    );
};

// 3. Distraction Analysis (Interactive Donut Chart)
export const DistractionAnalysis = ({ data = [] }) => {
    const [activeIdx, setActiveIdx] = useState(null);

    const categories = data;

    if (!categories || categories.length === 0) {
        return (
            <div className="h-[200px] flex flex-col justify-center items-center text-center p-4 bg-gray-50/50 dark:bg-[#1E1E1E]/20 rounded-xl border border-dashed border-gray-100 dark:border-[#2A2A2A] w-full">
                <p className="text-xs text-gray-400 dark:text-[#9CA3AF] font-bold">No distraction logs found</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 max-w-[200px]">Sessions with distractions will compile here to show visual breakdowns.</p>
            </div>
        );
    }

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);

    // Compute polar coordinates for SVG arcs
    let accumulatedAngle = -90; // Start at top

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const radius = 60;
    const center = 100;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full">
            {/* Donut SVG */}
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    <circle cx={center} cy={center} r={radius} fill="none" className="stroke-gray-100 dark:stroke-[#2A2A2A]" strokeWidth="20" />
                    
                    {categories.map((cat, idx) => {
                        const percent = cat.value / total;
                        const strokeDasharray = `${2 * Math.PI * radius * percent} ${2 * Math.PI * radius}`;
                        const strokeDashoffset = -2 * Math.PI * radius * (accumulatedAngle + 90) / 360;
                        
                        accumulatedAngle += percent * 360;
                        const isActive = activeIdx === idx;

                        return (
                            <circle
                                key={idx}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={cat.color}
                                strokeWidth={isActive ? 24 : 20}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-300 cursor-pointer origin-center"
                                onMouseEnter={() => setActiveIdx(idx)}
                                onMouseLeave={() => setActiveIdx(null)}
                            />
                        );
                    })}
                </svg>

                {/* Donut Middle Indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        {activeIdx !== null ? categories[activeIdx].label : "Distractions"}
                    </p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                        {activeIdx !== null ? `${categories[activeIdx].value}%` : "Active"}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {categories.map((cat, idx) => (
                    <div 
                        key={idx} 
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeIdx === idx ? 'bg-gray-50 dark:bg-[#2A2A2A]' : ''}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onMouseLeave={() => setActiveIdx(null)}
                    >
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{cat.label}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{cat.value}% contribution</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. Weekly Productivity Overview (Sparkline / Area Chart)
export const WeeklyProductivityOverview = ({ data = [] }) => {
    const points = data;

    if (!points || points.length === 0) {
        return (
            <div className="w-full h-16 flex items-center justify-center bg-gray-50/50 dark:bg-[#1E1E1E]/20 rounded-xl border border-dashed border-gray-100 dark:border-[#2A2A2A]">
                <p className="text-xs text-gray-400 dark:text-[#9CA3AF] font-bold">Awaiting weekly sessions score...</p>
            </div>
        );
    }
    
    const width = 300;
    const height = 60;
    const padding = 5;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = 100;
    const minVal = 0;

    const getX = (index) => padding + (index * (chartWidth / (points.length - 1)));
    const getY = (score) => padding + chartHeight - ((score - minVal) / (maxVal - minVal)) * chartHeight;

    let pathD = `M ${getX(0)} ${getY(points[0])}`;
    for (let i = 1; i < points.length; i++) {
        const x = getX(i);
        const y = getY(points[i]);
        const prevX = getX(i - 1);
        const prevY = getY(points[i - 1]);
        const cpX1 = prevX + (x - prevX) / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + (x - prevX) / 2;
        const cpY2 = y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }

    const fillD = `${pathD} L ${getX(points.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return (
        <div className="w-full h-16 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <path d={fillD} fill="url(#sparklineGrad)" />
                <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};
