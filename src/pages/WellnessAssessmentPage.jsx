import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BadgeDollarSign,
    BarChart3,
    Briefcase,
    Building2,
    Check,
    GraduationCap,
    Heart,
    Landmark,
    PiggyBank,
    RefreshCw,
    Target,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import onboardingLogo from '../assets/shilingi-logo-animated.gif';
import {
    completeWellnessAssessment,
    getWellnessAssessment,
    restartWellnessAssessment,
    saveWellnessAssessment,
} from '../services/wellnessAssessmentApi';
import { shouldShowProfileSetup } from '../utils/profileSetupState';

const steps = ['employment_status', 'financial_stage', 'goals', 'confidence_level'];

const optionSets = {
    employment_status: [
        ['SALARIED', 'Salaried Employee', Briefcase],
        ['BUSINESS', 'Business Owner', Building2],
        ['FREELANCER', 'Freelancer', BadgeDollarSign],
        ['STUDENT', 'Student', GraduationCap],
        ['RETIREE', 'Retiree', Landmark],
        ['EXPLORING', 'Just Exploring', Heart],
    ],
    financial_stage: [
        ['GETTING_STARTED', "I'm just getting started"],
        ['PAYCHECK', "I'm living paycheck to paycheck"],
        ['EMERGENCY', "I'm building my emergency savings"],
        ['INVESTING', "I'm investing consistently"],
        ['RETIREMENT', "I'm preparing for retirement"],
        ['FAMILY_WEALTH', "I'm building long-term family wealth"],
    ],
    goals: [
        ['BUDGET', 'Budget better', WalletCards],
        ['DEBT', 'Get out of debt', BarChart3],
        ['SAVE', 'Save consistently', PiggyBank],
        ['INVEST', 'Start investing', TrendingUp],
        ['GROW', 'Grow my investments', TrendingUp],
        ['LAND', 'Buy land long-term', Landmark],
        ['BUSINESS', 'Grow my business', Building2],
        ['EDUCATION', "Children's education", GraduationCap],
    ],
    confidence_level: [
        ['BEGINNER', 'Beginner'],
        ['INTERMEDIATE', 'Intermediate'],
        ['ADVANCED', 'Advanced'],
        ['EXPERT', 'Expert'],
    ],
};

const stepCopy = {
    employment_status: ["Let's get to know you", "We'll ask you a few questions to understand your financial wellness."],
    financial_stage: ['Where are you on your financial journey?', 'Choose the statement that feels closest to your current reality.'],
    goals: ['What are your biggest financial goals?', "Choose up to three. We'll use these to shape your dashboard."],
    confidence_level: ['How confident are you with managing money?', 'This helps us tune your coaching prompts and dashboard complexity.'],
};

const tierDetails = {
    BASIC: ['Shilingi Basic', 'Build your foundation'],
    PLUS: ['Shilingi Plus', 'Build financial security'],
    PRO: ['Shilingi Pro', 'Build long-term wealth'],
};

