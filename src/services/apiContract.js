export const API_PATHS = Object.freeze({
    tiers: '/api/v1/tiers/',
    userTier: '/api/v1/users/me/tier/',
    disclosures: '/disclosures/',
    planners: Object.freeze({
        tax: '/api/v1/tax-planner/',
        protection: '/api/v1/protection-planner/',
        investment: '/api/v1/investment-planner/',
        retirement: '/api/v1/retirement-planner/',
    }),
    billing: Object.freeze({
        subscription: '/api/v1/billing/subscription/',
        checkout: '/api/v1/billing/mpesa/checkout/',
        payments: '/api/v1/billing/mpesa/payments/',
    }),
});

export const unwrapData = (payload) => payload?.data ?? payload;

export const unwrapList = (payload, nestedKey) => {
    const value = unwrapData(payload);
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.results)) return value.results;
    if (nestedKey && Array.isArray(value?.[nestedKey])) return value[nestedKey];
    return [];
};

export const compactPayload = (payload = {}) => Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
);
