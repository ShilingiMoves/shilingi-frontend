import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

const UserTierCard = ({ user, tier }) => {
    const activeTier = tier?.current_tier || user?.tier || 'BASIC';
    const tierName = tier?.tier_name || activeTier;
    const features = Array.isArray(tier?.features) ? tier.features : [];

    return (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Membership tier</p>
                    <h3 className="mt-3 text-2xl font-extrabold text-emerald-950">{tierName}</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                        Your current plan shapes what features and guidance are available across the platform.
                    </p>
                    {!!features.length && (
                        <div className="mt-4 space-y-2">
                            {features.slice(0, 3).map((feature) => (
                                <div key={feature} className="flex items-center gap-2 text-sm text-emerald-900">
                                    <Sparkles size={14} />
                                    <span>{feature.replaceAll('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserTierCard;
