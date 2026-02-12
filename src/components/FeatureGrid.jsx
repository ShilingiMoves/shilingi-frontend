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
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                        What You Get
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need for financial wellness.
                    </p>
                </div>

                {/* Feature Cards Grid/Scroll */}
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 lg:gap-10 md:overflow-visible md:pb-0 md:px-0 snap-x snap-mandatory hide-scrollbar">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.path}
                            className="flex-shrink-0 w-[280px] md:w-auto snap-center mr-4 md:mr-0 group p-6 bg-white border border-gray-100 rounded-2xl hover:border-primary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center w-14 h-14 bg-primary-50 text-primary-600 rounded-xl mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                <feature.icon size={28} strokeWidth={1.5} />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-base text-gray-600 leading-relaxed line-clamp-2">
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
