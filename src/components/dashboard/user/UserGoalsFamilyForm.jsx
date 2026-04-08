import React, { useEffect, useState } from 'react';
import Button from '../../Button';

export const USER_PROFILE_WORKSPACE_KEY = 'shilingi_user_profile_workspace';

const defaultValues = {
    shortTermGoal: '',
    mediumTermGoal: '',
    longTermGoal: '',
    dependentsCount: '',
    familyNotes: '',
};

const readStoredValues = () => {
    if (typeof window === 'undefined') {
        return defaultValues;
    }

    try {
        const rawValue = window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY);
        if (!rawValue) {
            return defaultValues;
        }

        return {
            ...defaultValues,
            ...JSON.parse(rawValue),
        };
    } catch (error) {
        console.warn('Could not read saved dashboard profile workspace:', error);
        return defaultValues;
    }
};

const UserGoalsFamilyForm = () => {
    const [formValues, setFormValues] = useState(defaultValues);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setFormValues(readStoredValues());
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSaved(false);
        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        try {
            window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(formValues));
            setSaved(true);
        } catch (error) {
            console.warn('Could not save dashboard profile workspace:', error);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Financial goals</p>
                <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Capture what matters now, next, and later.</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep your short, medium, and long-term goals visible inside your dashboard workspace.
                </p>

                <div className="mt-6 grid gap-4">
                    <Field
                        label="Short-term goal"
                        name="shortTermGoal"
                        value={formValues.shortTermGoal}
                        onChange={handleChange}
                        placeholder="Build a 3-month emergency fund"
                    />
                    <Field
                        label="Medium-term goal"
                        name="mediumTermGoal"
                        value={formValues.mediumTermGoal}
                        onChange={handleChange}
                        placeholder="Clear my car loan within 24 months"
                    />
                    <Field
                        label="Long-term goal"
                        name="longTermGoal"
                        value={formValues.longTermGoal}
                        onChange={handleChange}
                        placeholder="Grow retirement and investment income"
                    />
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <Button type="submit" variant="primary" className="justify-center">
                        Save goals
                    </Button>
                    {saved && <p className="text-sm text-emerald-700">Saved to this device for your dashboard workspace.</p>}
                </div>
            </form>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Dependents / family</p>
                <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Add household context when it matters.</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    This section is optional and helps frame planning decisions around the people who depend on you.
                </p>

                <div className="mt-6 grid gap-4">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        Number of dependents
                        <input
                            type="number"
                            min="0"
                            name="dependentsCount"
                            value={formValues.dependentsCount}
                            onChange={handleChange}
                            placeholder="0"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        Family notes
                        <textarea
                            name="familyNotes"
                            value={formValues.familyNotes}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Optional notes about school fees, caregiving, medical support, or upcoming family priorities."
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                        />
                    </label>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <Button type="submit" variant="secondary" className="justify-center">
                        Save family context
                    </Button>
                    {saved && <p className="text-sm text-emerald-700">Saved to this device for your dashboard workspace.</p>}
                </div>
            </form>
        </div>
    );
};

const Field = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <textarea
            {...props}
            rows={4}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

export default UserGoalsFamilyForm;
