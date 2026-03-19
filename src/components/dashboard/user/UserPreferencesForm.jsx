import React, { useEffect, useState } from 'react';
import Button from '../../Button';

const UserPreferencesForm = ({ profile, onSubmit, isSubmitting }) => {
    const [formValues, setFormValues] = useState({
        monthly_income: '',
        primary_financial_goal: '',
        receive_notifications: true,
        receive_weekly_summary: true,
    });

    useEffect(() => {
        if (!profile) {
            return;
        }

        setFormValues({
            monthly_income: profile.monthly_income || '',
            primary_financial_goal: profile.primary_financial_goal || '',
            receive_notifications: profile.receive_notifications ?? true,
            receive_weekly_summary: profile.receive_weekly_summary ?? true,
        });
    }, [profile]);

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
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Financial preferences</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Shape the guidance you receive.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">These settings help Shilingi Moves reflect your financial priorities more clearly.</p>

            <div className="mt-6 grid gap-4">
                <Field
                    label="Monthly income"
                    name="monthly_income"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.monthly_income}
                    onChange={handleChange}
                    placeholder="120000"
                />

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Primary financial goal
                    <select
                        name="primary_financial_goal"
                        value={formValues.primary_financial_goal}
                        onChange={handleChange}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                    >
                        <option value="">Select a goal</option>
                        <option value="SAVE_EMERGENCY">Build emergency fund</option>
                        <option value="PAY_DEBT">Pay off debt</option>
                        <option value="SAVE_INVEST">Save and invest</option>
                        <option value="BUDGET_BETTER">Budget better</option>
                        <option value="RETIREMENT">Plan for retirement</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        name="receive_notifications"
                        checked={formValues.receive_notifications}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Receive notifications
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        name="receive_weekly_summary"
                        checked={formValues.receive_weekly_summary}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Receive weekly summary
                </label>
            </div>

            <div className="mt-6">
                <Button type="submit" variant="primary" className="justify-center" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving preferences...' : 'Save preferences'}
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

export default UserPreferencesForm;
