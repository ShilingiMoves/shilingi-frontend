import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { confirmPasswordReset, requestPasswordReset } from '../services/authApi';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState('email');
    const [formValues, setFormValues] = useState({
        email: '',
        code: '',
        password: '',
        password_confirm: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            });
            setStep('reset');
            setSuccess('We sent a verification code to your email. Enter it below to set a new password.');
        } catch (err) {
            setError(err.message || 'We could not send a reset code right now.');
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
            await confirmPasswordReset({
                email: formValues.email.trim(),
                code: formValues.code.trim(),
                password: formValues.password,
                password_confirm: formValues.password_confirm,
            });
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
                        We will send a verification code to your email, then you can create a new password for your Shilingi Moves account.
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
                            <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="you@example.com" required />
                            <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending code...' : 'Send verification code'}
                            </Button>
                        </form>
                    )}

                    {step === 'reset' && (
                        <form onSubmit={handleConfirmReset} className="space-y-4">
                            <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="you@example.com" required />
                            <Field label="Verification code" name="code" value={formValues.code} onChange={handleChange} placeholder="Enter the code from your email" required inputMode="numeric" />
                            <Field label="New password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Create a new password" required />
                            <Field label="Confirm new password" name="password_confirm" type="password" value={formValues.password_confirm} onChange={handleChange} placeholder="Repeat your new password" required />

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                                    {isSubmitting ? 'Resetting password...' : 'Reset password'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full justify-center sm:w-auto" disabled={isSubmitting} onClick={handleRequestCode}>
                                    Resend code
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

const stepOrder = {
    email: 0,
    reset: 1,
    complete: 2,
};

const stepCopy = {
    email: {
        title: 'Send your reset code',
        description: 'Enter your account email and we will send a password reset verification code.',
    },
    reset: {
        title: 'Create a new password',
        description: 'Use the code from your email and choose a new password for your account.',
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
