import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    BadgeDollarSign,
    BarChart3,
    Briefcase,
    Building2,
    AlertCircle,
    Check,
    ChevronLeft,
    CreditCard,
    Eye,
    EyeOff,
    GraduationCap,
    Heart,
    Landmark,
    Lock,
    MailCheck,
    PiggyBank,
    Target,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import { loginUser, registerUser, resendVerificationEmail } from '../services/authApi';
import { persistDashboardSection } from '../utils/dashboardDataState';
import { markProfileSetupPending, shouldShowProfileSetup } from '../utils/profileSetupState';
import onboardingIllustration from '../assets/onboarding-financial-coach.webp';
import onboardingLogo from '../assets/shilingi-logo-animated.gif';

const PENDING_ONBOARDING_SIGNUP_EMAIL_KEY = 'shilingi_pending_profile_signup_email';

const passwordRules = [
    { id: 'length', label: 'Password has 8 to 15 characters.', test: (value) => value.length >= 8 && value.length <= 15 },
    { id: 'special', label: 'Password has a special character.', test: (value) => /[^A-Za-z0-9]/.test(value) },
    { id: 'number', label: 'Password has a number.', test: (value) => /\d/.test(value) },
    { id: 'capital', label: 'Password has an uppercase letter.', test: (value) => /[A-Z]/.test(value) },
    { id: 'lowercase', label: 'Password has a lowercase letter.', test: (value) => /[a-z]/.test(value) },
];

const profileOptions = [
    { id: 'salaried', label: 'Salaried Employee', icon: Briefcase, plan: 'plus' },
    { id: 'business', label: 'Business Owner', icon: Building2, plan: 'elite' },
    { id: 'freelancer', label: 'Freelancer', icon: BadgeDollarSign, plan: 'basic' },
    { id: 'student', label: 'Student', icon: GraduationCap, plan: 'basic' },
    { id: 'retiree', label: 'Retiree', icon: Landmark, plan: 'elite' },
    { id: 'exploring', label: 'Just Exploring', icon: Heart, plan: 'basic' },
];

const stageOptions = [
    { id: 'getting-started', label: "I'm just getting started", score: 38, stage: 'Financial Foundation' },
    { id: 'paycheck', label: "I'm living paycheck to paycheck", score: 32, stage: 'Stability Builder' },
    { id: 'emergency', label: "I'm building my emergency savings", score: 52, stage: 'Safety Net Builder' },
    { id: 'investing', label: "I'm investing consistently", score: 72, stage: 'Wealth Accumulation' },
    { id: 'retirement', label: "I'm preparing for retirement", score: 76, stage: 'Future Security' },
    { id: 'family-wealth', label: "I'm building long-term family wealth", score: 82, stage: 'Legacy Builder' },
];

const goalOptions = [
    { id: 'budget', label: 'Budget better', icon: WalletCards, plan: 'basic' },
    { id: 'debt', label: 'Get out of debt', icon: BarChart3, plan: 'plus' },
    { id: 'save', label: 'Save consistently', icon: PiggyBank, plan: 'basic' },
    { id: 'invest', label: 'Start investing', icon: TrendingUp, plan: 'pro' },
    { id: 'grow', label: 'Grow my investments', icon: TrendingUp, plan: 'pro' },
    { id: 'land', label: 'Buy land long-term', icon: Landmark, plan: 'pro' },
    { id: 'business', label: 'Grow my business', icon: Building2, plan: 'elite' },
    { id: 'education', label: "Children's education", icon: GraduationCap, plan: 'plus' },
];

const confidenceOptions = [
    { id: 'beginner', label: 'Beginner', score: -8 },
    { id: 'intermediate', label: 'Intermediate', score: 0 },
    { id: 'advanced', label: 'Advanced', score: 8 },
    { id: 'expert', label: 'Expert', score: 12 },
];

const planDetails = {
    basic: {
        name: 'Shilingi Basic',
        price: 0,
        priceLabel: 'Free',
        shortName: 'Basic',
        eyebrow: 'Build your foundation',
        description: 'Perfect for students, first-time earners, young professionals and anyone beginning their financial journey.',
        tools: ['Dashboard insights', 'Budget planner', 'Net-worth tracker', 'Market Watch'],
    },
    plus: {
        name: 'Shilingi Plus',
        price: 500,
        priceLabel: 'KES 500',
        shortName: 'Plus',
        eyebrow: 'Build financial security',
        description: 'Perfect for salaried employees, young families, borrowers and individuals building financial resilience.',
        tools: ['Dashboard insights', 'Budget planner', 'Debt manager', 'Protection planner', 'Net-worth tracker'],
    },
    pro: {
        name: 'Shilingi Pro',
        price: 700,
        priceLabel: 'KES 700',
        shortName: 'Pro',
        eyebrow: 'Build wealth',
        description: 'Perfect for professionals, entrepreneurs, active investors and retirement planners.',
        tools: ['Dashboard insights', 'Budget planner', 'Debt manager', 'Investment planner', 'Retirement planner', 'Net-worth tracker'],
    },
    elite: {
        name: 'Shilingi Elite',
        price: 1000,
        priceLabel: 'KES 1,000',
        shortName: 'Elite',
        eyebrow: 'Achieve financial freedom',
        description: 'Perfect for executives, business owners, high-net-worth individuals, families and pre-retirees.',
        tools: ['Investment planner', 'Retirement planner', 'Debt manager', 'Budget planner', 'Learning hub', 'Comparison hub', 'Resources and tools', 'Community'],
    },
};

