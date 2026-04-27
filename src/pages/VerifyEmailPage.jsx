import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, MailCheck } from 'lucide-react';
import Button from '../components/Button';
import { verifyEmail } from '../services/authApi';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [status, setStatus] = useState(token ? 'loading' : 'error');
    const [message, setMessage] = useState(token ? 'Verifying your email address...' : 'This verification link is missing a token.');

    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        async function completeVerification() {
            try {
                await verifyEmail({ token });

                if (!isMounted) return;
                setStatus('success');
                setMessage('Your email has been verified. You can now sign in to Shilingi Moves.');
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

    const isSuccess = status === 'success';
    const isLoading = status === 'loading';

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fdfb_0%,_#ffffff_48%,_#fff8ec_100%)] px-4 py-16 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-2xl rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
                <div className={`mx-auto inline-flex rounded-3xl p-4 ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {isSuccess ? <CheckCircle2 size={30} /> : isLoading ? <MailCheck size={30} /> : <AlertCircle size={30} />}
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Email verification</p>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
                    {isSuccess ? 'Email verified' : isLoading ? 'Checking your link' : 'Verification needs attention'}
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600">{message}</p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button to="/signin" variant="primary" className="justify-center">
                        Go to sign in
                    </Button>
                    {!isSuccess && (
                        <Link to="/signin" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:text-primary-700">
                            Request another email
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default VerifyEmailPage;
