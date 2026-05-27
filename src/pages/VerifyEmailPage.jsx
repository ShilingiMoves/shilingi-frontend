import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, MailCheck } from 'lucide-react';
import Button from '../components/Button';
import { confirmPasswordReset, verifyEmail } from '../services/authApi';

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
    const [status, setStatus] = useState(token ? 'loading' : 'error');
    const [message, setMessage] = useState(token ? 'Verifying your email address...' : 'This verification link is missing a token.');
    const [formValues, setFormValues] = useState({
        password: '',
        password_confirm: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passedRules = useMemo(
        () => passwordRules.filter((rule) => rule.test(formValues.password)),
        [formValues.password]
    );
    const isPasswordStrong = passedRules.length === passwordRules.length;
    const passwordsMatch = formValues.password && formValues.password === formValues.password_confirm;
    const canSubmit = isPasswordStrong && passwordsMatch && !isSubmitting;

    useEffect(() => {
        if (!token) return undefined;

        let isMounted = true;

        async function completeVerification() {
            try {
                await verifyEmail({ token });

                if (!isMounted) return;
                setStatus('setup');
                setMessage('Your email is verified. Create a strong password to secure your Shilingi Moves account.');
            } catch (error) {
                if (!isMounted) return;
                setStatus('error');
                setMessage(error.message || 'We could not verify this email link. Please request a new verification email.');
            }
        }

        completeVerification();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({
            ...current,
            [name]: value,
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
            await confirmPasswordReset({
                token,
                new_password: formValues.password,
                new_password_confirm: formValues.password_confirm,
            });
            setStatus('complete');
            setMessage('Your account password is set. You can now sign in with the email and password you used to create your account.');
        } catch (error) {
            setStatus('setup');
            setMessage(error.message || 'We could not set your password right now. Please request a fresh verification link.');
        } finally {
            setIsSubmitting(false);
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
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button to="/signup" variant="primary" className="justify-center">
                            Create account again
                        </Button>
                        <Link to="/signin" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:text-primary-700">
                            Back to sign in
                        </Link>
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
                        <Button type="button" variant="primary" className="justify-center px-8" onClick={() => navigate('/signin')}>
                            Sign in now
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
                        <span>{message}</span>
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
            </section>
        </VerificationShell>
    );
};

const VerificationShell = ({ children }) => (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fdfb_0%,_#ffffff_48%,_#fff8ec_100%)] px-4 py-16 sm:px-6 lg:px-8">
        {children}
    </div>
);

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
