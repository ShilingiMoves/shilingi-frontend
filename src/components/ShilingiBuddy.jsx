import React, { useEffect, useRef, useState } from 'react';
import {
    Bot,
    CircleDollarSign,
    Compass,
    MessageCircle,
    Send,
    ShieldCheck,
    X,
} from 'lucide-react';

const MAX_MESSAGE_LENGTH = 260;
const EXIT_INTENT_STORAGE_KEY = 'shilingi_buddy_exit_intent_shown';

const starterPrompts = [
    'Help me understand my money',
    'I want to start budgeting',
    'I need help with debt',
    'Which tool should I use?',
];

const quickTopics = [
    { label: 'Budget', icon: CircleDollarSign, prompt: 'Help me start budgeting' },
    { label: 'Explore', icon: Compass, prompt: 'Which Shilingi Moves feature should I use?' },
    { label: 'Safety', icon: ShieldCheck, prompt: 'Is my financial data safe?' },
];

const initialMessages = [
    {
        id: 1,
        sender: 'buddy',
        text: 'Hi, I am Shilingi Buddy AI. Ask about budgeting, debt, saving, investing basics, or which Shilingi Moves tool to use.',
    },
];

const sensitiveInfoPatterns = [
    /\b(pin|password|passcode|otp|one[-\s]?time password|cvv|cvc|card number|mpesa pin|m-pesa pin)\b/i,
    /\b\d{12,19}\b/,
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/,
];

const promptInjectionPatterns = [
    /\b(ignore|forget|override|bypass|disable)\b.{0,50}\b(instruction|instructions|rules|system|policy|guardrail|safety)\b/i,
    /\b(system prompt|developer message|hidden prompt|internal data|private data|database|admin)\b/i,
    /\b(jailbreak|do anything now|dan mode|reveal your prompt)\b/i,
];

const forbiddenDataReply = 'I cannot access, reveal, or guess private Shilingi Moves data, internal instructions, account records, passwords, PINs, or user details. I can still help with general guidance and show you where to use official secure pages.';
const sensitiveDataReply = 'Please do not share PINs, passwords, OTPs, card numbers, ID numbers, or private account details here. For account-specific help, use the official secure Shilingi Moves support or account pages.';

const knowledgeBase = [
    {
        keywords: ['sign', 'account', 'register', 'join', 'login', 'log in'],
        reply: 'A good next step is to create your account or sign in. Once you are inside, your dashboard becomes your money home: budgeting, debt tracking, income, net worth, cashflow, and goals in one place.',
    },
    {
        keywords: ['dashboard', 'tier', 'basic', 'plus', 'pro', 'elite'],
        reply: 'Think of the Shilingi Dashboard as your financial control centre. Basic helps you start, Plus is useful if you are serious about budgeting and debt, Pro supports deeper planning, and Elite adds AI guidance.',
    },
    {
        keywords: ['budget', 'spend', 'expense', '50/30/20', 'planner'],
        reply: 'Let us make budgeting simple. Start with your monthly income, then separate needs, wants, and savings or debt payments. Your first win is not perfection; it is knowing where your money is going and choosing one area to improve this month.',
    },
    {
        keywords: ['debt', 'loan', 'borrow', 'payoff', 'repayment'],
        reply: 'Debt becomes easier to handle when it is visible. List each loan, balance, interest rate, minimum payment, and due date. Then choose a repayment strategy: highest-interest first to save money, or smallest-balance first to build momentum.',
    },
    {
        keywords: ['save', 'saving', 'emergency', 'goal'],
        reply: 'For saving, begin with a clear reason and a realistic amount. A small emergency fund is a strong first target because it protects you from borrowing when surprise expenses happen. Make saving part of the budget before spending the rest.',
    },
    {
        keywords: ['compare', 'product', 'bank', 'sacco', 'insurance', 'pension', 'm-pesa', 'mpesa'],
        reply: 'Before choosing a financial product, compare more than the headline offer. Look at fees, risk, flexibility, eligibility, penalties, and whether it fits your actual goal. The Compare page helps you review options side by side.',
    },
    {
        keywords: ['tool', 'calculator', 'resources', 'books', 'podcast'],
        reply: 'If you are unsure where to start, use the Resources and Tools area. It gives you calculators, learning resources, books, and podcasts so you can run the numbers before making a money decision.',
    },
    {
        keywords: ['learn', 'learning', 'article', 'education'],
        reply: 'The Learning Hub is best when you want to understand money in plain language. It covers budgeting, saving, investing basics, and everyday decisions through a Kenyan lens.',
    },
    {
        keywords: ['community', 'challenge', 'group'],
        reply: 'Money goals are easier when you are not doing them alone. The Community page helps users learn together, stay accountable, and join challenges around savings, debt, and financial wellness.',
    },
    {
        keywords: ['advice', 'guidance', 'help me decide'],
        reply: 'I can help you understand the basics, compare options, and prepare better questions for regulated providers. For personal investment, tax, retirement, insurance, or complex decisions, use trusted licensed professionals outside this chat.',
    },
    {
        keywords: ['safe', 'privacy', 'data', 'security', 'pin', 'password', 'card'],
        reply: 'Your financial privacy matters. Please do not share PINs, passwords, card numbers, ID numbers, or private account details in this chat. Keep sensitive actions on official secure pages.',
    },
    {
        keywords: ['contact', 'support', 'help'],
        reply: 'For account-specific help, use the official support or contact options on the website. I can guide you around Shilingi Moves and answer general finance questions here.',
    },
    {
        keywords: ['invest', 'investment', 'returns', 'stock', 'fund'],
        reply: 'Investing starts with your goal, time frame, risk comfort, and emergency savings. I can explain concepts in simple language, but I cannot promise returns or tell you exactly what to buy. For personal choices, use trusted licensed professionals.',
    },
    {
        keywords: ['shilingi', 'moves', 'what are you', 'about'],
        reply: 'Shilingi Moves helps people make clearer money decisions. It brings together learning, planning tools, product comparison, dashboard tracking, and community support built around Kenyan realities.',
    },
];

