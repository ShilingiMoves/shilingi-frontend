import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from './Button';
import animatedLogo from '../assets/shilingi-logo-animated.gif';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Learn', path: '/learn' },
        { name: 'Compare', path: '/compare' },
        { name: 'Tools', path: '/tools' },
        { name: 'Community', path: '/community' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 shadow-sm border-b border-gray-200" style={{ backgroundColor: '#f8f8f8' }}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-16 md:h-18 lg:h-20">
                    {/* Animated Logo */}
                    <Link to="/" className="flex items-center">
                        <img
                            src={animatedLogo}
                            alt="Shilingi Moves Logo"
                            className="h-12 md:h-14 lg:h-16 object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Button variant="ghost" to="/signin" size="sm" className="min-h-[40px]">
                            Sign In
                        </Button>
                        <Button variant="primary" to="/signup" size="sm" className="min-h-[40px]">
                            Free Sign Up
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2.5 rounded-md text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 pb-6 px-4 overflow-y-auto" style={{ top: '0', backgroundColor: '#f8f8f8' }}>
                    {/* Close button for mobile menu overlay provided by the main navbar toggle which is z-50 */}

                    <div className="container-custom space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3.5 rounded-lg text-lg font-medium min-h-[52px] flex items-center ${isActive(link.path)
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-6 space-y-3">
                            <Button variant="ghost" to="/signin" size="md" className="w-full justify-center">
                                Sign In
                            </Button>
                            <Button variant="primary" to="/signup" size="md" className="w-full justify-center shadow-md">
                                Free Sign Up
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
