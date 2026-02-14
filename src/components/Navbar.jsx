import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Users, Shield, BookOpen, BarChart3, Wrench } from 'lucide-react';
import Button from './Button';
import animatedLogo from '../assets/shilingi-logo-animated.gif';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
    const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
    const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
    const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
    const exploreRef = useRef(null);
    const communityRef = useRef(null);
    const exploreTimeoutRef = useRef(null);
    const communityTimeoutRef = useRef(null);
    const location = useLocation();

    const exploreDropdown = [
        { name: 'Learn', path: '/learn', icon: BookOpen, desc: 'Master your money' },
        { name: 'Compare', path: '/compare', icon: BarChart3, desc: 'Find the best products' },
        { name: 'Tools', path: '/tools', icon: Wrench, desc: 'Calculate & plan' },
    ];

    const communityDropdown = [
        { name: 'Community Hub', path: '/community', icon: Users, desc: 'Join discussions & groups' },
        { name: 'Find an Advisor', path: '/advisors', icon: Shield, desc: 'Connect with experts' },
    ];

    const isActive = (path) => location.pathname === path;
    const isExploreActive = exploreDropdown.some(item => location.pathname === item.path);
    const isCommunityActive = communityDropdown.some(item => location.pathname === item.path);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exploreRef.current && !exploreRef.current.contains(event.target)) {
                setExploreDropdownOpen(false);
            }
            if (communityRef.current && !communityRef.current.contains(event.target)) {
                setCommunityDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close everything on route change
    useEffect(() => {
        setExploreDropdownOpen(false);
        setCommunityDropdownOpen(false);
        setMobileMenuOpen(false);
        setMobileExploreOpen(false);
        setMobileCommunityOpen(false);
    }, [location.pathname]);

    // Hover handlers for Explore
    const handleExploreEnter = () => {
        clearTimeout(exploreTimeoutRef.current);
        setExploreDropdownOpen(true);
        setCommunityDropdownOpen(false);
    };
    const handleExploreLeave = () => {
        exploreTimeoutRef.current = setTimeout(() => setExploreDropdownOpen(false), 200);
    };

    // Hover handlers for Community
    const handleCommunityEnter = () => {
        clearTimeout(communityTimeoutRef.current);
        setCommunityDropdownOpen(true);
        setExploreDropdownOpen(false);
    };
    const handleCommunityLeave = () => {
        communityTimeoutRef.current = setTimeout(() => setCommunityDropdownOpen(false), 200);
    };

    // Reusable desktop dropdown panel renderer
    const DropdownPanel = ({ items }) => (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn overflow-hidden">
            {items.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors group ${isActive(item.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive(item.path)
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                        }`}>
                        <item.icon size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                </Link>
            ))}
        </div>
    );

    // Reusable mobile dropdown renderer
    const MobileDropdownItems = ({ items }) => (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-200 pl-4">
            {items.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium min-h-[48px] ${isActive(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <item.icon size={18} className="shrink-0" />
                    {item.name}
                </Link>
            ))}
        </div>
    );

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
                        {/* Dashboard — standalone */}
                        <Link
                            to="/dashboard"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                }`}
                        >
                            Dashboard
                        </Link>

                        {/* Explore Dropdown */}
                        <div
                            ref={exploreRef}
                            className="relative"
                            onMouseEnter={handleExploreEnter}
                            onMouseLeave={handleExploreLeave}
                        >
                            <button
                                onClick={() => { setExploreDropdownOpen(!exploreDropdownOpen); setCommunityDropdownOpen(false); }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1 ${isExploreActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                Explore
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${exploreDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {exploreDropdownOpen && <DropdownPanel items={exploreDropdown} />}
                        </div>

                        {/* Community Dropdown */}
                        <div
                            ref={communityRef}
                            className="relative"
                            onMouseEnter={handleCommunityEnter}
                            onMouseLeave={handleCommunityLeave}
                        >
                            <button
                                onClick={() => { setCommunityDropdownOpen(!communityDropdownOpen); setExploreDropdownOpen(false); }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1 ${isCommunityActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                Community
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${communityDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {communityDropdownOpen && <DropdownPanel items={communityDropdown} />}
                        </div>

                        {/* Partnerships — standalone */}
                        <Link
                            to="/partnerships"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/partnerships')
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                }`}
                        >
                            Partnerships
                        </Link>
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
                    <div className="container-custom space-y-2">
                        {/* Dashboard — standalone */}
                        <Link
                            to="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-3.5 rounded-lg text-lg font-medium min-h-[52px] flex items-center ${isActive('/dashboard')
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Dashboard
                        </Link>

                        {/* Mobile Explore Dropdown */}
                        <div>
                            <button
                                onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                                className={`w-full px-4 py-3.5 rounded-lg text-lg font-medium min-h-[52px] flex items-center justify-between ${isExploreActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Explore
                                <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-200 ${mobileExploreOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {mobileExploreOpen && <MobileDropdownItems items={exploreDropdown} />}
                        </div>

                        {/* Mobile Community Dropdown */}
                        <div>
                            <button
                                onClick={() => setMobileCommunityOpen(!mobileCommunityOpen)}
                                className={`w-full px-4 py-3.5 rounded-lg text-lg font-medium min-h-[52px] flex items-center justify-between ${isCommunityActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Community
                                <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-200 ${mobileCommunityOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {mobileCommunityOpen && <MobileDropdownItems items={communityDropdown} />}
                        </div>

                        {/* Partnerships — standalone */}
                        <Link
                            to="/partnerships"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-3.5 rounded-lg text-lg font-medium min-h-[52px] flex items-center ${isActive('/partnerships')
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Partnerships
                        </Link>

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
