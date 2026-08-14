import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, MailCheck, UserRoundPlus } from 'lucide-react';
import Button from '../components/Button';
import { registerUser, resendVerificationEmail } from '../services/authApi';
import VerifyEmailPage from './VerifyEmailPage';

export const PENDING_PROFILE_SIGNUP_EMAIL_KEY = 'shilingi_pending_profile_signup_email';

const passwordRules = [
    { id: 'length', label: 'Password has at least 8 characters.', test: (value) => value.length >= 8 && value.length <= 15 },
    { id: 'special', label: 'Password has special characters.', test: (value) => /[^A-Za-z0-9]/.test(value) },
    { id: 'number', label: 'Password has a number.', test: (value) => /\d/.test(value) },
    { id: 'capital', label: 'Password has a capital letter.', test: (value) => /[A-Z]/.test(value) },
    { id: 'lowercase', label: 'Password has a lowercase letter.', test: (value) => /[a-z]/.test(value) },
];

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

const SignUpPage = () => {
    const [searchParams] = useSearchParams();
    const verificationToken = searchParams.get('token') || searchParams.get('code') || searchParams.get('key') || '';
    const [step, setStep] = useState('form');
    const [formValues, setFormValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
    });
    const [formTouched, setFormTouched] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [isAccountAlreadyVerified, setIsAccountAlreadyVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    if (verificationToken) {
        return <VerifyEmailPage />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: name.includes('password') ? sanitizePasswordInput(value) : value,
        }));
        setFormTouched((current) => ({ ...current, [name]: true }));
    };

    const handleBlur = (event) => {
        const { name } = event.target;
        setFormTouched((current) => ({ ...current, [name]: true }));
    };

    const handleDetailsSubmit = (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setIsAccountAlreadyVerified(false);
        setFormSubmitted(true);

        const detailIssue = getRequiredDetailIssue(formValues);
        if (detailIssue) {
            setFormTouched((current) => ({ ...current, first_name: true, last_name: true, email: true }));
            setError(detailIssue);
            return;
        }

        setFormValues((current) => ({
            ...current,
            email: current.email.trim().toLowerCase(),
        }));
        setStep('password');
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setIsAccountAlreadyVerified(false);

        const passwordIssues = getPasswordIssues(formValues.password, formValues.password_confirm);
        if (passwordIssues) {
            setError(passwordIssues);
            return;
        }

        try {
            setIsSubmitting(true);
            const normalizedEmail = formValues.email.trim().toLowerCase();
            await registerUser({
                first_name: formValues.first_name.trim(),
                last_name: formValues.last_name.trim(),
                email: normalizedEmail,
                phone_number: formValues.phone_number.trim(),
                password: formValues.password,
                password_confirm: formValues.password_confirm,
                default_currency: 'KES',
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            storePendingSignupEmail(normalizedEmail);
            setVerificationEmail(normalizedEmail);
            setStep('verify');
            setSuccess('Your account was created. Please verify your email, then sign in with your email and password to open your dashboard.');
        } catch (err) {
            const normalizedEmail = formValues.email.trim().toLowerCase();
            if (normalizedEmail && isExistingAccountError(err)) {
                try {
                    const resendResult = await sendVerificationForExistingAccount(normalizedEmail);
                    setVerificationEmail(normalizedEmail);
                    setStep('verify');
                    setIsAccountAlreadyVerified(isAlreadyVerifiedResponse(resendResult));
                    setSuccess(getVerificationResendSuccessMessage(resendResult, 'This account already exists but still needs verification. We sent a fresh verification email. Please check your inbox and spam folder, then open the link to verify your email. After that, sign in to open your dashboard.'));
                    return;
                } catch (resendError) {
                    setError(getExistingAccountRecoveryMessage(resendError));
                    return;
                }
            }

            setError(err.message || 'We could not create your account right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        const email = verificationEmail || formValues.email.trim().toLowerCase();
        setError('');
        setSuccess('');
        setIsAccountAlreadyVerified(false);

        if (!email) {
            setError('Enter your email address so we can send a verification link.');
            return;
        }

        try {
            setIsResendingVerification(true);
            const resendResult = await resendVerificationEmail({
                email,
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            storePendingSignupEmail(email);
            setVerificationEmail(email);
            setIsAccountAlreadyVerified(isAlreadyVerifiedResponse(resendResult));
            setSuccess(getVerificationResendSuccessMessage(resendResult, 'We sent a fresh verification email. Please check your inbox and spam folder, then open the verification link to activate your account.'));
        } catch (err) {
            setError(err.message || 'We could not resend the verification email right now.');
        } finally {
            setIsResendingVerification(false);
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
                    {step === 'form' && (
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">Fill in your details below, create a strong password, then verify your email before signing in.</p>
                        </div>
                    )}

                    {step === 'password' && (
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900">Create your password</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">Use a strong password now, then verify your email before signing in.</p>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div className="mb-8">
                            <div className="mb-5 inline-flex rounded-3xl bg-emerald-50 p-4 text-emerald-700">
                                <MailCheck size={28} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                {isAccountAlreadyVerified ? 'Account already verified' : 'Verify this account is yours'}
                            </h2>
                            {isAccountAlreadyVerified ? (
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    <span className="font-semibold text-gray-900">{verificationEmail}</span> is already verified, so we will not send another verification email. Sign in to continue, or reset your password if you cannot remember it.
                                </p>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                    We have sent you an email at <span className="font-semibold text-gray-900">{verificationEmail}</span>. Click the link in your inbox to verify your email, then sign in to open your dashboard.
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        If you do not see the email, please check your spam or junk folder.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

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

                    {step === 'form' ? (
                        <form onSubmit={handleDetailsSubmit} className="grid gap-4 sm:grid-cols-2">
                            <Field error={getDetailFieldError('first_name', formValues, formTouched, formSubmitted)} label="First name" name="first_name" showRequiredMarker={formSubmitted && !String(formValues.first_name || '').trim()} value={formValues.first_name} onBlur={handleBlur} onChange={handleChange} placeholder="John" required />
                            <Field error={getDetailFieldError('last_name', formValues, formTouched, formSubmitted)} label="Last name" name="last_name" showRequiredMarker={formSubmitted && !String(formValues.last_name || '').trim()} value={formValues.last_name} onBlur={handleBlur} onChange={handleChange} placeholder="Doe" required />
                            <div className="sm:col-span-2">
                                <Field error={getDetailFieldError('email', formValues, formTouched, formSubmitted)} label="Email address" name="email" showRequiredMarker={formSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formValues.email || '').trim())} type="email" value={formValues.email} onBlur={handleBlur} onChange={handleChange} placeholder="example@gmail.com" required />
                            </div>
                            <div className="sm:col-span-2">
                                <Field label="Phone number" name="phone_number" value={formValues.phone_number} onBlur={handleBlur} onChange={handleChange} optional placeholder="0700 000 000" />
                            </div>
                            <div className="sm:col-span-2">
                                <Button type="submit" variant="primary" className="w-full justify-center">
                                    Create account
                                </Button>
                            </div>
                        </form>
                    ) : step === 'password' ? (
                        <form onSubmit={handleRegisterSubmit} className="space-y-5">
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
                                {passwordRules.map((rule) => (
                                    <PasswordRule key={rule.id} passed={rule.test(formValues.password)} label={rule.label} />
                                ))}
                                <PasswordRule passed={Boolean(formValues.password && formValues.password === formValues.password_confirm)} label="Passwords match." />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[0.45fr_1fr]">
                                <button
                                    type="button"
                                    onClick={() => setStep('form')}
                                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-300"
                                >
                                    Back
                                </button>
                                <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating your account...' : 'Proceed'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            {isAccountAlreadyVerified ? (
                                <>
                                    <Button to="/signin" variant="primary" className="w-full justify-center">
                                        Sign in
                                    </Button>
                                    <Button to="/forgot-password" variant="outline" className="w-full justify-center">
                                        Forgot password
                                    </Button>
                                </>
                            ) : (
                                <Button type="button" variant="outline" className="w-full justify-center" onClick={handleResendVerification} disabled={isResendingVerification}>
                                    {isResendingVerification ? 'Sending verification email...' : 'Resend verification email'}
                                </Button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAccountAlreadyVerified(false);
                                    setStep('form');
                                }}
                                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:text-primary-700"
                            >
                                Edit email details
                            </button>
                        </div>
                    )}

                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account? <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-600">Sign in</Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

async function sendVerificationForExistingAccount(email) {
    const result = await resendVerificationEmail({
        email,
        redirect_url: getEmailVerificationRedirectUrl(),
    });
    storePendingSignupEmail(email);
    return result;
}

function storePendingSignupEmail(email) {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(PENDING_PROFILE_SIGNUP_EMAIL_KEY, email);
    } catch {
        // If storage is blocked, the email can still be entered manually when resending.
    }
}

function isExistingAccountError(error) {
    const payloadText = JSON.stringify(error?.payload || {}).toLowerCase();
    const message = `${error?.message || ''} ${payloadText}`.toLowerCase();
    return error?.status === 409
        || message.includes('already exists')
        || message.includes('already registered')
        || message.includes('email exists')
        || message.includes('user exists')
        || message.includes('account exists');
}

function getExistingAccountRecoveryMessage(error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('already verified') || message.includes('active')) {
        return 'This account already exists and appears to be verified. Please sign in, or use forgot password if you cannot remember your password.';
    }

    return error?.message || 'This account already exists, but we could not send a fresh verification email right now.';
}

function getVerificationResendSuccessMessage(payload, fallback) {
    const backendMessage = extractBackendMessage(payload);
    return backendMessage || fallback;
}

function isAlreadyVerifiedResponse(payload) {
    const backendMessage = extractBackendMessage(payload).toLowerCase();
    return Boolean(payload?.already_verified)
        || Boolean(payload?.data?.already_verified)
        || backendMessage.includes('already verified')
        || backendMessage.includes('already active');
}

function extractBackendMessage(payload) {
    const candidates = [
        payload?.message,
        payload?.detail,
        payload?.data?.message,
        payload?.data?.detail,
    ];

    return candidates.find((candidate) => typeof candidate === 'string' && candidate.trim()) || '';
}

function sanitizePasswordInput(value) {
    return String(value || '').replace(/[\r\n]/g, '');
}

function getPasswordIssues(password, passwordConfirm) {
    const isStrong = passwordRules.every((rule) => rule.test(password));

    if (!isStrong) {
        return 'Please create a strong password: 8 to 15 characters with uppercase, lowercase, number, and symbol.';
    }

    if (!password || password !== passwordConfirm) {
        return 'Your passwords do not match. Please enter the same password in both fields.';
    }

    return '';
}

function getRequiredDetailIssue(values = {}) {
    const requiredFields = ['first_name', 'last_name', 'email'];
    const missingField = requiredFields.find((field) => !String(values[field] || '').trim());

    if (missingField) {
        return 'Please complete all required fields marked with a red star before continuing.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || '').trim())) {
        return 'Please enter a valid email address.';
    }

    return '';
}

function getDetailFieldError(field, values = {}, touched = {}, submitted = false) {
    const shouldShow = submitted || touched[field];
    if (!shouldShow) return '';

    const value = String(values[field] || '').trim();
    if (!value) return 'Required field.';

    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Enter a valid email.';
    }

    return '';
}

const Field = ({ error = '', label, optional = false, required = false, showRequiredMarker = false, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        <span>
            {label}
            {showRequiredMarker && <span className="ml-1 text-rose-600">*</span>}
            {optional && <span className="ml-1 text-gray-400">(optional)</span>}
        </span>
        <input
            {...props}
            required={required}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-2xl border px-4 py-3 text-base text-gray-900 outline-none transition-colors ${error ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-primary-500'}`}
        />
        {error && <span className="-mt-1 text-xs font-semibold text-rose-600">{error}</span>}
    </label>
);

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

export default SignUpPage;
