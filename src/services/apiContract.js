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
    dailyMoney: Object.freeze({
        today: '/api/v1/daily-money/today/',
        preferences: '/api/v1/daily-money/preferences/',
        plans: '/api/v1/daily-money/plans/',
        shoppingLists: '/api/v1/daily-money/shopping-lists/',
        reminders: '/api/v1/daily-money/reminders/',
        affordability: '/api/v1/daily-money/affordability/check/',
        calendar: '/api/v1/daily-money/calendar/',
        calendarEvents: '/api/v1/daily-money/calendar-events/',
        activity: '/api/v1/daily-money/activity/',
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
