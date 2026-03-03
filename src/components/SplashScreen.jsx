import React, { useState, useEffect } from 'react';
import animatedLogo from '../assets/shilingi-logo-animated.gif';

/**
 * SplashScreen — shows the animated Shilingi logo on first load,
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
                    width: 'clamp(120px, 22vw, 220px)',
                    height: 'auto',
                    userSelect: 'none',
                    animation: 'splashPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
            />

            {/* Subtle tagline beneath the logo */}
            <p
                style={{
                    marginTop: '1.25rem',
                    fontSize: '0.8rem',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#059669',
                    opacity: 0,
                    animation: 'splashFadeUp 0.5s ease 0.4s forwards',
                }}
            >
                One Shilingi at a Time
            </p>

            {/* Inline keyframes */}
            <style>{`
                @keyframes splashPop {
                    from { opacity: 0; transform: scale(0.82); }
                    to   { opacity: 1; transform: scale(1);    }
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
