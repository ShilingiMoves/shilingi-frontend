import React, { useMemo, useState } from 'react';
import { Bell, KeyRound, Monitor, Settings as SettingsIcon, ShieldCheck, Smartphone } from 'lucide-react';

const SettingsPanel = ({ user }) => {
    const [notificationPrefs, setNotificationPrefs] = useState({
        budgetAlerts: true,
        goalMilestones: true,
        marketUpdates: false,
        communityReplies: true,
    });

    const tierLabel = useMemo(() => {
        const rawTier = user?.tier || user?.subscription_tier || user?.plan || 'Basic';
        return String(rawTier)
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }, [user]);

    const togglePreference = (key) => {
        setNotificationPrefs((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    return (
        <div className="space-y-4">
            <section className="rounded-[1.6rem] bg-gradient-to-r from-[#0f6b5b] via-[#177663] to-[#2c8f78] px-6 py-5 text-white shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
                <div className="flex items-start gap-3">
                    <div className="inline-flex rounded-xl bg-white/12 p-2.5 text-white">
                        <SettingsIcon size={18} />
                    </div>
                    <div>
                        <h2 className="text-[1.65rem] font-extrabold tracking-tight">Settings</h2>
                        <p className="mt-1 text-sm text-white/85">
                            Manage your account preferences, security, and notification flow.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-primary-700" />
                        <h3 className="text-base font-bold text-slate-950">Notifications</h3>
                    </div>

                    <div className="mt-4 space-y-3">
                        {[
                            { key: 'budgetAlerts', label: 'Budget alerts' },
                            { key: 'goalMilestones', label: 'Goal milestones' },
                            { key: 'marketUpdates', label: 'Market updates' },
                            { key: 'communityReplies', label: 'Community replies' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-700">{item.label}</p>
                                <button
                                    type="button"
                                    aria-pressed={notificationPrefs[item.key]}
                                    onClick={() => togglePreference(item.key)}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                                        notificationPrefs[item.key] ? 'bg-primary-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                            notificationPrefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-primary-700" />
                        <h3 className="text-base font-bold text-slate-950">Security</h3>
                    </div>

                    <div className="mt-4 space-y-3">
                        <button type="button" className="w-full rounded-xl border border-emerald-100 bg-[#f5fbf8] px-4 py-2.5 text-sm font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-2"><KeyRound size={14} /> Change Password</span>
                        </button>
                        <button type="button" className="w-full rounded-xl border border-emerald-100 bg-[#f5fbf8] px-4 py-2.5 text-sm font-semibold text-slate-800">
                            Two-Factor Auth (Enabled)
                        </button>
                        <button type="button" className="w-full rounded-xl border border-emerald-100 bg-[#f5fbf8] px-4 py-2.5 text-sm font-semibold text-slate-800">
                            Manage Linked Accounts
                        </button>
                    </div>
                </article>

                <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-primary-700" />
                        <h3 className="text-base font-bold text-slate-950">Display</h3>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Currency display</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">KES - Kenyan Shilling</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date format</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">DD/MM/YYYY</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Membership plan</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{tierLabel}</p>
                        </div>
                        <button type="button" className="w-full rounded-xl border border-emerald-100 bg-[#f5fbf8] px-4 py-2.5 text-sm font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-2"><Smartphone size={14} /> Mobile App Preferences</span>
                        </button>
                    </div>
                </article>
            </section>
        </div>
    );
};

export default SettingsPanel;
