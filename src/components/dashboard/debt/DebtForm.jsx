import React, { useEffect, useState } from 'react';
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
    const isModal = variant === 'modal';
    const inputClasses = isModal
        ? 'h-10 rounded-lg border border-[#e7e9ee] bg-[#f7f8fa] px-3 text-[11px] text-[#232e3d] outline-none transition-colors placeholder:text-[#a3abb7] focus:border-[#11814f] focus:bg-white focus:ring-2 focus:ring-[#11814f]/10'
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
            return;
        }

        setFormValues(emptyForm);
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
                <div className="pr-8">
                    <p className="text-[14px] font-bold leading-5 text-[#11814f]">Add your debts</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#232e3d]">
                        Kindly provide the following to list your debts
                    </p>
                </div>
            )}

            <div className={`grid ${isModal ? 'gap-2.5' : 'gap-4 md:grid-cols-2'}`}>
                <label className={`flex flex-col ${isModal ? 'gap-1 text-[10px] font-medium text-[#707974]' : 'gap-2 text-sm font-medium text-gray-700'}`}>
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

                <Field label="Debt amount" name="balance" type="number" min="0" step="0.01" value={formValues.balance} onChange={handleChange} placeholder="E.g. KES 20,000.00" required className={inputClasses} isModal={isModal} />
                <Field label="Monthly repayment" name="minimumPayment" type="number" min="0" step="0.01" value={formValues.minimumPayment} onChange={handleChange} placeholder="E.g. KES 10,000" className={inputClasses} isModal={isModal} />
                <div className={isModal ? 'grid grid-cols-2 gap-2.5' : 'contents'}>
                    <Field label="Duration" name="durationMonths" type="number" min="1" step="1" value={formValues.durationMonths} onChange={handleChange} placeholder="E.g. 12 Months" className={inputClasses} isModal={isModal} />
                    <Field label="Repayment Date" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} className={inputClasses} isModal={isModal} />
                </div>
                {!isModal && <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
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
                </label>}

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

            <div className={`mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end ${isModal ? 'pt-0' : ''}`}>
                {isModal ? (
                    <>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#0c6060] px-5 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0a5454] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Saving debt...' : initialValues ? 'Save changes' : '+ Add Debt'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#0c6060] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#0c6060] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            I have no debt
                        </button>
                    </>
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

const Field = ({ label, className = '', wrapperClassName = '', isModal = false, ...props }) => (
    <label className={`flex flex-col ${isModal ? 'gap-1 text-[10px] font-medium text-[#707974]' : 'gap-2 text-sm font-medium text-gray-700'} ${wrapperClassName}`}>
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

