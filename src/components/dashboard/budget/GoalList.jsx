import React, { useState } from 'react';
import { Target, Plus, TrendingUp, Calendar, DollarSign, Star } from 'lucide-react';
import { formatCurrency, formatDate, getGoalTypeDisplay } from '../../../utils/budgetHelpers';
import { addGoalContribution } from '../../../services/budgetApi';

// Dynamic import to catch errors
const GoalForm = React.lazy(() => 
    import('./GoalForm').catch(err => {
        console.error('Failed to load GoalForm:', err);
        return { default: () => <div>GoalForm failed to load</div> };
    })
);

const GoalList = ({ goals, onUpdate, compact = false }) => {
    const [contributingTo, setContributingTo] = useState(null);
    const [contributionAmount, setContributionAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);

    console.log('GoalList render - showGoalForm:', showGoalForm); // Debug

    const handleContribute = async (goalUuid) => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;

        setIsSubmitting(true);
        try {
            await addGoalContribution(goalUuid, {
                amount: parseFloat(contributionAmount),
                notes: '',
            });
            setContributingTo(null);
            setContributionAmount('');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to add contribution:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenForm = () => {
        console.log('Opening goal form...'); // Debug
        setShowGoalForm(true);
        console.log('showGoalForm set to true'); // Debug
    };

    if (!goals || goals.length === 0) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Target className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Goals Yet</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Set financial goals and track your progress
                    </p>
                    <button
                        onClick={handleOpenForm}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-700"
                    >
                        <Plus size={18} />
                        Create Your First Goal
                    </button>

                    {/* Debug: Show form state */}
                    <p className="mt-4 text-xs text-slate-500">Form state: {showGoalForm ? 'OPEN' : 'CLOSED'}</p>
                </div>

                {/* Render form conditionally */}
                {showGoalForm && (
                    <React.Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">Loading...</div>}>
                        <GoalForm
                            onClose={() => {
                                console.log('Closing goal form...');
                                setShowGoalForm(false);
                            }}
                            onSuccess={() => {
                                console.log('Goal created successfully');
                                setShowGoalForm(false);
                                if (onUpdate) onUpdate();
                            }}
                        />
                    </React.Suspense>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Header with Create Button */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Financial Goals</h3>
                    <p className="mt-1 text-sm text-slate-600">{goals.length} active goal{goals.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-primary-700"
                >
                    <Plus size={18} />
                    New Goal
                </button>
            </div>

            {/* Goals Grid */}
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {goals.map((goal) => {
                    const progressPercentage = goal.progress_percentage || 0;
                    const isCompleted = goal.status === 'COMPLETED';

                    return (
                        <div
                            key={goal.uuid}
                            className={`group relative overflow-hidden rounded-[1.75rem] border ${
                                isCompleted ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white' : 'border-slate-200 bg-white'
                            } p-6 shadow-sm transition-all hover:shadow-lg`}
                        >
                            {/* Priority Badge */}
                            {goal.is_priority && (
                                <div className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 shadow-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={12} className="fill-amber-500 text-amber-500" />
                                        <span className="text-xs font-bold text-amber-700">Priority</span>
                                    </div>
                                </div>
                            )}

                            {/* Goal content - keeping your existing code */}
                            <div className="mb-4 flex items-start gap-3">
                                <div
                                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
                                    style={{ backgroundColor: goal.color + '20' }}
                                >
                                    {goal.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-bold text-slate-900 truncate">{goal.name}</h4>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                                        {getGoalTypeDisplay(goal.goal_type)}
                                    </p>
                                </div>
                            </div>

                            {/* Rest of goal card content... */}
                        </div>
                    );
                })}
            </div>

            {/* Goal Form Modal */}
            {showGoalForm && (
                <React.Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">Loading...</div>}>
                    <GoalForm
                        onClose={() => {
                            console.log('Closing goal form...');
                            setShowGoalForm(false);
                        }}
                        onSuccess={() => {
                            console.log('Goal created successfully');
                            setShowGoalForm(false);
                            if (onUpdate) onUpdate();
                        }}
                    />
                </React.Suspense>
            )}
        </>
    );
};

export default GoalList;