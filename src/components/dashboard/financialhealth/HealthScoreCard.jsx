import React from 'react';
import HealthTrendIndicator from './HealthTrendIndicator';

const HealthScoreCard = ({ score, status, statusDisplay, change, scoreDate }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'EXCELLENT':
                return 'text-green-600';
            case 'GOOD':
                return 'text-blue-600';
            case 'FAIR':
                return 'text-yellow-600';
            case 'NEEDS_ATTENTION':
                return 'text-red-600';
            default:
                return 'text-slate-600';
        }
    };

    const getStatusBgGradient = (status) => {
        switch (status) {
            case 'EXCELLENT':
                return 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300';
            case 'GOOD':
                return 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 border-blue-300';
            case 'FAIR':
                return 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-300';
            case 'NEEDS_ATTENTION':
                return 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-red-300';
            default:
                return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300';
        }
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'url(#excellentGradient)';
        if (score >= 60) return 'url(#goodGradient)';
        if (score >= 40) return 'url(#fairGradient)';
        return 'url(#needsAttentionGradient)';
    };

    const getGlowColor = (score) => {
        if (score >= 80) return 'rgba(16, 185, 129, 0.4)';
        if (score >= 60) return 'rgba(59, 130, 246, 0.4)';
        if (score >= 40) return 'rgba(245, 158, 11, 0.4)';
        return 'rgba(239, 68, 68, 0.4)';
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'EXCELLENT':
                return 'Outstanding! You are in excellent financial shape. Keep up the great work and maintain these healthy habits.';
            case 'GOOD':
                return 'Well done! Your finances are in good shape. Focus on the areas that need improvement to reach excellence.';
            case 'FAIR':
                return 'You are on the right track, but there is room for improvement. Focus on the critical areas highlighted below.';
            case 'NEEDS_ATTENTION':
                return 'Your finances need attention. Review the insights below and take action on the priority items to improve your score.';
            default:
                return 'Keep working on your financial health.';
        }
    };

    const circumference = 2 * Math.PI * 140;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="group relative overflow-hidden rounded-[2.5rem] border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-xl transition-all duration-500 hover:shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgb(71, 85, 105) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative p-8 sm:p-10">
                <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
                    {/* Enhanced Score Circle with Glow Effect */}
                    <div className="relative flex flex-shrink-0 items-center justify-center">
                        {/* Glow effect */}
                        <div 
                            className="absolute h-80 w-80 rounded-full blur-3xl opacity-30 transition-all duration-1000"
                            style={{ 
                                background: `radial-gradient(circle, ${getGlowColor(score)} 0%, transparent 70%)`
                            }}
                        />
                        
                        <svg className="relative h-80 w-80 drop-shadow-2xl" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Gradient Definitions */}
                            <defs>
                                <linearGradient id="excellentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                                <linearGradient id="fairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#d97706" />
                                </linearGradient>
                                <linearGradient id="needsAttentionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#dc2626" />
                                </linearGradient>
                                
                                {/* Shadow filter */}
                                <filter id="shadow">
                                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
                                </filter>
                            </defs>

                            {/* Background circle with subtle gradient */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="140"
                                stroke="#e2e8f0"
                                strokeWidth="28"
                                fill="none"
                                opacity="0.3"
                            />
                            
                            {/* Progress circle with gradient and glow */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="140"
                                stroke={getScoreGradient(score)}
                                strokeWidth="28"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                filter="url(#shadow)"
                                style={{
                                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease'
                                }}
                            />
                        </svg>
                        
                        {/* Score Display */}
                        <div className="absolute flex flex-col items-center">
                            <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-8xl font-black tracking-tighter text-transparent drop-shadow-lg">
                                {score}
                            </span>
                            <span className="text-3xl font-bold text-slate-400">/ 100</span>
                        </div>
                    </div>

                    {/* Enhanced Score Details */}
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        {/* Status Badge with Animation */}
                        <div className="flex justify-center lg:justify-start">
                            <div className={`group/badge relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border-2 ${getStatusBgGradient(status)} px-6 py-3 shadow-lg transition-all hover:scale-105`}>
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover/badge:translate-x-full" />
                                
                                <div className={`relative h-3 w-3 rounded-full ${getStatusColor(status).replace('text', 'bg')} animate-pulse`} />
                                <span className={`relative text-lg font-extrabold tracking-wide ${getStatusColor(status)}`}>
                                    {statusDisplay}
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h2 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
                                Your Financial Health
                            </h2>
                            <div className="mt-2 h-1.5 w-24 rounded-full bg-gradient-to-r from-primary-600 to-primary-400" />
                        </div>

                        {/* Description */}
                        <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                            {getStatusMessage(status)}
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                            {change !== null && change !== undefined && (
                                <div className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 shadow-sm backdrop-blur-sm">
                                    <HealthTrendIndicator change={change} size="medium" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 shadow-sm backdrop-blur-sm">
                                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-slate-700">
                                    {new Date(scoreDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthScoreCard;