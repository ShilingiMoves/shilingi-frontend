import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Heart, Shield, Zap, Users, BookOpen,
    BarChart2, Wrench, Target, Eye,
    Sparkles, Mail, Phone, CheckCircle2, ChevronRight, Linkedin
} from 'lucide-react';
import heroImg from '../assets/home-page-1.png';
import communityImg from '../assets/shilingi-community.png';
import trustImg from '../assets/trust_people_kenya.png';
import Footer from '../components/Footer';

// ─── DATA ────────────────────────────────────────────────────────────────────

const whatWeDo = [
    {
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600',
        title: 'Learn',
        desc: 'Easy lessons on saving, budgeting, and investing — built for Kenya.',
        cta: 'Start Learning',
        link: '/learn',
    },
    {
        icon: BarChart2,
        color: 'from-purple-500 to-purple-600',
        title: 'Compare',
        desc: 'See which bank, SACCO, or fund gives you the best deal.',
        cta: 'Compare Now',
        link: '/compare',
    },
    {
        icon: Wrench,
        color: 'from-amber-500 to-orange-500',
        title: 'Tools',
        desc: 'Free calculators to plan your budget, savings, and loans.',
        cta: 'Use Tools',
        link: '/tools',
    },
    {
        icon: Users,
        color: 'from-primary-500 to-primary-700',
        title: 'Community',
        desc: 'Join thousands of Kenyans sharing money tips and wins.',
        cta: 'Join Community',
        link: '/community',
    },
];

const whoWeHelp = [
    { emoji: '💼', label: 'Young Professionals', desc: 'Just started earning? We help you save smart from day one.' },
    { emoji: '🛒', label: 'Side Hustlers', desc: 'Running a business? Learn to separate personal and business money.' },
    { emoji: '🏠', label: 'Families', desc: 'Planning for school fees, a home, or retirement? We\'ve got you.' },
    { emoji: '🎓', label: 'Students', desc: 'Build good money habits before your first paycheck.' },
    { emoji: '🌍', label: 'Diaspora', desc: 'Sending money home? Make every shilling work harder.' },
    { emoji: '🏪', label: 'Small Business Owners', desc: 'Grow your business with better financial planning.' },
];

