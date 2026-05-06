import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, UserRoundPlus } from 'lucide-react';
import Button from '../components/Button';
import { registerUser } from '../services/authApi';

export const PENDING_PROFILE_SIGNUP_EMAIL_KEY = 'shilingi_pending_profile_signup_email';

const passwordRules = [
    { id: 'length', label: '8 to 12 characters', test: (value) => value.length >= 8 && value.length <= 12 },
    { id: 'letter', label: 'At least one letter', test: (value) => /[A-Za-z]/.test(value) },
    { id: 'number', label: 'At least one number', test: (value) => /\d/.test(value) },
    { id: 'symbol', label: 'At least one symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const getPasswordStrength = (password) => {
    const passed = passwordRules.filter((rule) => rule.test(password));
    if (!password) {
        return { passed, label: 'Password strength', tone: 'bg-gray-200', textTone: 'text-gray-500', width: '0%' };
    }
    if (passed.length <= 2) {
        return { passed, label: 'Weak', tone: 'bg-rose-500', textTone: 'text-rose-700', width: '35%' };
    }
    if (passed.length === 3) {
        return { passed, label: 'Almost there', tone: 'bg-amber-500', textTone: 'text-amber-700', width: '70%' };
    }
    return { passed, label: 'Strong', tone: 'bg-emerald-600', textTone: 'text-emerald-700', width: '100%' };
};

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const passwordStrength = getPasswordStrength(formValues.password);
    const isPasswordStrong = passwordStrength.passed.length === passwordRules.length;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formValues.password !== formValues.password_confirm) {
            setError('Your passwords do not match. Please try again.');
            return;
        }

        if (!isPasswordStrong) {
            setError('Please create a stronger password: 8 to 12 characters with letters, numbers, and symbols.');
            return;
        }

        try {
            setIsSubmitting(true);
            // Include default_currency as 'KES' by default as required by backend
            await registerUser({
                ...formValues,
                default_currency: 'KES',
            });
            try {
                sessionStorage.setItem(PENDING_PROFILE_SIGNUP_EMAIL_KEY, formValues.email.trim().toLowerCase());
            } catch {
                // If storage is blocked, sign-in will still use profile completeness.
            }
            setSuccess('Your account is ready. You can now sign in and start taking control of your money.');
            setTimeout(() => navigate('/signin'), 1200);
        } catch (err) {
            setError(err.message || 'We could not create your account right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,_#fffdf8_0%,_#ffffff_45%,_#f4f8ff_100%)] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[2rem] border border-amber-100 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
                    <div className="inline-flex rounded-3xl bg-amber-50 p-4 text-amber-600">
                        <UserRoundPlus size={28} />
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Create your account</p>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Start building better money habits with guidance you can trust.</h1>
                    <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
                        Join Shilingi Moves to organise your finances, stay on top of your debt, and make smarter decisions with confidence, one step at a time.
                    </p>
                    <div className="mt-8 rounded-3xl border border-gray-100 bg-gray-50 p-5">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={20} className="mt-1 text-emerald-600" />
                            <p className="text-sm leading-6 text-gray-600">
                                Your account gives you a private space to track your progress, return to your dashboard, and keep your financial plan moving forward.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">Fill in your details below to get started with Shilingi Moves.</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" name="first_name" value={formValues.first_name} onChange={handleChange} placeholder="John" required />
                        <Field label="Last name" name="last_name" value={formValues.last_name} onChange={handleChange} placeholder="Doe" required />
                        <div className="sm:col-span-2">
                            <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="example@gmail.com" required />
                        </div>
                        <div className="sm:col-span-2">
                            <Field label="Phone number (optional)" name="phone_number" value={formValues.phone_number} onChange={handleChange} placeholder="0700 000 000" />
                        </div>
                        <div className="space-y-3">
                            <Field label="Password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Create a password" minLength={8} maxLength={12} required />
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Password strength</span>
                                    <span className={`text-sm font-bold ${passwordStrength.textTone}`}>{passwordStrength.label}</span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                    <div className={`h-full rounded-full transition-all ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
                                </div>
                                <div className="mt-3 grid gap-2">
                                    {passwordRules.map((rule) => {
                                        const passed = rule.test(formValues.password);
                                        return (
                                            <div key={rule.id} className={`flex items-center gap-2 text-xs font-medium ${passed ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                <CheckCircle2 size={14} className={passed ? 'text-emerald-600' : 'text-gray-300'} />
                                                <span>{rule.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <Field label="Confirm password" name="password_confirm" type="password" value={formValues.password_confirm} onChange={handleChange} placeholder="Repeat your password" required />

                        <div className="sm:col-span-2">
                            <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting || !isPasswordStrong}>
                                {isSubmitting ? 'Creating your account...' : 'Create account'}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account? <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-600">Sign in</Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

const Field = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        {label}
        <input
            {...props}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

export default SignUpPage;
