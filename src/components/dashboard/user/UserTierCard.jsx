import React from 'react';
import { ShieldCheck } from 'lucide-react';

const UserTierCard = ({ user, tier }) => {
    const activeTier = tier?.tier || user?.tier || 'BASIC';

    return (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Membership tier</p>
                    <h3 className="mt-3 text-2xl font-extrabold text-emerald-950">{activeTier}</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                        Your current plan shapes what features and guidance are available across the platform.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserTierCard;
