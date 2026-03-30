export const formatCurrency = (amount, currency = 'KES') => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    });
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'ON_TRACK':
            return 'emerald';
        case 'WARNING':
            return 'amber';
        case 'OVER_BUDGET':
            return 'rose';
        case 'ACTIVE':
            return 'emerald';
        case 'COMPLETED':
            return 'indigo';
        case 'PAUSED':
            return 'slate';
        case 'CANCELLED':
            return 'rose';
        default:
            return 'slate';
    }
};

export const getStatusIcon = (status) => {
    switch (status) {
        case 'ON_TRACK':
            return '✓';
        case 'WARNING':
            return '⚠';
        case 'OVER_BUDGET':
            return '!';
        case 'ACTIVE':
            return '●';
        case 'COMPLETED':
            return '✓';
        case 'PAUSED':
            return '||';
        case 'CANCELLED':
            return '×';
        default:
            return '·';
    }
};

export const calculateBudgetHealth = (budgets) => {
    const total = budgets.length;
    if (total === 0) return { healthy: 0, warning: 0, over: 0, total: 0 };

    const healthy = budgets.filter(b => b.status === 'ON_TRACK').length;
    const warning = budgets.filter(b => b.status === 'WARNING').length;
    const over = budgets.filter(b => b.status === 'OVER_BUDGET').length;

    return { healthy, warning, over, total };
};

export const getCategoryIcon = (categoryName) => {
    const icons = {
        'Food & Dining': '🍽️',
        'Transportation': '🚗',
        'Housing': '🏠',
        'Utilities': '💡',
        'Healthcare': '⚕️',
        'Entertainment': '🎬',
        'Shopping': '🛍️',
        'Education': '📚',
        'Personal Care': '💆',
        'Savings': '💰',
        'Other': '📌',
    };
    return icons[categoryName] || '📁';
};

export const getPeriodDisplay = (period) => {
    const periods = {
        'WEEKLY': 'Weekly',
        'MONTHLY': 'Monthly',
        'YEARLY': 'Yearly',
    };
    return periods[period] || period;
};

export const getGoalTypeDisplay = (type) => {
    const types = {
        'EMERGENCY_FUND': 'Emergency Fund',
        'VACATION': 'Vacation',
        'HOME': 'Home Purchase',
        'CAR': 'Car Purchase',
        'EDUCATION': 'Education',
        'RETIREMENT': 'Retirement',
        'DEBT_PAYOFF': 'Debt Payoff',
        'INVESTMENT': 'Investment',
        'OTHER': 'Other',
    };
    return types[type] || type;
};