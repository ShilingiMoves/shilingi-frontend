import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Scale, Calculator, Users, MessageSquare } from 'lucide-react';

const FeatureGrid = () => {
    const features = [
        {
            icon: LayoutDashboard,
            title: 'Dashboard',
            description: 'Track all your spending, savings, and goals in one place.',
            path: '/dashboard',
        },
        {
            icon: BookOpen,
            title: 'Learn',
            description: 'Financial education tailored for Kenyan realities.',
            path: '/learn',
        },
        {
            icon: Scale,
            title: 'Compare',
            description: 'Compare banks, loans, investments side-by-side.',
            path: '/compare',
        },
        {
            icon: Calculator,
            title: 'Tools',
            description: 'Smart calculators for loans, savings, and budgets.',
            path: '/tools',
        },
        {
            icon: MessageSquare,
            title: 'Advisors',
            description: 'Get guidance from trusted financial experts.',
            path: '/community',
        },
        {
            icon: Users,
            title: 'Community',
            description: 'Learn together and share your progress.',
            path: '/community',
        },
    ];

    return (
        <section className="section-padding bg-white">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                        What You Get
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need to take control of your finances.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.path}
                            className="group p-5 md:p-6 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-lg transition-all duration-300 min-h-[140px] flex flex-col"
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <feature.icon size={24} />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600">
                                {feature.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;