const WellnessAssessmentPage = () => {
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        getWellnessAssessment()
            .then((data) => {
                if (!mounted) return;
                setAssessment(data);
                setStepIndex(data.is_completed ? steps.length : Math.min(data.current_step || 0, steps.length - 1));
            })
            .catch((err) => { if (mounted) setError(err.message || 'Unable to load your wellness journey.'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const currentStep = steps[stepIndex];
    const currentValue = assessment?.[currentStep];
    const canContinue = currentStep === 'goals'
        ? Array.isArray(currentValue) && currentValue.length > 0
        : Boolean(currentValue);
    const recommendation = useMemo(() => tierDetails[assessment?.recommended_tier] || tierDetails.BASIC, [assessment?.recommended_tier]);

    const choose = (value) => {
        setError('');
        setAssessment((current) => {
            if (currentStep !== 'goals') return { ...current, [currentStep]: value };
            const selected = current.goals || [];
            const goals = selected.includes(value)
                ? selected.filter((goal) => goal !== value)
                : selected.length < 3 ? [...selected, value] : selected;
            return { ...current, goals };
        });
    };

    const continueJourney = async () => {
        if (!canContinue || saving) return;
        setSaving(true);
        setError('');
        try {
            const nextStep = stepIndex + 1;
            const saved = await saveWellnessAssessment({
                [currentStep]: assessment[currentStep],
                current_step: nextStep,
            });
            setAssessment(saved);
            if (nextStep < steps.length) {
                setStepIndex(nextStep);
                return;
            }
            const completed = await completeWellnessAssessment();
            setAssessment(completed);
            setStepIndex(steps.length);
        } catch (err) {
            setError(err.message || 'We could not save this answer. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const restart = async () => {
        if (!window.confirm('Restart your wellness journey? Your account and financial records will not be changed.')) return;
        setSaving(true);
        setError('');
        try {
            const reset = await restartWellnessAssessment();
            setAssessment(reset);
            setStepIndex(0);
        } catch (err) {
            setError(err.message || 'We could not restart your journey.');
        } finally {
            setSaving(false);
        }
    };

    const openNext = () => navigate(shouldShowProfileSetup() ? '/profile-setup' : '/dashboard/app', { replace: true });

    if (loading) return <JourneyShell><p className="m-auto text-sm font-bold text-[#0c6060]">Loading your journey...</p></JourneyShell>;
    if (!assessment) return <JourneyShell><ErrorNotice message={error} /></JourneyShell>;

    return (
        <JourneyShell>
            <header className="flex justify-center px-5 pt-7"><img src={onboardingLogo} alt="Shilingi Moves" className="h-auto w-[92px]" /></header>
            {error && <div className="mx-4 mt-4"><ErrorNotice message={error} /></div>}

            {stepIndex < steps.length ? (
                <>
                    <div className="px-5 pt-5">
                        <div className="flex gap-2">{steps.map((step, index) => <span key={step} className={`h-2 flex-1 rounded-full ${index <= stepIndex ? 'bg-[#e1ad2b]' : 'bg-[#e9ecef]'}`} />)}</div>
                    </div>
                    <main className="flex flex-1 flex-col px-4 pb-5 pt-5">
                        <p className="text-xs font-bold text-[#5e5f60]">Step {stepIndex + 1} of 4</p>
                        <h1 className="mt-1 text-[20px] font-extrabold leading-6 text-[#232e3d]">{stepCopy[currentStep][0]}</h1>
                        <p className="mt-1 text-xs leading-5 text-[#5e5f60]">{stepCopy[currentStep][1]}</p>
                        <div className="mt-4 flex-1 rounded-[18px] border border-[#ebeeee] bg-white p-3 shadow-[0_18px_45px_rgba(35,46,61,0.06)]">
                            <div className="space-y-2">
                                {optionSets[currentStep].map(([id, label, Icon]) => {
                                    const selected = currentStep === 'goals' ? assessment.goals?.includes(id) : currentValue === id;
                                    return <OptionButton key={id} icon={Icon} label={label} onClick={() => choose(id)} selected={selected} />;
                                })}
                            </div>
                        </div>
                    </main>
                    <footer className="grid grid-cols-[0.32fr_1fr] gap-3 px-4 pb-7">
                        <button type="button" disabled={saving || stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))} className="min-h-[48px] rounded-full bg-white text-sm font-bold text-[#0c6060] disabled:opacity-40">Back</button>
                        <button type="button" disabled={!canContinue || saving} onClick={continueJourney} className="min-h-[48px] rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white disabled:bg-[#a8c3bd]">{saving ? 'Saving...' : stepIndex === 3 ? 'Build my recommendation' : 'Next'}</button>
                    </footer>
                </>
            ) : (
                <main className="flex flex-1 flex-col px-5 pb-7 pt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d49f20]">Your financial wellness snapshot</p>
                    <h1 className="mt-2 text-3xl font-extrabold text-[#232e3d]">{recommendation[0]}</h1>
                    <p className="mt-2 text-sm text-[#5e5f60]">{recommendation[1]}. This is a recommendation only; your current plan has not changed.</p>
                    <section className="mt-6 rounded-[24px] bg-[#0c6060] p-5 text-white">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/65">Wellness score</p>
                        <p className="mt-1 text-5xl font-extrabold">{assessment.wellness_score}<span className="text-lg text-white/70">/100</span></p>
                        <p className="mt-3 text-sm font-bold">{assessment.stage_label}</p>
                    </section>
                    <section className="mt-4 rounded-[18px] border border-[#ebeeee] bg-white p-4">
                        <h2 className="flex items-center gap-2 text-sm font-extrabold"><Target size={17} className="text-[#0c6060]" /> Why this fits your answers</h2>
                        <ul className="mt-3 space-y-3">{assessment.recommendation_reasons.map((reason) => <li key={reason} className="flex gap-2 text-xs leading-5 text-[#5e5f60]"><Check size={15} className="mt-0.5 shrink-0 text-[#d49f20]" />{reason}</li>)}</ul>
                    </section>
                    <div className="mt-auto space-y-3 pt-6">
                        <button type="button" onClick={openNext} className="min-h-[52px] w-full rounded-full bg-[#0c6060] px-6 text-sm font-extrabold text-white">Continue my journey</button>
                        <button type="button" onClick={() => navigate(`/onboarding?plan=${assessment.recommended_tier.toLowerCase()}&checkout=1`)} className="min-h-[46px] w-full rounded-full border border-[#0c6060]/25 bg-white px-5 text-sm font-bold text-[#0c6060]">View recommended plan</button>
                        <button type="button" disabled={saving} onClick={restart} className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 text-xs font-bold text-[#6f776f]"><RefreshCw size={14} /> Restart assessment</button>
                    </div>
                </main>
            )}
        </JourneyShell>
    );
};

const JourneyShell = ({ children }) => <div className="min-h-screen bg-[#111] font-sans text-[#232e3d] sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8"><section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#f8f8f8] sm:min-h-[812px] sm:rounded-[40px]">{children}</section></div>;

const ErrorNotice = ({ message }) => <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{message}</div>;

const OptionButton = ({ icon: Icon, label, onClick, selected }) => <button type="button" onClick={onClick} className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 text-left transition ${selected ? 'border-[#e1ad2b] bg-[#fff8e4]' : 'border-[#edf0f0] bg-[#fafafa]'}`}>{Icon && <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${selected ? 'bg-[#e1ad2b] text-white' : 'bg-white text-[#0c6060]'}`}><Icon size={15} /></span>}<span className="flex-1 text-sm font-bold">{label}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[#e1ad2b] bg-[#e1ad2b]' : 'border-[#cfd8d6] bg-white'}`}>{selected && <Check size={13} className="text-white" />}</span></button>;

export default WellnessAssessmentPage;
