export const TIER_RANK = Object.freeze({ BASIC: 1, PLUS: 2, PRO: 3 });

export const FEATURE_SECTION_MAP = Object.freeze({
    DASHBOARD: 'overview',
    PROFILE: 'user',
    BUDGET_PLANNER: 'budget',
    DEBT_MANAGER: 'debt',
    INVESTMENT_PLANNER: 'investments',
    PROTECTION_PLANNER: 'protection',
    RETIREMENT_PLANNER: 'retirement',
    NET_WORTH_TRACKER: 'networth',
    TAX_PLANNER: 'tax',
});

export const SECTION_FEATURE_MAP = Object.freeze(
    Object.fromEntries(Object.entries(FEATURE_SECTION_MAP).map(([feature, section]) => [section, feature]))
);

export const DEFAULT_SECTION_MIN_TIER = Object.freeze({
    overview: 'BASIC', user: 'BASIC', budget: 'BASIC', debt: 'PLUS',
    protection: 'PLUS', networth: 'PLUS', investments: 'PRO', retirement: 'PRO', tax: 'BASIC',
    health: 'PLUS', marketwatch: 'PRO',
});

export const normalizeTier = (tier) => {
    const value = String(tier || '').trim().toUpperCase();
    return TIER_RANK[value] ? value : 'BASIC';
};

export const tierAllows = (currentTier, minimumTier) => (
    TIER_RANK[normalizeTier(currentTier)] >= TIER_RANK[normalizeTier(minimumTier)]
);

export const filterItemsForTier = (items, currentTier) => (
    (items || []).filter((item) => tierAllows(currentTier, item.minimumTier || 'BASIC'))
);

export const buildDashboardAccess = (catalog, tierInfo) => {
    const currentTier = normalizeTier(tierInfo?.current_tier);
    const hasEntitlementData = Array.isArray(tierInfo?.entitlements);
    const entitlements = new Set(hasEntitlementData ? tierInfo.entitlements : []);
    const access = {};

    for (const [sectionId, minimumTier] of Object.entries(DEFAULT_SECTION_MIN_TIER)) {
        access[sectionId] = {
            allowed: tierAllows(currentTier, minimumTier),
            backendStatus: 'AVAILABLE',
            code: SECTION_FEATURE_MAP[sectionId],
            currentTier,
            minimumTier,
            title: sectionId,
        };
    }

    for (const group of catalog?.frontend_navigation || []) {
        for (const item of group?.items || []) {
            const sectionId = FEATURE_SECTION_MAP[item.code];
            if (!sectionId) continue;
            const available = item.backend_status === 'AVAILABLE';
            const minimumTier = normalizeTier(item.minimum_tier);
            const allowedByTier = tierAllows(currentTier, minimumTier);
            // BASIC is the platform's free baseline. A stale or incomplete
            // entitlement list must never ask an authenticated BASIC member to
            // "upgrade" to the plan they already have.
            const includedInBaseline = minimumTier === 'BASIC' && allowedByTier;
            const entitled = ['DASHBOARD', 'PROFILE'].includes(item.code)
                || includedInBaseline
                || (hasEntitlementData ? entitlements.has(item.code) : allowedByTier);
            access[sectionId] = {
                allowed: available && entitled,
                backendStatus: item.backend_status,
                code: item.code,
                currentTier,
                minimumTier,
                title: item.title,
            };
        }
    }

    return access;
};

export const getSectionAccess = (access, sectionId) => access?.[sectionId] || { allowed: true };

export const buildDashboardNavigationGroups = (catalog, fallbackGroups) => {
    const planningPriority = ['budget', 'tax'];
    const orderPlanningItems = (items) => [...items].sort((left, right) => {
        const leftPriority = planningPriority.indexOf(left);
        const rightPriority = planningPriority.indexOf(right);
        if (leftPriority === -1 && rightPriority === -1) return 0;
        if (leftPriority === -1) return 1;
        if (rightPriority === -1) return -1;
        return leftPriority - rightPriority;
    });
    const catalogGroups = (catalog?.frontend_navigation || []).map((group) => ({
        id: group.code === 'MAIN' ? 'main' : group.code === 'PLANNING_TOOLS' ? 'planning' : group.code.toLowerCase(),
        label: group.title,
        items: group.code === 'PLANNING_TOOLS'
            ? orderPlanningItems((group.items || []).map((item) => FEATURE_SECTION_MAP[item.code]).filter(Boolean))
            : (group.items || []).map((item) => FEATURE_SECTION_MAP[item.code]).filter(Boolean),
    })).filter((group) => group.items.length > 0);

    if (catalogGroups.length === 0) return fallbackGroups;
    const catalogIds = new Set(catalogGroups.map((group) => group.id));
    return [...catalogGroups, ...fallbackGroups.filter((group) => !catalogIds.has(group.id))];
};
