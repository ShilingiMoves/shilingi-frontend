export const PREFERRED_NAME_KEY = 'shilingi_preferred_profile_name';
export const PREFERRED_NAME_UPDATED_EVENT = 'shilingi-preferred-name-updated';
export const PROFILE_NAME_PROMPT_KEY = 'shilingi_show_preferred_name_prompt';
export const PROFILE_NAME_PROMPT_REASON_KEY = 'shilingi_preferred_name_prompt_reason';

const toStableNumber = (value) => {
    const source = String(value || 'shilingi-member').trim().toLowerCase();
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash) + source.charCodeAt(index);
        hash |= 0;
    }

    return String(Math.abs(hash) % 1000000).padStart(6, '0');
};

export const getMemberNumber = (user = {}) => {
    const explicitNumber = user?.member_number
        || user?.memberNumber
        || user?.customer_number
        || user?.account_number
        || user?.profile?.member_number
        || user?.profile?.memberNumber;

    if (explicitNumber) {
        return String(explicitNumber).replace(/^member\s*(no\.?|number)?\s*/i, '').trim();
    }

    return `SM-${toStableNumber(user?.uuid || user?.id || user?.email)}`;
};

export const getMemberLabel = (user = {}) => `Member No. ${getMemberNumber(user)}`;

export const getMemberInitials = (user = {}) => {
    const firstInitial = String(user?.first_name || '').trim().charAt(0);
    const lastInitial = String(user?.last_name || '').trim().charAt(0);
    const initials = `${firstInitial}${lastInitial}`.trim();

    if (initials) {
        return initials.toUpperCase();
    }

    return 'SM';
};

export const getStoredPreferredName = () => {
    if (typeof window === 'undefined') return '';

    try {
        return window.localStorage.getItem(PREFERRED_NAME_KEY) || '';
    } catch {
        return '';
    }
};

export const getDashboardDisplayName = (user = {}) => {
    return getStoredPreferredName().trim() || getMemberLabel(user);
};

export const setStoredPreferredName = (name) => {
    if (typeof window === 'undefined') return;

    try {
        const nextName = String(name || '').trim();
        if (nextName) {
            window.localStorage.setItem(PREFERRED_NAME_KEY, nextName);
            window.dispatchEvent(new CustomEvent(PREFERRED_NAME_UPDATED_EVENT, { detail: { preferredName: nextName } }));
            return;
        }

        window.localStorage.removeItem(PREFERRED_NAME_KEY);
        window.dispatchEvent(new CustomEvent(PREFERRED_NAME_UPDATED_EVENT, { detail: { preferredName: '' } }));
    } catch {
        // Local storage may be blocked. The profile can still work without it.
    }
};

export const queuePreferredNamePrompt = (reason = 'returning') => {
    if (typeof window === 'undefined') return;

    try {
        if (getStoredPreferredName().trim()) {
            return;
        }

        window.sessionStorage.setItem(PROFILE_NAME_PROMPT_KEY, '1');
        window.sessionStorage.setItem(PROFILE_NAME_PROMPT_REASON_KEY, reason);
    } catch {
        // Session storage may be blocked. Skipping the prompt is safer than blocking login.
    }
};

export const readQueuedPreferredNamePrompt = () => {
    if (typeof window === 'undefined') {
        return { shouldShow: false, reason: 'returning' };
    }

    try {
        return {
            shouldShow: window.sessionStorage.getItem(PROFILE_NAME_PROMPT_KEY) === '1',
            reason: window.sessionStorage.getItem(PROFILE_NAME_PROMPT_REASON_KEY) || 'returning',
        };
    } catch {
        return { shouldShow: false, reason: 'returning' };
    }
};

export const clearQueuedPreferredNamePrompt = () => {
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.removeItem(PROFILE_NAME_PROMPT_KEY);
        window.sessionStorage.removeItem(PROFILE_NAME_PROMPT_REASON_KEY);
    } catch {
        // Nothing to clean up if storage is unavailable.
    }
};
