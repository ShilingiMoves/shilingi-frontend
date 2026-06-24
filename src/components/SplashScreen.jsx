import React, { useState, useEffect } from 'react';
import animatedLogo from '../assets/shilingi-logo-animated.gif';

/**
 * SplashScreen: shows the animated Shilingi logo on first load,
 * then fades out and unmounts so the site beneath is revealed.
 *
 * Only plays ONCE per browser session (sessionStorage flag).
 * Set SPLASH_DURATION to control how long the logo is visible.
 */
const SPLASH_DURATION = 2600; // ms the logo stays fully visible
const FADE_DURATION = 600;  // ms the fade-out takes

const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('visible'); // 'visible' → 'fading' → 'done'

    useEffect(() => {
        // Stay visible, then fade
        const fadeTimer = setTimeout(() => setPhase('fading'), SPLASH_DURATION);

        // After fade, call onComplete so parent unmounts us
        const doneTimer = setTimeout(
            () => { setPhase('done'); onComplete(); },
            SPLASH_DURATION + FADE_DURATION
        );

        return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
    }, [onComplete]);

    if (phase === 'done') return null;

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                transition: `opacity ${FADE_DURATION}ms ease-in-out`,
                opacity: phase === 'fading' ? 0 : 1,
                pointerEvents: phase === 'fading' ? 'none' : 'all',
            }}
        >
            {/* Animated logo */}
            <img
                src={animatedLogo}
                alt="Shilingi Moves"
                style={{
                    width: 'clamp(150px, 28vw, 260px)',
                    height: 'auto',
                    userSelect: 'none',
                    animation: 'splashSpinUp 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
            />

            {/* Subtle tagline beneath the logo */}
            <p
                style={{
                    marginTop: '1.5rem',
                    maxWidth: 'min(34rem, calc(100vw - 3rem))',
                    textAlign: 'center',
                    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    lineHeight: 1.55,
                    color: '#115e59',
                    opacity: 0,
                    animation: 'splashFadeUp 0.5s ease 0.4s forwards',
                }}
            >
                Powering every step of your financial journey.<br />
                One shilingi at a time.
            </p>

            {/* Inline keyframes */}
            <style>{`
                @keyframes splashSpinUp {
                    from { opacity: 0; transform: scale(0.82) rotate(-18deg); }
                    to   { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes splashFadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0);   }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
