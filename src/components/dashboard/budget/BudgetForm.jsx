import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, CheckCircle2, DollarSign, PiggyBank, ShoppingBasket, Tag, TrendingUp, Wallet } from 'lucide-react';
import { createCategory, getCategories } from '../../../services/budgetApi';
import { deriveBudgetCategoryType, getBudgetTypeLimit, readBudgetSetup } from '../../../utils/budgetSetup';
import { formatCurrency } from '../../../utils/budgetHelpers';
import NumericInput from '../../common/NumericInput';

const BUDGET_ITEM_GROUPS = [
    {
        type: 'Needs',
        items: [
            'Food',
            'Transport',
            'Rent or Mortgage',
            'Internet',
            'Electricity',
            'Water',
            'School Fees',
            'Healthcare',
            'Insurance',
            'Household Essentials',
        ],
    },
    {
        type: 'Wants',
        items: [
            'Dining Out',
            'Entertainment',
            'Shopping',
            'Subscriptions',
            'Travel and Holidays',
            'Beauty and Grooming',
            'Gifts',
            'Hobbies',
            'Lifestyle',
        ],
    },
    {
        type: 'Savings',
        items: [
            'Money Market Fund',
            'Fixed Deposit Account',
            'Emergency Fund',
            'Treasury Bonds',
            'Treasury Bills',
            'Shares',
            'SACCO Savings',
            'Pension or Retirement',
            'Goal Savings',
        ],
    },
];

const normalise = (value = '') => String(value).trim().toLowerCase();
const getCurrentMonthValue = () => new Date().toISOString().slice(0, 7);
const monthFromDate = (value) => {
    if (!value) return getCurrentMonthValue();
    return String(value).slice(0, 7);
};
const laneVisuals = {
    Needs: {
        icon: Wallet,
        helper: 'Essentials you must cover first',
        shell: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        active: 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-600/20',
    },
    Wants: {
        icon: ShoppingBasket,
        helper: 'Lifestyle and flexible spending',
        shell: 'border-amber-200 bg-amber-50 text-amber-800',
        active: 'border-amber-500 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20',
    },
    Savings: {
        icon: PiggyBank,
        helper: 'Savings and investment allocations',
        shell: 'border-blue-200 bg-blue-50 text-blue-800',
        active: 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20',
    },
};

