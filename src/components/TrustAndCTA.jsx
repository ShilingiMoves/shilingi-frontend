import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, CheckCircle2, Target, Users, ThumbsUp, TrendingUp, ArrowRight } from 'lucide-react';
import TrustImg from '../assets/trust_people_kenya.png';

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
        <section className="section-padding bg-white overflow-hidden">
            <div className="container-custom">
                {/* Trust Section Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center mb-16 md:mb-24">
                    {/* Image Column */}
                    <div className="relative order-last lg:order-first mt-8 lg:mt-0">
                        <div className="absolute inset-0 bg-primary-600 rounded-3xl rotate-2 opacity-5 transform scale-95 translate-y-4"></div>
                        <img
                            src={TrustImg}
                            alt="Happy Kenyan couple using financial app on tablet"
                            className="relative rounded-3xl shadow-xl w-full object-cover aspect-square sm:aspect-[4/3] lg:aspect-[4/3] max-h-[400px] lg:max-h-none mx-auto"
                        />

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs hidden md:block">
                            <div className="flex items-center space-x-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
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

                    {/* Content Column */}
                    <div>
                        <div className="mb-8 md:mb-10">
                            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Shield size={16} /> Trusted Platform
                            </p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                                Join thousands of Kenyans securing their future.
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                We work with regulated partners to ensure your data and money are always safe. Your security is our top priority.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
                            {metrics.map((metric, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{metric.value}</div>
                                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-3">
                            {badges.map((badge, index) => (
                                <div key={index} className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final CTA Box */}
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl shadow-2xl p-8 sm:p-10 md:p-14 lg:p-16 text-center text-white relative overflow-hidden">
                    {/* Decorative dot pattern */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                    {/* Decorative blurs */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <p className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-5">
                            <TrendingUp size={14} /> Kenya's #1 Financial Wellness Platform
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Your financial future starts<br className="hidden md:block" /> with one good decision.
                        </h2>
                        <p className="text-lg sm:text-xl mb-8 md:mb-10 text-primary-100 max-w-xl mx-auto leading-relaxed">
                            Join thousands of Kenyans who are learning, planning, and growing their wealth — one shilling at a time.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-primary-700 font-extrabold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-base group"
                            >
                                Get Started Today
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/learn"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white font-bold rounded-full transition-all duration-300"
                            >
                                Explore the Platform
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustAndCTA;
