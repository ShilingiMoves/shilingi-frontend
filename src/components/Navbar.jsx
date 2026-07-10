import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gift } from 'lucide-react';
import Button from './Button';
import animatedLogo from '../assets/shilingi-logo-animated.gif';
import { hasStoredAccessToken } from '../services/authApi';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const dashboardPath = hasStoredAccessToken() ? '/dashboard/app' : '/dashboard';

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const mobileNavLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: dashboardPath },
        { name: 'Compare', path: '/compare' },
        { name: 'Resources', path: '/tools' },
        { name: 'Learning Hub', path: '/learn' },
        { name: 'Community', path: '/community' },
        { name: 'Refer a Friend', path: '/refer', icon: Gift },
    ];

    const desktopNavLinks = mobileNavLinks.filter((link) => link.name !== 'Home');

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 shadow-sm border-b border-gray-200" style={{ backgroundColor: '#f8f8f8' }}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-16 md:h-18 lg:h-20">
                    <Link to="/" className="flex items-center">
                        <img
                            src={animatedLogo}
                            alt="Shilingi Moves Logo"
                            className="h-12 md:h-14 lg:h-16 object-contain"
                        />
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {desktopNavLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.icon && <link.icon size={16} className={isActive(link.path) ? 'text-primary-600' : 'text-amber-500'} />}
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        <Link
                            to="/signin"
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors min-h-[40px] flex items-center"
                        >
                            Sign In
                        </Link>
                        <Button variant="primary" to="/onboarding" size="sm" className="min-h-[40px] px-5">
                            Create your account
                        </Button>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2.5 rounded-md text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[999] flex flex-col"
                    style={{ backgroundColor: '#f8f8f8' }}
                >
                    <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 shrink-0">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                            <img
                                src={animatedLogo}
                                alt="Shilingi Moves Logo"
                                className="h-12 object-contain"
                            />
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                        {mobileNavLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium min-h-[56px] transition-colors ${isActive(link.path)
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {link.icon && <link.icon size={20} className={isActive(link.path) ? 'text-primary-600' : 'text-amber-500'} />}
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="px-4 pb-8 pt-4 border-t border-gray-200 space-y-3 shrink-0">
                        <Link
                            to="/signin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-center w-full px-4 py-4 text-lg font-medium text-gray-700 hover:text-primary-600 transition-colors border border-gray-200 rounded-xl min-h-[56px]"
                        >
                            Sign In
                        </Link>
                        <Button variant="primary" to="/onboarding" size="md" className="w-full justify-center shadow-md text-lg min-h-[56px] px-5">
                            Create your account
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
