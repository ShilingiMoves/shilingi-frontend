import React, { useEffect, useState } from 'react';
import Button from '../../Button';

const UserAccountForm = ({ user, onSubmit, isSubmitting }) => {
    const [formValues, setFormValues] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        default_currency: 'KES',
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        setFormValues({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone_number: user.phone_number || '',
            default_currency: user.default_currency || 'KES',
        });
    }, [user]);

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
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Personal details</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Keep your account details current.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Update the basics we use across your dashboard and account experience.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="First name" name="first_name" value={formValues.first_name} onChange={handleChange} required />
                <Field label="Last name" name="last_name" value={formValues.last_name} onChange={handleChange} required />
                <Field label="Phone number" name="phone_number" value={formValues.phone_number} onChange={handleChange} placeholder="+254 700 000 000" />

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Default currency
                    <select
                        name="default_currency"
                        value={formValues.default_currency}
                        onChange={handleChange}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                    >
                        <option value="KES">KES</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="TZS">TZS</option>
                        <option value="UGX">UGX</option>
                    </select>
                </label>
            </div>

            <div className="mt-6">
                <Button type="submit" variant="primary" className="justify-center" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving details...' : 'Save details'}
                </Button>
            </div>
        </form>
    );
};

const Field = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <input
            {...props}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

export default UserAccountForm;
