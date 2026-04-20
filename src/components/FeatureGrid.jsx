import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Scale,
    Calculator,
    Users,
} from 'lucide-react';

import dashboardImage from '../assets/Shilingi-dashboad image.png';

const features = [
    {
        icon: LayoutDashboard,
        title: 'Dashboard',
        description:
            'See your full money picture - all your goals, spending, and progress in one clean view made for you.',
        path: '/dashboard',
    },
    {
        icon: Scale,
        title: 'Compare',
        description:
            'Stop settling for the first option you see. Compare banks, loans, and M-Pesa products side by side - in seconds.',
        path: '/compare',
    },
    {
        icon: Calculator,
        title: 'Resources',
        description:
            'Run the numbers before you commit. Loan, savings, and budget calculators so you never sign blindly again.',
        path: '/tools',
    },
    {
        icon: BookOpen,
        title: 'Learning Hub',
        description:
            'Stop guessing with your money. Get bite-sized financial lessons built around how Kenyans actually earn, spend, and save.',
        path: '/learn',
    },
    {
        icon: Users,
        title: 'Community',
        description:
            "You don't have to figure this out alone. Join a community of people on the same journey - share, learn, and grow together.",
        path: '/community',
    },
];

const FeatureGrid = () => {
    return (
        <section
            id="what-you-get"
            style={{ backgroundColor: '#f0f7f9' }}
            className="section-padding"
        >
            <div className="container-custom">
                <div className="text-center mb-10 md:mb-14">
                    <h2
                        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight"
                        style={{ color: '#0d4f5c' }}
                    >
                        What You Get
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Everything you need for financial wellness - all in one place.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
                    <div className="w-full lg:w-5/12 flex-shrink-0 flex flex-col justify-center">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={dashboardImage}
                                alt="Shilingi Moves Dashboard"
                                className="w-full h-auto object-cover block"
                            />
                            <div
                                className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to top, rgba(13,79,92,0.4), transparent)',
                                }}
                            />
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-white text-xs font-semibold tracking-wide drop-shadow">
                                    Live Dashboard
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const col = index % 3;
                            const row = Math.floor(index / 3);
                            const totalRows = Math.ceil(features.length / 3);
                            const borderRight = col < 2 && index < features.length - 1;
                            const borderBottom = row < totalRows - 1;

                            return (
                                <Link
                                    key={feature.title}
                                    to={feature.path}
                                    className="group relative p-6 flex flex-col items-start transition-colors duration-200"
                                    style={{
                                        borderRight: borderRight ? '1px dashed #c5dde3' : 'none',
                                        borderBottom: borderBottom ? '1px dashed #c5dde3' : 'none',
                                        backgroundColor: 'transparent',
                                    }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)';
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div className="mb-4 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                        <Icon size={20} strokeWidth={2} />
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;
