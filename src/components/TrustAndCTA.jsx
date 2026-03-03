import React from 'react';
import { Shield, Award, CheckCircle2, Target, Users, ThumbsUp } from 'lucide-react';
import Button from './Button';
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
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                            Start your financial dashboard today.
                        </h2>
                        <p className="text-lg sm:text-xl mb-8 md:mb-10 text-primary-50 max-w-2xl mx-auto leading-relaxed">
                            Join over 50,000 Kenyans who are taking control of their finances with Shilingi Moves. Free to start.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                variant="primary"
                                size="lg"
                                to="/signup"
                                className="bg-green-600 text-white hover:bg-green-600 border-2 border-white shadow-xl w-full sm:w-auto"
                            >
                                Create my dashboard
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                to="/dashboard"
                                className="border-white/30 text-white hover:bg-white/10"
                            >
                                Explore platform
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustAndCTA;
