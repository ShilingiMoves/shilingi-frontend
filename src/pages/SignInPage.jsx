import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { getStoredUserProfile, hasStoredAccessToken, loginUser, resendVerificationEmail } from '../services/authApi';
import { DASHBOARD_DATA_KEY, persistDashboardSection } from '../utils/dashboardDataState';
import { USER_PROFILE_WORKSPACE_KEY } from '../components/dashboard/user/UserGoalsFamilyForm';

const readProfileWorkspace = () => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}');
    } catch {
        return {};
    }
};

const hasDashboardData = () => {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(DASHBOARD_DATA_KEY) === 'true';
    } catch {
        return false;
    }
};

const hasCompletedProfileSetup = (user) => {
    const profile = user?.profile || {};
    const workspace = readProfileWorkspace();
    return Boolean(
        profile.monthly_income ||
        profile.primary_financial_goal ||
        workspace.shortTermGoal ||
        workspace.mediumTermGoal ||
        workspace.longTermGoal ||
        hasDashboardData()
    );
};

const SignInPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(hasStoredAccessToken() ? 'You are already signed in on this device. Continue to your dashboard whenever you are ready.' : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);

    const needsEmailVerification = error.toLowerCase().includes('verify your email');

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

        try {
            setIsSubmitting(true);
            await loginUser({
                email: formValues.email,
                password: formValues.password,
            });
            setSuccess('Welcome back. Your account is ready, and your money tools are now open.');
            const user = getStoredUserProfile();
            const nextSection = hasCompletedProfileSetup(user) ? 'overview' : 'user';
            persistDashboardSection(nextSection);
            const redirectTo = location.state?.from?.pathname || '/dashboard/app';
            navigate(redirectTo, { replace: true, state: { section: nextSection } });
        } catch (err) {
            setError(err.message || 'We could not sign you in right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        setError('');
        setSuccess('');

        try {
            setIsResendingVerification(true);
            await resendVerificationEmail({
                email: formValues.email.trim(),
            });
            setSuccess('We sent a new verification email. Please check your inbox and spam folder.');
        } catch (err) {
            setError(err.message || 'We could not resend the verification email right now.');
        } finally {
            setIsResendingVerification(false);
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fdfb_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-emerald-100 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Welcome back</p>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Pick up where you left off on your money journey.</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                        Sign in to review your financial progress, stay on top of your plans, and keep moving toward the goals that matter most to you.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <InfoCard icon={<ShieldCheck size={20} />} title="Your progress stays protected" text="Your account keeps your financial information private and accessible only to you." />
                        <InfoCard icon={<KeyRound size={20} />} title="Everything in one place" text="Come back to your dashboard, debt tools, and financial updates without starting over." />
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">Enter your details below to continue managing your money with confidence.</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                            {needsEmailVerification && (
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={isResendingVerification || !formValues.email.trim()}
                                    className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
                                >
                                    {isResendingVerification ? 'Sending verification email...' : 'Resend verification email'}
                                </button>
                            )}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="example@gmail.com" required />
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-gray-700">Password</span>
                                <Link to="/forgot-password" className="text-sm font-semibold text-primary-700 hover:text-primary-600">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                name="password"
                                type="password"
                                value={formValues.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
                            />
                        </div>

                        <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing you in... please wait' : 'Sign in'}
                        </Button>
                        {isSubmitting && (
                            <p className="text-center text-xs text-gray-500">
                                First login may take a few extra seconds if the server is waking up.
                            </p>
                        )}
                    </form>

                    <p className="mt-6 text-sm text-gray-600">
                        New to Shilingi Moves? <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-600">Create your account</Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

const InfoCard = ({ icon, title, text }) => (
    <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-5">
        <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-primary-700 shadow-sm">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
    </div>
);

const Field = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        {label}
        <input
            {...props}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

export default SignInPage;