function getSafetyReply(message) {
    if (promptInjectionPatterns.some((pattern) => pattern.test(message))) {
        return forbiddenDataReply;
    }

    if (sensitiveInfoPatterns.some((pattern) => pattern.test(message))) {
        return sensitiveDataReply;
    }

    return null;
}

function getBuddyReply(message) {
    const safetyReply = getSafetyReply(message);
    if (safetyReply) return safetyReply;

    const text = message.toLowerCase();
    const matchedTopic = knowledgeBase.find((topic) =>
        topic.keywords.some((keyword) => text.includes(keyword))
    );

    if (matchedTopic) return matchedTopic.reply;

    return 'That is a thoughtful question. To guide you well, tell me which area matters most right now: budgeting, debt, saving, investing basics, choosing a product, or finding the right Shilingi Moves tool.';
}

function ShilingiBuddy() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const nextMessageIdRef = useRef(initialMessages.length + 1);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isTyping]);

    useEffect(() => {
        const handleOpenBuddy = (event) => {
            setIsOpen(true);
            if (event.detail?.prompt) {
                setInputValue(event.detail.prompt);
            }
            window.setTimeout(() => inputRef.current?.focus(), 120);
        };

        window.addEventListener('shilingi-buddy-open', handleOpenBuddy);
        return () => window.removeEventListener('shilingi-buddy-open', handleOpenBuddy);
    }, []);

    useEffect(() => {
        const handleExitIntent = (event) => {
            if (isOpen || event.clientY > 12 || window.innerWidth < 768) return;

            try {
                if (sessionStorage.getItem(EXIT_INTENT_STORAGE_KEY) === '1') return;
                sessionStorage.setItem(EXIT_INTENT_STORAGE_KEY, '1');
            } catch {
                // Keep this non-blocking if browser storage is restricted.
            }

            setIsOpen(true);
        };

        document.addEventListener('mouseout', handleExitIntent);
        return () => document.removeEventListener('mouseout', handleExitIntent);
    }, [isOpen]);

    const sendMessage = (messageText = inputValue) => {
        const cleanMessage = messageText.trim().slice(0, MAX_MESSAGE_LENGTH);
        if (!cleanMessage || isTyping) return;

        const userMessageId = nextMessageIdRef.current;
        nextMessageIdRef.current += 1;

        const userMessage = {
            id: userMessageId,
            sender: 'user',
            text: cleanMessage,
        };

        setMessages((currentMessages) => [...currentMessages, userMessage]);
        setInputValue('');
        setIsTyping(true);

        window.setTimeout(() => {
            const buddyMessageId = nextMessageIdRef.current;
            nextMessageIdRef.current += 1;

            const buddyMessage = {
                id: buddyMessageId,
                sender: 'buddy',
                text: getBuddyReply(cleanMessage),
            };

            setMessages((currentMessages) => [...currentMessages, buddyMessage]);
            setIsTyping(false);
        }, 650);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage();
    };

    return (
        <div className="fixed bottom-2 right-2 z-[80] sm:bottom-3 sm:right-3">
            {isOpen && (
                <section
                    id="shilingi-buddy-panel"
                    className="flex h-[min(280px,calc(100vh-0.75rem))] w-[min(218px,calc(100vw-0.5rem))] flex-col overflow-hidden rounded-md border border-primary-100 bg-white shadow-lg shadow-slate-900/15 sm:h-[300px] sm:w-[232px]"
                    aria-label="Shilingi Buddy AI chat"
                >
                    <header className="flex items-center justify-between bg-primary-700 px-2 py-1.5 text-white">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                                <Bot size={12} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-[11px] font-bold">Shilingi Buddy</h2>
                                <p className="truncate text-[8px] font-medium text-primary-50">Money guide</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/80"
                            aria-label="Close Shilingi Buddy AI"
                        >
                            <X size={12} aria-hidden="true" />
                        </button>
                    </header>

                    <div className="border-b border-primary-100 bg-primary-50 px-1.5 py-1">
                        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
                            {quickTopics.map((topic) => (
                                <button
                                    key={topic.label}
                                    type="button"
                                    onClick={() => sendMessage(topic.prompt)}
                                    className="flex min-h-[21px] shrink-0 items-center gap-0.5 rounded-full border border-primary-200 bg-white px-1.5 text-[9px] font-semibold text-primary-800 transition-colors hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <topic.icon size={10} aria-hidden="true" />
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-y-auto bg-slate-50 px-1.5 py-1.5">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[90%] rounded-lg px-2 py-1.5 text-[10px] leading-snug shadow-sm ${
                                        message.sender === 'user'
                                            ? 'rounded-br-md bg-primary-600 text-white'
                                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="rounded-lg rounded-bl-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm">
                                    Shilingi Buddy is typing...
                                </div>
                            </div>
                        )}

                        {messages.length === 1 && (
                            <div className="space-y-1.5 pt-0.5">
                                {starterPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => sendMessage(prompt)}
                                        className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-left text-[10px] font-semibold text-slate-700 transition-colors hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-1.5">
                        <div className="flex items-end gap-1.5">
                            <label htmlFor="shilingi-buddy-message" className="sr-only">
                                Message Shilingi Buddy AI
                            </label>
                            <textarea
                                id="shilingi-buddy-message"
                                ref={inputRef}
                                value={inputValue}
                                onChange={(event) => setInputValue(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                rows={1}
                                placeholder="Ask Shilingi Buddy AI..."
                                maxLength={MAX_MESSAGE_LENGTH}
                                className="max-h-10 min-h-[28px] flex-1 resize-none rounded-md border border-slate-200 px-1.5 py-1.5 text-[10px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                                aria-label="Send message"
                            >
                                <Send size={12} aria-hidden="true" />
                            </button>
                        </div>
                        <p className="mt-0.5 text-[7px] leading-tight text-slate-500">
                            General guidance only. Do not share private details.
                        </p>
                    </form>
                </section>
            )}

            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-white shadow-md shadow-primary-900/20 transition-all hover:-translate-y-0.5 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:h-9 sm:w-9"
                    aria-expanded={isOpen}
                    aria-controls="shilingi-buddy-panel"
                    aria-label="Open Shilingi Buddy AI"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                        <MessageCircle size={13} aria-hidden="true" />
                    </span>
                </button>
            )}
        </div>
    );
}

export default ShilingiBuddy;
