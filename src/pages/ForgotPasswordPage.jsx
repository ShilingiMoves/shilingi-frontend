import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { confirmPasswordReset, requestPasswordReset } from '../services/authApi';

const ForgotPasswordPage = () => {
    const routeParams = useParams();
    const [searchParams] = useSearchParams();
    const resetToken = getResetToken(searchParams, routeParams);
    const resetUid = getResetUid(searchParams, routeParams);
    const [step, setStep] = useState(resetToken ? 'reset' : 'email');
    const [formValues, setFormValues] = useState({
        email: '',
        uid: resetUid,
        token: resetToken,
        password: '',
        password_confirm: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetRequestCount, setResetRequestCount] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) {
            return undefined;
        }

        const timerId = window.setTimeout(() => {
            setResendCooldown((seconds) => Math.max(seconds - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timerId);
    }, [resendCooldown]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleRequestCode = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        try {
            setIsSubmitting(true);
            await requestPasswordReset({
                email: formValues.email.trim(),
                redirect_url: getPasswordResetRedirectUrl(),
            });
            setResetRequestCount((count) => count + 1);
            setResendCooldown(RESET_RESEND_COOLDOWN_SECONDS);
            setSuccess('If that email is linked to an account, we sent password reset instructions. Open the secure link in your inbox to continue.');
        } catch (err) {
            setError(err.message || 'We could not send reset instructions right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmReset = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formValues.password !== formValues.password_confirm) {
            setError('Your new passwords do not match. Please try again.');
            return;
        }

        try {
            setIsSubmitting(true);
            const resetPayload = {
                token: formValues.token.trim(),
                new_password: formValues.password,
                new_password_confirm: formValues.password_confirm,
            };

            if (formValues.uid.trim()) {
                resetPayload.uid = formValues.uid.trim();
                resetPayload.uidb64 = formValues.uid.trim();
            }

            await confirmPasswordReset(resetPayload);
            setStep('complete');
            setSuccess('Your password has been reset. You can now sign in with your new password.');
        } catch (err) {
            setError(err.message || 'We could not reset your password right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,_#f5fbf8_0%,_#ffffff_48%,_#fff8ec_100%)] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
                    <div className="inline-flex rounded-3xl bg-primary-50 p-4 text-primary-700">
                        <KeyRound size={28} />
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Password help</p>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Reset your password and get back to your money plan.</h1>
                    <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
                        We will send a secure password reset link to your email, then you can create a new password for your Shilingi Moves account.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <InfoCard icon={<MailCheck size={20} />} title="Check your inbox" text="Use the same email you used when creating your account." />
                        <InfoCard icon={<ShieldCheck size={20} />} title="Keep it secure" text="Choose a password that is private, memorable, and different from your email password." />
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            {['email', 'reset', 'complete'].map((item, index) => (
                                <div
                                    key={item}
                                    className={`h-2 flex-1 rounded-full ${stepOrder[step] >= index ? 'bg-primary-600' : 'bg-gray-200'}`}
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{stepCopy[step].title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{stepCopy[step].description}</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {step === 'email' && (
                        <form onSubmit={handleRequestCode} className="space-y-4">
                            <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="example@gmail.com" required />
                            <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting || resendCooldown > 0}>
                                {getResetRequestButtonText({ isSubmitting, resetRequestCount, resendCooldown })}
                            </Button>
                            {resendCooldown > 0 && (
                                <p className="text-center text-sm font-medium text-gray-500">
                                    You can request another reset link in {formatCooldown(resendCooldown)}.
                                </p>
                            )}
                        </form>
                    )}

                    {step === 'reset' && (
                        <form onSubmit={handleConfirmReset} className="space-y-4">
                            {!resetUid && (
                                <Field label="Reset user ID" name="uid" value={formValues.uid} onChange={handleChange} placeholder="Paste the user ID from your email link" required />
                            )}
                            {!resetToken && (
                                <Field label="Reset token" name="token" value={formValues.token} onChange={handleChange} placeholder="Paste the token from your email link" required />
                            )}
                            <Field label="New password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Create a new password" required />
                            <Field label="Confirm new password" name="password_confirm" type="password" value={formValues.password_confirm} onChange={handleChange} placeholder="Repeat your new password" required />

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                                    {isSubmitting ? 'Resetting password...' : 'Reset password'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full justify-center sm:w-auto" disabled={isSubmitting} onClick={() => setStep('email')}>
                                    Request new link
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 'complete' && (
                        <div className="space-y-4">
                            <Button to="/signin" variant="primary" className="w-full justify-center">
                                Sign in with new password
                            </Button>
                        </div>
                    )}

                    <p className="mt-6 text-sm text-gray-600">
                        Remembered your password? <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-600">Back to sign in</Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

const RESET_RESEND_COOLDOWN_SECONDS = 60;

function getResetRequestButtonText({ isSubmitting, resetRequestCount, resendCooldown }) {
    if (isSubmitting) {
        return resetRequestCount > 0 ? 'Resending instructions...' : 'Sending instructions...';
    }

    if (resendCooldown > 0) {
        return `Resend in ${formatCooldown(resendCooldown)}`;
    }

    return resetRequestCount > 0 ? 'Resend reset instructions' : 'Send reset instructions';
}

function formatCooldown(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getResetToken(searchParams, routeParams) {
    return (
        searchParams.get('token') ||
        searchParams.get('reset_token') ||
        searchParams.get('key') ||
        searchParams.get('code') ||
        routeParams.token ||
        ''
    );
}

function getResetUid(searchParams, routeParams) {
    return (
        searchParams.get('uid') ||
        searchParams.get('uidb64') ||
        searchParams.get('user') ||
        routeParams.uid ||
        routeParams.uidb64 ||
        ''
    );
}

function getPasswordResetRedirectUrl() {
    const configuredUrl = import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL;

    if (configuredUrl) {
        return configuredUrl;
    }

    if (typeof window === 'undefined') {
        return '/forgot-password';
    }

    return `${window.location.origin}/forgot-password`;
}

const stepOrder = {
    email: 0,
    reset: 1,
    complete: 2,
};

const stepCopy = {
    email: {
        title: 'Send your reset link',
        description: 'Enter your account email and we will send secure password reset instructions.',
    },
    reset: {
        title: 'Create a new password',
        description: 'Use the secure link from your email and choose a new password for your account.',
    },
    complete: {
        title: 'Password reset complete',
        description: 'Your account is ready. Sign in again to continue to your dashboard.',
    },
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
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

export default ForgotPasswordPage;
