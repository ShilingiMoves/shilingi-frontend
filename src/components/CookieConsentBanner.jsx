import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Check, ChevronRight, Cookie, Lock, Shield, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const COOKIE_CONSENT_KEY = 'shilingi_cookie_consent_v1';

const defaultPreferences = {
    essential: true,
    analytics: false,
    marketing: false,
};

const preferenceItems = [
    {
        key: 'essential',
        title: 'Essential cookies',
        description: 'Required for security, sign-in, forms, saved choices, and basic site functionality.',
        icon: Lock,
        locked: true,
    },
    {
        key: 'analytics',
        title: 'Analytics cookies',
        description: 'Help us understand page visits and improve the Shilingi Moves experience.',
        icon: BarChart3,
    },
    {
        key: 'marketing',
        title: 'Marketing cookies',
        description: 'Allow future campaign measurement and more relevant Shilingi Moves updates.',
        icon: Shield,
    },
];

function readStoredConsent() {
    try {
        const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('Could not read cookie consent preference:', error);
        return null;
    }
}

function saveStoredConsent(preferences, source) {
    const payload = {
        version: 1,
        source,
        preferences: {
            essential: true,
            analytics: Boolean(preferences.analytics),
            marketing: Boolean(preferences.marketing),
        },
        savedAt: new Date().toISOString(),
    };

    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('shilingi-cookie-consent-change', { detail: payload }));
    } catch (error) {
        console.warn('Could not save cookie consent preference:', error);
    }
}

const PreferenceToggle = ({ item, checked, onChange }) => {
    const Icon = item.icon;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold text-slate-950">{item.title}</p>
                        <button
                            type="button"
                            disabled={item.locked}
                            aria-pressed={checked}
                            onClick={() => !item.locked && onChange(item.key)}
                            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-slate-300'} ${item.locked ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                            <span className="sr-only">{item.locked ? 'Always active' : `Toggle ${item.title}`}</span>
                        </button>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    {item.locked && <p className="mt-2 text-xs font-semibold text-primary-700">Always active</p>}
                </div>
            </div>
        </div>
    );
};

const CookieConsentBanner = () => {
    const [visible, setVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState(defaultPreferences);

    useEffect(() => {
        const stored = readStoredConsent();
        if (stored?.preferences) {
            setPreferences({ ...defaultPreferences, ...stored.preferences, essential: true });
            return;
        }
        setVisible(true);
    }, []);

    useEffect(() => {
        if (!showPreferences) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setShowPreferences(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPreferences]);

    const selectedCount = useMemo(
        () => Number(preferences.analytics) + Number(preferences.marketing),
        [preferences.analytics, preferences.marketing]
    );

    const completeConsent = (nextPreferences, source) => {
        saveStoredConsent(nextPreferences, source);
        setPreferences({ ...defaultPreferences, ...nextPreferences, essential: true });
        setShowPreferences(false);
        setVisible(false);
    };

    const togglePreference = (key) => {
        setPreferences((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    if (!visible && !showPreferences) return null;

    return (
        <>
            {visible && (
                <section
                    aria-label="Cookie consent"
                    className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6"
                >
                    <div className="mx-auto max-w-5xl rounded-3xl border border-white/15 bg-[#004d3d] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-5">
                        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-emerald-100">
                                <Cookie size={24} />
                            </div>

                            <div>
                                <p className="text-base font-extrabold">Cookies on Shilingi Moves</p>
                                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/82">
                                    We use essential cookies to keep the site working. With your consent, optional cookies can help us understand usage and improve the platform. You can change your choice later from your browser storage.
                                </p>
                                <Link to="/privacy#cookies" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-100 underline-offset-4 hover:underline">
                                    Read the Cookie Policy <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                                <button
                                    type="button"
                                    onClick={() => completeConsent({ essential: true, analytics: true, marketing: true }, 'accept_all')}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-primary-700 transition-colors hover:bg-primary-50"
                                >
                                    <Check size={16} /> Accept all
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPreferences(true)}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
                                >
                                    <SlidersHorizontal size={16} /> Manage
                                </button>
                                <button
                                    type="button"
                                    onClick={() => completeConsent(defaultPreferences, 'reject_optional')}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    Reject optional
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {showPreferences && (
                <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 px-4 py-5 backdrop-blur-sm sm:items-center">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cookie-preferences-title"
                        className="max-h-[calc(100vh-2.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
                                    <Cookie size={13} /> Cookie preferences
                                </p>
                                <h2 id="cookie-preferences-title" className="mt-3 text-2xl font-extrabold text-slate-950">
                                    Choose how Shilingi Moves uses cookies
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Essential cookies are always active. Optional choices are saved on this browser and can be used to gate analytics or marketing scripts when they are added.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPreferences(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                                <X size={18} />
                                <span className="sr-only">Close cookie preferences</span>
                            </button>
                        </div>

                        <div className="mt-5 space-y-3">
                            {preferenceItems.map((item) => (
                                <PreferenceToggle
                                    key={item.key}
                                    item={item}
                                    checked={Boolean(preferences[item.key])}
                                    onChange={togglePreference}
                                />
                            ))}
                        </div>

                        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            Optional categories selected: <span className="font-bold text-slate-900">{selectedCount} of 2</span>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => completeConsent(defaultPreferences, 'reject_optional')}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                Reject optional
                            </button>
                            <button
                                type="button"
                                onClick={() => completeConsent({ essential: true, analytics: true, marketing: true }, 'accept_all')}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-primary-200 bg-primary-50 px-5 py-2 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100"
                            >
                                Accept all
                            </button>
                            <button
                                type="button"
                                onClick={() => completeConsent(preferences, 'customize')}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary-600 px-5 py-2 text-sm font-extrabold text-white transition-colors hover:bg-primary-700"
                            >
                                Save choices
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CookieConsentBanner;
