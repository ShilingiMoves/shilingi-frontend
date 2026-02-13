import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, MessageCircle, Video, Trophy,
    ArrowRight, Star, Heart, Target,
    Calendar, CheckCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import communityHeroBg from '../assets/shilingi-community.png';

const CommunityPage = () => {
    useEffect(() => {
        document.title = 'Join the Community | Shilingi Moves';
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: MessageCircle,
            title: "Discussion Forums",
            description: "Share your journey, ask questions, and get advice from people on the same path.",
            color: "bg-blue-100 text-blue-600"
        },
        {
            icon: Trophy,
            title: "Success Stories",
            description: "Get inspired by real members who have paid off debt, started investing, and hit their goals.",
            color: "bg-amber-100 text-amber-600"
        },
        {
            icon: Users,
            title: "Accountability Groups",
            description: "Join small squads to keep you on track with your saving and investing targets.",
            color: "bg-emerald-100 text-emerald-600"
        },
        {
            icon: Video,
            title: "Live Masterclasses",
            description: "Weekly live sessions with financial experts. Learn, ask questions, and grow.",
            color: "bg-purple-100 text-purple-600"
        }
    ];

    const testimonials = [
        {
            name: "Sarah K.",
            role: "Member since 2024",
            text: "I felt so alone with my debt until I joined this community. The support is unreal!",
            image: "https://placehold.co/100x100/e2e8f0/1e293b?text=SK"
        },
        {
            name: "David M.",
            role: "Saved KES 100k",
            text: "The accountability group changed everything. I finally hit my savings goal!",
            image: "https://placehold.co/100x100/e2e8f0/1e293b?text=DM"
        },
        {
            name: "Wanjiku P.",
            role: "Investor",
            text: "The masterclasses are worth gold. I learned how to start my MMF portfolio here.",
            image: "https://placehold.co/100x100/e2e8f0/1e293b?text=WP"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* HERO SECTION */}
            <section className="relative bg-primary-900 text-white min-h-[70vh] flex items-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={communityHeroBg}
                        alt="Community"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/70 to-primary-900/40"></div>
                </div>

                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto py-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-700 text-primary-200 text-sm font-semibold mb-6 animate-fadeIn">
                        🚀 Join 5,000+ Members
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        You’re Not Alone <br /> in Your <span className="text-primary-400">Financial Journey</span>
                    </h1>
                    <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join a growing community committed to financial wellness. Learn together, stay accountable, and celebrate every win, big or small.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button to="/signup" variant="primary" size="lg" className="shadow-xl shadow-primary-900/20">
                            Join the Community
                        </Button>
                        <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                            <Video size={20} /> Watch Intro
                        </button>
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="py-20 relative z-10 -mt-20">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VALUE PROPOSITION / "Why Join?" */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                Transform Your Money Mindset <span className="text-primary-600">Together</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Most people fail at their financial goals because they try to do it alone. The Shilingi Moves community gives you the ecosystem you need to succeed.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-green-100 p-2 rounded-full h-fit text-green-600"><CheckCircle size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg">Daily Motivation</h4>
                                        <p className="text-gray-600">Start your day with money tips and wins from the community.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-blue-100 p-2 rounded-full h-fit text-blue-600"><Users size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg">Expert Access</h4>
                                        <p className="text-gray-600">Direct access to financial coaches and planners in our premium groups.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-purple-100 p-2 rounded-full h-fit text-purple-600"><Target size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg">Challenges</h4>
                                        <p className="text-gray-600">Join "52-Week Savings" or "Debt Destruction" challenges.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-600 rounded-3xl rotate-3 opacity-10"></div>
                            <img
                                src="https://placehold.co/600x500/f1f5f9/334155?text=Community+Event"
                                alt="Community Event"
                                className="relative rounded-3xl shadow-2xl w-full object-cover"
                            />
                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs animate-bounce-slow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-full"><Trophy size={16} /></div>
                                    <span className="font-bold text-sm text-gray-800">New Achievement!</span>
                                </div>
                                <p className="text-sm text-gray-600">"Debt Free in '26" group just hit 1M KES paid off!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Real Stories, Real Growth</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">See what happens when you surround yourself with the right people.</p>
                </div>
                <div className="container-custom grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex gap-1 text-amber-400 mb-4">
                                <Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} />
                            </div>
                            <p className="text-gray-700 italic mb-6">"{t.text}"</p>
                            <div className="flex items-center gap-4">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full bg-gray-200" />
                                <div className="text-left">
                                    <h4 className="font-bold">{t.name}</h4>
                                    <p className="text-xs text-primary-600 font-semibold uppercase">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-24 bg-primary-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600 rounded-full blur-3xl opacity-30translate-y-1/3 -translate-x-1/3"></div>

                <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Find Your Tribe?</h2>
                    <p className="text-xl text-primary-100 mb-10">
                        Join thousands of Kenyans taking control of their financial future. Access exclusive tools, expert advice, and a supportive network today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button to="/signup" variant="white" size="lg" className="text-primary-900">
                            Join for Free
                        </Button>
                        <Link to="/learn" className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                            Explore Courses
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-primary-300 opacity-80">No credit card required • Cancel anytime</p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

// Simple Button Component inline if not imported (reusing existing if strictly standard, but for speed here's the usage)
import { useNavigate } from 'react-router-dom';

const Button = ({ children, to, variant = 'primary', size = 'md', className = '' }) => {
    const navigate = useNavigate();

    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 transform active:scale-95";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg",
        white: "bg-white text-primary-900 hover:bg-gray-100 hover:shadow-lg",
        outline: "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <button
            onClick={() => to && navigate(to)}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export default CommunityPage;
