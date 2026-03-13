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
            });
            return;
        }

        setFormValues(emptyForm);
    }, [initialValues]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: value,
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
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Debt form</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                        {initialValues ? 'Update debt account' : 'Add a new debt account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Save the main details from your backend API so the dashboard can summarize what you owe.
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
                <Field label="Balance" name="balance" type="number" min="0" step="0.01" value={formValues.balance} onChange={handleChange} placeholder="35000" required />
                <Field label="Interest rate (%)" name="interestRate" type="number" min="0" step="0.01" value={formValues.interestRate} onChange={handleChange} placeholder="13.5" />
                <Field label="Minimum payment" name="minimumPayment" type="number" min="0" step="0.01" value={formValues.minimumPayment} onChange={handleChange} placeholder="5000" />
                <Field label="Due date" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} />
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 md:col-span-2">
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
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 md:col-span-2">
                    Notes
                    <textarea
                        name="notes"
                        value={formValues.notes}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Anything helpful from the backend record, like account number or repayment notes."
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

