import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { hasStoredAccessToken, loginUser } from '../services/authApi';

const SignInPage = () => {
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(hasStoredAccessToken() ? 'You already have an active session token saved on this device.' : '');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setSuccess('Sign in successful. Your JWT token is now saved for protected API requests.');
            navigate('/debts');
        } catch (err) {
            setError(err.message || 'We could not sign you in right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fdfb_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-emerald-100 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Account access</p>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Sign in to unlock your protected debt dashboard.</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                        Use the same JWT authentication flow your backend developer configured in Swagger. Once you log in,
                        this device will store your access token and your debt requests will include it automatically.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <InfoCard icon={<ShieldCheck size={20} />} title="JWT ready" text="The saved access token is reused by the debt API service." />
                        <InfoCard icon={<KeyRound size={20} />} title="Swagger-compatible" text="The form mirrors the create account plus login flow you tested in Swagger." />
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">Enter the same credentials you created in Swagger or the account management backend.</p>
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="you@example.com" required />
                        <Field label="Password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Enter your password" required />

                        <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>

                    <p className="mt-6 text-sm text-gray-600">
                        New here? <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-600">Create your account</Link>
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
