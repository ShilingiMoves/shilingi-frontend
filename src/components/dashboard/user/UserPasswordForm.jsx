import React, { useState } from 'react';
import Button from '../../Button';

const emptyForm = {
    current_password: '',
    new_password: '',
    new_password_confirm: '',
};

const UserPasswordForm = ({ onSubmit, isSubmitting }) => {
    const [formValues, setFormValues] = useState(emptyForm);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await onSubmit(formValues);
        setFormValues(emptyForm);
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Security</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Update your password safely.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use this when you want to strengthen your account security or refresh your credentials.</p>

            <div className="mt-6 grid gap-4">
                <Field label="Current password" name="current_password" type="password" value={formValues.current_password} onChange={handleChange} required />
                <Field label="New password" name="new_password" type="password" value={formValues.new_password} onChange={handleChange} required />
                <Field label="Confirm new password" name="new_password_confirm" type="password" value={formValues.new_password_confirm} onChange={handleChange} required />
            </div>

            <div className="mt-6">
                <Button type="submit" variant="primary" className="justify-center" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating password...' : 'Update password'}
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

export default UserPasswordForm;
