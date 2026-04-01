import React, { useEffect, useRef } from 'react';
import ScoreGauge from './ScoreGauge';

const ComponentDetailModal = ({ component, onClose }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    if (!component) return null;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-blue-50 border-blue-200';
        if (score >= 40) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const formatDataKey = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatDataValue = (value) => {
        if (typeof value === 'number') {
            return value % 1 === 0 ? value : value.toFixed(2);
        }
        return value;
    };

    const getRecommendations = (componentKey, score) => {
        const recommendations = {
            savings_rate: [
                { condition: score < 40, text: 'Start by saving at least 5% of your income each month' },
                { condition: score < 60, text: 'Try to increase your savings rate to 10-15% of your income' },
                { condition: score < 80, text: 'You\'re doing well! Aim for 20% savings rate for excellent financial health' },
                { condition: score >= 80, text: 'Excellent! Maintain your savings discipline and consider investing surplus' }
            ],
            debt_burden: [
                { condition: score < 40, text: 'Focus on reducing high-interest debt first. Consider debt consolidation' },
                { condition: score < 60, text: 'Work on keeping your debt-to-income ratio below 35%' },
                { condition: score < 80, text: 'Good progress! Continue paying down debt to improve your score' },
                { condition: score >= 80, text: 'Great job! Maintain low debt levels and avoid new high-interest debt' }
            ],
            emergency_fund: [
                { condition: score < 40, text: 'Start building an emergency fund. Aim for at least 1 month of expenses' },
                { condition: score < 60, text: 'Continue building your emergency fund to cover 3 months of expenses' },
                { condition: score < 80, text: 'Almost there! Work towards 6 months of expenses for full security' },
                { condition: score >= 80, text: 'Excellent buffer! Keep this fund separate and only use for true emergencies' }
            ],
            budget_adherence: [
                { condition: score < 40, text: 'Review your budget categories and set realistic spending limits' },
                { condition: score < 60, text: 'Track your daily expenses to identify areas of overspending' },
                { condition: score < 80, text: 'You\'re on track! Fine-tune categories where you tend to overspend' },
                { condition: score >= 80, text: 'Excellent budgeting! Share your strategies with others' }
            ],
            net_worth_trend: [
                { condition: score < 40, text: 'Focus on increasing income and reducing expenses to improve net worth' },
                { condition: score < 60, text: 'Look for opportunities to increase income or reduce fixed costs' },
                { condition: score < 80, text: 'Good progress! Consider investment opportunities to accelerate growth' },
                { condition: score >= 80, text: 'Outstanding growth! Maintain your wealth-building momentum' }
            ]
        };

        const componentRecs = recommendations[componentKey] || [];
        return componentRecs.filter(rec => rec.condition).map(rec => rec.text);
    };

    const recommendations = getRecommendations(component.key, component.score);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className={`border-b-2 p-6 ${getScoreBg(component.score)}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-950">{component.name}</h2>
                            <p className="mt-1 text-sm text-slate-600">{component.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Score Display */}
                    <div className="mt-6 flex items-center gap-6">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-extrabold ${getScoreColor(component.score)}`}>
                                {component.score}
                            </span>
                            <span className="text-2xl font-semibold text-slate-400">/ 100</span>
                        </div>
                        <div className="flex-1">
                            <ScoreGauge score={component.score} height="h-3" animated />
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Weight: {component.weight}%</span>
                                <span className={`rounded-full px-2 py-0.5 font-bold ${
                                    component.score >= 80 ? 'bg-green-100 text-green-700' :
                                    component.score >= 60 ? 'bg-blue-100 text-blue-700' :
                                    component.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    Grade: {component.grade}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Component Data */}
                    {component.data && Object.keys(component.data).length > 0 && (
                        <div>
                            <h3 className="mb-3 text-lg font-bold text-slate-950">Calculation Data</h3>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="space-y-2">
                                    {Object.entries(component.data).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-slate-600">{formatDataKey(key)}:</span>
                                            <span className="font-semibold text-slate-950">{formatDataValue(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-lg font-bold text-slate-950">Recommendations</h3>
                            <div className="space-y-2">
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                                        <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <p className="text-sm text-blue-700">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Score Ranges */}
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-slate-950">Score Guide</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-sm font-semibold text-slate-950">80-100:</span>
                                <span className="text-sm text-slate-600">Excellent</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span className="text-sm font-semibold text-slate-950">60-79:</span>
                                <span className="text-sm text-slate-600">Good</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <span className="text-sm font-semibold text-slate-950">40-59:</span>
                                <span className="text-sm text-slate-600">Fair</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-sm font-semibold text-slate-950">0-39:</span>
                                <span className="text-sm text-slate-600">Needs Attention</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComponentDetailModal;