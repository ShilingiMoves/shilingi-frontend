import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomePage1 from '../assets/home-page-1.png';
import HomePage2 from '../assets/home-page-2.png';
import HomePage3 from '../assets/home-page-3.png';

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [HomePage1, HomePage2, HomePage3];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const scrollToContent = () => {
        window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
    };

    return (
        <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">

            {/* Background Image Carousel */}
            <div className="absolute inset-0 z-0">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={img}
                            alt={`Shilingi Moves Background ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Gradient overlay — stronger on left for text, fades right */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
                    </div>
                ))}
            </div>

            {/* Hero Content */}
            <div className="container-custom relative z-10 w-full pt-20 pb-28">
                <div className="max-w-2xl">

                    {/* Headline */}
                    <h1
                        className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-5"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        Take control of your money.{' '}
                        <span className="text-primary-400">Build the life you want.</span>
                    </h1>

                    {/* Subtext */}
                    <p
                        className="font-sans text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-8 max-w-lg font-light"
                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                    >
                        Shilingi Moves is your complete financial wellness platform. Learn, plan, compare, and grow your money — built for Kenyan realities.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                            to="/signup"
                            className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary-900/40 hover:-translate-y-0.5 group text-base w-full sm:w-auto"
                        >
                            Create free account
                            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                                <ArrowRight size={15} />
                            </span>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-between gap-4 px-6 py-4 border-2 border-white/80 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-0.5 group text-base w-full sm:w-auto sm:min-w-[200px]"
                        >
                            <span>See dashboard demo</span>
                            <span className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
                                <ArrowRight size={15} />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Cue — pinned to bottom centre, always clear of buttons */}
            <div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 animate-bounce cursor-pointer"
                onClick={scrollToContent}
            >
                <div className="flex flex-col items-center gap-1.5 text-white hover:text-primary-300 transition-colors drop-shadow-lg">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em]">Explore</span>
                    <div className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center hover:border-white transition-colors">
                        <ArrowDown size={16} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
