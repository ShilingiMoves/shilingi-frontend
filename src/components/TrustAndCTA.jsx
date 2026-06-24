import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, Target, ThumbsUp, TrendingUp, ArrowRight } from 'lucide-react';
import TrustImg from '../assets/trust_people_kenya.webp';

const TrustAndCTA = () => {
    const badges = [
        { name: 'CBK', description: 'Compliant' },
        { name: 'CMA', description: 'Registered' },
        { name: 'KDIC', description: 'Protected' },
    ];

    const metrics = [
        { icon: Target, value: '50,000+', label: 'Goals tracked' },
        { icon: ThumbsUp, value: '98%', label: 'User satisfaction' },
    ];

    return (
        <section className="section-padding overflow-hidden bg-white">
            <div className="container-custom">
                <div className="mb-16 grid grid-cols-1 items-center gap-10 md:mb-24 md:gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="relative order-last mt-8 lg:order-first lg:mt-0">
                        <div className="absolute inset-0 translate-y-4 scale-95 rotate-2 rounded-3xl bg-primary-600 opacity-5" />
                        <img
                            src={TrustImg}
                            alt="Happy Kenyan couple using financial app on tablet"
                            className="relative mx-auto aspect-square max-h-[400px] w-full rounded-3xl object-cover shadow-xl sm:aspect-[4/3] lg:aspect-[4/3] lg:max-h-none"
                            loading="lazy"
                            decoding="async"
                        />

                        <div className="absolute -bottom-6 -right-6 hidden max-w-xs rounded-xl border border-gray-100 bg-white p-4 shadow-lg md:block">
                            <div className="flex items-center space-x-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-500">
                                            User
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">50,000+ Users</p>
                                    <p className="text-xs text-green-600">Trust Shilingi Moves</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-8 md:mb-10">
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-600">
                                <Shield size={16} /> Trusted Platform
                            </p>
                            <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:mb-6 md:text-5xl">
                                Join thousands of Kenyans securing their future.
                            </h2>
                            <p className="text-lg leading-relaxed text-gray-600">
                                We work with regulated partners to ensure your data and money are always safe. Your security is our top priority.
                            </p>
                        </div>

                        <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:mb-10 md:gap-8">
                            {metrics.map((metric, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="mb-1 text-3xl font-bold text-gray-900 sm:text-4xl">{metric.value}</div>
                                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {badges.map((badge, index) => (
                                <div key={index} className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center text-white shadow-2xl sm:p-10 md:p-14 lg:p-16">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                    <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                            <TrendingUp size={14} /> Kenya&apos;s #1 Financial Wellness Platform
                        </p>
                        <h2 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                            Your financial future starts<br className="hidden md:block" /> with one good decision.
                        </h2>
                        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-primary-100 sm:text-xl md:mb-10">
                            Join thousands of Kenyans who are learning, planning, and growing their wealth, one shilling at a time.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                to="/signup"
                                className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-extrabold text-primary-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50 hover:shadow-2xl"
                            >
                                Get Started Today
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustAndCTA;
