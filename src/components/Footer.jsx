import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin, ArrowRight, Linkedin, Youtube } from 'lucide-react';
import animatedLogo from '../assets/shilingi-logo-animated.gif';

const Footer = () => {
    return (
        <footer className="bg-gray-50 text-gray-900 border-t border-gray-200 font-sans">
            {/* 1. Pre-Footer CTA Banner */}
            <div className="bg-primary-600 py-12 md:py-16 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <div className="container-custom relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Your financial journey starts here.</h2>
                        <p className="text-primary-100 text-lg max-w-xl">Take the first step towards a wealthier future today with Shilingi Moves.</p>
                    </div>
                    <Link
                        to="/learn"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-primary-700 font-extrabold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg group"
                    >
                        START LEARNING FREE
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* 2. Main Footer Content */}
            <div className="container-custom pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="inline-block">
                            <img
                                src={animatedLogo}
                                alt="Shilingi Moves Logo"
                                className="h-16 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                            Powering every step of your financial journey.
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* LinkedIn */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
                                <Linkedin size={20} className="text-[#0077b5]" strokeWidth={1.5} fill="currentColor" fillOpacity={0} />
                            </a>
                            {/* Instagram */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
                                <Instagram size={20} className="text-[#E1306C]" />
                            </a>
                            {/* Facebook */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
                                <Facebook size={20} className="text-[#1877F2]" />
                            </a>
                            {/* X (Twitter) */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill="currentColor" />
                                </svg>
                            </a>
                            {/* TikTok */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md group">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-black">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
                                <Youtube size={20} className="text-[#FF0000]" />
                            </a>
                        </div>
                    </div>

                    {/* Solutions Column */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Financial Solutions</h3>
                        <ul className="space-y-4">
                            <li><Link to="/tools" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Budgeting Tools</Link></li>
                            <li><Link to="/compare" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Compare Rates</Link></li>
                            <li><Link to="/community" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Find Advisors</Link></li>
                            <li><Link to="/learn" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Workshops</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Wealth Resources</h3>
                        <ul className="space-y-4">
                            <li><Link to="/learn" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Learning Hub</Link></li>
                            <li><Link to="/learn#paths" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Guided Paths</Link></li>
                            <li><Link to="/tools" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Calculators</Link></li>
                            <li><Link to="/community" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Success Stories</Link></li>
                        </ul>
                    </div>

                    {/* Company Column - NEW */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Company</h3>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>About</Link></li>
                            <li><Link to="/careers" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Career</Link></li>
                            <li><Link to="/partnerships" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Partnerships</Link></li>
                            <li><Link to="/community" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>Community</Link></li>
                            <li><Link to="/faqs" className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover:bg-primary-600 transition-colors"></span>FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Get in Touch</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-600">
                                <Phone size={20} className="text-primary-600 shrink-0 mt-1" />
                                <span>+254 700 000 000</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <Mail size={20} className="text-primary-600 shrink-0 mt-1" />
                                <a href="mailto:hello@shilingimoves.com" className="hover:text-primary-600 transition-colors">hello@shilingimoves.com</a>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <MapPin size={20} className="text-primary-600 shrink-0 mt-1" />
                                <span>Park Court, Ojijo Road,<br />Parklands, Nairobi</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Bar */}
            <div className="border-t border-gray-200 bg-white py-6">
                <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Shilingi Moves. All Rights Reserved.</p>

                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
                    </div>

                    <p className="flex items-center gap-1">
                        Developed by <span className="text-primary-600 font-medium">Prospect Pilot AI</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
