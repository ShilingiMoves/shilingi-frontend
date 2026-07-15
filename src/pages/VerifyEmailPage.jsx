import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, MailCheck } from 'lucide-react';
import Button from '../components/Button';
import { resendVerificationEmail, verifyEmail } from '../services/authApi';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const emailFromLink = searchParams.get('email') || '';
    const [status, setStatus] = useState(token ? 'loading' : 'error');
    const [message, setMessage] = useState(token ? 'Verifying your email address...' : 'This verification link is missing a token.');
    const [recoveryEmail, setRecoveryEmail] = useState(() => emailFromLink || getStoredVerificationEmail());
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

    useEffect(() => {
        if (!token) return undefined;

        let isMounted = true;

        async function completeVerification() {
            try {
                const verificationResponse = await verifyEmail({ token });
                const verificationResult = verificationResponse.result;

                if (!isMounted) return;
                const verifiedEmail = extractEmailFromPayload(verificationResult);
                if (verifiedEmail) {
                    setRecoveryEmail(verifiedEmail);
                    storeVerificationEmail(verifiedEmail);
                }

                if (verificationResponse.authenticated) {
                    setStatus('complete');
                    setMessage('Your email is verified. Please sign in with your email and password to open your dashboard.');
                    return;
                }

                setStatus('complete');
                setMessage('Your email is verified. Please sign in with your email and password to open your dashboard.');
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
            setMessage('We sent a fresh verification email. Please check your inbox and spam folder, then open the verification link to activate your account.');
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
                    eyebrow="Email verified"
                    title="Your account is active"
                    message={message}
                >
                    <div className="mt-8">
                        <Button to="/signin" variant="primary" className="justify-center px-8">
                            Sign in to dashboard
                        </Button>
                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Use the same email and password you created for your Shilingi Moves account.
                        </p>
                    </div>
                </StatusPanel>
            </VerificationShell>
        );
    }

    return (
        <VerificationShell>
            <StatusPanel
                icon={<AlertCircle size={32} />}
                tone="amber"
                eyebrow="Verification needs attention"
                title="Check your verification link"
                message={message}
            />
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

export default VerifyEmailPage;
