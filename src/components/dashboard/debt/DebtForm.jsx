import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../Button';
import NumericInput from '../../common/NumericInput';

const emptyForm = {
    name: '',
    creditor: '',
    balance: '',
    interestRate: '',
    minimumPayment: '',
    durationMonths: '',
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

const debtTypeLabels = {
    PERSONAL_LOAN: 'Personal Loan',
    CREDIT_CARD: 'Credit Card',
    MOBILE_LOAN: 'Mobile Loan',
    SACCO_LOAN: 'SACCO Loan',
    BANK_LOAN: 'Bank Loan',
    MORTGAGE: 'Mortgage',
    CAR_LOAN: 'Car Loan',
    STUDENT_LOAN: 'Student Loan',
    BUSINESS_LOAN: 'Business Loan',
    FAMILY_FRIEND: 'Family or Friend',
    HIRE_PURCHASE: 'Hire Purchase',
    OTHER: 'Other Debt',
};

const DebtForm = ({ initialValues, onSubmit, onCancel, isSubmitting, variant = 'card' }) => {
    const [formValues, setFormValues] = useState(emptyForm);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const isModal = variant === 'modal';
    const inputClasses = isModal
        ? 'rounded-xl border border-[#d8ece3] px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10'
        : 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500';
    const textareaClasses = isModal
        ? 'rounded-xl border border-[#d8ece3] px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10'
        : 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500';
    const calculatedInterestRate = (() => {
        const balance = Number(formValues.balance || 0);
        const monthlyPayment = Number(formValues.minimumPayment || 0);
        const duration = Number(formValues.durationMonths || 0);
        if (balance <= 0 || monthlyPayment <= 0 || duration <= 0) return '';
        const totalRepayment = monthlyPayment * duration;
        const interestAmount = Math.max(totalRepayment - balance, 0);
        if (interestAmount <= 0) return '0.00';
        return ((interestAmount / balance) * (12 / duration) * 100).toFixed(2);
    })();
    const hasDebtCalculationInputs = Number(formValues.balance || 0) > 0
        && Number(formValues.minimumPayment || 0) > 0
        && Number(formValues.durationMonths || 0) > 0;
    const repaymentTotal = Number(formValues.minimumPayment || 0) * Number(formValues.durationMonths || 0);
    const repaymentBelowPrincipal = hasDebtCalculationInputs && repaymentTotal < Number(formValues.balance || 0);
    const interestHelperText = !hasDebtCalculationInputs
        ? 'Enter debt amount, monthly repayment, and duration to calculate.'
        : repaymentBelowPrincipal
            ? 'Repayment total is below the debt amount, so the estimated rate shows 0.00%. Check duration or repayment.'
            : 'Estimated from debt amount, monthly repayment, and duration.';

    useEffect(() => {
        if (initialValues) {
            setFormValues({
                name: initialValues.name ?? '',
                creditor: initialValues.creditor ?? '',
                balance: initialValues.balance ?? '',
                interestRate: initialValues.interestRate ?? '',
                minimumPayment: initialValues.minimumPayment ?? '',
                durationMonths: initialValues.durationMonths ?? '',
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

    useEffect(() => {
        if (!calculatedInterestRate) return;
        setFormValues((current) => (
            current.interestRate === calculatedInterestRate
                ? current
                : { ...current, interestRate: calculatedInterestRate }
        ));
    }, [calculatedInterestRate]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const fallbackDebtName = debtTypeLabels[formValues.debtType] || 'Debt Account';
        onSubmit({
            ...formValues,
            interestRate: calculatedInterestRate || formValues.interestRate,
            name: formValues.name?.trim() || fallbackDebtName,
        });
    };

    return (
        <form onSubmit={handleSubmit} className={isModal ? 'space-y-3' : 'rounded-3xl border border-gray-100 bg-white p-6 shadow-sm'}>
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
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#11814f]">Debt details</p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                        Add the essentials first.
                    </p>
                </div>
            )}

            <div className={`grid ${isModal ? 'gap-2.5 md:grid-cols-2' : 'gap-4 md:grid-cols-2'}`}>
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Debt type
                    <select
                        name="debtType"
                        value={formValues.debtType}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="MOBILE_LOAN">Mobile Loan</option>
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="SACCO_LOAN">SACCO Loan</option>
                        <option value="BANK_LOAN">Bank Loan</option>
                        <option value="MORTGAGE">Mortgage</option>
                        <option value="BUSINESS_LOAN">Business Loan</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="CAR_LOAN">Car Loan</option>
                        <option value="STUDENT_LOAN">Student Loan</option>
                        <option value="FAMILY_FRIEND">Family or Friend</option>
                        <option value="HIRE_PURCHASE">Hire Purchase</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>

                <Field label="Monthly repayment" name="minimumPayment" type="number" min="0" step="0.01" value={formValues.minimumPayment} onChange={handleChange} placeholder="5000" className={inputClasses} />
                <Field label="Debt amount" name="balance" type="number" min="0" step="0.01" value={formValues.balance} onChange={handleChange} placeholder="35000" required className={inputClasses} />
                <Field label="Duration (months)" name="durationMonths" type="number" min="1" step="1" value={formValues.durationMonths} onChange={handleChange} placeholder="12" className={inputClasses} />
                <Field label="Monthly repayment date" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} className={inputClasses} />
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Interest rate (%) - auto calculated
                    <input
                        type="text"
                        value={calculatedInterestRate ? `${calculatedInterestRate}%` : ''}
                        readOnly
                        placeholder="Auto"
                        className={`${inputClasses} bg-[#f8fcfa] font-semibold text-[#11814f]`}
                    />
                    <span className="text-xs leading-4 text-[#6f968a]">
                        {interestHelperText}
                    </span>
                </label>

                {!isModal && <div className="flex items-center gap-3 py-2">
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
                </div>}

                {!isModal && <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 md:col-span-2">
                    Description
                    <textarea
                        name="notes"
                        value={formValues.notes}
                        onChange={handleChange}
                        rows={isModal ? 2 : 3}
                        placeholder="Anything helpful like account number or repayment notes."
                        className={textareaClasses}
                    />
                </label>}
            </div>

            {isModal && (
                <div className="rounded-2xl border border-[#d0e8df] bg-[#f8fcfa] px-4 py-3">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((current) => !current)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#11814f]"
                    >
                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {showAdvanced ? 'Hide extra details' : 'Add more details'}
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <Field label="Financial institution" name="creditor" value={formValues.creditor} onChange={handleChange} placeholder="Bank, SACCO, lender, or person" className={inputClasses} wrapperClassName="md:col-span-2" />

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
                {isModal ? (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#11814f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f7044] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Saving debt...' : initialValues ? 'Save changes' : 'Add debt'}
                    </button>
                ) : (
                    <Button type="submit" variant="primary" size="sm" className="justify-center" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving debt...' : initialValues ? 'Save changes' : 'Add debt'}
                    </Button>
                )}
                {!isModal && initialValues && (
                    <Button type="button" variant="outline" className="justify-center" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

const Field = ({ label, className = '', wrapperClassName = '', ...props }) => (
    <label className={`flex flex-col gap-2 text-sm font-medium text-gray-700 ${wrapperClassName}`}>
        {label}
        {props.type === 'number' ? (
            <NumericInput
                {...props}
                className={className || 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500'}
            />
        ) : (
            <input
                {...props}
                className={className || 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500'}
            />
        )}
    </label>
);

export default DebtForm;

