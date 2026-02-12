import React from 'react';
import { UserPlus, Search, TrendingUp, ArrowRight } from 'lucide-react';

const Steps = () => {
    const steps = [
        {
            number: 1,
            icon: UserPlus,
            title: 'Create your dashboard',
            description: 'Sign up and connect your accounts',
        },
        {
            number: 2,
            icon: Search,
            title: 'Pick what you need',
            description: 'Learn, tools, compare - all in one place',
        },
        {
            number: 3,
            icon: TrendingUp,
            title: 'Track progress and grow',
            description: 'Achieve your financial goals',
        },
    ];

    return (
        <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                        How It Works
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Get started in three simple steps.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Connection Line - Desktop */}
                    <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gray-200" style={{ width: 'calc(100% - 120px)', left: '60px' }}>
                        <div className="h-full bg-primary-500" style={{ width: '100%' }}></div>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center">
                                {/* Step Number Circle */}
                                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-lg mb-4">
                                    <step.icon size={28} className="md:hidden" strokeWidth={2} />
                                    <step.icon size={32} className="hidden md:block" strokeWidth={2} />
                                </div>

                                {/* Step Number Badge */}
                                <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2 flex items-center justify-center w-8 h-8 bg-gray-900 text-white text-sm font-bold rounded-full z-20">
                                    {step.number}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Expert CTA */}
                    <div className="mt-12 text-center">
                        <a
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 transition-all duration-300 group"
                        >
                            Launch Your Shilingi Dashboard Today
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Steps;
