import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import Button from '../../Button';

const emptyForm = {
    name: '',
    creditor_name: '',
    current_balance: '',
    original_amount: '',
    interest_rate: '',
    minimum_payment: '',
    committed_payment: '',
    due_date: '',
    notes: '',
    debt_type: 'PERSONAL_LOAN',
    payment_frequency: 'MONTHLY',
    start_date: '',
    is_priority: false,
    account_number: '',
    currency: 'KES',
    auto_add_to_budget: true,
};

const DebtForm = ({ initialValues, onSubmit, onCancel, isSubmitting, tierInfo }) => {
    const [formValues, setFormValues] = useState(emptyForm);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [errors, setErrors] = useState({});
    const [tierLimitError, setTierLimitError] = useState(null);

    useEffect(() => {
        if (initialValues) {
            setFormValues({
                name: initialValues.name ?? '',
                creditor_name: initialValues.creditor_name ?? '',
                current_balance: initialValues.current_balance ?? '',
                original_amount: initialValues.original_amount ?? '',
                interest_rate: initialValues.interest_rate ?? '',
                minimum_payment: initialValues.minimum_payment ?? '',
                committed_payment: initialValues.committed_payment ?? '',
                due_date: initialValues.due_date ?? '',
                notes: initialValues.notes ?? '',
                debt_type: initialValues.debt_type ?? 'PERSONAL_LOAN',
                payment_frequency: initialValues.payment_frequency ?? 'MONTHLY',
                start_date: initialValues.start_date ?? '',
                is_priority: initialValues.is_priority ?? false,
                account_number: initialValues.account_number ?? '',
                currency: initialValues.currency ?? 'KES',
                auto_add_to_budget: initialValues.auto_add_to_budget ?? true,
            });
            return;
        }

        setFormValues(emptyForm);
        setErrors({});
        setTierLimitError(null);
    }, [initialValues]);

    // Check tier limits
    useEffect(() => {
        if (!initialValues && tierInfo) {
            const { current_count, max_debts, tier } = tierInfo;
            
            if (max_debts !== null && current_count >= max_debts) {
                setTierLimitError({
                    message: `You've reached your ${tier} tier limit of ${max_debts} active debts.`,
                    action: 'Upgrade your plan to add more debts.'
                });
            } else {
                setTierLimitError(null);
            }
        }
    }, [tierInfo, initialValues]);

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formValues.name?.trim()) {
            newErrors.name = 'Debt name is required';
        }

        if (!formValues.current_balance || parseFloat(formValues.current_balance) <= 0) {
            newErrors.current_balance = 'Current balance must be greater than zero';
        }

        if (!formValues.minimum_payment || parseFloat(formValues.minimum_payment) <= 0) {
            newErrors.minimum_payment = 'Minimum payment must be greater than zero';
        }

        // Validate original amount if provided
        if (formValues.original_amount) {
            const original = parseFloat(formValues.original_amount);
            const current = parseFloat(formValues.current_balance);
            
            if (original < current) {
                newErrors.original_amount = 'Original amount cannot be less than current balance';
            }
        }

        // Validate interest rate
        if (formValues.interest_rate) {
            const rate = parseFloat(formValues.interest_rate);
            if (rate < 0 || rate > 100) {
                newErrors.interest_rate = 'Interest rate must be between 0 and 100';
            }
        }

        // Validate committed payment
        if (formValues.committed_payment) {
            const committed = parseFloat(formValues.committed_payment);
            const minimum = parseFloat(formValues.minimum_payment);
            
            if (committed < minimum) {
                newErrors.committed_payment = 'Committed payment should be at least the minimum payment';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        
        setFormValues((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (tierLimitError && !initialValues) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        // If original_amount not provided, set it equal to current_balance
        const submitData = {
            ...formValues,
            original_amount: formValues.original_amount || formValues.current_balance
        };

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">
                        Debt details
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                        {initialValues ? 'Update debt account' : 'Add a new debt account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Enter the details of your debt to track it in your dashboard.
                    </p>
                </div>
                {initialValues && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700"
                    >
                        Cancel edit
                    </button>
                )}
            </div>

            {/* Tier Limit Warning */}
            {tierLimitError && !initialValues && (
                <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-900">
                                Tier Limit Reached
                            </h4>
                            <p className="mt-1 text-sm text-amber-700">
                                {tierLimitError.message}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-amber-800">
                                {tierLimitError.action}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tier Info Display */}
            {tierInfo && !initialValues && !tierLimitError && (
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Info className="h-4 w-4" />
                        <span>
                            {tierInfo.max_debts === null 
                                ? `Unlimited debts on ${tierInfo.tier} tier` 
                                : `${tierInfo.current_count} of ${tierInfo.max_debts} debts used (${tierInfo.tier} tier)`
                            }
                        </span>
                    </div>
                </div>
            )}

            {/* Basic Fields */}
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Debt Name */}
                    <Field 
                        label="Debt name" 
                        name="name" 
                        value={formValues.name} 
                        onChange={handleChange} 
                        placeholder="e.g., KCB Personal Loan" 
                        required 
                        error={errors.name}
                    />

                    {/* Creditor */}
                    <Field 
                        label="Creditor/Lender" 
                        name="creditor_name" 
                        value={formValues.creditor_name} 
                        onChange={handleChange} 
                        placeholder="e.g., KCB Bank"
                        error={errors.creditor_name}
                    />

                    {/* Debt Type */}
                    <SelectField
                        label="Debt type"
                        name="debt_type"
                        value={formValues.debt_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="MOBILE_LOAN">Mobile Loan (M-Shwari, Fuliza)</option>
                        <option value="SACCO_LOAN">SACCO Loan</option>
                        <option value="BANK_LOAN">Bank Loan</option>
                        <option value="MORTGAGE">Mortgage/Home Loan</option>
                        <option value="CAR_LOAN">Car Loan</option>
                        <option value="STUDENT_LOAN">Student/Education Loan</option>
                        <option value="BUSINESS_LOAN">Business Loan</option>
                        <option value="FAMILY_FRIEND">Family/Friend Loan</option>
                        <option value="HIRE_PURCHASE">Hire Purchase</option>
                        <option value="OTHER">Other</option>
                    </SelectField>

                    {/* Currency */}
                    <SelectField
                        label="Currency"
                        name="currency"
                        value={formValues.currency}
                        onChange={handleChange}
                        required
                    >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="TZS">TZS - Tanzanian Shilling</option>
                        <option value="UGX">UGX - Ugandan Shilling</option>
                    </SelectField>

                    {/* Current Balance */}
                    <Field 
                        label="Current balance" 
                        name="current_balance" 
                        type="number" 
                        min="0.01" 
                        step="0.01" 
                        value={formValues.current_balance} 
                        onChange={handleChange} 
                        placeholder="35,000" 
                        required 
                        error={errors.current_balance}
                        helpText="How much you currently owe"
                    />

                    {/* Minimum Payment */}
                    <Field 
                        label="Minimum payment" 
                        name="minimum_payment" 
                        type="number" 
                        min="0.01" 
                        step="0.01" 
                        value={formValues.minimum_payment} 
                        onChange={handleChange} 
                        placeholder="5,000" 
                        required 
                        error={errors.minimum_payment}
                        helpText="Required amount per payment period"
                    />

                    {/* Payment Frequency */}
                    <SelectField
                        label="Payment frequency"
                        name="payment_frequency"
                        value={formValues.payment_frequency}
                        onChange={handleChange}
                        required
                    >
                        <option value="WEEKLY">Weekly</option>
                        <option value="BIWEEKLY">Every 2 Weeks</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                    </SelectField>

                    {/* Due Date */}
                    <Field 
                        label="Next payment due" 
                        name="due_date" 
                        type="date" 
                        value={formValues.due_date} 
                        onChange={handleChange}
                        helpText="When is your next payment due?"
                    />
                </div>

                {/* Priority Checkbox */}
                <div className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                    <input
                        type="checkbox"
                        id="is_priority"
                        name="is_priority"
                        checked={formValues.is_priority}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="is_priority" className="flex-1 text-sm font-semibold text-slate-700">
                        Mark as priority debt
                        <span className="ml-2 text-xs font-normal text-slate-500">
                            (Focus on paying this off first)
                        </span>
                    </label>
                </div>

                {/* Advanced Options Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                    <span>Advanced Options (Optional)</span>
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {/* Advanced Fields */}
                {showAdvanced && (
                    <div className="space-y-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Original Amount */}
                            <Field 
                                label="Original amount borrowed" 
                                name="original_amount" 
                                type="number" 
                                min="0.01" 
                                step="0.01" 
                                value={formValues.original_amount} 
                                onChange={handleChange} 
                                placeholder="40,000"
                                error={errors.original_amount}
                                helpText="Total amount you originally borrowed"
                            />

                            {/* Interest Rate */}
                            <Field 
                                label="Interest rate (%)" 
                                name="interest_rate" 
                                type="number" 
                                min="0" 
                                max="100"
                                step="0.01" 
                                value={formValues.interest_rate} 
                                onChange={handleChange} 
                                placeholder="13.5"
                                error={errors.interest_rate}
                                helpText="Annual interest rate"
                            />

                            {/* Committed Payment */}
                            <Field 
                                label="Committed payment amount" 
                                name="committed_payment" 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={formValues.committed_payment} 
                                onChange={handleChange} 
                                placeholder="7,000"
                                error={errors.committed_payment}
                                helpText="Amount you commit to pay (should be ≥ minimum)"
                            />

                            {/* Start Date */}
                            <Field 
                                label="Loan start date" 
                                name="start_date" 
                                type="date" 
                                value={formValues.start_date} 
                                onChange={handleChange}
                                helpText="When did you take this loan?"
                            />

                            {/* Account Number */}
                            <Field 
                                label="Account/Reference number" 
                                name="account_number" 
                                value={formValues.account_number} 
                                onChange={handleChange} 
                                placeholder="ACC-123456"
                                helpText="For your reference only"
                            />
                        </div>

                        {/* Auto Budget Checkbox */}
                        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white p-3">
                            <input
                                type="checkbox"
                                id="auto_add_to_budget"
                                name="auto_add_to_budget"
                                checked={formValues.auto_add_to_budget}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="auto_add_to_budget" className="flex-1 text-sm text-slate-700">
                                Automatically add to budget as recurring expense
                            </label>
                        </div>

                        {/* Notes */}
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Notes
                            <textarea
                                name="notes"
                                value={formValues.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Any additional information about this debt..."
                                className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="justify-center" 
                    disabled={isSubmitting || (tierLimitError && !initialValues)}
                >
                    {isSubmitting ? 'Saving debt...' : initialValues ? 'Save changes' : 'Create debt'}
                </Button>
                {initialValues && (
                    <Button type="button" variant="outline" className="justify-center" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

// Reusable Field Component
const Field = ({ label, error, helpText, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        {props.required && <span className="text-red-500">*</span>}
        <input
            {...props}
            className={`rounded-xl border px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500 ${
                error ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}
        />
        {helpText && !error && (
            <span className="text-xs text-slate-500">{helpText}</span>
        )}
        {error && (
            <span className="text-xs font-semibold text-red-600">{error}</span>
        )}
    </label>
);

// Reusable Select Field Component
const SelectField = ({ label, children, error, helpText, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        {props.required && <span className="text-red-500">*</span>}
        <select
            {...props}
            className={`rounded-xl border px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500 ${
                error ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}
        >
            {children}
        </select>
        {helpText && !error && (
            <span className="text-xs text-slate-500">{helpText}</span>
        )}
        {error && (
            <span className="text-xs font-semibold text-red-600">{error}</span>
        )}
    </label>
);

export default DebtForm;