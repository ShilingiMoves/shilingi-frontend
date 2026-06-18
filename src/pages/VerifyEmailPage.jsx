import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, MailCheck } from 'lucide-react';
import Button from '../components/Button';
import { completePasswordSetup, loginUser, resendVerificationEmail, verifyEmail } from '../services/authApi';
import { persistDashboardSection } from '../utils/dashboardDataState';
import { queuePreferredNamePrompt } from '../utils/memberIdentity';

const passwordRules = [
    { id: 'length', label: 'Password has at least 8 characters.', test: (value) => value.length >= 8 && value.length <= 15 },
    { id: 'special', label: 'Password has special characters.', test: (value) => /[^A-Za-z0-9]/.test(value) },
    { id: 'number', label: 'Password has a number.', test: (value) => /\d/.test(value) },
    { id: 'capital', label: 'Password has a capital letter.', test: (value) => /[A-Z]/.test(value) },
    { id: 'lowercase', label: 'Password has a lowercase letter.', test: (value) => /[a-z]/.test(value) },
];

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const emailFromLink = searchParams.get('email') || '';
    const [status, setStatus] = useState(token ? 'loading' : 'error');
    const [message, setMessage] = useState(token ? 'Verifying your email address...' : 'This verification link is missing a token.');
    const [recoveryEmail, setRecoveryEmail] = useState(() => emailFromLink || getStoredVerificationEmail());
    const [formValues, setFormValues] = useState({
        password: '',
        password_confirm: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

    const passedRules = useMemo(
        () => passwordRules.filter((rule) => rule.test(formValues.password)),
        [formValues.password]
    );
    const isPasswordStrong = passedRules.length === passwordRules.length;
    const passwordsMatch = formValues.password && formValues.password === formValues.password_confirm;
    const canSubmit = isPasswordStrong && passwordsMatch && !isSubmitting;
    const shouldShowRecoveryHint = status === 'setup' && !message.toLowerCase().includes('verified');

    useEffect(() => {
        if (!token) return undefined;

        let isMounted = true;

        async function completeVerification() {
            try {
                const verificationResult = await verifyEmail({ token });

                if (!isMounted) return;
                const verifiedEmail = extractEmailFromPayload(verificationResult);
                if (verifiedEmail) {
                    setRecoveryEmail(verifiedEmail);
                    storeVerificationEmail(verifiedEmail);
                }
                setStatus('setup');
                setMessage('Your email is verified. Create a strong password to secure your Shilingi Moves account.');
            } catch (error) {
                if (!isMounted) return;
                setResendCooldownSeconds(getRetryDelaySeconds(error.message));
                setStatus('error');
                setMessage(error.message || 'We could not verify this email link. Please request a new verification email.');
            }
        }

        completeVerification();

        return () => {
            isMounted = false;
        };
    }, [token]);

    useEffect(() => {
        if (resendCooldownSeconds <= 0) return undefined;

        const timer = window.setInterval(() => {
            setResendCooldownSeconds((seconds) => Math.max(seconds - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [resendCooldownSeconds]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: sanitizePasswordInput(value),
        }));
    };

    const handlePasswordSetup = async (event) => {
        event.preventDefault();
        setMessage('');

        if (!isPasswordStrong) {
            setMessage('Please create a strong password: 8 to 15 characters with uppercase, lowercase, number, and symbol.');
            return;
        }

        if (!passwordsMatch) {
            setMessage('Your passwords do not match. Please enter the same password in both fields.');
            return;
        }

        try {
            setIsSubmitting(true);
            const passwordSetup = await completePasswordSetup({
                token,
                new_password: formValues.password,
                new_password_confirm: formValues.password,
            });

            const email = (extractEmailFromPayload(passwordSetup.result) || recoveryEmail).trim().toLowerCase();

            if (!passwordSetup.authenticated) {
                if (!email) {
                    throw new Error('Your password was saved, but the server did not return a login session. Please sign in with your verified email and new password.');
                }

                await loginUser({
                    email,
                    password: formValues.password,
                });
            }

            persistDashboardSection('user');
            queuePreferredNamePrompt('signup');
            setStatus('complete');
            setMessage('Your account password is set and you are signed in. Continue to complete your Shilingi Moves profile.');
        } catch (error) {
            setStatus('setup');
            setMessage(error.message || 'We could not confirm this password for your account. Please request a fresh verification link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async (event) => {
        event.preventDefault();
        const email = recoveryEmail.trim().toLowerCase();
        setMessage('');

        if (!email) {
            setMessage('Enter the email you used to create your account so we can send a fresh verification link.');
            return;
        }

        if (resendCooldownSeconds > 0) {
            setMessage(`Please wait ${resendCooldownSeconds} seconds before requesting a fresh verification link.`);
            return;
        }

        try {
            setIsResendingVerification(true);
            await resendVerificationEmail({
                email,
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            storeVerificationEmail(email);
            setRecoveryEmail(email);
            setStatus('resent');
            setMessage('We sent a fresh verification email. Please check your inbox and spam folder, then open the verification link to set your password.');
        } catch (error) {
            const retryDelay = getRetryDelaySeconds(error.message);
            if (retryDelay > 0) {
                setResendCooldownSeconds(retryDelay);
            }
            setMessage(error.message || 'We could not send a fresh verification email right now.');
        } finally {
            setIsResendingVerification(false);
        }
    };

    if (status === 'loading') {
        return (
            <VerificationShell>
                <StatusPanel
                    icon={<MailCheck size={32} />}
                    tone="amber"
                    eyebrow="Email verification"
                    title="Checking your link"
                    message={message}
                />
            </VerificationShell>
        );
    }

    if (status === 'error') {
        return (
            <VerificationShell>
                <StatusPanel
                    icon={<AlertCircle size={32} />}
                    tone="rose"
                    eyebrow="Verification needs attention"
                    title="We could not verify this link"
                    message={message}
                >
                    <form onSubmit={handleResendVerification} className="mx-auto mt-8 max-w-md space-y-4 text-left">
                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Email address
                            <input
                                type="email"
                                value={recoveryEmail}
                                onChange={(event) => setRecoveryEmail(event.target.value)}
                                placeholder="example@gmail.com"
                                required
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
                            />
                        </label>
                        <Button type="submit" variant="primary" className="w-full justify-center" disabled={isResendingVerification || resendCooldownSeconds > 0}>
                            {isResendingVerification
                                ? 'Sending fresh link...'
                                : resendCooldownSeconds > 0
                                    ? `Try again in ${resendCooldownSeconds}s`
                                    : 'Send fresh verification link'}
                        </Button>
                        <p className="text-center text-sm leading-6 text-gray-500">
                            Use the same email you used when creating your account. If you do not see the new email, check spam or junk.
                        </p>
                    </form>
                </StatusPanel>
            </VerificationShell>
        );
    }

    if (status === 'resent') {
        return (
            <VerificationShell>
                <StatusPanel
                    icon={<MailCheck size={32} />}
                    tone="emerald"
                    eyebrow="Verification email sent"
                    title="Check your email"
                    message={message}
                >
                    <div className="mx-auto mt-8 max-w-md space-y-4 text-center">
                        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                            We sent it to <span className="font-semibold">{recoveryEmail}</span>. If you do not see it, check spam or junk before requesting another one.
                        </p>
                        <form onSubmit={handleResendVerification}>
                            <button
                                type="submit"
                                disabled={isResendingVerification || resendCooldownSeconds > 0 || !recoveryEmail.trim()}
                                className="text-sm font-semibold text-primary-700 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                {isResendingVerification
                                    ? 'Sending fresh verification link...'
                                    : resendCooldownSeconds > 0
                                        ? `Try again in ${resendCooldownSeconds}s`
                                        : 'Send another verification link'}
                            </button>
                        </form>
                    </div>
                </StatusPanel>
            </VerificationShell>
        );
    }

    if (status === 'complete') {
        return (
            <VerificationShell>
                <StatusPanel
                    icon={<CheckCircle2 size={32} />}
                    tone="emerald"
                    eyebrow="Account secured"
                    title="Password setup complete"
                    message={message}
                >
                    <div className="mt-8">
                        <Button type="button" variant="primary" className="justify-center px-8" onClick={() => navigate('/dashboard/app', { replace: true, state: { section: 'user' } })}>
                            Continue to profile setup
                        </Button>
                    </div>
                </StatusPanel>
            </VerificationShell>
        );
    }

    return (
        <VerificationShell>
            <section className="mx-auto max-w-3xl">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Email verified</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17496b] sm:text-4xl">Setup your account password</h1>
                    <p className="mt-2 text-base text-[#17496b]">Enter a strong password to secure your account</p>
                </div>

                {message && (
                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>
                            {message}
                            {shouldShowRecoveryHint ? ' If this continues, request a fresh verification link below.' : ''}
                        </span>
                    </div>
                )}

                <form onSubmit={handlePasswordSetup} className="mt-8 space-y-5">
                    <PasswordField
                        label="Enter password"
                        name="password"
                        value={formValues.password}
                        onChange={handleChange}
                        visible={showPassword}
                        onToggleVisibility={() => setShowPassword((current) => !current)}
                    />
                    <PasswordField
                        label="Confirm password"
                        name="password_confirm"
                        value={formValues.password_confirm}
                        onChange={handleChange}
                        visible={showConfirmPassword}
                        onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
                    />

                    <div className="space-y-3 pt-1">
                        {passwordRules.map((rule) => {
                            const passed = rule.test(formValues.password);
                            return <PasswordRule key={rule.id} passed={passed} label={rule.label} />;
                        })}
                        <PasswordRule
                            passed={Boolean(passwordsMatch)}
                            label="Passwords match."
                        />
                    </div>

                    <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
                        <Link to="/signup" className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gray-200 px-8 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-300">
                            Back
                        </Link>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary-800 to-amber-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary-900/15 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? 'Saving password...' : 'Save and Proceed'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>

                <form onSubmit={handleResendVerification} className="mx-auto mt-6 max-w-md text-center">
                    <button
                        type="submit"
                        disabled={isResendingVerification || resendCooldownSeconds > 0 || !recoveryEmail.trim()}
                        className="text-sm font-semibold text-primary-700 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {isResendingVerification
                            ? 'Sending fresh verification link...'
                            : resendCooldownSeconds > 0
                                ? `Try again in ${resendCooldownSeconds}s`
                                : 'Request a fresh verification link'}
                    </button>
                </form>
            </section>
        </VerificationShell>
    );
};

const VerificationShell = ({ children }) => (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fdfb_0%,_#ffffff_48%,_#fff8ec_100%)] px-4 py-16 sm:px-6 lg:px-8">
        {children}
    </div>
);

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

function getStoredVerificationEmail() {
    if (typeof window === 'undefined') return '';

    try {
        return sessionStorage.getItem('shilingi_pending_profile_signup_email') || '';
    } catch {
        return '';
    }
}

function storeVerificationEmail(email) {
    if (typeof window === 'undefined' || !email) return;

    try {
        sessionStorage.setItem('shilingi_pending_profile_signup_email', email.trim().toLowerCase());
    } catch {
        // Session storage can be unavailable in private or restricted browser contexts.
    }
}

function sanitizePasswordInput(value) {
    return String(value || '').replace(/[\r\n]/g, '');
}

function extractEmailFromPayload(payload) {
    const candidates = [
        payload?.email,
        payload?.user?.email,
        payload?.data?.email,
        payload?.data?.user?.email,
        payload?.result?.email,
        payload?.result?.user?.email,
        payload?.result?.data?.email,
        payload?.result?.data?.user?.email,
    ];

    return candidates.find((candidate) => typeof candidate === 'string' && candidate.includes('@')) || '';
}

function getRetryDelaySeconds(message) {
    const match = String(message || '').match(/(?:in|available in)\s+(\d+)\s+seconds?/i);
    return match ? Number(match[1]) : 0;
}

const StatusPanel = ({ children, eyebrow, icon, message, title, tone }) => {
    const toneClasses = {
        amber: 'bg-amber-50 text-amber-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        rose: 'bg-rose-50 text-rose-700',
    };

    return (
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
            <div className={`mx-auto inline-flex rounded-3xl p-4 ${toneClasses[tone]}`}>
                {icon}
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">{title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600">{message}</p>
            {children}
        </section>
    );
};

const PasswordField = ({ label, name, onChange, onToggleVisibility, value, visible }) => (
    <label className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.08)] focus-within:border-primary-500">
        <span className="text-xs font-medium text-gray-600">{label}<span className="text-rose-500">*</span></span>
        <span className="mt-1 flex items-center gap-3">
            <Lock size={18} className="text-gray-500" />
            <input
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                autoComplete="new-password"
                minLength={8}
                maxLength={15}
                required
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
                type="button"
                onClick={onToggleVisibility}
                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-700"
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </span>
    </label>
);

const PasswordRule = ({ label, passed }) => (
    <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
        {passed ? (
            <CheckCircle2 size={17} className="shrink-0 text-emerald-500" />
        ) : (
            <span className="h-[17px] w-[17px] shrink-0 rounded-full border-2 border-gray-300 bg-white" aria-hidden="true" />
        )}
        <span>{label}</span>
    </div>
);

export default VerifyEmailPage;