const BudgetForm = ({ initialValues, onSubmit, onCancel, isSubmitting, existingBudgets = [], totalIncome = 0 }) => {
    const [categories, setCategories] = useState([]);
    const [formError, setFormError] = useState('');
    const [selectedLane, setSelectedLane] = useState('Needs');
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        currency: 'KES',
        period: 'MONTHLY',
        start_month: getCurrentMonthValue(),
        is_recurring: true,
        alert_threshold: 80,
        notes: '',
    });

    async function loadCategories() {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialValues) {
            setSelectedLane(deriveBudgetCategoryType(initialValues.category_name));
            setFormData({
                category: initialValues.category ? String(initialValues.category) : '',
                amount: initialValues.amount || '',
                currency: initialValues.currency || 'KES',
                period: initialValues.period || 'MONTHLY',
                start_month: monthFromDate(initialValues.start_date),
                is_recurring: initialValues.is_recurring ?? true,
                alert_threshold: initialValues.alert_threshold || 80,
                notes: initialValues.notes || '',
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormError('');
        if (name === 'category') {
            const itemLane = BUDGET_ITEM_GROUPS.find((group) => group.items.includes(value.replace('new:', '')))?.type;
            if (itemLane) setSelectedLane(itemLane);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleLaneSelect = (lane) => {
        setSelectedLane(lane);
        setFormError('');
        if (!initialValues) {
            setFormData((current) => ({ ...current, category: '' }));
        }
    };

    const groupedBudgetItems = useMemo(() => {
        const categoriesByName = new Map(categories.map((item) => [normalise(item.name), item]));
        return BUDGET_ITEM_GROUPS.map((group) => ({
            ...group,
            items: group.items.map((label) => {
                const matchedCategory = categoriesByName.get(normalise(label));
                return {
                    label,
                    value: matchedCategory?.value || `new:${label}`,
                };
            }),
        }));
    }, [categories]);

    const visibleBudgetItems = useMemo(
        () => groupedBudgetItems.find((group) => group.type === selectedLane)?.items || [],
        [groupedBudgetItems, selectedLane]
    );

    const selectedBudgetItem = useMemo(() => {
        const curated = BUDGET_ITEM_GROUPS.flatMap((group) => group.items.map((label) => ({ label, type: group.type })));
        const selectedCategory = categories.find((item) => String(item.value) === String(formData.category));
        const fromCurated = String(formData.category || '').startsWith('new:')
            ? curated.find((item) => item.label === formData.category.replace('new:', ''))
            : curated.find((item) => normalise(item.label) === normalise(selectedCategory?.name));
        return {
            name: fromCurated?.label || selectedCategory?.name || initialValues?.category_name || '',
            type: fromCurated?.type || deriveBudgetCategoryType(selectedCategory?.name || initialValues?.category_name || ''),
        };
    }, [categories, formData.category, initialValues]);
    const laneLimitSummary = useMemo(() => {
        const budgetSetup = readBudgetSetup();
        const categoryType = selectedBudgetItem.type || selectedLane;
        const allowedLimit = getBudgetTypeLimit(budgetSetup, totalIncome, categoryType);
        const allocated = existingBudgets
            .filter((item) => item.uuid !== initialValues?.uuid)
            .filter((item) => deriveBudgetCategoryType(item.category_name) === categoryType)
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const requestedAmount = Number(formData.amount || 0);
        const remainingBeforeThisItem = Math.max(allowedLimit - allocated, 0);
        const remainingAfterThisItem = Math.max(allowedLimit - allocated - requestedAmount, 0);

        return {
            hasBudgetModel: Boolean(budgetSetup?.split),
            categoryType,
            allowedLimit,
            allocated,
            requestedAmount,
            remainingBeforeThisItem,
            remainingAfterThisItem,
            wouldExceed: Boolean(budgetSetup?.split) && allowedLimit > 0 && requestedAmount > remainingBeforeThisItem,
        };
    }, [existingBudgets, formData.amount, initialValues?.uuid, selectedBudgetItem.type, selectedLane, totalIncome]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let selectedCategory = categories.find((item) => String(item.value) === String(formData.category));
        let categoryName = selectedBudgetItem.name;
        const categoryType = selectedBudgetItem.type || deriveBudgetCategoryType(categoryName);
        const budgetSetup = readBudgetSetup();
        const allowedLimit = getBudgetTypeLimit(budgetSetup, totalIncome, categoryType);
        const currentlyAllocated = existingBudgets
            .filter((item) => item.uuid !== initialValues?.uuid)
            .filter((item) => deriveBudgetCategoryType(item.category_name) === categoryType)
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const remainingLimit = Math.max(allowedLimit - currentlyAllocated, 0);
        const requestedAmount = Number(formData.amount || 0);

        if (!budgetSetup?.split) {
            setFormError('Choose a budget model first so we can cap Needs, Wants, and Savings correctly.');
            return;
        }

        if (totalIncome <= 0 || allowedLimit <= 0) {
            setFormError('Add or refresh your monthly income before adding budget items. The selected budget model needs income to calculate limits.');
            return;
        }

        if (budgetSetup?.split && allowedLimit > 0 && requestedAmount > remainingLimit) {
            setFormError(`Your amount has exceeded the set ${categoryType.toLowerCase()} limit for this budget type. Remaining available is KES ${remainingLimit.toLocaleString('en-KE')}. Please review your amount or budget model.`);
            return;
        }

        if (!selectedCategory && String(formData.category || '').startsWith('new:')) {
            try {
                const createdCategory = await createCategory({ name: categoryName });
                const categoryPayload = createdCategory?.category || createdCategory?.data || createdCategory;
                selectedCategory = {
                    ...categoryPayload,
                    value: String(categoryPayload?.id || categoryPayload?.uuid || categoryPayload?.category_id || categoryName),
                    name: categoryPayload?.name || categoryName,
                };
            } catch (error) {
                setFormError('We could not create this budget item right now. Please try again.');
                return;
            }
        }

        const { start_month: startMonth, ...payload } = formData;
        await onSubmit({
            ...payload,
            category: selectedCategory?.value || formData.category || '',
            categoryName,
            categoryType,
            start_date: `${startMonth || getCurrentMonthValue()}-01`,
        });
    };

    const handleReset = () => {
        setFormData({
            category: '',
            amount: '',
            period: 'MONTHLY',
            start_month: getCurrentMonthValue(),
            is_recurring: true,
            alert_threshold: 80,
            notes: '',
        });
        if (onCancel) onCancel();
    };

    return (
        <div className="overflow-hidden rounded-[1.25rem] border border-emerald-100 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#0f7a55] via-[#11814f] to-[#35a86e] px-5 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="mt-1 text-xl font-extrabold">
                            {initialValues ? 'Edit Item' : 'Add Item'}
                        </h3>
                        <p className="mt-1 max-w-sm text-sm leading-6 text-white/75">
                            Choose the lane, pick the item, then set the amount for this month.
                        </p>
                    </div>
                    {selectedBudgetItem.name && (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                            {selectedBudgetItem.type}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5">
                {formError && (
                    <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <p className="mb-2 text-sm font-bold text-slate-900">Start by choosing where do you want your money to be </p>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {BUDGET_ITEM_GROUPS.map((group) => {
                                const visual = laneVisuals[group.type];
                                const Icon = visual.icon;
                                const active = selectedLane === group.type;
                                return (
                                    <button
                                        key={group.type}
                                        type="button"
                                        onClick={() => handleLaneSelect(group.type)}
                                        className={`rounded-[0.95rem] border px-3 py-3 text-left transition-all ${active ? visual.active : visual.shell}`}
                                    >
                                        <span className="flex items-center justify-between gap-2">
                                            <Icon size={16} />
                                            {active && <CheckCircle2 size={15} />}
                                        </span>
                                        <span className="mt-2 block text-sm font-extrabold">{group.type}</span>
                                        <span className={`mt-1 block text-[11px] leading-4 ${active ? 'text-inherit opacity-80' : 'opacity-70'}`}>{visual.helper}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Tag size={16} className="text-slate-500" />
                            {selectedLane} Item
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={!!initialValues}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                        >
                            <option value="">Select item</option>
                            {visibleBudgetItems.map((item) => (
                                <option key={`${selectedLane}-${item.label}`} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        {selectedBudgetItem.name && (
                            <p className="mt-1.5 text-xs font-semibold text-primary-700">
                                {selectedBudgetItem.type} item
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <DollarSign size={16} className="text-slate-500" />
                            Amount Allocated
                        </label>
                        <div className="mb-3 grid gap-2 sm:grid-cols-3">
                            <div className="rounded-[0.85rem] bg-emerald-50 px-3 py-2 text-emerald-800">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">{laneLimitSummary.categoryType} limit</p>
                                <p className="mt-1 text-sm font-extrabold">{formatCurrency(laneLimitSummary.allowedLimit, formData.currency)}</p>
                            </div>
                            <div className="rounded-[0.85rem] bg-slate-50 px-3 py-2 text-slate-700">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Allocated</p>
                                <p className="mt-1 text-sm font-extrabold">{formatCurrency(laneLimitSummary.allocated, formData.currency)}</p>
                            </div>
                            <div className={`rounded-[0.85rem] px-3 py-2 ${laneLimitSummary.wouldExceed ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-800'}`}>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Available</p>
                                <p className="mt-1 text-sm font-extrabold">{formatCurrency(laneLimitSummary.remainingBeforeThisItem, formData.currency)}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <NumericInput
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                KES
                            </span>
                        </div>
                        {laneLimitSummary.hasBudgetModel && laneLimitSummary.requestedAmount > 0 && (
                            <p className={`mt-2 text-xs font-semibold ${laneLimitSummary.wouldExceed ? 'text-rose-700' : 'text-primary-700'}`}>
                                {laneLimitSummary.wouldExceed
                                    ? `This would exceed your ${laneLimitSummary.categoryType.toLowerCase()} limit by ${formatCurrency(laneLimitSummary.requestedAmount - laneLimitSummary.remainingBeforeThisItem, formData.currency)}.`
                                    : `${formatCurrency(laneLimitSummary.remainingAfterThisItem, formData.currency)} will remain in ${laneLimitSummary.categoryType.toLowerCase()} after this item.`}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <TrendingUp size={16} className="text-slate-500" />
                            Period
                        </label>
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                            Monthly
                        </div>
                    </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="text-slate-500" />
                                Month
                            </label>
                            <input
                                type="month"
                                name="start_month"
                                value={formData.start_month}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    </div>

                    {/* Alert Threshold */}
                    <div>
                        <label className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                            <span className="flex items-center gap-2">
                                <Bell size={16} className="text-slate-500" />
                                Alert Threshold
                            </span>
                            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                {formData.alert_threshold}%
                            </span>
                        </label>
                        <input
                            type="range"
                            name="alert_threshold"
                            value={formData.alert_threshold}
                            onChange={handleChange}
                            min="50"
                            max="100"
                            step="5"
                            className="w-full accent-amber-500"
                        />
                        <p className="mt-1.5 text-xs text-slate-500">
                            Get notified when spending reaches this percentage
                        </p>
                    </div>

                    {/* Recurring Checkbox */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <label className="flex cursor-pointer items-center justify-between gap-3">
                            <div>
                                <span className="text-sm font-semibold text-slate-900">Repeat monthly</span>
                                <p className="mt-0.5 text-xs text-slate-600">
                                    Keep this item active for future months.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                name="is_recurring"
                                checked={formData.is_recurring}
                                onChange={handleChange}
                                className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                            />
                        </label>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Add any additional notes about this budget..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving...' : initialValues ? 'Update Item' : 'Add Item'}
                        </button>
                        {(initialValues || onCancel) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetForm;
