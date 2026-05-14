import React, { useState } from 'react';
import { 
    Target, Plus, TrendingUp, Calendar, DollarSign, Star, 
    Edit2, Trash2, MoreVertical, Award, Sparkles, Clock,
    CheckCircle2, Pause, XCircle
} from 'lucide-react';
import { formatCurrency, formatDate, getGoalTypeDisplay } from '../../../utils/budgetHelpers';
import { addGoalContribution, updateGoal, deleteGoal } from '../../../services/budgetApi';
import GoalForm from './GoalForm';
import { toast } from 'react-hot-toast';
import NumericInput from '../../common/NumericInput';

const GoalTracker = ({ goals, goalSummary, onUpdate }) => {
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [contributingTo, setContributingTo] = useState(null);
    const [contributionAmount, setContributionAmount] = useState('');
    const [contributionNotes, setContributionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handleContribute = async (goalUuid) => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        try {
            await addGoalContribution(goalUuid, {
                amount: parseFloat(contributionAmount),
                notes: contributionNotes,
            });
            setContributingTo(null);
            setContributionAmount('');
            setContributionNotes('');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to add contribution:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setShowGoalForm(true);
        setActiveMenu(null);
    };

    const handleDeleteGoal = async (goal) => {
        if (!window.confirm(`Delete goal "${goal.name}"? This action cannot be undone.`)) return;

        setActiveMenu(null);
        try {
            await deleteGoal(goal.uuid);
            toast.success('Goal deleted successfully!');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to delete goal');
            console.error(error);
        }
    };

    const handleStatusChange = async (goal, newStatus) => {
        setActiveMenu(null);
        try {
            await updateGoal(goal.uuid, { status: newStatus });
            toast.success(`Goal ${newStatus.toLowerCase()}!`);
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to update goal status');
            console.error(error);
        }
    };

    const handleTogglePriority = async (goal) => {
        setActiveMenu(null);
        try {
            await updateGoal(goal.uuid, { is_priority: !goal.is_priority });
            toast.success(goal.is_priority ? 'Removed from priority' : 'Marked as priority!');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to update priority');
            console.error(error);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            ACTIVE: { icon: TrendingUp, label: 'Active', color: 'emerald' },
            COMPLETED: { icon: CheckCircle2, label: 'Completed', color: 'indigo' },
            PAUSED: { icon: Pause, label: 'Paused', color: 'amber' },
            CANCELLED: { icon: XCircle, label: 'Cancelled', color: 'rose' },
        };
        return badges[status] || badges.ACTIVE;
    };

    if (!goals || goals.length === 0) {
        return (
            <>
                <div className="flex min-h-[400px] items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-300 bg-slate-50 p-8">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
                            <Target className="h-12 w-12 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Start Your Financial Journey</h3>
                        <p className="mt-3 max-w-md text-slate-600">
                            Set meaningful financial goals and track your progress with visual milestones and celebration alerts
                        </p>
                        <button
                            onClick={() => setShowGoalForm(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:scale-105"
                        >
                            <Plus size={20} />
                            Create Your First Goal
                        </button>
                    </div>
                </div>

                {showGoalForm && (
                    <GoalForm
                        initialValues={editingGoal}
                        onClose={() => {
                            setShowGoalForm(false);
                            setEditingGoal(null);
                        }}
                        onSuccess={() => {
                            setShowGoalForm(false);
                            setEditingGoal(null);
                            if (onUpdate) onUpdate();
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Goal Summary Cards */}
                {goalSummary && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-purple-600">Total Goals</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{goalSummary.total_goals}</p>
                            <p className="mt-1 text-xs text-slate-600">
                                {goalSummary.active_goals} active, {goalSummary.completed_goals} completed
                            </p>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-indigo-600">Total Target</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {formatCurrency(goalSummary.total_target, goalSummary.currency)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Across all active goals</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-emerald-600">Total Saved</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {formatCurrency(goalSummary.total_saved, goalSummary.currency)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">So far achieved</p>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-amber-600">Overall Progress</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{goalSummary.overall_progress}%</p>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                                    style={{ width: `${goalSummary.overall_progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Your Financial Goals</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            {goals.length} goal{goals.length !== 1 ? 's' : ''} • Track progress and celebrate milestones
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGoal(null);
                            setShowGoalForm(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:scale-105"
                    >
                        <Plus size={18} />
                        New Goal
                    </button>
                </div>

                {/* Goals Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {goals.map((goal) => {
                        const progressPercentage = goal.progress_percentage || 0;
                        const isCompleted = goal.status === 'COMPLETED';
                        const statusBadge = getStatusBadge(goal.status);
                        const StatusIcon = statusBadge.icon;
                        const isExpanded = selectedGoal === goal.uuid;

                        return (
                            <div
                                key={goal.uuid}
                                className={`group relative overflow-hidden rounded-[1.75rem] border transition-all ${
                                    isCompleted 
                                        ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50' 
                                        : 'border-slate-200 bg-white hover:shadow-lg'
                                }`}
                            >
                                {/* Priority Ribbon */}
                                {goal.is_priority && !isCompleted && (
                                    <div className="absolute -right-12 top-6 rotate-45 bg-amber-500 px-16 py-1 text-center shadow-lg">
                                        <span className="text-xs font-bold text-white">PRIORITY</span>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div
                                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold shadow-sm"
                                                style={{ backgroundColor: goal.color + '20', color: goal.color }}
                                            >
                                                {goal.icon?.charAt(0) || '🎯'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">{goal.name}</h3>
                                                <p className="mt-0.5 text-sm text-slate-600">{getGoalTypeDisplay(goal.goal_type)}</p>
                                            </div>
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === goal.uuid ? null : goal.uuid)}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === goal.uuid && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                    <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                                        <button
                                                            onClick={() => handleEditGoal(goal)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Edit2 size={16} />
                                                            Edit Goal
                                                        </button>
                                                        <button
                                                            onClick={() => handleTogglePriority(goal)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Star size={16} className={goal.is_priority ? 'fill-amber-500 text-amber-500' : ''} />
                                                            {goal.is_priority ? 'Remove Priority' : 'Mark as Priority'}
                                                        </button>
                                                        {goal.status === 'ACTIVE' && (
                                                            <button
                                                                onClick={() => handleStatusChange(goal, 'PAUSED')}
                                                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <Pause size={16} />
                                                                Pause Goal
                                                            </button>
                                                        )}
                                                        {goal.status === 'PAUSED' && (
                                                            <button
                                                                onClick={() => handleStatusChange(goal, 'ACTIVE')}
                                                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                                                            >
                                                                <TrendingUp size={16} />
                                                                Resume Goal
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setSelectedGoal(isExpanded ? null : goal.uuid)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Award size={16} />
                                                            {isExpanded ? 'Hide' : 'View'} Milestones
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGoal(goal)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete Goal
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`mb-4 inline-flex items-center gap-2 rounded-full bg-${statusBadge.color}-100 px-3 py-1`}>
                                        <StatusIcon size={14} className={`text-${statusBadge.color}-600`} />
                                        <span className={`text-xs font-bold text-${statusBadge.color}-700`}>{statusBadge.label}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Progress</span>
                                            <span className="text-lg font-bold text-slate-900">{progressPercentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-4 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isCompleted
                                                        ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600'
                                                        : 'bg-gradient-to-r from-purple-400 to-indigo-600'
                                                }`}
                                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Amounts */}
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                            <span className="text-sm font-medium text-slate-600">Current</span>
                                            <span className="text-base font-bold text-slate-900">
                                                {formatCurrency(goal.current_amount, goal.currency)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                            <span className="text-sm font-medium text-slate-600">Target</span>
                                            <span className="text-base font-bold text-slate-900">
                                                {formatCurrency(goal.target_amount, goal.currency)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2">
                                            <span className="text-sm font-semibold text-purple-700">Remaining</span>
                                            <span className="text-base font-bold text-purple-900">
                                                {formatCurrency(goal.remaining_amount, goal.currency)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Target Date */}
                                    {goal.target_date && (
                                        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar size={16} />
                                            <span>Target: {formatDate(goal.target_date)}</span>
                                            {goal.months_to_goal && (
                                                <>
                                                    <span className="text-slate-400">•</span>
                                                    <Clock size={16} />
                                                    <span className="font-semibold text-slate-900">{goal.months_to_goal} months left</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Monthly Contribution Suggestion */}
                                    {goal.monthly_contribution && goal.status === 'ACTIVE' && (
                                        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={16} className="text-indigo-600" />
                                                <span className="text-sm font-semibold text-indigo-900">Suggested Monthly</span>
                                            </div>
                                            <p className="mt-1 text-lg font-bold text-indigo-900">
                                                {formatCurrency(goal.monthly_contribution, goal.currency)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Milestones (Expandable) */}
                                    {isExpanded && goal.milestones && goal.milestones.length > 0 && (
                                        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-purple-900">
                                                <Award size={16} />
                                                Milestones
                                            </h4>
                                            <div className="space-y-2">
                                                {goal.milestones.map((milestone, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center gap-3 rounded-lg p-2 ${
                                                            milestone.achieved ? 'bg-emerald-100' : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                            milestone.achieved ? 'bg-emerald-500' : 'bg-slate-200'
                                                        }`}>
                                                            {milestone.achieved ? (
                                                                <CheckCircle2 size={16} className="text-white" />
                                                            ) : (
                                                                <span className="text-xs font-bold text-slate-600">{milestone.percentage}%</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${
                                                                milestone.achieved ? 'text-emerald-900' : 'text-slate-700'
                                                            }`}>
                                                                {milestone.message}
                                                            </p>
                                                            {milestone.achieved && milestone.achieved_date && (
                                                                <p className="text-xs text-emerald-600">
                                                                    Achieved on {formatDate(milestone.achieved_date)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contribution Section */}
                                    {!isCompleted && goal.status === 'ACTIVE' && (
                                        <div className="border-t border-slate-100 pt-4">
                                            {contributingTo === goal.uuid ? (
                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <NumericInput
                                                            value={contributionAmount}
                                                            onChange={(e) => setContributionAmount(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                                            autoFocus
                                                        />
                                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={contributionNotes}
                                                        onChange={(e) => setContributionNotes(e.target.value)}
                                                        placeholder="Add a note (optional)"
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleContribute(goal.uuid)}
                                                            disabled={isSubmitting || !contributionAmount}
                                                            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                                                        >
                                                            {isSubmitting ? 'Adding...' : 'Add Contribution'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setContributingTo(null);
                                                                setContributionAmount('');
                                                                setContributionNotes('');
                                                            }}
                                                            disabled={isSubmitting}
                                                            className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setContributingTo(goal.uuid)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-700 transition-all hover:border-purple-400 hover:bg-purple-100"
                                                >
                                                    <Plus size={18} />
                                                    Add Contribution
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Completed Badge */}
                                    {isCompleted && (
                                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-bold text-white shadow-lg">
                                            <CheckCircle2 size={20} />
                                            Goal Achieved! Congratulations! 🎉
                                        </div>
                                    )}

                                    {goal.status === 'PAUSED' && (
                                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-800">
                                            <Pause size={18} />
                                            Goal Paused
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Goal Form Modal */}
            {showGoalForm && (
                <GoalForm
                    initialValues={editingGoal}
                    onClose={() => {
                        setShowGoalForm(false);
                        setEditingGoal(null);
                    }}
                    onSuccess={() => {
                        setShowGoalForm(false);
                        setEditingGoal(null);
                        if (onUpdate) onUpdate();
                    }}
                />
            )}
        </>
    );
};

export default GoalTracker;