import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, UserRoundPlus } from 'lucide-react';
import Button from '../components/Button';
import { registerUser } from '../services/authApi';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formValues.password !== formValues.password_confirm) {
            setError('Your passwords do not match. Please try again.');
            return;
        }

        try {
            setIsSubmitting(true);
            // Include default_currency as 'KES' by default as required by backend
            await registerUser({
                ...formValues,
                default_currency: 'KES',
            });
            setSuccess('Your account is ready. You can now sign in and start taking control of your money.');
            setTimeout(() => navigate('/signin'), 1200);
        } catch (err) {
            setError(err.message || 'We could not create your account right now.');
        } finally {
            setIsSubmitting(false);
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
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">Fill in your details below to get started with Shilingi Moves.</p>
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

                    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" name="first_name" value={formValues.first_name} onChange={handleChange} placeholder="Myra" required />
                        <Field label="Last name" name="last_name" value={formValues.last_name} onChange={handleChange} placeholder="Jarenga" required />
                        <div className="sm:col-span-2">
                            <Field label="Email address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="you@example.com" required />
                        </div>
                        <div className="sm:col-span-2">
                            <Field label="Phone number (optional)" name="phone_number" value={formValues.phone_number} onChange={handleChange} placeholder="+254 700 000 000" />
                        </div>
                        <Field label="Password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Create a password" required />
                        <Field label="Confirm password" name="password_confirm" type="password" value={formValues.password_confirm} onChange={handleChange} placeholder="Repeat your password" required />

                        <div className="sm:col-span-2">
                            <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating your account...' : 'Create account'}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account? <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-600">Sign in</Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

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
