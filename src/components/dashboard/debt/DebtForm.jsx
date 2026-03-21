import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../Button';

const emptyForm = {
    name: '',
    creditor: '',
    balance: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
    status: 'ACTIVE',
    notes: '',
    debtType: 'PERSONAL_LOAN',
    paymentFrequency: 'MONTHLY',
    startDate: '',
    isPriority: false,
    accountNumber: '',
    currency: 'KES',
};

const DebtForm = ({ initialValues, onSubmit, onCancel, isSubmitting, variant = 'card' }) => {
    const [formValues, setFormValues] = useState(emptyForm);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const isModal = variant === 'modal';
    const inputClasses = isModal
        ? 'rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500'
        : 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500';
    const textareaClasses = isModal
        ? 'rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500'
        : 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500';

    useEffect(() => {
        if (initialValues) {
            setFormValues({
                name: initialValues.name ?? '',
                creditor: initialValues.creditor ?? '',
                balance: initialValues.balance ?? '',
                interestRate: initialValues.interestRate ?? '',
                minimumPayment: initialValues.minimumPayment ?? '',
                dueDate: initialValues.dueDate ?? '',
                status: initialValues.status ?? 'ACTIVE',
                notes: initialValues.notes ?? '',
                debtType: initialValues.debtType ?? 'PERSONAL_LOAN',
                paymentFrequency: initialValues.paymentFrequency ?? 'MONTHLY',
                startDate: initialValues.startDate ?? '',
                isPriority: initialValues.isPriority ?? false,
                accountNumber: initialValues.accountNumber ?? '',
                currency: initialValues.currency ?? 'KES',
            });
            setShowAdvanced(true);
            return;
        }

        setFormValues(emptyForm);
        setShowAdvanced(false);
    }, [initialValues]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formValues);
    };

    return (
        <form onSubmit={handleSubmit} className={isModal ? 'space-y-4' : 'rounded-3xl border border-gray-100 bg-white p-6 shadow-sm'}>
            {!isModal && (
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Debt details</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                            {initialValues ? 'Update debt account' : 'Add a new debt account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter the details of your debt to track it in your dashboard.
                        </p>
                    </div>
                    {initialValues && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
                        >
                            Cancel edit
                        </button>
                    )}
                </div>
            )}

            {isModal && (
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Debt details</p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                        Add the essentials first.
                    </p>
                </div>
            )}

            <div className={`grid ${isModal ? 'gap-2.5 md:grid-cols-2' : 'gap-4 md:grid-cols-2'}`}>
                <Field label="Debt name" name="name" value={formValues.name} onChange={handleChange} placeholder="Student loan" required className={inputClasses} />
                
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Debt type
                    <select
                        name="debtType"
                        value={formValues.debtType}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="MOBILE_LOAN">Mobile Loan</option>
                        <option value="SACCO_LOAN">SACCO Loan</option>
                        <option value="BANK_LOAN">Bank Loan</option>
                        <option value="MORTGAGE">Mortgage</option>
                        <option value="CAR_LOAN">Car Loan</option>
                        <option value="STUDENT_LOAN">Student Loan</option>
                        <option value="BUSINESS_LOAN">Business Loan</option>
                        <option value="FAMILY_FRIEND">Family or Friend</option>
                        <option value="HIRE_PURCHASE">Hire Purchase</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>

                <Field label="Current balance" name="balance" type="number" min="0" step="0.01" value={formValues.balance} onChange={handleChange} placeholder="35000" required className={inputClasses} />
                <Field label="Interest rate (%)" name="interestRate" type="number" min="0" step="0.01" value={formValues.interestRate} onChange={handleChange} placeholder="13.5" className={inputClasses} />
                <Field label="Minimum payment" name="minimumPayment" type="number" min="0" step="0.01" value={formValues.minimumPayment} onChange={handleChange} placeholder="5000" className={inputClasses} />
                <Field label="Due date" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} className={inputClasses} />

                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id="isPriority"
                        name="isPriority"
                        checked={formValues.isPriority}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isPriority" className="text-sm font-medium text-gray-700">
                        Mark as priority debt
                    </label>
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 md:col-span-2">
                    Description
                    <textarea
                        name="notes"
                        value={formValues.notes}
                        onChange={handleChange}
                        rows={isModal ? 2 : 3}
                        placeholder="Anything helpful like account number or repayment notes."
                        className={textareaClasses}
                    />
                </label>
            </div>

            {isModal && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((current) => !current)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {showAdvanced ? 'Hide extra details' : 'Add more details'}
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <Field label="Creditor" name="creditor" value={formValues.creditor} onChange={handleChange} placeholder="Bank or lender" className={inputClasses} />
                            <Field label="Account number" name="accountNumber" value={formValues.accountNumber} onChange={handleChange} placeholder="Optional" className={inputClasses} />

                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Payment frequency
                                <select
                                    name="paymentFrequency"
                                    value={formValues.paymentFrequency}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="BIWEEKLY">Every 2 weeks</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                </select>
                            </label>

                            <Field label="Start date" name="startDate" type="date" value={formValues.startDate} onChange={handleChange} className={inputClasses} />

                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 md:col-span-2">
                                Status
                                <select
                                    name="status"
                                    value={formValues.status}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="PAID_OFF">Paid off</option>
                                    <option value="PAUSED">Paused</option>
                                    <option value="DEFAULTED">Defaulted</option>
                                </select>
                            </label>
                        </div>
                    )}
                </div>
            )}

            <div className={`mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end ${isModal ? 'pt-0' : ''}`}>
                {isModal && (
                    <Button type="button" variant="outline" size="sm" className="justify-center" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" variant="primary" size="sm" className="justify-center" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving debt...' : initialValues ? 'Save changes' : 'Add debt'}
                </Button>
                {!isModal && initialValues && (
                    <Button type="button" variant="outline" className="justify-center" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

const Field = ({ label, className = '', ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        {label}
        <input
            {...props}
            className={className || 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500'}
        />
    </label>
);

export default DebtForm;