const values = [
    { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Simple', desc: 'No jargon. No confusion. Just clear, easy money advice.' },
    { icon: Shield, color: 'bg-blue-100 text-blue-600', title: 'Transparent', desc: 'We show you the full picture — no hidden fees or fine print.' },
    { icon: Heart, color: 'bg-red-100 text-red-600', title: 'Empowering', desc: 'We give you the tools to make your own smart decisions.' },
    { icon: Users, color: 'bg-primary-100 text-primary-600', title: 'Community', desc: 'We grow together. Your win is our win.' },
];

const team = [
    {
        initials: 'BS',
        name: 'Bernar Sanya',
        role: 'Founder & CEO',
        bio: 'Passionate about making financial freedom accessible to every Kenyan.',
        color: 'from-primary-500 to-primary-700',
    },
    {
        initials: 'AO',
        name: 'Amara Odhiambo',
        role: 'Head of Financial Education',
        bio: 'Certified financial planner with 10+ years helping Kenyans build wealth.',
        color: 'from-blue-500 to-blue-700',
    },
    {
        initials: 'KM',
        name: 'Kelvin Mwangi',
        role: 'Head of Product',
        bio: 'Builds tools that are simple enough for anyone to use on day one.',
        color: 'from-purple-500 to-purple-700',
    },
    {
        initials: 'FW',
        name: 'Faith Wanjiku',
        role: 'Community Lead',
        bio: 'Connects our growing community of Kenyans on their money journey.',
        color: 'from-amber-500 to-orange-600',
    },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const AboutPage = () => {

    useEffect(() => {
        document.title = 'About Us — Shilingi Moves | Kenya\'s Financial Companion';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Learn about Shilingi Moves — Kenya\'s platform for financial education, tools, and community. Discover our mission, values, and the team behind the platform.');
        }
    }, []);

    return (
        <div className="min-h-screen bg-white">

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1 — HERO
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative bg-gray-900 text-white overflow-hidden min-h-[85vh] flex items-center">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImg}
                        alt="Kenyans taking control of their finances"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/30" />
                </div>

                <div className="relative z-10 container-custom py-24 md:py-32">
                    <div className="max-w-2xl">
                        <p className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-300 mb-6">
                            <Sparkles size={16} /> Kenya's Financial Companion
                        </p>
                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-6"
                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                        >
                            We help Kenyans<br />
                            <span className="text-primary-400">take control of their money.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-10 max-w-xl">
                            Shilingi Moves is your one-stop place to learn about money, compare financial products, and use free tools — all built for Kenya.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="mailto:hello@shilingimoves.com"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white font-bold rounded-full transition-all duration-300"
                            >
                                <Mail className="mr-2 w-5 h-5" /> Say Hello
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2 — WHO WE ARE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Image */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={communityImg}
                                alt="Shilingi Moves community members"
                                className="w-full h-80 lg:h-[480px] object-cover"
                            />
                            {/* Floating stat badge */}
                            <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <Users size={24} className="text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">10,000+</p>
                                    <p className="text-sm text-gray-500">Kenyans on the platform</p>
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                                Who We Are
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                We are your money guide — built right here in Kenya.
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Shilingi Moves was born from one simple idea: <strong>every Kenyan deserves to understand their money.</strong> Whether you earn 20,000 or 200,000 shillings a month, you deserve the same great financial advice.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                We bring together free education, smart tools, and a supportive community — all in one place, all built for Kenyan realities.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/learn"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full transition-all duration-300 group"
                                >
                                    Explore What We Offer
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/partnerships"
                                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 hover:border-primary-400 text-gray-700 hover:text-primary-600 font-bold rounded-full transition-all duration-300"
                                >
                                    Partner With Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3 — WHAT WE DO
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                            What We Do
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Four ways we help you grow your money
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Pick what you need today. Come back for more tomorrow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whatWeDo.map((item, i) => (
                            <div
                                key={i}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {/* Gradient top bar */}
                                <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />
                                <div className="p-7 flex flex-col flex-1">
                                    <div className={`w-14 h-14 mb-5 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <item.icon size={26} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{item.desc}</p>
                                    <Link
                                        to={item.link}
                                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 group-hover:gap-2.5 transition-all"
                                    >
                                        {item.cta} <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 4 — WHO WE HELP
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Text side */}
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                                Who We Help
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                If you earn money in Kenya, this is for you.
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                We built Shilingi Moves for real Kenyans — not just the wealthy. Whether you're just starting out or already building wealth, there's something here for you.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {whoWeHelp.map((person, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors group">
                                        <span className="text-2xl">{person.emoji}</span>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{person.label}</p>
                                            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{person.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                                >
                                    Join Shilingi Moves — It's Free
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Image side */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl order-first lg:order-last">
                            <img
                                src={trustImg}
                                alt="Kenyans using Shilingi Moves"
                                className="w-full h-80 lg:h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
                            <div className="absolute bottom-6 right-6 bg-white rounded-2xl shadow-xl px-5 py-4">
                                <p className="text-sm font-bold text-gray-900">Trusted by Kenyans</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1">4.9 / 5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 5 — MISSION, VISION & VALUES
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                            Our Purpose
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why we do what we do
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Every decision we make comes back to one thing: helping Kenyans win with money.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
                        <div className="bg-primary-600 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                                    <Target size={24} className="text-white" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary-200 mb-2">Our Mission</p>
                                <h3 className="text-xl font-bold mb-3">Make financial tools and knowledge available to every Kenyan.</h3>
                                <p className="text-primary-100 text-sm leading-relaxed">
                                    No matter where you live or how much you earn, you deserve the same great financial guidance.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
                                    <Eye size={24} className="text-white" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Our Vision</p>
                                <h3 className="text-xl font-bold mb-3">A Kenya where everyone can grow their wealth.</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    We see a future where financial freedom is not a privilege — it's a right for every Kenyan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {values.map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 mx-auto mb-4 ${v.color} rounded-xl flex items-center justify-center`}>
                                    <v.icon size={22} />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">{v.title}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">Want to know more about how we work?</p>
                        <a
                            href="mailto:hello@shilingimoves.com"
                            className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold rounded-full transition-all duration-300 group"
                        >
                            <Mail className="mr-2 w-5 h-5" />
                            Email Us Anytime
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 6 — OUR TEAM
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                            Our Team
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Real people. Real passion for your money.
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            We're a small, dedicated team of Kenyans who believe everyone deserves financial clarity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {team.map((member, i) => (
                            <div
                                key={i}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
                            >
                                {/* Avatar */}
                                <div className={`bg-gradient-to-br ${member.color} h-36 flex items-center justify-center`}>
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{member.initials}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-gray-900 text-lg mb-0.5">{member.name}</h3>
                                    <p className="text-sm text-primary-600 font-semibold mb-3">{member.role}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{member.bio}</p>
                                    {/* Social icon row */}
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Email */}
                                        <a
                                            href="mailto:hello@shilingimoves.com"
                                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-400 transition-all duration-200"
                                            title="Email"
                                        >
                                            <Mail size={15} />
                                        </a>
                                        {/* Phone */}
                                        <a
                                            href="tel:+254700000000"
                                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-400 transition-all duration-200"
                                            title="Call"
                                        >
                                            <Phone size={15} />
                                        </a>
                                        {/* LinkedIn */}
                                        <a
                                            href="https://linkedin.com/company/shilingimoves"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0077b5] hover:border-[#0077b5] transition-all duration-200"
                                            title="LinkedIn"
                                        >
                                            <Linkedin size={15} />
                                        </a>
                                        {/* WhatsApp */}
                                        <a
                                            href="https://wa.me/254700000000"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#25D366] hover:border-[#25D366] transition-all duration-200"
                                            title="WhatsApp"
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Team CTA */}
                    <div className="mt-12 text-center">
                        <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gray-50 rounded-2xl px-8 py-6 border border-gray-100">
                            <div className="text-left">
                                <p className="font-bold text-gray-900">Want to join our team?</p>
                                <p className="text-sm text-gray-500">We're always looking for people who love Kenya and love money.</p>
                            </div>
                            <Link
                                to="/careers"
                                className="shrink-0 inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full transition-all duration-300 group"
                            >
                                Apply Now
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 7 — CONTACT / GET IN TOUCH
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                                Get In Touch
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                We'd love to hear from you.
                            </h2>
                            <p className="text-lg text-gray-600 max-w-xl mx-auto">
                                Have a question? Want to partner with us? Or just want to say hi? We're here.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* Email */}
                            <a
                                href="mailto:hello@shilingimoves.com"
                                className="group bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                    <Mail size={24} className="text-primary-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                <p className="text-sm text-gray-500 mb-3">We reply within 24 hours</p>
                                <p className="text-sm font-semibold text-primary-600">hello@shilingimoves.com</p>
                            </a>

                            {/* Phone */}
                            <a
                                href="tel:+254700000000"
                                className="group bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                    <Phone size={24} className="text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                <p className="text-sm text-gray-500 mb-3">Mon – Fri, 8am – 6pm</p>
                                <p className="text-sm font-semibold text-green-600">+254 700 000 000</p>
                            </a>

                            {/* Partner */}
                            <Link
                                to="/partnerships"
                                className="group bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                    <Users size={24} className="text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Partner With Us</h3>
                                <p className="text-sm text-gray-500 mb-3">Banks, SACCOs & fintechs</p>
                                <p className="text-sm font-semibold text-purple-600">View Partnership Options →</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 8 — FINAL CTA BANNER
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl shadow-2xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10">
                            <Sparkles size={40} className="mx-auto mb-5 text-primary-200" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
                                Ready to take control of your money?
                            </h2>
                            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto leading-relaxed">
                                Join thousands of Kenyans already using Shilingi Moves to save more, spend smarter, and build real wealth.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300 group"
                                >
                                    Create Free Account
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="mailto:hello@shilingimoves.com"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold rounded-full border border-white/20 transition-all duration-300"
                                >
                                    <Mail className="mr-2 w-5 h-5" /> Contact Us
                                </a>
                            </div>
                            {/* Trust signals */}
                            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-primary-200">
                                {['Free to join', 'No credit card needed', 'Built for Kenya'].map((item, i) => (
                                    <span key={i} className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-primary-300" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
