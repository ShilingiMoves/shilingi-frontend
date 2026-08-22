import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { hasStoredAccessToken, loginUser, resendVerificationEmail } from '../services/authApi';
import { persistDashboardSection } from '../utils/dashboardDataState';
import { hasAnyPreferredName, queuePreferredNamePrompt } from '../utils/memberIdentity';
import { shouldShowProfileSetup } from '../utils/profileSetupState';
import { getWellnessAssessment } from '../services/wellnessAssessmentApi';
import { PENDING_PROFILE_SIGNUP_EMAIL_KEY } from './SignUpPage';

const isPendingProfileSignup = (email) => {
    if (typeof window === 'undefined') return false;
    try {
        const pendingEmail = sessionStorage.getItem(PENDING_PROFILE_SIGNUP_EMAIL_KEY);
        return Boolean(pendingEmail && pendingEmail === email.trim().toLowerCase());
    } catch {
        return false;
    }
};

const clearPendingProfileSignup = () => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem(PENDING_PROFILE_SIGNUP_EMAIL_KEY);
    } catch {
        // Storage may be blocked; redirect logic has already completed.
    }
};

const getPostLoginSection = (email) => {
    if (isPendingProfileSignup(email)) {
        return 'user';
    }

    return 'overview';
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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: name === 'password' ? sanitizePasswordInput(value) : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const submittedForm = new FormData(event.currentTarget);
        const submittedEmail = String(submittedForm.get('email') || formValues.email).trim().toLowerCase();
        const submittedPassword = sanitizePasswordInput(submittedForm.get('password') || formValues.password);

        try {
            setIsSubmitting(true);
            const loginPayload = await loginUser({
                email: submittedEmail,
                password: submittedPassword,
            });
            setSuccess('Welcome back. Your account is ready, and your money tools are now open.');
            const nextSection = getPostLoginSection(submittedEmail);
            const loggedInUser = loginPayload?.data?.user || loginPayload?.user || loginPayload?.data || loginPayload;
            if (!hasAnyPreferredName(loggedInUser)) {
                queuePreferredNamePrompt(nextSection === 'user' ? 'signup' : 'returning');
            }
            clearPendingProfileSignup();
            try {
                const assessment = await getWellnessAssessment();
                if (!assessment?.is_completed) {
                    navigate('/wellness-assessment', { replace: true });
                    return;
                }
            } catch {
                navigate('/wellness-assessment', { replace: true });
                return;
            }
            if (shouldShowProfileSetup(submittedEmail)) {
                navigate('/profile-setup', { replace: true });
                return;
            }
            persistDashboardSection(nextSection);
            const redirectTo = location.state?.from?.pathname || '/dashboard/app';
            navigate(redirectTo, { replace: true, state: { section: nextSection } });
        } catch (err) {
            if (shouldResendVerification(err)) {
                const email = formValues.email.trim().toLowerCase();
                try {
                    await resendVerificationEmail({
                        email,
                        redirect_url: getEmailVerificationRedirectUrl(),
                    });
                    setSuccess('This account still needs email verification. We sent a fresh verification email. Please verify your email, then come back and sign in.');
                    setError('');
                } catch (resendError) {
                    setError(resendError.message || 'This account still needs email verification, but we could not send a fresh verification email right now.');
                }
            } else {
                setError(err.message || 'We could not sign you in right now.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialAuth = (provider) => {
        setError(`${provider} sign-in is coming soon. Continue with email for now.`);
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fdfb_0%,_#ffffff_45%,_#eef6ff_100%)] px-3 py-8 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="hidden rounded-[2rem] border border-emerald-100 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10 lg:block">
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

                <section className="bg-transparent px-1 py-0 sm:rounded-[2rem] sm:border sm:border-gray-100 sm:bg-white sm:p-10 sm:shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">Enter your details below to continue managing your money with confidence.</p>
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

                    <div className="mb-6 space-y-3 lg:hidden">
                        <SocialButton label="Continue with Google" provider="google" onClick={() => handleSocialAuth('Google')} />
                        <SocialButton label="Continue with Apple" provider="apple" dark onClick={() => handleSocialAuth('Apple')} />
                        <SocialButton label="Continue with Microsoft" provider="microsoft" muted onClick={() => handleSocialAuth('Microsoft')} />
                    </div>

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
                        New to Shilingi Moves?{' '}
                        <Link to="/onboarding" className="font-semibold text-primary-700 hover:text-primary-600 sm:hidden">
                            Create your account
                        </Link>
                        <Link to="/signup" className="hidden font-semibold text-primary-700 hover:text-primary-600 sm:inline">
                            Create your account
                        </Link>
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

const SocialButton = ({ dark = false, label, provider, muted = false, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full px-5 text-sm font-medium ${dark ? 'bg-[#050708] text-white' : muted ? 'bg-[#2f2f2f] text-white' : 'bg-[#f2f2f2] text-[#1f1f1f]'}`}
    >
        <BrandIcon provider={provider} />
        {label}
    </button>
);

const BrandIcon = ({ provider }) => {
    if (provider === 'google') {
        return (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.76-.07-1.49-.19-2.19H12v4.14h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.48z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.62-2.29l-3.23-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22z" />
                <path fill="#FBBC05" d="M6.41 14.03A6 6 0 0 1 6.09 12c0-.7.12-1.39.32-2.03V7.38H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.62l3.34-2.59z" />
                <path fill="#EA4335" d="M12 5.85c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 2.86 14.7 2 12 2a10 10 0 0 0-8.93 5.38l3.34 2.59C7.2 7.61 9.4 5.85 12 5.85z" />
            </svg>
        );
    }

    if (provider === 'microsoft') {
        return (
            <span className="grid h-5 w-5 shrink-0 grid-cols-2 gap-0.5" aria-hidden="true">
                <span className="bg-[#f25022]" />
                <span className="bg-[#7fba00]" />
                <span className="bg-[#00a4ef]" />
                <span className="bg-[#ffb900]" />
            </span>
        );
    }

    return (
        <svg className="h-5 w-5 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 12.56c-.02-2.08 1.69-3.08 1.77-3.13-1-.15-1.94-.57-2.78-1.23-1.07-.82-2.11-.78-2.57-.78-1.1.11-2.15.64-2.71.64-.57 0-1.45-.62-2.39-.6-1.23.02-2.37.72-3 1.82-1.28 2.22-.33 5.51.92 7.31.61.88 1.34 1.87 2.29 1.83.92-.04 1.27-.59 2.38-.59 1.12 0 1.43.59 2.4.57.99-.02 1.62-.89 2.23-1.77.7-1.02.99-2.02 1-2.07-.02-.01-1.52-.58-1.54-2z" />
            <path d="M15.32 6.18c.51-.62.86-1.48.76-2.34-.74.03-1.64.49-2.17 1.11-.48.55-.9 1.44-.79 2.29.83.06 1.68-.42 2.2-1.06z" />
        </svg>
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

function sanitizePasswordInput(value) {
    return String(value || '').replace(/[\r\n]/g, '');
}

function shouldResendVerification(error) {
    const message = String(error?.message || '').toLowerCase();
    const payloadText = JSON.stringify(error?.payload || {}).toLowerCase();
    const combined = `${message} ${payloadText}`;

    return (
        combined.includes('verify')
        || combined.includes('verification')
        || combined.includes('not verified')
        || combined.includes('inactive')
        || combined.includes('not active')
    );
}

function getEmailVerificationRedirectUrl() {
    const configuredUrl = import.meta.env.VITE_EMAIL_VERIFICATION_REDIRECT_URL;

    if (configuredUrl) {
        return configuredUrl;
    }

    if (typeof window === 'undefined') {
        return '/verify-email';
    }

    return `${window.location.origin}/verify-email`;
}

export default SignInPage;
