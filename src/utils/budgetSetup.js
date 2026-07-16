export const BUDGET_SETUP_STORAGE_KEY = 'shilingi_budget_setup';

export const deriveBudgetCategoryType = (categoryName = '') => {
    const normalized = String(categoryName || '').toLowerCase();

    if (normalized.includes('saving') || normalized.includes('invest') || normalized.includes('goal') || normalized.includes('debt') || normalized.includes('mmf') || normalized.includes('money market') || normalized.includes('fixed deposit') || normalized.includes('bond') || normalized.includes('share') || normalized.includes('treasury')) {
        return 'Savings';
    }

    if (normalized.includes('want') || normalized.includes('entertain') || normalized.includes('fun') || normalized.includes('shopping') || normalized.includes('lifestyle') || normalized.includes('travel') || normalized.includes('dining') || normalized.includes('restaurant') || normalized.includes('holiday') || normalized.includes('beauty') || normalized.includes('subscription') || normalized.includes('clothes') || normalized.includes('gift') || normalized.includes('hobbies')) {
        return 'Wants';
    }

    return 'Needs';
};

export const readBudgetSetup = () => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(BUDGET_SETUP_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const saveBudgetSetup = (setup) => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(BUDGET_SETUP_STORAGE_KEY, JSON.stringify(setup));
    } catch {
        // Ignore storage failures and keep the in-memory flow working.
    }
};

export const getBudgetTypeLimit = (setup, totalIncome, categoryType) => {
    const split = setup?.split;
    const income = Number(totalIncome || 0);

    if (!split || income <= 0) return 0;

    if (categoryType === 'Wants') {
        return Math.round((income * Number(split.wants || 0)) / 100);
    }

    if (categoryType === 'Savings') {
        return Math.round((income * Number(split.savings || 0)) / 100);
    }

    return Math.round((income * Number(split.needs || 0)) / 100);
};
