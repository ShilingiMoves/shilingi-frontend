import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook, Instagram, Mail, Phone,
    Linkedin, Youtube,
    Shield,
    Send, CheckCircle
} from 'lucide-react';
import animatedLogo from '../assets/shilingi-logo-animated.gif';
import contactHeroImg from '../assets/contact-form-hero.png';
import { hasStoredAccessToken } from '../services/authApi';


const Footer = () => {
    const dashboardPath = hasStoredAccessToken() ? '/dashboard/app' : '/dashboard';
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        consent: false,
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formError, setFormError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        // Basic validation
        if (!formData.firstName.trim() || !formData.email.trim()) {
            setFormError('Please fill in at least your first name and email.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setFormError('Please enter a valid email address.');
            return;
        }
        if (!formData.consent) {
            setFormError('Please give consent to be contacted.');
            return;
        }

        // Simulate submission
        setFormSubmitted(true);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: '',
            consent: false,
        });

        // Reset success message after 5 seconds
        setTimeout(() => setFormSubmitted(false), 5000);
    };

    return (
        <footer id="site-footer" className="font-sans bg-gray-50 border-t border-gray-200">

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ CONTACT FORM SECTION Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-900 relative overflow-hidden">
                {/* Subtle overlay pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                        {/* Left: Image */}
                        <div className="relative hidden lg:block">
                            <img
                                src={contactHeroImg}
                                alt="Shilingi Moves customer support representative"
                                className="absolute inset-0 w-full h-full object-cover object-center"
                            />
                            {/* Gradient overlay for smooth edge blending */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary-800/60" />
                        </div>

                        {/* Right: Contact Form */}
                        <div className="py-12 md:py-16 lg:py-14 px-2 sm:px-6 lg:px-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                                Contact Shilingi Moves
                            </h2>

                            {/* Success Message */}
                            {formSubmitted && (
                                <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-100 text-sm font-medium animate-fade-in">
                                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                                    Thank you! We&apos;ve received your message and will get back to you shortly.
                                </div>
                            )}

                            {/* Error Message */}
                            {formError && (
                                <div className="mb-6 px-5 py-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm font-medium">
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Row 1: First Name + Last Name */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Email + Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Message */}
                                <div>
                                    <textarea
                                        name="message"
                                        placeholder="Message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 resize-none"
                                    />
                                </div>

                                {/* Consent Checkbox */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="consent"
                                        checked={formData.consent}
                                        onChange={handleInputChange}
                                        className="mt-0.5 w-5 h-5 rounded border-2 border-white/40 bg-transparent text-primary-500 focus:ring-primary-400 focus:ring-offset-0 cursor-pointer accent-primary-500"
                                    />
                                    <span className="text-sm text-white/80 group-hover:text-white transition-colors leading-snug">
                                        I allow Shilingi Moves to contact me via email and phone.
                                    </span>
                                </label>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-base rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                                >
                                    Submit
                                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ MAIN FOOTER BODY Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="bg-[#050807]">
            <div className="container-custom pt-14 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-10 lg:gap-6 xl:gap-8">

                    {/* Brand column Ã¢â‚¬â€ spans 2 on lg */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link to="/" className="inline-block">
                            <img
                                src={animatedLogo}
                                alt="Shilingi Moves"
                                className="h-14 w-auto object-contain"
                            />
                        </Link>

                        <p className="max-w-xs text-sm leading-relaxed !text-white/75">
                            Powering every step of your financial journey.<br />One shilingi at a time.
                        </p>

                        {/* Trust badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2">
                            <Shield size={14} className="text-emerald-300" />
                            <span className="text-xs font-semibold text-emerald-100">Trusted by 10,000+ Kenyans</span>
                        </div>

                        {/* Social icons */}
                        <p className="text-xs font-bold uppercase tracking-widest !text-white/55">Follow Us</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            {[
                                {
                                    href: '#', label: 'LinkedIn', color: 'text-[#0077b5]',
                                    icon: <Linkedin size={17} />,
                                },

                                {
                                    href: '#', label: 'Facebook', color: 'text-[#1877F2]',
                                    icon: <Facebook size={17} />,
                                },
                                {
                                    href: '#', label: 'YouTube', color: 'text-[#FF0000]',
                                    icon: <Youtube size={17} />,
                                },
                                {
                                    href: '#', label: 'X', color: 'text-white',
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" /></svg>,
                                },
                                {
                                    href: '#', label: 'TikTok', color: 'text-white',
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>,
                                },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    aria-label={s.label}
                                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1] ${s.color}`}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform column */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.26em] text-white">Platform</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'Dashboard', to: dashboardPath },
                                { label: 'Compare', to: '/compare' },
                                { label: 'Resources', to: '/tools' },
                                { label: 'Learning Hub', to: '/learn' },
                                { label: 'Community', to: '/community' },
                                { label: 'Refer a Friend', to: '/refer' },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={item.to}
                                        className="inline-flex text-[15px] font-medium !text-white/80 transition-colors duration-200 hover:!text-white"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Planning Tools column */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.26em] text-white">Planning Tools</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'Budget Planner', to: '/signup' },
                                { label: 'Debt Manager', to: '/signup' },
                                { label: 'Investment Planner', to: '/signup' },
                                { label: 'Protection Planner', to: '/signup' },
                                { label: 'Retirement Planner', to: '/signup' },
                                { label: 'Net Worth Tracker', to: '/signup' },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={item.to}
                                        className="inline-flex text-[15px] font-medium !text-white/80 transition-colors duration-200 hover:!text-white"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company column */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.26em] text-white">Company</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'About Us', to: '/about' },
                                { label: 'Careers', to: '/careers' },
                                { label: 'Partner With Us', to: '/partnerships' },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={item.to}
                                        className="inline-flex text-[15px] font-medium !text-white/80 transition-colors duration-200 hover:!text-white"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get in Touch column */}
                    <div className="lg:col-span-2">
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.26em] text-white">Get in Touch</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:hello@shilingimoves.com" className="group flex items-start gap-3 text-sm !text-white/80 transition-colors hover:!text-white">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-white/[0.12]">
                                        <Mail size={14} className="text-emerald-300 transition-colors group-hover:text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="mb-0.5 text-xs !text-white/50">Email us</p>
                                        <p className="whitespace-nowrap text-[13px] font-semibold !text-white transition-colors group-hover:!text-white xl:text-sm">hello@shilingimoves.com</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+254727005993" className="group flex items-start gap-3 text-sm !text-white/80 transition-colors hover:!text-white">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-white/[0.12]">
                                        <Phone size={14} className="text-emerald-300 transition-colors group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-xs !text-white/50">Contact us</p>
                                        <p className="font-semibold !text-white transition-colors group-hover:!text-white">+254 727 005 993</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <Link to="/faqs" className="group flex items-start gap-3 text-sm !text-white/80 transition-colors hover:!text-white">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-white/[0.12]">
                                        <span className="text-xs font-bold text-emerald-300 transition-colors group-hover:text-white">?</span>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-xs !text-white/50">Read our help answers</p>
                                        <p className="font-semibold !text-white transition-colors group-hover:!text-white">FAQs</p>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            </div>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ BOTTOM BAR Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="border-t border-white/8 bg-[#050807] py-5">
                <div className="container-custom">
                    <p className="max-w-5xl text-xs leading-6 !text-white/70">
                        Shilingi Moves is a financial wellness platform and does not provide regulated financial advice. All content is for educational and informational purposes only. Consult regulated providers or licensed financial professionals before making investment decisions.
                    </p>
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-white/72 md:flex-row">
                        <div className="flex flex-wrap items-center justify-center gap-5 md:justify-start">
                            <Link to="/privacy" className="!text-white/80 transition-colors hover:!text-white">Data Privacy Policy</Link>
                            <Link to="/terms" className="!text-white/80 transition-colors hover:!text-white">Terms of Service</Link>
                            <Link to="/privacy#cookies" className="!text-white/80 transition-colors hover:!text-white">Cookie Policy</Link>
                            <Link to="/data-protection" className="!text-white/80 transition-colors hover:!text-white">Data Protection</Link>
                        </div>
                        <p className="text-center text-xs font-medium !text-white">
                            &copy; {new Date().getFullYear()} Kaizen Publishers Limited. All Rights Reserved.
                        </p>
                        <p className="!text-white">
                            Developed by <span className="text-white font-semibold">CyberJali</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
