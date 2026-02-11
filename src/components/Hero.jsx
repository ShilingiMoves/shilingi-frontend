import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import Button from './Button';
import HomePage1 from '../assets/home-page-1.png';
import HomePage2 from '../assets/home-page-2.png';
import HomePage3 from '../assets/home-page-3.png';

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [HomePage1, HomePage2, HomePage3];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds 

        return () => clearInterval(interval);
    }, [images.length]);

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight - 80, // Approximate navbar height of narbar
            behavior: 'smooth'
        });
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
                            className="w-full h-full object-cover"
                        />
                        {/* Dark Overlay for Readability */}
                        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    </div>
                ))}
            </div>

            {/* Content Content - Left Aligned */}
            <div className="container-custom relative z-10 w-full pt-20">
                <div className="max-w-2xl space-y-6 md:space-y-8">
                    <div className="space-y-4 md:space-y-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
                            Take Control of Your Money. <br />
                            <span className="text-primary-400">Build the Life You Want.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-100 leading-relaxed max-w-lg drop-shadow-sm font-medium">
                            Shilingi Moves is your complete financial wellness platform. Learn, plan, compare, and grow your money using one personalized dashboard built for Kenyan realities.
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button
                            variant="primary"
                            size="lg"
                            to="/signup"
                            className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all bg-primary-600 border-transparent hover:bg-primary-500 text-white"
                        >
                            Create free account
                        </Button>
                        <Button
                            size="lg"
                            to="/dashboard"
                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white shadow-lg"
                        >
                            See dashboard demo
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scroll Cue */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce cursor-pointer" onClick={scrollToContent}>
                <div className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors">
                    <span className="text-xs font-medium uppercase tracking-widest hidden md:block text-shadow">Explore</span>
                    <ArrowDown size={32} />
                </div>
            </div>
        </section>
    );
};

export default Hero;