const planOrder = ['basic', 'plus', 'pro', 'elite'];
const assessmentSteps = ['profile', 'stage', 'goals', 'confidence'];
const steps = ['welcome', 'profile', 'stage', 'goals', 'confidence', 'results', 'plan', 'payment', 'account'];

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialAuthMode = normalizeAuthMode(searchParams.get('auth') || searchParams.get('mode'));
    const isDirectAuthEntry = Boolean(initialAuthMode);
    const [stepIndex, setStepIndex] = useState(() => (initialAuthMode ? steps.indexOf('account') : 0));
    const [answers, setAnswers] = useState({
        profile: '',
        stage: '',
        goals: [],
        confidence: '',
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showOtherPlans, setShowOtherPlans] = useState(false);
    const [accountMode, setAccountMode] = useState(() => initialAuthMode || 'choice');
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');
    const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [isAccountAlreadyVerified, setIsAccountAlreadyVerified] = useState(false);
    const [signupValues, setSignupValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
    });
    const [signupTouched, setSignupTouched] = useState({});
    const [signupSubmitted, setSignupSubmitted] = useState(false);
    const [signinValues, setSigninValues] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const currentStep = steps[stepIndex];
    const recommendation = useMemo(() => buildRecommendation(answers), [answers]);
    const activePlanKey = selectedPlan || recommendation.planKey;
    const activePlan = planDetails[activePlanKey];
    const canContinue = getCanContinue(currentStep, answers);

    const goNext = () => {
        if (!canContinue) return;
        if (currentStep === 'confidence') {
            setAnalysisProgress(0);
            setIsAnalyzing(true);
            return;
        }
        setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    };

    const goBack = () => {
        if (isAnalyzing) return;
        setStepIndex((current) => Math.max(current - 1, 0));
    };

    const updateAnswer = (key, value) => {
        setAnswers((current) => ({ ...current, [key]: value }));
    };

    const toggleGoal = (goalId) => {
        setAnswers((current) => {
            const selected = current.goals.includes(goalId);
            const goals = selected
                ? current.goals.filter((id) => id !== goalId)
                : current.goals.length < 3
                    ? [...current.goals, goalId]
                    : current.goals;
            return { ...current, goals };
        });
    };

    const choosePlan = (planKey) => {
        setSelectedPlan(planKey);
        setShowOtherPlans(false);
    };

    const handleStartPlan = (planKey = activePlanKey) => {
        const planToStart = planDetails[planKey] || activePlan;
        setSelectedPlan(planKey);
        setShowOtherPlans(false);
        setAccountMode('choice');
        setStepIndex(steps.indexOf(planToStart.price > 0 ? 'payment' : 'account'));
    };

    const handleSocialAuth = (provider) => {
        setAuthError(`${provider} sign-in is coming soon. Continue with email for now.`);
        setAuthSuccess('');
    };

    const handleSignupChange = (event) => {
        const { name, value } = event.target;
        setSignupValues((current) => ({
            ...current,
            [name]: name.includes('password') ? sanitizePasswordInput(value) : value,
        }));
        setSignupTouched((current) => ({ ...current, [name]: true }));
    };

    const handleSignupBlur = (event) => {
        const { name } = event.target;
        setSignupTouched((current) => ({ ...current, [name]: true }));
    };

    const handleSigninChange = (event) => {
        const { name, value } = event.target;
        setSigninValues((current) => ({
            ...current,
            [name]: name === 'password' ? sanitizePasswordInput(value) : value,
        }));
    };

    useEffect(() => {
        if (!isAnalyzing) return undefined;

        const duration = 2200;
        const startedAt = Date.now();
        let finishId;
        const intervalId = window.setInterval(() => {
            const elapsed = Date.now() - startedAt;
            const rawProgress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
            const nextProgress = Math.min(99, Math.floor(easedProgress * 100));
            setAnalysisProgress(nextProgress);
        }, 80);

        const completeId = window.setTimeout(() => {
            window.clearInterval(intervalId);
            setAnalysisProgress(100);
            finishId = window.setTimeout(() => {
                setIsAnalyzing(false);
                setStepIndex(steps.indexOf('results'));
            }, 250);
        }, duration);

        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(completeId);
            window.clearTimeout(finishId);
        };
    }, [isAnalyzing]);

    const handleSignupSubmit = async (event) => {
        event.preventDefault();
        setAuthError('');
        setAuthSuccess('');
        setIsAccountAlreadyVerified(false);
        setSignupSubmitted(true);

        const fieldIssue = getSignupFieldIssue(signupValues);
        if (fieldIssue) {
            setSignupTouched((current) => ({
                ...current,
                first_name: true,
                last_name: true,
                email: true,
                password: true,
                password_confirm: true,
            }));
            setAuthError(fieldIssue);
            return;
        }

        const passwordIssue = getPasswordIssue(signupValues.password, signupValues.password_confirm);
        if (passwordIssue) {
            setAuthError(passwordIssue);
            return;
        }

        try {
            setIsAuthSubmitting(true);
            const normalizedEmail = signupValues.email.trim().toLowerCase();
            await registerUser({
                first_name: signupValues.first_name.trim(),
                last_name: signupValues.last_name.trim(),
                email: normalizedEmail,
                phone_number: signupValues.phone_number.trim(),
                password: signupValues.password,
                password_confirm: signupValues.password_confirm,
                default_currency: 'KES',
                onboarding_plan: activePlanKey,
                onboarding_billing_cycle: billingCycle,
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            markProfileSetupPending(normalizedEmail);
            storePendingSignupEmail(normalizedEmail);
            setVerificationEmail(normalizedEmail);
            setIsAccountAlreadyVerified(false);
            setAccountMode('verify');
            setAuthSuccess('Your account was created. Please verify your email, then sign in with your email and password to open your dashboard.');
        } catch (error) {
            const normalizedEmail = signupValues.email.trim().toLowerCase();
            if (normalizedEmail && isExistingAccountError(error)) {
                try {
                    const resendResult = await resendVerificationEmail({
                        email: normalizedEmail,
                        redirect_url: getEmailVerificationRedirectUrl(),
                    });
                    storePendingSignupEmail(normalizedEmail);
                    setVerificationEmail(normalizedEmail);
                    setIsAccountAlreadyVerified(isAlreadyVerifiedResponse(resendResult));
                    setAccountMode('verify');
                    setAuthSuccess(getVerificationResendSuccessMessage(resendResult, 'This account already exists but still needs verification. We sent a fresh verification email. Verify your email, then sign in to open your dashboard.'));
                    return;
                } catch (resendError) {
                    setAuthError(resendError.message || 'This account already exists, but we could not resend verification right now.');
                    return;
                }
            }
            setAuthError(error.message || 'We could not create your account right now.');
        } finally {
            setIsAuthSubmitting(false);
        }
    };

    const handleSigninSubmit = async (event) => {
        event.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        try {
            setIsAuthSubmitting(true);
            await loginUser({
                email: signinValues.email.trim().toLowerCase(),
                password: signinValues.password,
            });
            if (shouldShowProfileSetup(signinValues.email)) {
                navigate('/profile-setup', { replace: true });
                return;
            }
            persistDashboardSection('overview');
            navigate('/dashboard/app', { replace: true, state: { section: 'overview' } });
        } catch (error) {
            setAuthError(error.message || 'We could not sign you in right now.');
        } finally {
            setIsAuthSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        const email = verificationEmail || signupValues.email.trim().toLowerCase() || signinValues.email.trim().toLowerCase();
        setAuthError('');
        setAuthSuccess('');

        if (!email) {
            setAuthError('Enter your email address so we can send a fresh verification link.');
            return;
        }

        try {
            setIsAuthSubmitting(true);
            const resendResult = await resendVerificationEmail({
                email,
                redirect_url: getEmailVerificationRedirectUrl(),
            });
            storePendingSignupEmail(email);
            setVerificationEmail(email);
            setIsAccountAlreadyVerified(isAlreadyVerifiedResponse(resendResult));
            setAuthSuccess(getVerificationResendSuccessMessage(resendResult, 'We sent another verification email. Please check your inbox and spam folder, then sign in after verifying your account.'));
        } catch (error) {
            setAuthError(error.message || 'We could not send another verification email right now.');
        } finally {
            setIsAuthSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] px-0 py-0 font-sans text-[#232e3d] sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8">
            <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#f8f8f8] sm:min-h-[812px] sm:rounded-[40px]">
                {currentStep !== 'welcome' && currentStep !== 'account' && (
                    <header className="relative z-10 flex items-center px-5 pb-3 pt-5">
                        <img src={onboardingLogo} alt="Shilingi Moves" className="h-auto w-[92px]" decoding="async" />
                    </header>
                )}

                {assessmentSteps.includes(currentStep) && (
                    <div className="px-5">
                        <div className="mb-5 flex items-center gap-2">
                            {assessmentSteps.map((step) => (
                                <span
                                    key={step}
                                    className={`h-2 flex-1 rounded-full ${steps.indexOf(step) <= stepIndex ? 'bg-[#e1ad2b]' : 'bg-[#e9ecef]'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="relative z-10 flex flex-1 flex-col px-4 pb-7">
                    {currentStep === 'welcome' && (
                        <WelcomeScreen onStart={() => setStepIndex(1)} />
                    )}

                    {currentStep === 'profile' && (
                        <QuestionScreen
                            eyebrow="Step 1 of 4"
                            title="Let's get to know you"
                            subtitle="We'll ask you a few questions to understand your financial wellness."
                        >
                            <OptionList
                                options={profileOptions}
                                value={answers.profile}
                                onChange={(value) => updateAnswer('profile', value)}
                            />
                        </QuestionScreen>
                    )}

                    {currentStep === 'stage' && (
                        <QuestionScreen
                            eyebrow="Step 2 of 4"
                            title="Where are you on your financial journey?"
                            subtitle="Choose the statement that feels closest to your current reality."
                        >
                            <OptionList
                                options={stageOptions}
                                value={answers.stage}
                                onChange={(value) => updateAnswer('stage', value)}
                            />
                        </QuestionScreen>
                    )}

                    {currentStep === 'goals' && (
                        <QuestionScreen
                            eyebrow="Step 3 of 4"
                            title="What are your biggest financial goals?"
                            subtitle="Choose up to three. We'll use these to shape your dashboard."
                        >
                            <OptionList
                                options={goalOptions}
                                value={answers.goals}
                                onChange={toggleGoal}
                                multiple
                            />
                        </QuestionScreen>
                    )}

                    {currentStep === 'confidence' && !isAnalyzing && (
                        <QuestionScreen
                            eyebrow="Step 4 of 4"
                            title="How confident are you with managing money?"
                            subtitle="This helps us tune your coaching prompts and dashboard complexity."
                        >
                            <OptionList
                                options={confidenceOptions}
                                value={answers.confidence}
                                onChange={(value) => updateAnswer('confidence', value)}
                            />
                        </QuestionScreen>
                    )}

                    {isAnalyzing && <AnalyzingScreen progress={analysisProgress} />}

                    {currentStep === 'results' && !isAnalyzing && (
                        <ResultsScreen recommendation={recommendation} />
                    )}

                    {currentStep === 'plan' && !isAnalyzing && (
                        <PlanSelectionScreen
                            activePlan={activePlan}
                            activePlanKey={activePlanKey}
                            billingCycle={billingCycle}
                            isRecommended={activePlanKey === recommendation.planKey}
                            onBack={() => setStepIndex(steps.indexOf('results'))}
                            onBillingChange={setBillingCycle}
                            onChoosePlan={choosePlan}
                            onStartPlan={handleStartPlan}
                            onToggleOtherPlans={() => setShowOtherPlans((current) => !current)}
                            recommendedPlanKey={recommendation.planKey}
                            showOtherPlans={showOtherPlans}
                        />
                    )}

                    {currentStep === 'payment' && !isAnalyzing && (
                        <PaymentScreen
                            billingCycle={billingCycle}
                            onBack={() => setStepIndex(steps.indexOf('plan'))}
                            onContinue={() => {
                                setAccountMode('choice');
                                setStepIndex(steps.indexOf('account'));
                            }}
                            plan={activePlan}
                        />
                    )}

                    {currentStep === 'account' && !isAnalyzing && (
                        <AccountScreen
                            accountMode={accountMode}
                            authError={authError}
                            authSuccess={authSuccess}
                            billingCycle={billingCycle}
                            isSubmitting={isAuthSubmitting}
                            onBack={() => {
                                setAuthError('');
                                setAuthSuccess('');
                                setAccountMode('choice');
                                setStepIndex(activePlan.price > 0 ? steps.indexOf('payment') : steps.indexOf('plan'));
                            }}
                            showBack={!isDirectAuthEntry}
                            onModeChange={(mode) => {
                                setAuthError('');
                                setAuthSuccess('');
                                setAccountMode(mode);
                            }}
                            onSigninChange={handleSigninChange}
                            onSigninSubmit={handleSigninSubmit}
                            onSignupChange={handleSignupChange}
                            onSignupBlur={handleSignupBlur}
                            onSignupSubmit={handleSignupSubmit}
                            onResendVerification={handleResendVerification}
                            onSocialAuth={handleSocialAuth}
                            plan={activePlan}
                            showConfirmPassword={showConfirmPassword}
                            showPassword={showPassword}
                            signinValues={signinValues}
                            signupSubmitted={signupSubmitted}
                            signupTouched={signupTouched}
                            signupValues={signupValues}
                            toggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
                            togglePassword={() => setShowPassword((current) => !current)}
                            isAccountAlreadyVerified={isAccountAlreadyVerified}
                            verificationEmail={verificationEmail}
                        />
                    )}
                </div>

                {assessmentSteps.includes(currentStep) && !isAnalyzing && (
                    <footer className="relative z-10 grid grid-cols-[0.32fr_1fr] gap-3 px-4 pb-7">
                        <button
                            type="button"
                            onClick={goBack}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-[#0c6060]"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={!canContinue}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-[#a8c3bd]"
                        >
                            Next
                        </button>
                    </footer>
                )}

                {currentStep === 'results' && !isAnalyzing && (
                    <footer className="relative z-10 px-4 pb-7">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                setSelectedPlan(recommendation.planKey);
                                setStepIndex(steps.indexOf('plan'));
                            }}
                            className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-extrabold text-white shadow-sm"
                        >
                            View Plan
                        </button>
                    </footer>
                )}

                <div className="pointer-events-none flex h-[22px] items-start justify-center pb-2">
                    <span className="mt-0 h-[5px] w-[134px] rounded-full bg-black" />
                </div>
            </section>
        </div>
    );
};

const WelcomeScreen = ({ onStart }) => (
    <div className="flex min-h-[calc(100dvh-22px)] flex-col px-0 pt-4 sm:min-h-[790px] sm:pt-7">
        <div className="flex justify-center">
            <img src={onboardingLogo} alt="Shilingi Moves" className="h-auto w-[82px] sm:w-[96px]" decoding="async" fetchPriority="high" />
        </div>

        <div className="relative mx-auto mt-3 flex h-[142px] w-full max-w-[320px] items-center justify-center sm:mt-5 sm:h-[176px]">
            <img
                src={onboardingIllustration}
                alt=""
                className="h-auto w-[210px] object-contain sm:w-[250px]"
                decoding="async"
                fetchPriority="high"
            />
            <div className="absolute bottom-1 left-1/2 h-2 w-[210px] -translate-x-1/2 rounded-full bg-[#d8e8e4] sm:w-[242px]" />
        </div>

        <div className="mt-2 px-4 sm:mt-3">
            <h1 className="text-[30px] font-extrabold leading-[34px] tracking-normal text-[#232e3d] sm:text-[34px] sm:leading-[38px]">
                Your journey to <span className="text-[#d9a62e]">financial freedom</span> starts with one conversation.
            </h1>
            <p className="mt-3 text-[13.5px] leading-[20px] text-[#5e5f60] sm:mt-4 sm:text-[14.5px] sm:leading-[22px]">
                We'll ask you a few simple questions to understand your financial goals and recommend the dashboard best suited to your needs.
            </p>
            <span className="mt-3 inline-flex min-h-[30px] items-center rounded-full bg-[#eabb3a] px-4 text-xs font-medium text-white sm:mt-4 sm:min-h-[34px]">
                Takes about 2 minutes
            </span>
        </div>

        <div className="mt-auto px-4 pb-4 pt-4 sm:pb-7 sm:pt-7">
            <button
                type="button"
                onClick={onStart}
                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-base font-extrabold text-white"
            >
                Start My Journey
            </button>
        </div>
    </div>
);

const QuestionScreen = ({ eyebrow, title, subtitle, children }) => (
    <div className="flex flex-1 flex-col">
        <div className="px-1">
            <p className="text-xs font-bold text-[#5e5f60]">{eyebrow}</p>
            <h1 className="mt-1 text-[20px] font-extrabold leading-6 text-[#232e3d]">{title}</h1>
            <p className="mt-1 text-xs leading-5 text-[#5e5f60]">{subtitle}</p>
        </div>
        <div className="mt-4 flex-1 rounded-[18px] border border-[#ebeeee] bg-white p-3 shadow-[0_18px_45px_rgba(35,46,61,0.06)]">
            {children}
        </div>
    </div>
);

const OptionList = ({ options, value, onChange, multiple = false }) => (
    <div className="space-y-2">
        {options.map((option) => {
            const Icon = option.icon;
            const selected = multiple ? value.includes(option.id) : value === option.id;
            return (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 text-left transition ${selected ? 'border-[#e1ad2b] bg-[#fff8e4]' : 'border-[#edf0f0] bg-[#fafafa]'}`}
                >
                    {Icon && (
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-[#e1ad2b] text-white' : 'bg-white text-[#0c6060]'}`}>
                            <Icon size={15} />
                        </span>
                    )}
                    <span className="min-w-0 flex-1 text-sm font-bold text-[#232e3d]">{option.label}</span>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#e1ad2b] bg-[#e1ad2b]' : 'border-[#cfd8d6] bg-white'}`}>
                        {selected && <Check size={13} className="text-white" />}
                    </span>
                </button>
            );
        })}
    </div>
);

const AnalyzingScreen = ({ progress }) => {
    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference - (progress / 100) * circumference;
    const paddedProgress = String(progress).padStart(2, '0');
    const statusText = progress < 34
        ? 'Reading your answers'
        : progress < 68
            ? 'Scoring your financial profile'
            : progress < 100
                ? 'Preparing your recommendation'
                : 'Finishing your snapshot';

    return (
        <div className="flex flex-1 flex-col px-1">
            <p className="text-xs font-bold text-[#0c6060]">Financial wellness snapshot</p>
            <h1 className="mt-2 text-[22px] font-extrabold leading-7 text-[#232e3d]">Assessing your financial snapshot</h1>
            <p className="mt-2 text-sm leading-6 text-[#5e5f60]">
                This will not take long. We're scoring your financial profile to tailor effective financial solutions.
            </p>
            <div className="flex flex-1 items-center justify-center">
                <div className="relative flex h-52 w-52 items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 208 208" aria-hidden="true">
                        <circle
                            cx="104"
                            cy="104"
                            r={radius}
                            fill="none"
                            stroke="#d8d8d8"
                            strokeWidth="8"
                        />
                        <circle
                            cx="104"
                            cy="104"
                            r={radius}
                            fill="none"
                            stroke="#0c6060"
                            strokeLinecap="round"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            className="transition-[stroke-dashoffset] duration-100 ease-out"
                        />
                    </svg>
                    <div className="relative flex flex-col items-center">
                        <div className="flex items-start">
                            <span className="text-[44px] font-extrabold tabular-nums text-[#0c6060]">{paddedProgress}</span>
                            <span className="ml-1 mt-2 text-xl font-extrabold text-[#0c6060]">%</span>
                        </div>
                        <p className="mt-2 w-36 text-center text-[11px] font-semibold leading-4 text-[#8a8a8a]">
                            {statusText}
                        </p>
                    </div>
                    <p className="absolute -bottom-10 w-48 text-center text-[11px] leading-4 text-[#8a8a8a]">
                        Calculating your wellness score. Please wait a moment.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ResultsScreen = ({ recommendation }) => (
    <div className="flex flex-1 flex-col px-1">
        <p className="text-xs font-bold text-[#0c6060]">Financial Wellness Snapshot</p>
        <h1 className="mt-2 text-[22px] font-extrabold leading-7 text-[#232e3d]">Here's what we found</h1>
        <p className="mt-2 text-sm leading-6 text-[#5e5f60]">
            Your financial wellness snapshot is built from your answers.
        </p>

        <div className="mt-5 space-y-3">
            {recommendation.insights.map((item) => (
                <div key={item.label} className="flex min-h-[64px] items-center gap-3 rounded-xl bg-[#eaf1f0] px-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e1ad2b] text-white">
                        <item.icon size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-normal text-[#0c6060]">{item.label}</p>
                        <p className="truncate text-sm font-extrabold text-[#232e3d]">{item.value}</p>
                    </div>
                </div>
            ))}

            <div className="flex min-h-[68px] items-center gap-3 rounded-xl bg-[#e1ad2b] px-3 text-white shadow-[0_10px_24px_rgba(185,139,26,0.2)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/22 text-white">
                    <Check size={18} strokeWidth={3} />
                </span>
                <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-normal text-white/75">Recommended plan</p>
                    <p className="truncate text-sm font-extrabold text-white">{recommendation.plan.name}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-white/80">{recommendation.plan.eyebrow}</p>
                </div>
            </div>
        </div>
    </div>
);

const PlanSelectionScreen = ({
    activePlanKey,
    billingCycle,
    onBack,
    onBillingChange,
    onChoosePlan,
    onStartPlan,
    recommendedPlanKey,
}) => {
    const carouselRef = useRef(null);
    const scrollFrameRef = useRef(null);
    const carouselPlanKeys = useMemo(
        () => [recommendedPlanKey, ...planOrder.filter((planKey) => planKey !== recommendedPlanKey)],
        [recommendedPlanKey]
    );
    const activeCarouselIndex = Math.max(0, carouselPlanKeys.indexOf(activePlanKey));

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return undefined;

        const nextPlanKey = carouselPlanKeys[activeCarouselIndex] || recommendedPlanKey;
        const activeSlide = carousel.querySelector(`[data-plan-key="${nextPlanKey}"]`);
        activeSlide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        const intervalId = window.setInterval(() => {
            const currentIndex = Math.max(0, carouselPlanKeys.indexOf(nextPlanKey));
            const nextIndex = (currentIndex + 1) % carouselPlanKeys.length;
            onChoosePlan(carouselPlanKeys[nextIndex]);
        }, 4200);

        return () => {
            window.clearInterval(intervalId);
            if (scrollFrameRef.current) {
                window.cancelAnimationFrame(scrollFrameRef.current);
            }
        };
    }, [activeCarouselIndex, activePlanKey, carouselPlanKeys, onChoosePlan, recommendedPlanKey]);

    const handleCarouselScroll = () => {
        const carousel = carouselRef.current;
        if (!carousel || scrollFrameRef.current) return;

        scrollFrameRef.current = window.requestAnimationFrame(() => {
            scrollFrameRef.current = null;
            const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
            let closestPlanKey = activePlanKey;
            let closestDistance = Number.POSITIVE_INFINITY;

            carouselPlanKeys.forEach((planKey) => {
                const slide = carousel.querySelector(`[data-plan-key="${planKey}"]`);
                if (!slide) return;

                const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
                const distance = Math.abs(carouselCenter - slideCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPlanKey = planKey;
                }
            });

            if (closestPlanKey !== activePlanKey) {
                onChoosePlan(closestPlanKey);
            }
        });
    };

    return (
        <div className="flex max-h-[calc(100vh-22px)] flex-1 flex-col overflow-y-auto px-0 pb-2 pt-5 sm:max-h-[790px]">
            <div className="flex justify-center">
                <PlanSwitcher billingCycle={billingCycle} onChange={onBillingChange} />
            </div>

            <div className="mt-6 px-0">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-[#0c6060]"
                >
                    <ChevronLeft size={15} /> Back to snapshot
                </button>
                <h1 className="text-[22px] font-extrabold leading-7 text-[#141c2b]">
                    Shilingi Moves Plans
                </h1>
                <p className="mt-2 text-[13px] leading-[21px] text-[#8e97ab]">
                    Swipe through each plan to compare pricing, features, and what fits your financial goals.
                </p>
            </div>

            <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {carouselPlanKeys.map((planKey) => {
                    const isSelected = planKey === activePlanKey;
                    const isRecommendedPlan = planKey === recommendedPlanKey;

                    return (
                        <div
                            key={planKey}
                            data-plan-key={planKey}
                            className="w-[calc(100%-8px)] shrink-0 snap-center"
                        >
                            <PlanCard
                                billingCycle={billingCycle}
                                isRecommended={isRecommendedPlan}
                                isSelected={isSelected}
                                onSelect={() => onChoosePlan(planKey)}
                                onStartPlan={onStartPlan}
                                plan={planDetails[planKey]}
                                planKey={planKey}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
                {carouselPlanKeys.map((planKey) => (
                    <button
                        key={`${planKey}-dot`}
                        type="button"
                        onClick={() => onChoosePlan(planKey)}
                        className={`h-2 rounded-full transition-all ${planKey === activePlanKey ? 'w-5 bg-[#0c6060]' : 'w-2 bg-[#d9dbe9]'}`}
                        aria-label={`View ${planDetails[planKey].name}`}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={() => onChoosePlan(planOrder[0])}
                className="mt-4 text-center text-[15px] font-extrabold text-[#0c6060] underline underline-offset-2"
            >
                Compare all plans
            </button>
        </div>
    );
};

const PlanSwitcher = ({ billingCycle, onChange }) => (
    <div className="flex items-center gap-3 rounded-xl border border-[#d9dbe9] bg-[#f1f2f9] p-1 shadow-[inset_0_-2px_2px_rgba(10,16,50,0.04)]">
        <button
            type="button"
            onClick={() => onChange('monthly')}
            className={`min-h-[40px] rounded-lg px-5 text-sm font-bold ${billingCycle === 'monthly' ? 'bg-white text-[#170f49] shadow-[0_3px_3px_rgba(7,0,110,0.03)]' : 'text-[#170f49]'}`}
        >
            Monthly
        </button>
        <button
            type="button"
            onClick={() => onChange('annual')}
            className={`flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-sm font-bold ${billingCycle === 'annual' ? 'bg-white text-[#170f49] shadow-[0_3px_3px_rgba(7,0,110,0.03)]' : 'text-[#170f49]'}`}
        >
            Annually
            <span className="rounded bg-[#d9dbe9] px-2 py-1 text-xs font-bold text-[#6f6c8f]">Save 20%</span>
        </button>
    </div>
);

const PlanCard = ({ billingCycle, isRecommended, isSelected, onSelect, onStartPlan, plan, planKey }) => (
    <article className={`overflow-hidden rounded-[24px] border bg-white shadow-[0_2px_15px_rgba(25,33,61,0.1)] ${isSelected ? 'border-[#0c6060]' : 'border-[#dfe3ec]'}`}>
        <div className="px-8 py-6">
            <div className="flex flex-col gap-4">
                {isRecommended && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#deefe5] px-2 py-1 text-[10px] text-[#00a63e]">
                        <span className="h-1 w-1 rounded-full bg-[#00a63e]" />
                        Recommended
                    </span>
                )}
                <p className="text-base font-bold text-[#eabb3a]">{plan.name}</p>
                <div className="flex items-end gap-2">
                    <p className="text-[32px] font-extrabold leading-none text-[#0c6060]">{formatPlanPrice(plan, billingCycle)}</p>
                    {plan.price > 0 && <span className="pb-1 text-xs text-[#a0a3bd]">{billingCycle === 'annual' ? 'yearly' : 'monthly'}</span>}
                </div>
                <p className="text-sm leading-6 text-[#514f6e]">{plan.description}</p>
            </div>
        </div>

        <div className="border-t border-[#dfe3ec] px-8 py-6">
            <p className="text-base font-bold text-[#170f49]">Features:</p>
            <p className="mt-2 text-sm leading-6 text-[#6f6c8f]">Access to financial wellness</p>
            <div className="mt-5 grid gap-4">
                {plan.tools.map((tool) => (
                    <div key={`${planKey}-${tool}`} className="flex items-center gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eabb3a] text-white">
                            <Check size={13} strokeWidth={3} />
                        </span>
                        <span className="text-sm leading-none text-[#6f6c8f]">{tool}</span>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => {
                    onSelect();
                    onStartPlan(planKey);
                }}
                className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0c6060] px-5 text-base font-extrabold text-white shadow-[0_12px_22px_rgba(12,96,96,0.18)] transition hover:bg-[#0a5757] focus:outline-none focus:ring-2 focus:ring-[#0c6060] focus:ring-offset-2"
            >
                Get started
            </button>
        </div>
    </article>
);

const PaymentScreen = ({ billingCycle, onBack, onContinue, plan }) => (
    <div className="flex flex-1 flex-col overflow-y-auto px-0 pb-4 pt-5">
        <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-1 text-xs font-bold text-[#0c6060]"
        >
            <ChevronLeft size={15} /> Back to plan
        </button>

        <div className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_2px_15px_rgba(25,33,61,0.1)]">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1f0] text-[#0c6060]">
                <CreditCard size={24} />
            </span>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[1.98px] text-[#0c6060]">Secure Payment</p>
            <h1 className="mt-3 text-[27px] font-extrabold leading-[31px] tracking-normal text-[#10231c]">Activate {plan.name}</h1>
            <p className="mt-3 text-[14.5px] leading-[22px] text-[#5f7168]">
                Complete payment first, then create or sign in to your account so your dashboard access can be saved.
            </p>

            <div className="mt-6 rounded-2xl border border-[#f1f2f9] bg-[#fbfbfe] p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#170f49]">{plan.name}</p>
                        <p className="mt-1 text-xs text-[#6f6c8f]">{billingCycle === 'annual' ? 'Annual billing with 20% savings' : 'Monthly billing'}</p>
                    </div>
                    <p className="text-lg font-extrabold text-[#0c6060]">{formatPlanPrice(plan, billingCycle)}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={onContinue}
                className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white"
            >
                Continue to payment
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-[#8e97ab]">
                Payment provider connection will attach here. For now this continues to account setup.
            </p>
        </div>
    </div>
);

const AccountScreen = ({
    accountMode,
    authError,
    authSuccess,
    billingCycle,
    isSubmitting,
    isAccountAlreadyVerified,
    onBack,
    onModeChange,
    onSigninChange,
    onSignupBlur,
    onSigninSubmit,
    onSignupChange,
    onSignupSubmit,
    onResendVerification,
    onSocialAuth,
    plan,
    showConfirmPassword,
    showBack = true,
    showPassword,
    signinValues,
    signupSubmitted,
    signupTouched,
    signupValues,
    toggleConfirmPassword,
    togglePassword,
    verificationEmail,
}) => (
    <div className="flex flex-1 flex-col overflow-y-auto px-0 pb-4 pt-5">
        <div className="flex items-center justify-center">
            <Link to="/" aria-label="Go to Shilingi Moves home page">
                <img src={onboardingLogo} alt="Shilingi Moves" className="h-auto w-[92px]" decoding="async" />
            </Link>
        </div>

        <div className="mt-8">
            {showBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-[#0c6060]"
                >
                    <ChevronLeft size={15} /> Back
                </button>
            )}

            <h1 className="text-[27px] font-extrabold leading-[31px] tracking-normal text-[#10231c]">
                {accountMode === 'signin' ? 'Sign in to your account' : accountMode === 'verify' ? 'Verify this account' : 'Create your account'}
            </h1>
            <p className="mt-3 text-[14.5px] leading-[22px] text-[#5f7168]">
                {accountMode === 'signin'
                    ? 'Welcome back. Sign in to continue into Shilingi Moves.'
                    : accountMode === 'verify'
                        ? isAccountAlreadyVerified
                            ? 'This account is verified. Sign in with your email and password.'
                            : 'Open the verification link we sent, then sign in with your email and password.'
                        : `Let's get your account ready for ${plan.name} on ${billingCycle} billing.`}
            </p>
        </div>

        {(authError || authSuccess) && (
            <div className={`mt-4 flex items-start gap-3 rounded-2xl p-4 text-sm ${authError ? 'border border-rose-200 bg-rose-50 text-rose-800' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                {authError ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <MailCheck size={18} className="mt-0.5 shrink-0" />}
                <span>{authError || authSuccess}</span>
            </div>
        )}

        {accountMode === 'choice' && (
            <div className="mt-5 space-y-[14px]">
                <SocialButton label="Continue with Google" provider="google" onClick={() => onSocialAuth('Google')} />
                <SocialButton label="Continue with Apple" provider="apple" dark onClick={() => onSocialAuth('Apple')} />
                <SocialButton label="Continue with Microsoft" provider="microsoft" muted onClick={() => onSocialAuth('Microsoft')} />
                <button
                    type="button"
                    onClick={() => onModeChange('signup')}
                    className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-medium text-white"
                >
                    Continue with Email
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('signin')}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full text-sm font-bold text-[#0c6060]"
                >
                    Already have an account? Sign in
                </button>
            </div>
        )}

        {accountMode === 'signup' && (
            <EmailSignupForm
                isSubmitting={isSubmitting}
                onBlur={onSignupBlur}
                onChange={onSignupChange}
                onModeChange={onModeChange}
                onSubmit={onSignupSubmit}
                showConfirmPassword={showConfirmPassword}
                showPassword={showPassword}
                toggleConfirmPassword={toggleConfirmPassword}
                togglePassword={togglePassword}
                submitted={signupSubmitted}
                touched={signupTouched}
                values={signupValues}
            />
        )}

        {accountMode === 'signin' && (
            <EmailSigninForm
                isSubmitting={isSubmitting}
                onChange={onSigninChange}
                onModeChange={onModeChange}
                onSubmit={onSigninSubmit}
                values={signinValues}
            />
        )}

        {accountMode === 'verify' && (
            <div className="mt-6 rounded-[24px] bg-white p-5 shadow-[0_2px_15px_rgba(25,33,61,0.1)]">
                <MailCheck size={32} className="text-[#0c6060]" />
                <p className="mt-4 text-sm leading-6 text-[#5f7168]">
                    {isAccountAlreadyVerified ? (
                        <>
                            <span className="font-bold text-[#10231c]">{verificationEmail}</span> is already verified. Sign in with your email and password to open your dashboard.
                        </>
                    ) : (
                        <>
                            We sent a verification email to <span className="font-bold text-[#10231c]">{verificationEmail}</span>. Verify your email, then sign in with your password.
                        </>
                    )}
                </p>
                <button
                    type="button"
                    onClick={() => onModeChange('signin')}
                    className="mt-5 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white"
                >
                    {isAccountAlreadyVerified ? 'Sign in to your account' : 'Sign in after verification'}
                </button>
                {!isAccountAlreadyVerified && (
                    <>
                        <button
                            type="button"
                            onClick={onResendVerification}
                            disabled={isSubmitting}
                            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#0c6060]/25 bg-white px-6 text-sm font-bold text-[#0c6060] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Sending verification email...' : 'Resend verification email'}
                        </button>
                        <p className="mt-3 text-center text-xs leading-5 text-[#6c7b75]">
                            If it does not arrive, check spam or confirm the email address is correct.
                        </p>
                    </>
                )}
            </div>
        )}
    </div>
);

const SocialButton = ({ dark = false, label, provider, muted = false, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full px-5 text-sm font-medium ${dark ? 'bg-[#050708] text-white' : muted ? 'bg-[#2f2f2f] text-white' : 'bg-[#f2f2f2] text-[#1f1f1f]'}`}
    >
        <BrandIcon provider={provider} />
        {label}
    </button>
);

const BrandIcon = ({ provider }) => {
    if (provider === 'google') {
        return (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.76-.07-1.49-.19-2.19H12v4.14h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.48z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.62-2.29l-3.23-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22z" />
                <path fill="#FBBC05" d="M6.41 14.03A6 6 0 0 1 6.09 12c0-.7.12-1.39.32-2.03V7.38H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.62l3.34-2.59z" />
                <path fill="#EA4335" d="M12 5.85c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 2.86 14.7 2 12 2a10 10 0 0 0-8.93 5.38l3.34 2.59C7.2 7.61 9.4 5.85 12 5.85z" />
            </svg>
        );
    }

    if (provider === 'microsoft') {
        return (
            <span className="grid h-5 w-5 shrink-0 grid-cols-2 gap-0.5" aria-hidden="true">
                <span className="bg-[#f25022]" />
                <span className="bg-[#7fba00]" />
                <span className="bg-[#00a4ef]" />
                <span className="bg-[#ffb900]" />
            </span>
        );
    }

    return (
        <svg className="h-5 w-5 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 12.56c-.02-2.08 1.69-3.08 1.77-3.13-1-.15-1.94-.57-2.78-1.23-1.07-.82-2.11-.78-2.57-.78-1.1.11-2.15.64-2.71.64-.57 0-1.45-.62-2.39-.6-1.23.02-2.37.72-3 1.82-1.28 2.22-.33 5.51.92 7.31.61.88 1.34 1.87 2.29 1.83.92-.04 1.27-.59 2.38-.59 1.12 0 1.43.59 2.4.57.99-.02 1.62-.89 2.23-1.77.7-1.02.99-2.02 1-2.07-.02-.01-1.52-.58-1.54-2z" />
            <path d="M15.32 6.18c.51-.62.86-1.48.76-2.34-.74.03-1.64.49-2.17 1.11-.48.55-.9 1.44-.79 2.29.83.06 1.68-.42 2.2-1.06z" />
        </svg>
    );
};

const EmailSignupForm = ({
    isSubmitting,
    onBlur,
    onChange,
    onModeChange,
    onSubmit,
    showConfirmPassword,
    showPassword,
    submitted = false,
    touched = {},
    toggleConfirmPassword,
    togglePassword,
    values,
}) => (
    <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <AuthField error={getSignupFieldError('first_name', values, touched, submitted)} label="First name" name="first_name" showRequiredMarker={submitted && !String(values.first_name || '').trim()} value={values.first_name} onBlur={onBlur} onChange={onChange} required />
            <AuthField error={getSignupFieldError('last_name', values, touched, submitted)} label="Last name" name="last_name" showRequiredMarker={submitted && !String(values.last_name || '').trim()} value={values.last_name} onBlur={onBlur} onChange={onChange} required />
        </div>
        <AuthField error={getSignupFieldError('email', values, touched, submitted)} label="Email address" name="email" showRequiredMarker={submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || '').trim())} type="email" value={values.email} onBlur={onBlur} onChange={onChange} required />
        <AuthField label="Phone number" name="phone_number" value={values.phone_number} onBlur={onBlur} onChange={onChange} optional />
        <PasswordInput error={getSignupFieldError('password', values, touched, submitted)} label="Password" name="password" showRequiredMarker={submitted && !passwordRules.every((rule) => rule.test(values.password))} value={values.password} onBlur={onBlur} onChange={onChange} visible={showPassword} onToggle={togglePassword} />
        <PasswordInput error={getSignupFieldError('password_confirm', values, touched, submitted)} label="Confirm password" name="password_confirm" showRequiredMarker={submitted && values.password !== values.password_confirm} value={values.password_confirm} onBlur={onBlur} onChange={onChange} visible={showConfirmPassword} onToggle={toggleConfirmPassword} />
        <div className="space-y-2 rounded-2xl bg-white p-4 text-xs text-[#5f7168]">
            {passwordRules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${rule.test(values.password) ? 'bg-[#0c6060]' : 'bg-[#d9dbe9]'}`} />
                    {rule.label}
                </div>
            ))}
        </div>
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white disabled:bg-[#a8c3bd]">
            {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
        <button type="button" onClick={() => onModeChange('signin')} className="inline-flex min-h-[42px] w-full items-center justify-center text-sm font-bold text-[#0c6060]">
            Signing back in? Use email and password
        </button>
    </form>
);

const EmailSigninForm = ({ isSubmitting, onChange, onModeChange, onSubmit, values }) => (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <AuthField label="Email address" name="email" type="email" value={values.email} onChange={onChange} required />
        <PasswordInput label="Password" name="password" value={values.password} onChange={onChange} visible={false} hideToggle />
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white disabled:bg-[#a8c3bd]">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
        <button type="button" onClick={() => onModeChange('signup')} className="inline-flex min-h-[42px] w-full items-center justify-center text-sm font-bold text-[#0c6060]">
            New here? Create your account
        </button>
    </form>
);

const AuthField = ({ error = '', label, optional = false, required = false, showRequiredMarker = false, ...props }) => (
    <label className="block text-xs font-bold text-[#5f7168]">
        <span className="flex items-center gap-1">
            {label}
            {showRequiredMarker && <span className="text-sm leading-none text-rose-600">*</span>}
            {optional && <span className="font-medium text-[#8a9891]">(optional)</span>}
        </span>
        <input
            {...props}
            required={required}
            aria-invalid={Boolean(error)}
            className={`mt-2 min-h-[48px] w-full rounded-2xl border bg-white px-4 text-base text-[#10231c] outline-none ${error ? 'border-rose-400 focus:border-rose-500' : 'border-[#e1e7e4] focus:border-[#0c6060]'}`}
        />
        {error && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span>}
    </label>
);

const PasswordInput = ({ error = '', hideToggle = false, label, name, onBlur, onChange, onToggle, showRequiredMarker = false, value, visible }) => (
    <label className="block text-xs font-bold text-[#5f7168]">
        <span className="flex items-center gap-1">
            {label}
            {showRequiredMarker && <span className="text-sm leading-none text-rose-600">*</span>}
        </span>
        <span className={`mt-2 flex min-h-[48px] items-center gap-2 rounded-2xl border bg-white px-4 ${error ? 'border-rose-400 focus-within:border-rose-500' : 'border-[#e1e7e4] focus-within:border-[#0c6060]'}`}>
            <Lock size={16} className="text-[#5f7168]" />
            <input
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                required
                aria-invalid={Boolean(error)}
                className="min-w-0 flex-1 bg-transparent text-base text-[#10231c] outline-none"
            />
            {!hideToggle && (
                <button type="button" onClick={onToggle} className="text-[#5f7168]" aria-label={visible ? 'Hide password' : 'Show password'}>
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </span>
        {error && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span>}
    </label>
);

function getCanContinue(step, answers) {
    if (step === 'welcome' || step === 'results') return true;
    if (step === 'profile') return Boolean(answers.profile);
    if (step === 'stage') return Boolean(answers.stage);
    if (step === 'goals') return answers.goals.length > 0;
    if (step === 'confidence') return Boolean(answers.confidence);
    return false;
}

function normalizeAuthMode(value) {
    if (value === 'signin' || value === 'signup' || value === 'choice') return value;
    return '';
}

function getEmailVerificationRedirectUrl() {
    const configuredUrl = import.meta.env.VITE_EMAIL_VERIFICATION_REDIRECT_URL;
    if (configuredUrl) return configuredUrl;
    if (typeof window === 'undefined') return '/verify-email';
    return `${window.location.origin}/verify-email`;
}

function storePendingSignupEmail(email) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(PENDING_ONBOARDING_SIGNUP_EMAIL_KEY, email);
    } catch {
        // The account can still be verified and signed in without session storage.
    }
}

function getVerificationResendSuccessMessage(payload, fallback) {
    const backendMessage = extractBackendMessage(payload);
    return backendMessage || fallback;
}

function isAlreadyVerifiedResponse(payload) {
    const backendMessage = extractBackendMessage(payload).toLowerCase();
    return Boolean(payload?.already_verified)
        || Boolean(payload?.data?.already_verified)
        || backendMessage.includes('already verified')
        || backendMessage.includes('already active');
}

function extractBackendMessage(payload) {
    const candidates = [
        payload?.message,
        payload?.detail,
        payload?.data?.message,
        payload?.data?.detail,
    ];

    return candidates.find((message) => typeof message === 'string' && message.trim()) || '';
}

function sanitizePasswordInput(value) {
    return String(value || '').replace(/[\r\n]/g, '');
}

function getSignupFieldIssue(values = {}) {
    const requiredFields = ['first_name', 'last_name', 'email', 'password', 'password_confirm'];
    const missingField = requiredFields.find((field) => !String(values[field] || '').trim());

    if (missingField) {
        return 'Please complete all required fields marked with a red star before creating your account.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || '').trim())) {
        return 'Please enter a valid email address.';
    }

    return '';
}

function getSignupFieldError(field, values = {}, touched = {}, submitted = false) {
    const shouldShow = submitted || touched[field];
    if (!shouldShow) return '';

    const value = String(values[field] || '').trim();
    if (!value) {
        return 'Required field.';
    }

    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Enter a valid email.';
    }

    if (field === 'password' && value && !passwordRules.every((rule) => rule.test(value))) {
        return 'Use 8-15 chars with uppercase, lowercase, number, and symbol.';
    }

    if (field === 'password_confirm' && value && values.password !== values.password_confirm) {
        return 'Passwords must match.';
    }

    return '';
}

function getPasswordIssue(password, passwordConfirm) {
    const isStrong = passwordRules.every((rule) => rule.test(password));

    if (!isStrong) {
        return 'Please create a strong password: 8 to 15 characters with uppercase, lowercase, number, and symbol.';
    }

    if (!password || password !== passwordConfirm) {
        return 'Your passwords do not match. Please enter the same password in both fields.';
    }

    return '';
}

function isExistingAccountError(error) {
    const payloadText = JSON.stringify(error?.payload || {}).toLowerCase();
    const message = `${error?.message || ''} ${payloadText}`.toLowerCase();
    return error?.status === 409
        || message.includes('already exists')
        || message.includes('already registered')
        || message.includes('email exists')
        || message.includes('user exists')
        || message.includes('account exists');
}

function buildRecommendation(answers) {
    const stage = stageOptions.find((item) => item.id === answers.stage) || stageOptions[0];
    const confidence = confidenceOptions.find((item) => item.id === answers.confidence) || confidenceOptions[0];
    const votes = { basic: 0, plus: 0, pro: 0, elite: 0 };
    const profile = profileOptions.find((item) => item.id === answers.profile);
    if (profile) votes[profile.plan] += 2;

    answers.goals.forEach((goalId) => {
        const goal = goalOptions.find((item) => item.id === goalId);
        if (goal) votes[goal.plan] += 2;
    });

    if (['emergency', 'paycheck'].includes(stage.id)) votes.plus += 1;
    if (['investing', 'retirement'].includes(stage.id)) votes.pro += 2;
    if (stage.id === 'family-wealth') votes.elite += 2;

    const planKey = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
    const score = Math.min(94, Math.max(24, stage.score + confidence.score + answers.goals.length * 2));
    const primaryGoal = goalOptions.find((item) => item.id === answers.goals[0])?.label || 'Build a clear money plan';

    return {
        score,
        stage: stage.stage,
        planKey,
        plan: planDetails[planKey],
        insights: [
            { label: 'Current financial stage', value: stage.stage, icon: WalletCards },
            { label: 'Primary goal', value: primaryGoal, icon: Target },
            { label: 'Financial strength', value: score >= 65 ? 'Consistent saving habits' : 'Ready for guided structure', icon: PiggyBank },
            { label: 'Biggest opportunity', value: planKey === 'elite' ? 'Legacy and wealth clarity' : 'Long-term wealth building', icon: TrendingUp },
        ],
    };
}

function formatPlanPrice(plan, billingCycle) {
    if (plan.price === 0) return plan.priceLabel;
    if (billingCycle === 'annual') {
        const annualPrice = Math.round(plan.price * 12 * 0.8);
        return `KES ${annualPrice.toLocaleString('en-KE')}`;
    }
    return plan.priceLabel;
}

export default OnboardingPage;
