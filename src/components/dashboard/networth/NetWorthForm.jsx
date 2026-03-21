import React, { useEffect, useState } from 'react';
import Button from '../../Button';

const assetEmptyForm = {
    name: '',
    categoryId: '',
    currentValue: '',
    purchaseValue: '',
    currency: 'KES',
    purchaseDate: '',
    interestRate: '',
    institution: '',
    accountNumber: '',
    isLiquid: false,
    includeInNetWorth: true,
    lastValuedDate: '',
    notes: '',
};

const liabilityEmptyForm = {
    name: '',
    categoryId: '',
    amount: '',
    currency: 'KES',
    dueDate: '',
    creditor: '',
    status: 'ACTIVE',
    includeInNetWorth: true,
    notes: '',
};

const currencyOptions = ['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX'];

const NetWorthForm = ({
    kind,
    categories,
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    variant = 'card',
    showCategoryIdNotice = false,
}) => {
    const [formValues, setFormValues] = useState(kind === 'asset' ? assetEmptyForm : liabilityEmptyForm);
    const isModal = variant === 'modal';
    const inputClasses = isModal
        ? 'rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500'
        : 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500';
    const textareaClasses = isModal
        ? 'rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500'
        : 'rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500';

    useEffect(() => {
        const defaultCategoryId = categories?.[0]?.categoryId ? String(categories[0].categoryId) : '';

        if (kind === 'asset') {
            if (initialValues) {
                setFormValues({
                    name: initialValues.name ?? '',
                    categoryId: initialValues.category ? String(initialValues.category) : defaultCategoryId,
                    currentValue: initialValues.currentValue ?? '',
                    purchaseValue: initialValues.purchaseValue ?? '',
                    currency: initialValues.currency ?? 'KES',
                    purchaseDate: initialValues.purchaseDate ?? '',
                    interestRate: initialValues.interestRate ?? '',
                    institution: initialValues.institution ?? '',
                    accountNumber: initialValues.accountNumber ?? '',
                    isLiquid: initialValues.isLiquid ?? false,
                    includeInNetWorth: initialValues.includeInNetWorth ?? true,
                    lastValuedDate: initialValues.lastValuedDate ?? '',
                    notes: initialValues.notes ?? '',
                });
                return;
            }

            setFormValues({
                ...assetEmptyForm,
                categoryId: defaultCategoryId,
            });
            return;
        }

        if (initialValues) {
            setFormValues({
                name: initialValues.name ?? '',
                categoryId: initialValues.category ? String(initialValues.category) : defaultCategoryId,
                amount: initialValues.amount ?? '',
                currency: initialValues.currency ?? 'KES',
                dueDate: initialValues.dueDate ?? '',
                creditor: initialValues.creditor ?? '',
                status: initialValues.status ?? 'ACTIVE',
                includeInNetWorth: initialValues.includeInNetWorth ?? true,
                notes: initialValues.notes ?? '',
            });
            return;
        }

        setFormValues({
            ...liabilityEmptyForm,
            categoryId: defaultCategoryId,
        });
    }, [categories, initialValues, kind]);

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

    const label = kind === 'asset' ? 'asset' : 'liability';

    return (
        <form onSubmit={handleSubmit} className={isModal ? 'space-y-4' : 'rounded-3xl border border-gray-100 bg-white p-6 shadow-sm'}>
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">{label} details</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                    {kind === 'asset'
                        ? 'Use this form to create or update assets against the live API.'
                        : 'Use this form to create or update liabilities against the live API.'}
                </p>
            </div>

            {showCategoryIdNotice && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    The live API currently expects numeric category IDs on create and update, while the category list endpoint only exposes names and UUIDs.
                    This form pre-fills the category ID using the returned list order so endpoint testing can still move forward.
                </div>
            )}

            <div className={`grid ${isModal ? 'gap-3 md:grid-cols-2' : 'gap-4 md:grid-cols-2'}`}>
                <Field
                    label={kind === 'asset' ? 'Asset name' : 'Liability name'}
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    placeholder={kind === 'asset' ? 'Emergency fund' : 'Rent arrears'}
                    required
                    className={inputClasses}
                />

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Suggested category
                    <select
                        value={formValues.categoryId}
                        onChange={(event) => {
                            const { value } = event.target;
                            setFormValues((current) => ({
                                ...current,
                                categoryId: value,
                            }));
                        }}
                        className={inputClasses}
                    >
                        {!categories?.length && <option value="">No categories loaded</option>}
                        {categories?.map((category) => (
                            <option key={category.id} value={String(category.categoryId)}>
                                {category.name} (ID {category.categoryId})
                            </option>
                        ))}
                    </select>
                </label>

                <Field
                    label="Category ID"
                    name="categoryId"
                    type="number"
                    min="1"
                    step="1"
                    value={formValues.categoryId}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                />

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Currency
                    <select
                        name="currency"
                        value={formValues.currency}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        {currencyOptions.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </label>

                {kind === 'asset' ? (
                    <>
                        <Field
                            label="Current value"
                            name="currentValue"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formValues.currentValue}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                        />
                        <Field
                            label="Purchase value"
                            name="purchaseValue"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formValues.purchaseValue}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                        <Field
                            label="Institution or location"
                            name="institution"
                            value={formValues.institution}
                            onChange={handleChange}
                            placeholder="KCB Bank"
                            className={inputClasses}
                        />
                        <Field
                            label="Account or reference number"
                            name="accountNumber"
                            value={formValues.accountNumber}
                            onChange={handleChange}
                            placeholder="Optional"
                            className={inputClasses}
                        />
                        <Field label="Purchase date" name="purchaseDate" type="date" value={formValues.purchaseDate} onChange={handleChange} className={inputClasses} />
                        <Field label="Last valued date" name="lastValuedDate" type="date" value={formValues.lastValuedDate} onChange={handleChange} className={inputClasses} />
                        <Field
                            label="Interest or growth rate (%)"
                            name="interestRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formValues.interestRate}
                            onChange={handleChange}
                            className={inputClasses}
                        />

                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 md:col-span-2">
                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    name="isLiquid"
                                    checked={formValues.isLiquid}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Mark as a liquid asset
                            </label>
                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    name="includeInNetWorth"
                                    checked={formValues.includeInNetWorth}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Include in net worth calculations
                            </label>
                        </div>
                    </>
                ) : (
                    <>
                        <Field
                            label="Amount owed"
                            name="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formValues.amount}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                        />
                        <Field
                            label="Creditor"
                            name="creditor"
                            value={formValues.creditor}
                            onChange={handleChange}
                            placeholder="Landlord or provider"
                            className={inputClasses}
                        />
                        <Field label="Due date" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} className={inputClasses} />

                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Status
                            <select
                                name="status"
                                value={formValues.status}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="PAID">Paid</option>
                                <option value="DISPUTED">Disputed</option>
                            </select>
                        </label>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 md:col-span-2">
                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    name="includeInNetWorth"
                                    checked={formValues.includeInNetWorth}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Include in net worth calculations
                            </label>
                        </div>
                    </>
                )}

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 md:col-span-2">
                    Notes
                    <textarea
                        name="notes"
                        value={formValues.notes}
                        onChange={handleChange}
                        rows={isModal ? 3 : 4}
                        placeholder="Anything helpful for tracking or testing the endpoint."
                        className={textareaClasses}
                    />
                </label>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" size="sm" className="justify-center" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="justify-center" disabled={isSubmitting}>
                    {isSubmitting
                        ? `Saving ${label}...`
                        : initialValues
                            ? 'Save changes'
                            : `Add ${label}`}
                </Button>
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

export default NetWorthForm;
