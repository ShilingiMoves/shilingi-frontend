import React, { useEffect, useState } from 'react';
import Button from '../../Button';

const emptyForm = {
    name: '',
    creditor: '',
    balance: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
    status: 'active',
    notes: '',
    debtType: 'PERSONAL_LOAN',
    paymentFrequency: 'MONTHLY',
    startDate: '',
    isPriority: false,
    accountNumber: '',
    currency: 'KES',
};

const DebtForm = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
    const [formValues, setFormValues] = useState(emptyForm);

    useEffect(() => {
        if (initialValues) {
            setFormValues({
                name: initialValues.name ?? '',
                creditor: initialValues.creditor ?? '',
                balance: initialValues.balance ?? '',
                interestRate: initialValues.interestRate ?? '',
                minimumPayment: initialValues.minimumPayment ?? '',
                dueDate: initialValues.dueDate ?? '',
                status: initialValues.status ?? 'active',
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

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formValues);
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
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

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Debt name" name="name" value={formValues.name} onChange={handleChange} placeholder="Student loan" required />
                <Field label="Creditor" name="creditor" value={formValues.creditor} onChange={handleChange} placeholder="Bank or lender" required />
                
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Debt type
                    <select
                        name="debtType"
                        value={formValues.debtType}
                        onChange={handleChange}
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
                    >
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="MORTGAGE">Mortgage</option>
                        <option value="CAR_LOAN">Car Loan</option>
                        <option value="STUDENT_LOAN">Student Loan</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>

                <Field label="Account number" name="accountNumber" value={formValues.accountNumber} onChange={handleChange} placeholder="Optional" />
                
                <Field label="Current balance" name="balance" type="number" min="0" step="0.01" value={formValues.balance} onChange={handleChange} placeholder="35000" required />
                <Field label="Interest rate (%)" name="interestRate" type="number" min="0" step="0.01" value={formValues.interestRate} onChange={handleChange} placeholder="13.5" />
                <Field label="Minimum payment" name="minimumPayment" type="number" min="0" step="0.01" value={formValues.minimumPayment} onChange={handleChange} placeholder="5000" />
                
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Payment frequency
                    <select
                        name="paymentFrequency"
                        value={formValues.paymentFrequency}
                        onChange={handleChange}
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
                    >
                        <option value="WEEKLY">Weekly</option>
                        <option value="BI_WEEKLY">Bi-weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="ANNUALLY">Annually</option>
                    </select>
                </label>

                <Field label="Start date" name="startDate" type="date" value={formValues.startDate} onChange={handleChange} />
                <Field label="Due date" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} />
                
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Status
                    <select
                        name="status"
                        value={formValues.status}
                        onChange={handleChange}
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
                    >
                        <option value="active">Active</option>
                        <option value="paid">Paid</option>
                        <option value="in-review">In review</option>
                    </select>
                </label>

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
                    Notes
                    <textarea
                        name="notes"
                        value={formValues.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Anything helpful like account number or repayment notes."
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
                    />
                </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" variant="primary" className="justify-center" disabled={isSubmitting}>
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

const Field = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        {label}
        <input
            {...props}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

export default DebtForm;

