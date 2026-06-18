import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, MailCheck, UserRoundPlus } from 'lucide-react';
import Button from '../components/Button';
import { registerUser, resendVerificationEmail } from '../services/authApi';
import VerifyEmailPage from './VerifyEmailPage';

export const PENDING_PROFILE_SIGNUP_EMAIL_KEY = 'shilingi_pending_profile_signup_email';

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
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');

    if (verificationToken) {
        return <VerifyEmailPage />;
    }

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
            const normalizedEmail = formValues.email.trim().toLowerCase();
            const provisionalPassword = createProvisionalSignupPassword();
            // Include default_currency as 'KES' by default as required by backend
            await registerUser({
                ...formValues,
                email: normalizedEmail,
                password: provisionalPassword,
                password_confirm: provisionalPassword,
                default_currency: 'KES',
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            try {
                sessionStorage.setItem(PENDING_PROFILE_SIGNUP_EMAIL_KEY, normalizedEmail);
            } catch {
                // If storage is blocked, sign-in will still use profile completeness.
            }
            setVerificationEmail(normalizedEmail);
            setStep('verify');
            setSuccess('Your account was created. Please verify your email before signing in.');
        } catch (err) {
            setError(err.message || 'We could not create your account right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        const email = verificationEmail || formValues.email.trim().toLowerCase();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Enter your email address so we can send a verification link.');
            return;
        }

        try {
            setIsResendingVerification(true);
            await resendVerificationEmail({
                email,
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            try {
                sessionStorage.setItem(PENDING_PROFILE_SIGNUP_EMAIL_KEY, email);
            } catch {
                // If storage is blocked, the email can still be entered manually when resending.
            }
            setVerificationEmail(email);
            setSuccess('We sent a fresh verification email. Please check your inbox and spam folder, then open the verification link to set your password.');
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
                    {step === 'form' ? (
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">Fill in your details below. We will verify your email before you set your password.</p>
                        </div>
                    ) : (
                        <div className="mb-8">
                            <div className="mb-5 inline-flex rounded-3xl bg-emerald-50 p-4 text-emerald-700">
                                <MailCheck size={28} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Verify this account is yours</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                We have sent you an email at <span className="font-semibold text-gray-900">{verificationEmail}</span>. Click the link in your inbox to verify your email and continue setting up your account.
                            </p>
                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                If you do not see the email, please check your spam or junk folder.
                            </p>
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
                        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                            <Field label="First name" name="first_name" value={formValues.first_name} onChange={handleChange} placeholder="John" required />
                            <Field label="Last name" name="last_name" value={formValues.last_name} onChange={handleChange} placeholder="Doe" required />
                            <div className="sm:col-span-2">
                                <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="example@gmail.com" required />
                            </div>
                            <div className="sm:col-span-2">
                                <Field label="Phone number (optional)" name="phone_number" value={formValues.phone_number} onChange={handleChange} placeholder="0700 000 000" />
                            </div>
                            <div className="sm:col-span-2">
                                <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating your account...' : 'Create account and verify email'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <Button type="button" variant="outline" className="w-full justify-center" onClick={handleResendVerification} disabled={isResendingVerification}>
                                {isResendingVerification ? 'Sending verification email...' : 'Resend verification email'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep('form')}
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

function createProvisionalSignupPassword() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes = new Uint8Array(8);

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let index = 0; index < bytes.length; index += 1) {
            bytes[index] = Math.floor(Math.random() * 256);
        }
    }

    const randomPart = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
    return `Sm${randomPart}9!`;
}

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
