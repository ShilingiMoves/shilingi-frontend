import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeartHandshake, TrendingUp, Users, BarChart3, Shield, Star,
    ArrowRight, CheckCircle, ChevronRight, Building2, Landmark,
    PiggyBank, GraduationCap, Sparkles, Zap, Globe, Award,
    Phone, Mail, PlayCircle, BookOpen
} from 'lucide-react';
import Footer from '../components/Footer';
import partnershipsVideo from '../assets/Partnerships-herovideo.mp4';
import story1 from '../assets/stories/story1.png';
import story2 from '../assets/stories/story2.png';

const AnimatedImpactValue = ({ target, suffix = '', decimals = 0 }) => {
    const ref = useRef(null);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setDisplayValue(target);
            return undefined;
        }

        let animationFrame;
        let hasAnimated = false;

        const animate = () => {
            const duration = 1400;
            const startedAt = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - startedAt) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplayValue(target * eased);

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(tick);
                } else {
                    setDisplayValue(target);
                }
            };

            animationFrame = requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    animate();
                    observer.disconnect();
                }
            },
            { threshold: 0.45 }
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [target]);

    const formattedValue = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString('en-US');

    return (
        <span ref={ref}>
            {formattedValue}
            {suffix}
        </span>
    );
};

const PartnershipsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Partnerships | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Partner with Shilingi Moves to reach financially-conscious Kenyans. Banking, investment, insurance, and education partnership opportunities.');
        }
    }, []);

    const audienceStats = [
        { target: 500, suffix: 'K+', label: 'Kenyans Reached', icon: Users },
        { target: 1.2, suffix: 'M', decimals: 1, label: 'Financial Decisions supported', icon: BarChart3 },
        { target: 10, suffix: '+', label: 'Partners onboarded', icon: Globe },
        { target: 4, suffix: '/5', label: 'User Satisfaction', icon: Star },
    ];

    const valuePillars = [
        {
            title: 'Visibility to Financially Intentional Audiences',
            desc: 'Reach individuals, SMEs, corporates, educators, and professionals actively seeking financial clarity.',
            icon: Users,
            color: 'from-blue-500 to-indigo-600',
            cta: 'Explore Tools'
        },
        {
            title: 'Trust Built Through Education',
            desc: 'Position your brand in a neutral, education-first ecosystem focused on long-term financial fitness.',
            icon: Shield,
            color: 'from-emerald-500 to-teal-600',
            cta: 'See Comparisons'
        },
        {
            title: 'Measurable Financial Impact',
            desc: 'Support literacy across Kenya and the diaspora with clear engagement metrics.',
            icon: BarChart3,
            color: 'from-amber-500 to-orange-600',
            cta: 'View Impact'
        },
        {
            title: 'Ecosystem Collaboration',
            desc: 'Integrate into dashboards, tools, learning hubs, and comparison flows that convert education into action.',
            icon: Zap,
            color: 'from-purple-500 to-violet-600',
            cta: 'Join Now'
        }
    ];

    const partnerCommunity = [
        {
            category: 'Individual Partners',
            items: [
                {
                    role: 'Content & Media Partners',
                    benefit: 'Expanded reach and authority.',
                    cta: 'Content Collaboration',
                    icon: PlayCircle,
                    color: 'bg-red-50 text-red-600'
                }
            ]
        },
        {
            category: 'Corporate Partners',
            items: [
                {
                    role: 'Employers & Brands',
                    benefit: 'Brand visibility, CSR alignment, workforce wellness.',
                    cta: 'Corporate Partnership Details',
                    icon: Building2,
                    color: 'bg-emerald-50 text-emerald-600'
                }
            ]
        },
        {
            category: 'Institutional & Community Partners',
            items: [
                {
                    role: 'NGOs, SACCOs, Community Organizations',
                    benefit: 'Scalable literacy programs and digital distribution.',
                    cta: 'Join Our Financial Literacy Campaigns',
                    icon: Landmark,
                    color: 'bg-amber-50 text-amber-600'
                }
            ]
        }
    ];

    const waysToPartner = [
        {
            title: 'Ecosystem Partner',
            desc: 'Platform-wide visibility, dashboard exposure, thought leadership.',
            icon: Globe,
            color: 'from-blue-600 to-indigo-700'
        },
        {
            title: 'Knowledge Partner',
            desc: 'Co-created content, featured placement in Learn & Community.',
            icon: BookOpen,
            color: 'from-emerald-600 to-teal-700'
        },
        {
            title: 'Tools & Solutions Partner',
            desc: 'Visibility in Compare hub, smart tools integration, lead generation.',
            icon: Zap,
            color: 'from-primary-600 to-primary-800'
        },
    ];

    const tiers = [
        {
            name: 'Bronze',
            tagline: 'Get Noticed',
            color: 'from-amber-600 to-amber-800',
            ring: 'ring-amber-200',
            features: [
                'Logo on Partners page',
                'Quarterly newsletter feature',
                'Basic analytics dashboard',
                'Standard support',
            ],
        },
        {
            name: 'Silver',
            tagline: 'Build Presence',
            color: 'from-gray-400 to-gray-600',
            ring: 'ring-gray-300',
            popular: false,
            features: [
                'Everything in Bronze',
                'Featured in comparison tools',
                'Monthly social media mentions',
                'Co-branded blog content',
                'Priority support',
            ],
        },
        {
            name: 'Gold',
            tagline: 'Drive Growth',
            color: 'from-yellow-400 to-amber-600',
            ring: 'ring-yellow-200',
            popular: true,
            features: [
                'Everything in Silver',
                'Homepage banner placement',
                'Quarterly webinar co-hosting',
                'Dedicated lead pipeline',
                'Custom analytics reports',
                'Dedicated account manager',
            ],
        },
        {
            name: 'Platinum',
            tagline: 'Full Integration',
            color: 'from-primary-500 to-emerald-700',
            ring: 'ring-primary-200',
            features: [
                'Everything in Gold',
                'Exclusive category placement',
                'White-label integrations',
                'Joint product development',
                'Board-level quarterly reviews',
                'Custom API integrations',
                'VIP event access',
            ],
        },
    ];

    const partnerStories = [
        {
            title: 'Corporate Financial Wellness',
            case: 'Rolling out a scalable wellness program for a 5,000+ employee brand.',
            image: story1
        },
        {
            title: 'Fintech Trust-Building',
            case: 'Using education-first positioning to build user confidence in new credit products.',
            image: story2
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* HERO: Video background with strong value prop */}
            <section className="relative flex min-h-[clamp(520px,calc(100vh-5.5rem),680px)] items-center overflow-hidden text-white md:min-h-[clamp(560px,calc(100vh-6rem),720px)]">
                {/* Video Background */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={partnershipsVideo} type="video/mp4" />
                </video>
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-emerald-900/80"></div>

                <div className="container-custom relative z-10 py-8 sm:py-10 md:py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm md:mb-4">
                            <HeartHandshake size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-200">Shilingi Moves Partnership Ecosystem</span>
                        </div>

                        <h1
                            className="mb-3 text-4xl font-normal leading-[1.05] tracking-tight text-white sm:text-5xl md:text-[3.45rem] lg:text-[3.8rem]"
                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                        >
                            Together, into a new era of <br className="hidden md:block" />
                            <span className="text-emerald-400">
                                financial wellness across Kenya and the diaspora
                            </span>
                        </h1>

                        <p className="mx-auto mb-5 max-w-3xl text-base font-medium leading-tight text-white sm:text-lg md:text-xl">
                            Become part of Kenya’s leading financial literacy platform and support a community choosing financial fitness, every day, everywhere.
                        </p>

                        <p className="mx-auto mb-5 hidden max-w-3xl text-sm leading-6 text-white/80 xl:block">
                            Shilingi Moves is Kenya’s financial wellness hub, connecting people to trusted knowledge, smart tools, transparent comparisons, and practical learning journeys. By partnering with us, you’re not just supporting a platform; you’re helping shape financially confident lives and empowering communities to thrive across generations.
                        </p>

                        <div className="flex justify-center px-4">
                            <a
                                href="#ways"
                                className="group flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl bg-primary-600 px-8 py-3 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-primary-500 sm:w-auto"
                            >
                                Become a Partner
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>

            </section>

            {/* ═══════════ SECTION 2: WHY PARTNER (Value Pillars) ═══════════ */}
            <section id="pillars" className="py-20 md:py-32 bg-white overflow-hidden">
                <div className="container-custom">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">Why Partner with <span className="text-primary-600">Shilingi Moves?</span></h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
                            Position your brand at the center of Kenya's financial wellness revolution and reach a community committed to growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {valuePillars.map((pillar, idx) => (
                            <div key={idx} className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
                                <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <pillar.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-primary-600 transition-colors">{pillar.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-8 flex-grow">{pillar.desc}</p>
                                
                                <div className="pt-6 border-t border-gray-50 mt-auto">
                                    <button className="flex items-center gap-2 text-primary-600 font-bold group/btn">
                                        {pillar.cta}
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className={`absolute -inset-1 bg-gradient-to-br ${pillar.color} rounded-3xl blur opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SECTION 6: IMPACT & SOCIAL PROOF (Integrated) ═══════════ */}
            <section id="impact" className="py-20 bg-gray-900 text-white rounded-[40px] md:rounded-[80px] mx-4 md:mx-10 mb-20 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">Our Growing Impact</h2>
                        <p className="text-gray-400">Scale your brand alongside our community performance.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {audienceStats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-400 mb-2">
                                    <AnimatedImpactValue {...stat} />
                                </p>
                                <p className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SECTION 3: OUR PARTNER COMMUNITY ═══════════ */}
            <section id="community" className="py-20 md:py-32 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">Our <span className="text-primary-600">Partner Community</span></h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl">
                            Join a diverse network of professionals and organizations dedicated to building a financially stronger Kenya.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {partnerCommunity.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="mb-6 border-l-4 border-primary-500 pl-4 text-lg font-bold uppercase tracking-widest text-gray-900 md:text-xl">{group.category}</h3>
                                <div className="grid grid-cols-1 gap-8">
                                    {group.items.map((item, i) => (
                                        <div key={i} className="group flex h-full flex-col rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl">
                                            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                                                <item.icon size={28} />
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-3">{item.role}</h4>
                                            <p className="mb-8 flex-1 text-sm leading-relaxed text-gray-500">{item.benefit}</p>
                                            <button className="w-full py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                                {item.cta}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SECTION 4: WAYS TO PARTNER ═══════════ */}
            <section id="ways" className="py-20 md:py-32 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">Ways to <span className="text-primary-600">Partner</span></h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Flexible partnership models designed for maximum impact and mutual growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {waysToPartner.map((way, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-[40px] p-10 bg-gray-900 text-white">
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${way.color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`}></div>
                                
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                        <way.icon size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{way.title}</h3>
                                    <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md">{way.desc}</p>
                                    <a 
                                        href="#contact"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-500 transition-all shadow-xl group/btn"
                                    >
                                        Become a Partner
                                        <ArrowRight size={20} className="text-white group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SECTION 5: ECOSYSTEM INTEGRATION MAP ═══════════ */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold mb-6">One Platform. <span className="text-primary-600">Multiple Touchpoints.</span></h2>
                        <p className="text-gray-500 text-lg">Visualizing the interconnected Shilingi Moves ecosystem.</p>
                    </div>

                    <div className="relative py-20">
                        {/* Map Background Connection Lines (CSS-only approximation) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                            <div className="w-[80%] h-[80%] border-2 border-dashed border-primary-600 rounded-full animate-[spin_60s_linear_infinite]"></div>
                            <div className="absolute w-[60%] h-[60%] border border-primary-400 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                        </div>

                        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-2 justify-center gap-6 md:grid-cols-3 md:gap-8 lg:flex lg:flex-wrap lg:items-start lg:justify-center">
                            {[
                                { name: 'Dashboard', icon: Users, color: 'from-blue-400 to-blue-600' },
                                { name: 'Learn', icon: GraduationCap, color: 'from-amber-400 to-amber-600' },
                                { name: 'Compare', icon: BarChart3, color: 'from-emerald-400 to-emerald-600' },
                                { name: 'Tools', icon: Zap, color: 'from-rose-400 to-rose-600' },
                                { name: 'Community', icon: Globe, color: 'from-indigo-400 to-indigo-600' }
                            ].map((node, i) => (
                                <div key={i} className="group flex cursor-pointer flex-col items-center gap-4 lg:w-36">
                                    <div className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${node.color} rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 relative`}>
                                        <node.icon size={32} />
                                        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity animate-ping"></div>
                                    </div>
                                    <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-widest text-xs md:text-sm">{node.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ SECTION 7: PARTNER STORIES & USE CASES ═══════════ */}
            <section className="py-20 md:py-32 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">What Partnership Looks Like <span className="text-primary-600">in Action</span></h2>
                        <p className="text-gray-500 text-lg">Real success stories from our ecosystem.</p>
                    </div>

                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
                        {partnerStories.map((story, idx) => (
                            <div key={idx} className="group relative rounded-[32px] overflow-hidden bg-primary-600 hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-primary-500">
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent"></div>
                                </div>
                                <div className="p-8 flex flex-col flex-grow relative text-white">
                                    <h4 className="text-xl font-bold mb-4 tracking-tight">{story.title}</h4>
                                    <p className="text-emerald-50 mb-8 leading-relaxed flex-grow italic opacity-90">"{story.case}"</p>
                                    <a 
                                        href="#contact"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg group/btn mt-auto w-full sm:w-auto self-start"
                                    >
                                        Become a Partner
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TRUST BAR (Restored) ═══════════ */}
            {/* ═══════════ SECTION 8: PRIMARY CONVERSION BLOCK (Bottom Fold) ═══════════ */}
            <section id="contact" className="py-24 md:py-32 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="container-custom relative z-10 text-center max-w-5xl mx-auto px-4">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                        Build Financial Wellness <br className="hidden md:block" /> <span className="text-emerald-400">with Us</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto font-medium">
                        Whether you are an individual, institution, or brand, partnering with Shilingi Moves means shaping a financially stronger Kenya, one informed decision at a time.
                    </p>

                    <div className="flex justify-center">
                        <a
                            href="mailto:partnerships@shilingimoves.com"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-5 text-center font-bold text-white shadow-xl shadow-primary-600/20 transition-all hover:-translate-y-1 hover:bg-primary-500"
                        >
                            <Mail size={18} />
                            Become a Partner
                        </a>
                    </div>
                    
                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-8 text-gray-500 text-sm font-medium tracking-widest">
                        <a href="mailto:partnerships@shilingimoves.com" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                             <Mail size={16} /> partnerships@shilingimoves.com
                        </a>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                        <a href="tel:+254727005993" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                            <Phone size={16} /> +254 727 005 993
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PartnershipsPage;
