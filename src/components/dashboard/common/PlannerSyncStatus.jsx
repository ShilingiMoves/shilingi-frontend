import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const getWarnings = (plan) => {
    const result = plan?.calculation_result || {};
    const source = result.warnings || result.warning || [];
    return Array.isArray(source) ? source.filter(Boolean) : source ? [source] : [];
};

const PlannerSyncStatus = ({ plan }) => {
    if (!plan?.uuid) return null;
    const warnings = getWarnings(plan);
    const version = plan.calculation_version || plan.rules_version;
    const updatedAt = plan.calculated_at || plan.updated_at;

    return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                <span>Saved to your Shilingi account</span>
            </div>
            <p className="mt-1 text-xs text-emerald-800">
                {version ? `Calculation version ${version}` : 'Backend calculation saved'}
                {updatedAt ? ` · Updated ${new Date(updatedAt).toLocaleString('en-KE')}` : ''}
            </p>
            {warnings.length > 0 && <p className="mt-2 text-xs text-amber-800">{warnings.join(' ')}</p>}
        </div>
    );
};

export default PlannerSyncStatus;
